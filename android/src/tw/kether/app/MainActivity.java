package tw.kether.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.os.Handler;
import android.os.Build;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.webkit.JavascriptInterface;
import android.util.Base64;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

public class MainActivity extends Activity {
    private static final String UPDATE_MANIFEST = "https://kether-warframe-database.vercel.app/app-update.json";
    private WebView webView;
    private org.json.JSONObject pendingUpdate;
    private boolean loginFlowStarted = false;
    private boolean visitedDiscord = false;
    private boolean pausedDuringLogin = false;
    private int ketherLoadsDuringLogin = 0;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(9, 11, 18));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        webView.addJavascriptInterface(new KetherSyncBridge(), "KetherSync");
        webView.setWebViewClient(new WebViewClient() {
            private boolean openExternal(String url) {
                if (url == null) return false;
                if (url.startsWith("kether://logout")) {
                    performLogout();
                    return true;
                }
                if (url.startsWith("file:///android_asset/")) return false;
                if (url.startsWith("https://kether-warframe-database.vercel.app/profile")) {
                    loginFlowStarted = true;
                    ketherLoadsDuringLogin = 0;
                    return false;
                }
                if (loginFlowStarted) {
                    if (url.contains("discord.com") || url.contains("discordapp.com")) visitedDiscord = true;
                    if (url.startsWith("intent://") || url.startsWith("discord://")) {
                        try {
                            visitedDiscord = true;
                            pausedDuringLogin = true;
                            startActivity(Intent.parseUri(url, Intent.URI_INTENT_SCHEME));
                        } catch (Exception ignored) { }
                        return true;
                    }
                    return false;
                }
                if (url.startsWith("https://") || url.startsWith("http://")) {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                }
                return false;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternal(url);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                if (!loginFlowStarted || url == null) return;
                if (url.contains("discord.com") || url.contains("discordapp.com")) {
                    visitedDiscord = true;
                    return;
                }
                if (url.startsWith("https://kether-warframe-database.vercel.app")) {
                    ketherLoadsDuringLogin++;
                    boolean callback = url.contains("callback") || url.contains("code=") || url.contains("/api/auth/");
                    if (visitedDiscord || callback || ketherLoadsDuringLogin >= 2) markLoggedInAndReturn(view);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (loginFlowStarted && url != null && url.startsWith("https://kether-warframe-database.vercel.app")) {
                    if (visitedDiscord) {
                        markLoggedInAndReturn(view);
                    } else {
                        view.evaluateJavascript("(function(){var t=(document.body&&document.body.innerText||'').toLowerCase();return t.indexOf('登出')>=0||t.indexOf('logout')>=0||t.indexOf('sign out')>=0;})()", new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {
                                if ("true".equals(value) && loginFlowStarted) {
                                    markLoggedInAndReturn(webView);
                                }
                            }
                        });
                    }
                }
            }
        });
        setContentView(webView);
        boolean loggedIn = getPreferences(MODE_PRIVATE).getBoolean("kether_logged_in", false);
        webView.loadUrl(loggedIn ? "file:///android_asset/index.html?loggedin=1" : "file:///android_asset/index.html");
        new Handler().postDelayed(new Runnable() {
            @Override public void run() { checkForUpdates(); }
        }, 6500);
    }

    private void checkForUpdates() {
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    HttpURLConnection connection = (HttpURLConnection) new URL(UPDATE_MANIFEST + "?t=" + System.currentTimeMillis()).openConnection();
                    connection.setConnectTimeout(8000);
                    connection.setReadTimeout(10000);
                    connection.setUseCaches(false);
                    connection.setRequestProperty("User-Agent", "KETHER-Android/2.2");
                    connection.setRequestProperty("Accept", "application/json");
                    InputStream input = connection.getInputStream();
                    ByteArrayOutputStream output = new ByteArrayOutputStream();
                    byte[] buffer = new byte[4096]; int count;
                    while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                    input.close();
                    final org.json.JSONObject info = new org.json.JSONObject(output.toString("UTF-8"));
                    int installed = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
                    if (info.optInt("versionCode", 0) > installed) runOnUiThread(new Runnable() {
                        @Override public void run() { showUpdateDialog(info); }
                    });
                } catch (Exception ignored) { }
            }
        }).start();
    }

    private void showUpdateDialog(final org.json.JSONObject info) {
        pendingUpdate = info;
        AlertDialog.Builder dialog = new AlertDialog.Builder(this)
            .setTitle("KETHER 新版本 " + info.optString("versionName", ""))
            .setMessage(info.optString("notes", "新版本已準備完成。"))
            .setPositiveButton("立即更新", new android.content.DialogInterface.OnClickListener() {
                @Override public void onClick(android.content.DialogInterface d, int which) { beginUpdate(info); }
            });
        if (!info.optBoolean("required", false)) dialog.setNegativeButton("稍後", null);
        dialog.setCancelable(!info.optBoolean("required", false));
        dialog.show();
    }

    private boolean canInstallPackages() {
        if (Build.VERSION.SDK_INT < 26) return true;
        try {
            Object result = getPackageManager().getClass().getMethod("canRequestPackageInstalls").invoke(getPackageManager());
            return result instanceof Boolean && ((Boolean) result).booleanValue();
        } catch (Exception ignored) { return false; }
    }

    private void beginUpdate(org.json.JSONObject info) {
        pendingUpdate = info;
        if (Build.VERSION.SDK_INT >= 26 && !canInstallPackages()) {
            Toast.makeText(this, "請允許 KETHER 安裝更新，返回後會自動繼續", Toast.LENGTH_LONG).show();
            startActivity(new Intent("android.settings.MANAGE_UNKNOWN_APP_SOURCES", Uri.parse("package:" + getPackageName())));
            return;
        }
        pendingUpdate = null;
        downloadAndInstall(info);
    }

    private void downloadAndInstall(final org.json.JSONObject info) {
        Toast.makeText(this, "正在下載 KETHER 更新…", Toast.LENGTH_LONG).show();
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    File directory = new File(getCacheDir(), "updates");
                    if (!directory.exists() && !directory.mkdirs()) throw new Exception("無法建立更新目錄");
                    File apk = new File(directory, "update.apk");
                    HttpURLConnection connection = (HttpURLConnection) new URL(info.getString("apkUrl")).openConnection();
                    connection.setConnectTimeout(12000);
                    connection.setReadTimeout(60000);
                    connection.setInstanceFollowRedirects(true);
                    connection.setRequestProperty("User-Agent", "KETHER-Android/2.2");
                    InputStream input = connection.getInputStream();
                    FileOutputStream output = new FileOutputStream(apk);
                    byte[] buffer = new byte[16384]; int count;
                    while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                    output.flush(); output.close(); input.close();
                    String expected = info.optString("sha256", "").trim().toLowerCase();
                    if (!expected.isEmpty() && !expected.equals(sha256(apk))) {
                        apk.delete();
                        throw new SecurityException("更新檔驗證失敗");
                    }
                    final File verifiedApk = apk;
                    runOnUiThread(new Runnable() { @Override public void run() { launchInstaller(verifiedApk); }});
                } catch (final Exception error) {
                    runOnUiThread(new Runnable() { @Override public void run() {
                        Toast.makeText(MainActivity.this, "更新失敗，請稍後再試", Toast.LENGTH_LONG).show();
                    }});
                }
            }
        }).start();
    }

    private String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        InputStream input = new java.io.FileInputStream(file);
        byte[] buffer = new byte[16384]; int count;
        while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
        input.close();
        StringBuilder result = new StringBuilder();
        for (byte value : digest.digest()) result.append(String.format("%02x", value & 0xff));
        return result.toString();
    }

    private void launchInstaller(File apk) {
        Intent install = new Intent(Intent.ACTION_VIEW);
        install.setDataAndType(Uri.parse("content://tw.kether.app.updates/update.apk"), "application/vnd.android.package-archive");
        install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(install);
    }

    public class KetherSyncBridge {
        @JavascriptInterface
        public void fetchWorldState() {
            new Thread(new Runnable() {
                @Override public void run() {
                    String encoded = "";
                    try {
                        URL target = new URL("https://api.warframestat.us/pc");
                        HttpURLConnection connection = (HttpURLConnection) target.openConnection();
                        connection.setConnectTimeout(12000);
                        connection.setReadTimeout(25000);
                        connection.setRequestProperty("Accept", "application/json");
                        connection.setRequestProperty("User-Agent", "KETHER-Android/3.0");
                        InputStream input = connection.getInputStream();
                        ByteArrayOutputStream output = new ByteArrayOutputStream();
                        byte[] buffer = new byte[8192]; int count;
                        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                        input.close();
                        encoded = Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
                    } catch (Exception ignored) { }
                    final String result = encoded;
                    webView.post(new Runnable() { @Override public void run() {
                        webView.evaluateJavascript("if(window.ketherWorldResult)window.ketherWorldResult(" + org.json.JSONObject.quote(result) + ")", null);
                    }});
                }
            }).start();
        }

        @JavascriptInterface
        public void fetchSheet(final String key, final String gid) {
            new Thread(new Runnable() {
                @Override public void run() {
                    String encoded = "";
                    try {
                        URL target = new URL("https://docs.google.com/spreadsheets/d/1ll27z4P_9a9ly2HsxNJdOHW2mzTL8_BHUqLZUtxy9Lc/export?format=csv&gid=" + gid);
                        HttpURLConnection connection = (HttpURLConnection) target.openConnection();
                        connection.setConnectTimeout(15000);
                        connection.setReadTimeout(30000);
                        connection.setInstanceFollowRedirects(true);
                        connection.setRequestProperty("User-Agent", "KETHER-Android/2.2.3");
                        InputStream input = connection.getInputStream();
                        ByteArrayOutputStream output = new ByteArrayOutputStream();
                        byte[] buffer = new byte[8192]; int count;
                        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                        input.close();
                        encoded = Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
                    } catch (Exception ignored) { }
                    final String result = encoded;
                    webView.post(new Runnable() { @Override public void run() {
                        webView.evaluateJavascript("if(window.ketherSheetResult)window.ketherSheetResult(" + org.json.JSONObject.quote(key) + "," + org.json.JSONObject.quote(result) + ")", null);
                    }});
                }
            }).start();
        }

        @JavascriptInterface
        public void fetchAvatar() {
            new Thread(new Runnable() {
                @Override public void run() {
                    String avatarUrl = "";
                    try {
                        URL target = new URL("https://kether-warframe-database.vercel.app/api/auth/session");
                        HttpURLConnection connection = (HttpURLConnection) target.openConnection();
                        connection.setRequestProperty("User-Agent", "KETHER-Android/2.1");
                        String cookies = CookieManager.getInstance().getCookie("https://kether-warframe-database.vercel.app");
                        if (cookies != null) connection.setRequestProperty("Cookie", cookies);
                        InputStream input = connection.getInputStream();
                        ByteArrayOutputStream output = new ByteArrayOutputStream();
                        byte[] buffer = new byte[4096]; int count;
                        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                        input.close();
                        org.json.JSONObject root = new org.json.JSONObject(output.toString("UTF-8"));
                        org.json.JSONObject user = root.optJSONObject("discordUser");
                        if (user != null) {
                            String id = user.optString("id", ""), avatar = user.optString("avatar", "");
                            if (!id.isEmpty() && !avatar.isEmpty()) avatarUrl = "https://cdn.discordapp.com/avatars/" + id + "/" + avatar + (avatar.startsWith("a_") ? ".gif" : ".png") + "?size=256";
                        }
                    } catch (Exception ignored) { }
                    final String result = avatarUrl;
                    webView.post(new Runnable() { @Override public void run() {
                        webView.evaluateJavascript("(function(){var i=document.querySelector('.k5-feature img');if(i&&" + org.json.JSONObject.quote(result) + ")i.src=" + org.json.JSONObject.quote(result) + ";})()", null);
                    }});
                }
            }).start();
        }

        @JavascriptInterface
        public void fetch(final String path) {
            new Thread(new Runnable() {
                @Override public void run() {
                    String encoded = "";
                    try {
                        String safePath = path != null && path.startsWith("/") ? path : "/";
                        URL target = new URL("https://kether-warframe-database.vercel.app" + safePath);
                        HttpURLConnection connection = (HttpURLConnection) target.openConnection();
                        connection.setConnectTimeout(12000);
                        connection.setReadTimeout(16000);
                        connection.setRequestProperty("User-Agent", "KETHER-Android/2.1");
                        String cookies = CookieManager.getInstance().getCookie("https://kether-warframe-database.vercel.app");
                        if (cookies != null) connection.setRequestProperty("Cookie", cookies);
                        InputStream input = connection.getInputStream();
                        ByteArrayOutputStream output = new ByteArrayOutputStream();
                        byte[] buffer = new byte[8192];
                        int count;
                        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                        input.close();
                        encoded = Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
                    } catch (Exception ignored) { }
                    final String result = encoded;
                    webView.post(new Runnable() {
                        @Override public void run() {
                            webView.evaluateJavascript("window.ketherSyncResult(" + org.json.JSONObject.quote(path) + "," + org.json.JSONObject.quote(result) + ")", null);
                        }
                    });
                }
            }).start();
        }

        @JavascriptInterface
        public void fetchMarketItems() {
            new Thread(new Runnable() {
                @Override public void run() {
                    String encoded = "";
                    try {
                        URL target = new URL("https://api.warframe.market/v1/items");
                        HttpURLConnection connection = (HttpURLConnection) target.openConnection();
                        connection.setConnectTimeout(12000);
                        connection.setReadTimeout(18000);
                        connection.setRequestProperty("User-Agent", "KETHER-Android/2.1");
                        connection.setRequestProperty("Language", "en");
                        InputStream input = connection.getInputStream();
                        ByteArrayOutputStream output = new ByteArrayOutputStream();
                        byte[] buffer = new byte[8192]; int count;
                        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                        input.close();
                        encoded = Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
                    } catch (Exception ignored) { }
                    final String result = encoded;
                    webView.post(new Runnable() { @Override public void run() {
                        webView.evaluateJavascript("if(window.ketherMarketItems)window.ketherMarketItems(" + org.json.JSONObject.quote(result) + ")", null);
                    }});
                }
            }).start();
        }
    }

    private void markLoggedInAndReturn(WebView view) {
        loginFlowStarted = false;
        visitedDiscord = false;
        pausedDuringLogin = false;
        ketherLoadsDuringLogin = 0;
        getPreferences(MODE_PRIVATE).edit().putBoolean("kether_logged_in", true).apply();
        view.stopLoading();
        view.loadUrl("file:///android_asset/index.html?loggedin=1&returning=1");
    }

    private void performLogout() {
        loginFlowStarted = false;
        visitedDiscord = false;
        pausedDuringLogin = false;
        ketherLoadsDuringLogin = 0;
        getPreferences(MODE_PRIVATE).edit().putBoolean("kether_logged_in", false).apply();

        CookieManager cookies = CookieManager.getInstance();
        String origin = "https://kether-warframe-database.vercel.app";
        cookies.setCookie(origin, "kether_discord_session=; Max-Age=0; Path=/; Secure; SameSite=Lax");
        cookies.setCookie(origin, "kether_discord_oauth_state=; Max-Age=0; Path=/; Secure; SameSite=Lax");
        cookies.flush();

        if (webView != null) {
            webView.stopLoading();
            webView.clearHistory();
            webView.loadUrl("file:///android_asset/index.html?returning=1");
        }
    }

    @Override
    protected void onPause() {
        if (loginFlowStarted) pausedDuringLogin = true;
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (pendingUpdate != null && (Build.VERSION.SDK_INT < 26 || canInstallPackages())) {
            org.json.JSONObject update = pendingUpdate;
            pendingUpdate = null;
            downloadAndInstall(update);
            return;
        }
        if (loginFlowStarted && pausedDuringLogin && webView != null) markLoggedInAndReturn(webView);
    }

    @Override
    public void onBackPressed() {
        if (loginFlowStarted) {
            loginFlowStarted = false;
            visitedDiscord = false;
            webView.loadUrl("file:///android_asset/index.html");
        } else if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
