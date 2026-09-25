# ciallo 的遊戲主頁

Steam 風格的個人遊戲主頁。純靜態網站 —— 沒有框架、沒有建置步驟、沒有後端，
直接用瀏覽器打開 `index.html` 就能看。


## 檔案結構

```
D:\My website\
├─ index.html              ← 版面骨架（不含內容，通常不需要改）
├─ data.js                 ← ★ 所有內容都在這裡，你只需要改這個檔案
├─ script.js               ← 讀取 data.js 自動生成卡片（通常不需要改）
├─ style.css               ← 樣式，顏色集中在最上面的 :root
├─ images\
│   ├─ avatar.jpg          ← 你的 Steam 頭像
│   ├─ thanks-preview.jpg  ← 特別鳴謝那顆按鈕的預覽圖
│   ├─ favicon.ico / .png  ← 分頁圖示（由你提供的圖轉出來的）
│   ├─ icon-192.png        ← Android 加到主畫面用
│   ├─ apple-touch-icon.png← iOS 加到主畫面用
│   └─ README.txt          ← 圖片放的規則
├─ media\
│   └─ deepseek-dance.mp4  ← 特別鳴謝播放的影片
├─ tools\
│   ├─ fetch-steam.mjs     ← 從 Steam API 重新抓資料的工具
│   ├─ make-favicon.ps1    ← 從一張方形圖重新產生 favicon
│   └─ steam-data.json     ← 抓下來的原始資料（給你參考，網站本身不讀它）
├─ user provide image\     ← 你原本給我的素材（已複製到上面各位置，可以刪掉）
└─ steam-api-key.txt       ← ⚠ 你的 Steam Web API 金鑰，不要上傳到公開網站
```

**內容與版面是分離的**：`data.js` 只管資料，`script.js` 只管產生 DOM，
`style.css` 只管外觀。三邊互不干擾。


## 怎麼改內容

打開 `data.js`，裡面的註解分成兩種標記：

- **✅ 已填真實資料** —— 我從你的 Steam 帳號抓的，可以直接用
- **✏️ 需要你自己填** —— 我留的空位

改完存檔，重新整理瀏覽器就生效，不用重啟任何東西。


## 目前還需要你填的東西

| 位置 | 內容 | 說明 |
| :-- | :-- | :-- |
| `links[]` | Discord / X / IG / YouTube / Twitch / Bilibili / GitHub / Email | 除了 Steam，其餘都是我填的範例網址。不想顯示某項就整行刪掉，或加 `enabled: false` |
| `games.favorites[].rating` | 個人評分 0～5 | 全部是 `null`，所以卡片上沒顯示星星。填數字就會出現 |
| `games.favorites[].why` | 一句「為什麼喜歡」 | 全部是空字串，所以卡片上沒有那行引文。填了才會顯示 |
| `games.favorites[].tags` | 標籤 | 我先按遊戲類型填了，請改成你自己的說法 |
| `games.favorites` 的選擇與順序 | 哪幾款算最愛 | 目前是我按時數排的前 9 名，陣列順序就是顯示順序 |
| `about.intro / habits` | 自我介紹、遊玩習慣 | 還是 `✏️` 範例文字（設備已填好） |
| `guestbook.mode` | 留言板模式 | 目前是 `'static'`，見下方說明 |

**關於評分與「為什麼喜歡」**：這兩個是主觀內容，我不會替你編，
所以全部留空。填 `rating: 4.5` 會出現 4.5 顆星；填 `why: '...'` 會出現引文框。


## 遊戲封面怎麼來的

不用自己上傳。`script.js` 會用遊戲的 `appid` 自動組出 Steam 官方封面：

```
https://cdn.cloudflare.steamstatic.com/steam/apps/<appid>/library_600x900.jpg
```

載入失敗會自動退回橫式 `header.jpg`，再失敗才顯示遊戲名稱（不會出現破圖）。
想讓某款遊戲用自己的圖，在該行加 `cover: 'images/我的圖.jpg'` 就會蓋過去。

