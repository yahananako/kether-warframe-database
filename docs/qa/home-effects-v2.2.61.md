# 首頁顯示效能控制整合驗證 — v2.2.61

日期：2026-10-21

## 比較基準與移植範圍

- 最新 main：`f9bea7d85cffe9ed3f02b6803dcacbc141896512`（網站 v2.2.60，Bot v3.5.11）。
- PR #34：`5d4002f230a9981e299d92f5cec494bed39bde2e`，原基底 `506a7a875cf67ba75daf5c701c6e7102c685440f`。
- PR #34 修改的首頁 TSX、CSS、共用選單、規格文件與測試在 main 中仍未整合；這些檔案自原基底以來沒有新版替代實作。
- 從最新 main 建立新分支，僅移植仍需的首頁控制、CSS、規格和測試；沒有合併舊分支。
- 舊 PR 的 v2.2.59／Bot v3.5.9 版號不採用。網站接續 v2.2.61，Bot 保留 v3.5.11。
- 保留新版新聞、資料同步、權限與部署程式；首頁搜尋、通知、登入、分類入口、影片與電台布局沒有重建。

提交前 main 新增兩筆白金價格數值儲存修正（僅變更兩個準備試算表的 scripts），已重新以該 main 為基底；相關首頁元件無衝突。

## 實作與額外修正

首頁頂部加入共用 `KetherEffectsMenu` 的 home 樣式，仍使用唯一的根層 `KetherEffectsProvider` 與 `kether-effects-mode-v1` 儲存鍵。設定分為華麗、平衡、省電；減少動態／節省數據覆寫實際效果為省電，並保留使用者原選擇。

手機採圖示控制與固定在視窗內的選單，不新增導航列。首頁選單接入既有 `data-home-menu` 關閉邏輯，支援點擊外部及 Escape，Escape 回復焦點至觸發元件。這補足原 PR 僅新增控制、未將其納入首頁關閉邏輯的缺口。

## 本地驗證結果

使用 package-lock.json 鎖定的依賴（Next.js 16.2.10、React 19.2.7、TypeScript 6.0.3）、獨立本地測試 session 與 Chromium 141 / Playwright 1.56.1。沒有使用正式 Discord 憑證或修改正式資料。

| 檢查 | 結果 |
| --- | --- |
| `node scripts/check-redesign-invariants.mjs` | 11 / 11 通過 |
| `npx tsc --noEmit` | 通過 |
| `node --import tsx scripts/test-safe-next.ts` | 20 項通過 |
| `node --import tsx scripts/test-incarnon-sync.ts` | 通過：53 組資料及網站／Bot／Android 一致 |
| `npx next build` | 通過，255 個頁面；不執行正式 Discord 指令註冊 |
| `node scripts/test-redesign-browser.mjs` | 46 項通過，0 失敗 |
| `node scripts/test-redesign-journeys.mjs` | 10 項通過，0 失敗 |
| `node scripts/test-player-auth-regressions.mjs` | 5 項通過，0 失敗 |
| `git diff --check` | 通過 |

操作驗證包含：

- 首頁選華麗 → 重新整理 → 透過首頁選單進入故事內頁 → 內頁選平衡 → 點首頁連結返回；選擇、實際效果與儲存值一致。
- 省電與另一個已開啟分頁同步；重新整理後保留設定。
- 執行中切換 prefers-reduced-motion：首頁與內頁實際效果自動降為省電，背景影片暫停；使用者原華麗選擇不被覆寫，關閉減少動態後恢復。
- 模擬 navigator.connection.saveData=true，確認首頁和內頁皆自動降級。
- 390×844、360×740 手機模擬下以真實 tap 操作開關及選取；確認選單完整位於視窗、選取後關閉、重新整理保留、外部觸控可關閉。兩張選單截圖已目視檢查。
- 桌機 1440×900、筆電 1280×800 與上述手機尺寸的既有頁面無整頁水平／垂直溢出；通知、權限、搜尋頁、電台單一實例與播放控制回歸通過。

測試環境曾遇到跨執行程序的 localhost 隔離，改為同一程序樹啟動伺服器與瀏覽器；首次外點測試誤選被選單覆蓋的搜尋欄，已改點可見頁尾後通過。這些不計為產品功能通過的替代證據。

React 檢查：重用既有 Context，沒有新增設定狀態或儲存鍵、網路請求或全域事件監聽；保留原生 details/summary、按鈕 aria-pressed、可讀取的模式名稱及焦點回復。

## 驗證限制與發布狀態

- 手機為 Chromium 觸控模擬，非實體手機或 iOS Safari。
- 未在實體 Intel Iris Xe 筆電量測 FPS、溫度或耗電；平衡模式沿用既有實作。
- saveData 為瀏覽器能力模擬，電台播放使用既有 YouTube mock；不是正式 OAuth 或真實 YouTube 串流驗證。
- 此文件記錄本地提交前證據；GitHub CI、PR 合併與 Vercel 正式部署結果須以後續 GitHub／部署狀態另行確認，不能由本地建置推論正式站已更新。
