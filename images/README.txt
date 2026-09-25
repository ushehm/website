images/ — 圖片放這裡
====================

目前內容
--------
avatar.jpg            你的 Steam 頭像（從 Steam 抓的）
thanks-preview.jpg    特別鳴謝區那顆影片按鈕的預覽圖（由你提供的圖轉存）

favicon.ico           分頁圖示，內含 16 / 32 / 48 三種尺寸
favicon.png           分頁圖示 32×32（現代瀏覽器優先讀這個）
icon-192.png          192×192，給 Android「加到主畫面」用
apple-touch-icon.png  180×180，給 iOS 用（這張刻意保留白底，iOS 會自己切圓角）

你可以自己加的圖
----------------
banner.jpg            頂部橫幅背景。放進來就會自動使用；沒有這個檔案時，
                      橫幅會用 data.js 裡設定的動態漸層，不會破圖。
                      建議尺寸：1920×400 以上，橫式。


分頁圖示怎麼來的
----------------
不是直接把 JPEG 改名 —— 你的來源圖是「圓角方形圖示放在白色畫布上」，
直接縮到 16px 會變成一個白方塊。所以 tools/make-favicon.ps1 先做了兩件事：

  1. 從圖片四邊往內做洪水填充，只把「精確純白 255,255,255」且與外部相連的
     像素變成透明。刻意只認精確純白，因為圖內的女僕頭飾雖然也是白的，
     但帶有 JPEG 雜訊（例如 254,255,253），不會被誤刪。
  2. 再縮成各種尺寸並封裝。

要換圖示就重跑（記得用管理員權限的 PowerShell 或一般的都可以）：

  powershell -ExecutionPolicy Bypass -File tools\make-favicon.ps1 `
      -Source "你的新圖.jpeg"


注意
----
遊戲封面「不需要」放這裡。script.js 會用遊戲的 appid 自動組出
Steam 官方封面網址：

  https://cdn.cloudflare.steamstatic.com/steam/apps/<appid>/library_600x900.jpg

如果你想讓某款遊戲用自己的圖，在 data.js 的那款遊戲加一行：

  cover: 'images/我的圖.jpg'

圖片格式建議用 .jpg 或 .webp（檔案小）；要透明背景才用 .png。
影片檔（例如特別鳴謝用的 mp4）放在上一層的 media/，不要放這裡。