> 註：願望清單裡的《死亡搁浅2》《超级枪弹辩驳２×２》因為尚未發售，
> Steam 還沒有封面圖，所以會顯示名稱為主的備援樣式，這是正常的。


## 更新 Steam 資料

之後想重新抓（例如買了新遊戲、時數變了）：

```powershell
cd "D:\My website"
node tools\fetch-steam.mjs
```

這會重新產生 `tools/steam-data.json`。**它不會動 `data.js`**，
所以你自己改過的內容不會被蓋掉 —— 對照著新資料手動更新即可。

> API key 申請：<https://steamcommunity.com/dev/apikey>


## 留言板的三種模式

改 `data.js` 的 `guestbook.mode`：

| 模式 | 行為 | 需要填 |
| :-- | :-- | :-- |
| `'static'`（目前） | 只有前端，按送出顯示示範訊息，不會真的送出去 | 無 |
| `'discord'` | 真的送出到 Discord Webhook | `discordWebhook` |
| `'google'` | 用 iframe 嵌入 Google 表單 | `googleFormUrl`（要 `?embedded=true` 的網址）|

程式碼不用改，只改這一個值。


## 特別鳴謝與影片

頁面最下方有一張卡片：按鈕上放預覽圖，點下去會彈出影片播放器。

影片有兩種來源，改 `data.js` 的 `thanks.video.source` 切換：

| `source` | 播放方式 |
| :-- | :-- |
| `'local'`（目前） | 播放 `media/deepseek-dance.mp4`，**離線也能看** |
| `'youtube'` | 用 YouTube 內嵌播放器播放 `thanks.video.youtube` |

不管選哪個，卡片上都會保留另一個的連結，讓訪客自己挑。

YouTube 網址支援 `youtu.be/xxx`、`watch?v=xxx`、`/embed/xxx`、`/shorts/xxx`
等各種格式，程式會自動取出影片 ID，你直接貼分享連結就行。

要換預覽圖，把圖覆蓋到 `images/thanks-preview.jpg`，或改 `thanks.preview`
指到別的檔案。標題與說明文字在 `thanks.heading` / `thanks.description`。

> 用 YouTube 內嵌時走的是 `youtube-nocookie.com`，不會在訪客瀏覽器放追蹤 cookie。
> 關閉彈窗時程式會清空播放器，影片不會在背景繼續播。


## 分頁圖示（favicon）

你的來源圖是「圓角方形圖示放在白色畫布上」。直接縮到 16px 會變成一個白方塊，
所以 `tools\make-favicon.ps1` 先用洪水填充把與外部相連的**精確純白**像素
變透明（只認 255,255,255，所以圖內的女僕頭飾不會被誤刪），再輸出各種尺寸。

要換圖示就重跑：

```powershell
cd "D:\My website"
powershell -ExecutionPolicy Bypass -File tools\make-favicon.ps1 `
    -Source "你的新圖.jpeg"
```

`apple-touch-icon.png` 刻意保留白底 —— iOS 會自己切圓角，透明反而會變黑邊。


## 彩蛋

**發現方式**：在網頁上任何位置**連續輸入 `ciallo`**（不分大小寫、不需要點輸入框）。
頁尾右下角有一個很不顯眼的小 `?`，滑鼠移上去會給提示。

觸發後會彈出「🎉 你發現彩蛋了！」面板，裡面就是「**廣告位招租**」。

想換觸發字串或文案，改 `data.js` 的 `easterEgg` 區塊即可。


## 注意事項

**API 金鑰**：`steam-api-key.txt` 是你的私密金鑰。這個資料夾要上傳到 GitHub
或任何公開空間之前，**務必先刪掉或排除這個檔案**。網站本身（HTML/CSS/JS）
不會讀取它，只有 `tools/fetch-steam.mjs` 在你自己電腦上跑的時候會用到。

**版權**：頁尾已經註明「非官方頁面，與 Valve 及 Steam 無關」，
以及遊戲封面版權屬各自發行者。這幾行建議保留。

**瀏覽器支援**：用到 CSS Grid、`aspect-ratio`、`backdrop-filter`、
`IntersectionObserver`，在 2021 年之後的 Chrome / Edge / Firefox / Safari 都正常。
