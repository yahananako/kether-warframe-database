package tw.kether.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.app.ProgressDialog;
import android.os.Bundle;
import android.os.Handler;
import android.os.Build;
import android.os.Environment;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
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
    private static final String UPDATE_DOWNLOAD_PREFS = "kether_update_download";
    private WebView webView;
    private org.json.JSONObject pendingUpdate;
    private org.json.JSONObject pendingDownloadInfo;
    private volatile long pendingDownloadId = -1L;
    private long processingDownloadId = -1L;
    private BroadcastReceiver downloadReceiver;
    private ProgressDialog downloadProgress;
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
        registerDownloadReceiver();
        restorePendingDownload();
        new Handler().postDelayed(new Runnable() {
            @Override public void run() { checkForUpdates(); }
        }, 6500);
    }

    private void checkForUpdates() {
        if (pendingDownloadId > 0L) return;
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
        if (pendingDownloadId > 0L) {
            showDownloadProgress(pendingDownloadId, pendingDownloadInfo != null ? pendingDownloadInfo : info);
            return;
        }
        try {
            File downloadDirectory = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (downloadDirectory == null) throw new Exception("手機無法提供下載目錄");
            if (!downloadDirectory.exists() && !downloadDirectory.mkdirs()) throw new Exception("無法建立下載目錄");

            String fileName = updateFileName(info);
            File target = new File(downloadDirectory, fileName);
            if (target.exists() && !target.delete()) throw new Exception("無法清除舊更新檔");

            DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            if (manager == null) throw new Exception("Android 系統下載器無法使用");
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(info.getString("apkUrl")));
            request.setTitle("KETHER " + info.optString("versionName", "新版"));
            request.setDescription("正在下載安全更新，可在通知列查看進度");
            request.setMimeType("application/vnd.android.package-archive");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);
            request.addRequestHeader("User-Agent", "KETHER-Android/3.0.11");
            request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, fileName);

            pendingDownloadInfo = info;
            pendingDownloadId = manager.enqueue(request);
            getSharedPreferences(UPDATE_DOWNLOAD_PREFS, MODE_PRIVATE).edit()
                .putLong("download_id", pendingDownloadId)
                .putString("download_info", info.toString())
                .putString("download_file", fileName)
                .apply();
            showDownloadProgress(pendingDownloadId, info);
            monitorDownload(pendingDownloadId, info);
            Toast.makeText(this, "已交給 Android 系統下載器，可在通知列查看進度", Toast.LENGTH_LONG).show();
        } catch (final Exception error) {
            showDownloadFailure(info, error.getMessage());
        }
    }

    private String updateFileName(org.json.JSONObject info) {
        String version = info.optString("versionName", "latest").replaceAll("[^A-Za-z0-9._-]", "-");
        return "KETHER-Warframe-v" + version + ".apk";
    }

    private void registerDownloadReceiver() {
        downloadReceiver = new BroadcastReceiver() {
            @Override public void onReceive(Context context, Intent intent) {
                if (!DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())) return;
                long downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L);
                if (downloadId == pendingDownloadId) handleDownloadResult(downloadId);
            }
        };
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(downloadReceiver, filter);
    }

    private void restorePendingDownload() {
        android.content.SharedPreferences prefs = getSharedPreferences(UPDATE_DOWNLOAD_PREFS, MODE_PRIVATE);
        long downloadId = prefs.getLong("download_id", -1L);
        String infoText = prefs.getString("download_info", "");
        if (downloadId <= 0L || infoText == null || infoText.isEmpty()) return;
        try {
            pendingDownloadId = downloadId;
            pendingDownloadInfo = new org.json.JSONObject(infoText);
            showDownloadProgress(downloadId, pendingDownloadInfo);
            monitorDownload(downloadId, pendingDownloadInfo);
        } catch (Exception ignored) {
            clearDownloadState(downloadId, true);
        }
    }

    private void showDownloadProgress(final long downloadId, final org.json.JSONObject info) {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                if (isFinishing()) return;
                if (downloadProgress != null && downloadProgress.isShowing()) return;
                downloadProgress = new ProgressDialog(MainActivity.this);
                downloadProgress.setTitle("KETHER " + info.optString("versionName", "新版") + " 下載中");
                downloadProgress.setMessage("正在連線至 Android 系統下載器…");
                downloadProgress.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
                downloadProgress.setIndeterminate(true);
                downloadProgress.setCancelable(false);
                downloadProgress.setButton(android.content.DialogInterface.BUTTON_NEGATIVE, "改用瀏覽器", new android.content.DialogInterface.OnClickListener() {
                    @Override public void onClick(android.content.DialogInterface dialog, int which) {
                        clearDownloadState(downloadId, true);
                        openBrowserDownload(info);
                    }
                });
                downloadProgress.show();
            }
        });
    }

    private void monitorDownload(final long downloadId, final org.json.JSONObject info) {
        new Thread(new Runnable() {
            @Override public void run() {
                DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                if (manager == null) return;
                while (downloadId == pendingDownloadId) {
                    Cursor cursor = null;
                    try {
                        cursor = manager.query(new DownloadManager.Query().setFilterById(downloadId));
                        if (cursor == null || !cursor.moveToFirst()) {
                            handleDownloadResult(downloadId);
                            return;
                        }
                        int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                        long downloaded = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
                        long total = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
                        updateDownloadProgress(downloaded, total);
                        if (status == DownloadManager.STATUS_SUCCESSFUL || status == DownloadManager.STATUS_FAILED) {
                            handleDownloadResult(downloadId);
                            return;
                        }
                    } catch (Exception error) {
                        handleDownloadResult(downloadId);
                        return;
                    } finally {
                        if (cursor != null) cursor.close();
                    }
                    try { Thread.sleep(700L); } catch (InterruptedException ignored) { return; }
                }
            }
        }).start();
    }

    private void updateDownloadProgress(final long downloaded, final long total) {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                if (downloadProgress == null || !downloadProgress.isShowing()) return;
                if (total > 0L) {
                    int percent = (int) Math.min(100L, downloaded * 100L / total);
                    downloadProgress.setIndeterminate(false);
                    downloadProgress.setMax(100);
                    downloadProgress.setProgress(percent);
                    downloadProgress.setMessage(String.format(java.util.Locale.TAIWAN, "已下載 %.1f / %.1f MB", downloaded / 1048576.0, total / 1048576.0));
                } else {
                    downloadProgress.setIndeterminate(true);
                    downloadProgress.setMessage("正在等待 GitHub 傳送更新檔…");
                }
            }
        });
    }

    private synchronized boolean beginProcessingDownload(long downloadId) {
        if (downloadId != pendingDownloadId || processingDownloadId == downloadId) return false;
        processingDownloadId = downloadId;
        return true;
    }

    private void handleDownloadResult(final long downloadId) {
        if (!beginProcessingDownload(downloadId)) return;
        new Thread(new Runnable() {
            @Override public void run() {
                DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                Cursor cursor = null;
                try {
                    if (manager == null) throw new Exception("Android 系統下載器無法使用");
                    cursor = manager.query(new DownloadManager.Query().setFilterById(downloadId));
                    if (cursor == null || !cursor.moveToFirst()) throw new Exception("下載工作已消失");
                    int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                    int reason = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON));
                    if (status != DownloadManager.STATUS_SUCCESSFUL) throw new Exception("系統下載失敗（代碼 " + reason + "）");

                    org.json.JSONObject info = pendingDownloadInfo;
                    if (info == null) throw new Exception("找不到更新資料");
                    File downloadDirectory = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    if (downloadDirectory == null) throw new Exception("找不到下載目錄");
                    File downloadedApk = new File(downloadDirectory, updateFileName(info));
                    if (!downloadedApk.isFile() || downloadedApk.length() <= 0L) throw new Exception("下載檔不存在");
                    String expected = info.optString("sha256", "").trim().toLowerCase();
                    if (!expected.isEmpty() && !expected.equals(sha256(downloadedApk))) throw new SecurityException("更新檔驗證失敗");

                    File cacheDirectory = new File(getCacheDir(), "updates");
                    if (!cacheDirectory.exists() && !cacheDirectory.mkdirs()) throw new Exception("無法建立安裝目錄");
                    final File verifiedApk = new File(cacheDirectory, "update.apk");
                    copyFile(downloadedApk, verifiedApk);
                    final org.json.JSONObject verifiedInfo = info;
                    clearDownloadState(downloadId, true);
                    runOnUiThread(new Runnable() {
                        @Override public void run() {
                            dismissDownloadProgress();
                            launchInstaller(verifiedApk, verifiedInfo);
                        }
                    });
                } catch (final Exception error) {
                    final org.json.JSONObject info = pendingDownloadInfo;
                    clearDownloadState(downloadId, true);
                    runOnUiThread(new Runnable() {
                        @Override public void run() {
                            dismissDownloadProgress();
                            showDownloadFailure(info, error.getMessage());
                        }
                    });
                } finally {
                    if (cursor != null) cursor.close();
                }
            }
        }).start();
    }

    private void copyFile(File source, File target) throws Exception {
        InputStream input = new java.io.FileInputStream(source);
        FileOutputStream output = new FileOutputStream(target);
        try {
            byte[] buffer = new byte[16384]; int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            output.flush();
        } finally {
            try { input.close(); } catch (Exception ignored) { }
            try { output.close(); } catch (Exception ignored) { }
        }
    }

    private synchronized void clearDownloadState(long downloadId, boolean removeDownload) {
        if (removeDownload) {
            try {
                DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                if (manager != null && downloadId > 0L) manager.remove(downloadId);
            } catch (Exception ignored) { }
        }
        getSharedPreferences(UPDATE_DOWNLOAD_PREFS, MODE_PRIVATE).edit().clear().apply();
        pendingDownloadId = -1L;
        pendingDownloadInfo = null;
        processingDownloadId = -1L;
    }

    private void dismissDownloadProgress() {
        if (downloadProgress != null) {
            try { downloadProgress.dismiss(); } catch (Exception ignored) { }
            downloadProgress = null;
        }
    }

    private void showDownloadFailure(final org.json.JSONObject info, String detail) {
        dismissDownloadProgress();
        String message = detail == null || detail.trim().isEmpty() ? "系統下載未完成。" : detail;
        new AlertDialog.Builder(this)
            .setTitle("更新下載未完成")
            .setMessage(message + "\n\n可以改用瀏覽器直接下載 APK。")
            .setPositiveButton("用瀏覽器下載", new android.content.DialogInterface.OnClickListener() {
                @Override public void onClick(android.content.DialogInterface dialog, int which) { openBrowserDownload(info); }
            })
            .setNegativeButton("稍後", null)
            .show();
    }

    private void openBrowserDownload(org.json.JSONObject info) {
        if (info == null) {
            Toast.makeText(this, "找不到更新連結，請重新開啟 APP", Toast.LENGTH_LONG).show();
            return;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(info.optString("apkUrl", ""))));
        } catch (Exception error) {
            Toast.makeText(this, "無法開啟瀏覽器下載", Toast.LENGTH_LONG).show();
        }
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

    private void launchInstaller(File apk, org.json.JSONObject info) {
        try {
            Uri updateUri = Uri.parse("content://tw.kether.app.updates/update.apk");
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(updateUri, "application/vnd.android.package-archive");
            install.setClipData(ClipData.newRawUri("KETHER update", updateUri));
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(install);
        } catch (Exception error) {
            showDownloadFailure(info, "Android 安裝器無法開啟");
        }
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
    protected void onDestroy() {
        dismissDownloadProgress();
        if (downloadReceiver != null) {
            try { unregisterReceiver(downloadReceiver); } catch (Exception ignored) { }
            downloadReceiver = null;
        }
        super.onDestroy();
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
