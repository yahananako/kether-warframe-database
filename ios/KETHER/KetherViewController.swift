import UIKit
import WebKit

private final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?

    init(delegate: WKScriptMessageHandler) {
        self.delegate = delegate
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}

final class KetherViewController: UIViewController {
    private enum Constants {
        static var appVersion: String {
            Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "3.0.11"
        }
        static let websiteOrigin = "https://kether-warframe-database.vercel.app"
        static let websiteHost = "kether-warframe-database.vercel.app"
        static let worldStateURL = "https://api.warframestat.us/pc"
        static let marketItemsURL = "https://api.warframe.market/v1/items"
        static let sheetBaseURL = "https://docs.google.com/spreadsheets/d/1ll27z4P_9a9ly2HsxNJdOHW2mzTL8_BHUqLZUtxy9Lc/export?format=csv&gid="
        static let loggedInKey = "kether_logged_in"
    }

    private lazy var webView: WKWebView = makeWebView()
    private lazy var networkSession: URLSession = {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.httpCookieStorage = nil
        configuration.httpShouldSetCookies = false
        configuration.requestCachePolicy = .reloadIgnoringLocalCacheData
        return URLSession(configuration: configuration)
    }()
    private let refreshControl = UIRefreshControl()
    private var loginFlowStarted = false
    private var visitedDiscord = false
    private var pausedDuringLogin = false

    override var preferredStatusBarStyle: UIStatusBarStyle {
        .lightContent
    }

    override func loadView() {
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 9 / 255, green: 11 / 255, blue: 18 / 255, alpha: 1)

        refreshControl.tintColor = UIColor(red: 112 / 255, green: 231 / 255, blue: 1, alpha: 1)
        refreshControl.addTarget(self, action: #selector(refreshContent), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )

        loadLocalHome(returning: false)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        networkSession.invalidateAndCancel()
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "kether")
    }

    private func makeWebView() -> WKWebView {
        let controller = WKUserContentController()
        controller.add(WeakScriptMessageHandler(delegate: self), name: "kether")
        controller.addUserScript(
            WKUserScript(
                source: Self.bridgeJavaScript,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
        )

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.userContentController = controller
        configuration.applicationNameForUserAgent = "KETHER-iOS/\(Constants.appVersion)"

        let view = WKWebView(frame: .zero, configuration: configuration)
        view.backgroundColor = UIColor(red: 9 / 255, green: 11 / 255, blue: 18 / 255, alpha: 1)
        view.scrollView.backgroundColor = view.backgroundColor
        view.isOpaque = false
        view.allowsBackForwardNavigationGestures = true
        view.allowsLinkPreview = false
        view.navigationDelegate = self
        view.uiDelegate = self
        return view
    }

    private static let bridgeJavaScript = #"""
    (() => {
      const send = payload => window.webkit.messageHandlers.kether.postMessage(payload);
      window.KetherSync = Object.freeze({
        fetch(path) { send({ action: 'fetch', path: String(path || '/') }); },
        fetchWorldState() { send({ action: 'fetchWorldState' }); },
        fetchSheet(key, gid) {
          send({ action: 'fetchSheet', key: String(key || ''), gid: String(gid || '') });
        },
        fetchAvatar() { send({ action: 'fetchAvatar' }); },
        fetchMarketItems() { send({ action: 'fetchMarketItems' }); }
      });
      window.KETHER_NATIVE_PLATFORM = 'ios';
    })();
    """#

    private func loadLocalHome(returning: Bool) {
        guard let fileURL = Bundle.main.url(forResource: "index", withExtension: "html") else {
            showFatalError("找不到 KETHER 介面檔案，請重新安裝 App。")
            return
        }

        var query: [String] = []
        if UserDefaults.standard.bool(forKey: Constants.loggedInKey) {
            query.append("loggedin=1")
        }
        if returning {
            query.append("returning=1")
        }

        let suffix = query.isEmpty ? "" : "?" + query.joined(separator: "&")
        guard let url = URL(string: fileURL.absoluteString + suffix) else {
            showFatalError("KETHER 首頁網址無法建立。")
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: Bundle.main.bundleURL)
    }

    @objc private func refreshContent() {
        if webView.url?.isFileURL == true {
            loadLocalHome(returning: true)
        } else {
            webView.reload()
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) { [weak self] in
            self?.refreshControl.endRefreshing()
        }
    }

    @objc private func applicationDidEnterBackground() {
        if loginFlowStarted {
            pausedDuringLogin = true
        }
    }

    @objc private func applicationDidBecomeActive() {
        guard loginFlowStarted, pausedDuringLogin else { return }
        pausedDuringLogin = false
        webView.reload()
    }

    private func showFatalError(_ message: String) {
        let label = UILabel()
        label.backgroundColor = UIColor(red: 9 / 255, green: 11 / 255, blue: 18 / 255, alpha: 1)
        label.textColor = .white
        label.textAlignment = .center
        label.numberOfLines = 0
        label.text = message
        view = label
    }

    private func isKetherWebsite(_ url: URL) -> Bool {
        url.scheme?.lowercased() == "https" && url.host?.lowercased() == Constants.websiteHost
    }

    private func isDiscordWebsite(_ url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        return host == "discord.com" || host.hasSuffix(".discord.com") || host == "discordapp.com" || host.hasSuffix(".discordapp.com")
    }

    private func openExternal(_ url: URL) {
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }

    private func markLoggedInAndReturn() {
        loginFlowStarted = false
        visitedDiscord = false
        pausedDuringLogin = false
        UserDefaults.standard.set(true, forKey: Constants.loggedInKey)
        webView.stopLoading()
        loadLocalHome(returning: true)
    }

    private func performLogout() {
        loginFlowStarted = false
        visitedDiscord = false
        pausedDuringLogin = false
        UserDefaults.standard.set(false, forKey: Constants.loggedInKey)

        let cookieStore = webView.configuration.websiteDataStore.httpCookieStore
        cookieStore.getAllCookies { [weak self] cookies in
            let targets = cookies.filter { cookie in
                let domain = cookie.domain.trimmingCharacters(in: CharacterSet(charactersIn: ".")).lowercased()
                return Constants.websiteHost == domain || Constants.websiteHost.hasSuffix("." + domain)
            }
            let group = DispatchGroup()
            for cookie in targets {
                group.enter()
                cookieStore.delete(cookie) {
                    group.leave()
                }
            }
            group.notify(queue: .main) {
                guard let self else { return }
                self.webView.stopLoading()
                self.loadLocalHome(returning: true)
            }
        }
    }

    private func completeLoginIfPossible(at url: URL?) {
        guard loginFlowStarted, let url, isKetherWebsite(url) else { return }
        let returnedFromDiscord = visitedDiscord || url.path.contains("callback") || url.query?.contains("code=") == true
        let script = #"""
        (() => {
          const text = (document.body && document.body.innerText || '').toLowerCase();
          return text.includes('登出 discord') || text.includes('logout') || text.includes('sign out');
        })();
        """#
        webView.evaluateJavaScript(script) { [weak self] result, _ in
            guard let self, self.loginFlowStarted else { return }
            if returnedFromDiscord || (result as? Bool == true) {
                self.markLoggedInAndReturn()
            }
        }
    }
}

extension KetherViewController: WKNavigationDelegate {
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        if url.scheme?.lowercased() == "kether", url.host?.lowercased() == "logout" {
            performLogout()
            decisionHandler(.cancel)
            return
        }

        if url.isFileURL {
            decisionHandler(.allow)
            return
        }

        if isKetherWebsite(url) {
            if url.path == "/profile" || url.path.hasPrefix("/api/auth/") {
                loginFlowStarted = true
                decisionHandler(.allow)
            } else if loginFlowStarted {
                decisionHandler(.allow)
            } else {
                openExternal(url)
                decisionHandler(.cancel)
            }
            return
        }

        if loginFlowStarted, isDiscordWebsite(url) {
            visitedDiscord = true
            decisionHandler(.allow)
            return
        }

        if loginFlowStarted && (url.scheme == "http" || url.scheme == "https") {
            decisionHandler(.allow)
            return
        }

        if url.scheme == "http" || url.scheme == "https" || url.scheme == "discord" {
            openExternal(url)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        guard loginFlowStarted, let url = webView.url else { return }
        if isDiscordWebsite(url) {
            visitedDiscord = true
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
        completeLoginIfPossible(at: webView.url)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        webView.reload()
    }
}

extension KetherViewController: WKUIDelegate {
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        guard navigationAction.targetFrame == nil, let url = navigationAction.request.url else { return nil }
        if isKetherWebsite(url), loginFlowStarted {
            webView.load(URLRequest(url: url))
        } else {
            openExternal(url)
        }
        return nil
    }
}

extension KetherViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "kether", let payload = message.body as? [String: Any], let action = payload["action"] as? String else {
            return
        }

        switch action {
        case "fetch":
            fetchWebsitePath(payload["path"] as? String ?? "/")
        case "fetchWorldState":
            fetchBase64(
                urlString: Constants.worldStateURL,
                headers: ["Accept": "application/json"],
                includeKetherCookies: false
            ) { [weak self] encoded in
                self?.evaluate("if(window.ketherWorldResult)window.ketherWorldResult(\(self?.javaScriptLiteral(encoded) ?? "\"\""))")
            }
        case "fetchSheet":
            let key = payload["key"] as? String ?? ""
            let gid = payload["gid"] as? String ?? ""
            fetchSheet(key: key, gid: gid)
        case "fetchAvatar":
            fetchAvatar()
        case "fetchMarketItems":
            fetchBase64(
                urlString: Constants.marketItemsURL,
                headers: ["Accept": "application/json", "Language": "en"],
                includeKetherCookies: false
            ) { [weak self] encoded in
                self?.evaluate("if(window.ketherMarketItems)window.ketherMarketItems(\(self?.javaScriptLiteral(encoded) ?? "\"\""))")
            }
        default:
            break
        }
    }

    private func fetchWebsitePath(_ path: String) {
        let base = URL(string: Constants.websiteOrigin)!
        guard path.hasPrefix("/"), !path.hasPrefix("//"), let url = URL(string: path, relativeTo: base)?.absoluteURL, url.host == base.host else {
            sendSyncResult(path: path, encoded: "")
            return
        }

        fetchBase64(url: url, headers: [:], includeKetherCookies: true) { [weak self] encoded in
            self?.sendSyncResult(path: path, encoded: encoded)
        }
    }

    private func fetchSheet(key: String, gid: String) {
        guard !gid.isEmpty, gid.allSatisfy(\.isNumber) else {
            sendSheetResult(key: key, encoded: "")
            return
        }
        fetchBase64(
            urlString: Constants.sheetBaseURL + gid,
            headers: ["Accept": "text/csv"],
            includeKetherCookies: false
        ) { [weak self] encoded in
            self?.sendSheetResult(key: key, encoded: encoded)
        }
    }

    private func fetchAvatar() {
        guard let url = URL(string: Constants.websiteOrigin + "/api/auth/session") else { return }
        performRequest(url: url, headers: ["Accept": "application/json"], includeKetherCookies: true) { [weak self] data in
            var avatarURL = ""
            if
                let data,
                let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                let user = root["discordUser"] as? [String: Any],
                let id = user["id"] as? String,
                let avatar = user["avatar"] as? String,
                !id.isEmpty,
                !avatar.isEmpty
            {
                let fileExtension = avatar.hasPrefix("a_") ? "gif" : "png"
                avatarURL = "https://cdn.discordapp.com/avatars/\(id)/\(avatar).\(fileExtension)?size=256"
            }
            let literal = self?.javaScriptLiteral(avatarURL) ?? "\"\""
            self?.evaluate("(function(){var i=document.querySelector('.k5-feature img');if(i&&\(literal))i.src=\(literal);})()")
        }
    }

    private func fetchBase64(
        urlString: String,
        headers: [String: String],
        includeKetherCookies: Bool,
        completion: @escaping (String) -> Void
    ) {
        guard let url = URL(string: urlString) else {
            completion("")
            return
        }
        fetchBase64(url: url, headers: headers, includeKetherCookies: includeKetherCookies, completion: completion)
    }

    private func fetchBase64(
        url: URL,
        headers: [String: String],
        includeKetherCookies: Bool,
        completion: @escaping (String) -> Void
    ) {
        performRequest(url: url, headers: headers, includeKetherCookies: includeKetherCookies) { data in
            completion(data?.base64EncodedString() ?? "")
        }
    }

    private func performRequest(
        url: URL,
        headers: [String: String],
        includeKetherCookies: Bool,
        completion: @escaping (Data?) -> Void
    ) {
        let execute: ([HTTPCookie]) -> Void = { cookies in
            var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30)
            request.setValue("KETHER-iOS/\(Constants.appVersion)", forHTTPHeaderField: "User-Agent")
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
            if !cookies.isEmpty {
                for (key, value) in HTTPCookie.requestHeaderFields(with: cookies) {
                    request.setValue(value, forHTTPHeaderField: key)
                }
            }
            self.networkSession.dataTask(with: request) { data, response, _ in
                guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                    completion(nil)
                    return
                }
                completion(data)
            }.resume()
        }

        guard includeKetherCookies else {
            execute([])
            return
        }

        webView.configuration.websiteDataStore.httpCookieStore.getAllCookies { cookies in
            let host = url.host?.lowercased() ?? ""
            let path = url.path.isEmpty ? "/" : url.path
            let matching = cookies.filter { cookie in
                let domain = cookie.domain.trimmingCharacters(in: CharacterSet(charactersIn: ".")).lowercased()
                let domainMatches = host == domain || host.hasSuffix("." + domain)
                let pathMatches = path.hasPrefix(cookie.path)
                return domainMatches && pathMatches
            }
            execute(matching)
        }
    }

    private func sendSyncResult(path: String, encoded: String) {
        evaluate("if(window.ketherSyncResult)window.ketherSyncResult(\(javaScriptLiteral(path)),\(javaScriptLiteral(encoded)))")
    }

    private func sendSheetResult(key: String, encoded: String) {
        evaluate("if(window.ketherSheetResult)window.ketherSheetResult(\(javaScriptLiteral(key)),\(javaScriptLiteral(encoded)))")
    }

    private func evaluate(_ script: String) {
        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript(script, completionHandler: nil)
        }
    }

    private func javaScriptLiteral(_ value: String) -> String {
        guard let data = try? JSONEncoder().encode(value), let string = String(data: data, encoding: .utf8) else {
            return "\"\""
        }
        return string
    }
}
