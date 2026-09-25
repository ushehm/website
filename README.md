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
│   ├─ deepseek-dance.mp4  ← 特別鳴謝播放的影片
│   └─ music\
│       ├─ covers\         ← 4 張專輯封面
│       ├─ startrip\       ← 各專輯的音訊檔（檔名已改成 ASCII）
│       ├─ atri\
│       ├─ aokana\
│       └─ yuzusoft\
├─ tools\
│   ├─ fetch-steam.mjs     ← 從 Steam API 重新抓資料的工具
│   ├─ make-favicon.ps1    ← 從一張方形圖重新產生 favicon
│   └─ steam-data.json     ← 抓下來的原始資料（給你參考，網站本身不讀它）
├─ user provide image\     ← 你原本給我的素材（已複製到上面各位置，可以刪掉）
├─ user provide music\     ← 同上，音訊原始檔（可以刪掉）
├─ update-website.bat      ← 雙擊就把變更推上 GitHub
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


## My Favorite Music（音樂區）

左邊是專輯封面與左右切換箭頭，右邊是曲目列表，下方是播放控制列。

### 怎麼操作

| 動作 | 方式 |
| :-- | :-- |
| 播放／暫停某首 | 點曲目那一列；再點同一首會暫停 |
| 一首播完 | 會自動接下一首；到專輯最後一首就停 |
| 切換專輯 | 點封面兩側的 ◀ ▶，或直接按鍵盤 **← →** |
| 跳秒 | 點進度條任何位置，或按住拖曳 |
| 音量 | 右下角滑桿 |

鍵盤左右鍵在這些情況**不會**被攔截：焦點在輸入框（留言板）、任何彈窗開著、
或焦點在進度條／音量滑桿上（那時左右鍵是快進／倒轉 5 秒）。

切換專輯時**不會**中斷正在播的歌 —— 播放器會繼續播，只是畫面換了一張專輯。
只有當顯示中的專輯就是播放中那首所屬的專輯時，曲目才會顯示播放中的標記。

### 怎麼改內容

全部在 `data.js` 的 `music` 區塊：

```js
music: {
  albums: [
    {
      name:   '專輯名稱',
      cover:  'media/music/covers/xxx.png',   // 封面圖
      tags:   ['標籤一', '標籤二'],            // 疊在封面底部
      accent: '#6285C8',                      // 這張專輯的主題色
      tracks: [
        { title: '顯示的曲名', src: 'media/music/xxx/01-song.mp3' }
      ]
    }
  ]
}
```

**`accent` 是這張專輯的主題色。** 封面發光、播放鈕、進度條、音量滑桿、
正在播那首的邊框、區塊頂部的柔光，全部跟著它變色。目前這四個顏色是我
從各張封面取樣算出來的（取飽和像素的色相眾數，再正規化亮度），不是隨便挑；
想換成自己喜歡的顏色，直接改 hex 值就好。

### 加新歌

1. 把音訊檔放進 `media/music/<專輯>/` 底下
2. 在 `data.js` 對應的 `tracks` 陣列加一行 `{ title: '曲名', src: '路徑' }`

檔名建議用 ASCII（英文、數字、減號）。中文、空格、全形標點在網址裡需要編碼，
能用但容易出問題，所以複製進來時我把檔名換掉了 —— 你原本的檔案完全沒動。


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


## 會員註冊（玩笑）

橫幅右上角有一顆「會員註冊」按鈕，點開是五欄表單：用戶名稱、性別、電話號碼、
密碼、再次確定密碼，最下面是註冊鍵。

**這不是真的註冊功能，是刻意做的梗：**

- **沒有任何後端。** 資料不會被儲存，也不會傳送到任何地方 —— 打開瀏覽器的
  開發者工具、切到 Network 面板再按註冊，不會有任何請求送出。
- **性別那一欄永遠說「性別已被佔用，請選擇其他性別」。** 選男也說被佔用、
  選女也說被佔用，所以這個表單**永遠註冊不成功**。這是 `data.js` 的
  `member.messages.genderTaken` 設定出來的效果，不是 bug。
- 因為什麼都沒蒐集，頁尾的「本站不使用追蹤 cookie、不蒐集個人資料」仍然成立。

其餘四欄的驗證是正常的：名稱 2～20 字、電話 8～15 位數字、密碼至少 6 個字、
兩次密碼要一致。驗證失敗時那一欄會變紅框、顯示訊息並晃動一下，焦點也會移過去。

所有文案都在 `data.js` 的 `member` 區塊，改字不用碰程式。

> 想把那個梗拿掉：改掉 `member.messages.genderTaken` 的內容，並在 `script.js`
> 的 `submitMember()` 裡把 `else fail('gender', m.genderTaken);` 那一行刪掉。


## 彩蛋

**發現方式**：在網頁上任何位置**連續輸入 `ciallo`**（不分大小寫、不需要點輸入框）。
頁尾右下角有一個很不顯眼的小 `?`，滑鼠移上去會給提示。

觸發後會彈出「🎉 你發現彩蛋了！」面板，裡面就是「**廣告位招租**」。

想換觸發字串或文案，改 `data.js` 的 `easterEgg` 區塊即可。


## 圖片彩蛋（第二個）

「特別鳴謝」下面、頁尾上面有一張**很小、半透明的圓形縮圖**（68px）。
它平常幾乎不搶眼，滑鼠移上去才會亮起來。

**發現方式**：連續點它 **3 次**。每點一下底下會亮一個小點，讓你知道「有在算」。

第 3 下會**隨機抽一張**圖片顯示（不是全部）。同一張圖再點一下可以放大。
圖片下面有一行小字「查看全部 9 張 ▸」，點開才會展開全部圖片的網格；
展開後下面還有一行「◂ 再隨機抽一張」可以回到單張模式。

每次重新觸發都會重抽，而且會避開上一次抽到的那張（只有兩張以上時才這樣做）。

| 想改什麼 | 改哪裡 |
| :-- | :-- |
| 要點幾下 | `data.js` → `galleryEgg.clicks` |
| 縮圖換成別的圖 | `galleryEgg.trigger` |
| 隨機抽取的圖片池 | `galleryEgg.images` 陣列 |
| 標題／副標／說明文字 | `galleryEgg.title` / `subtitle` / `caption` |
| 兩行小字的文字 | `galleryEgg.moreLabel` / `backLabel`（`{n}` 會換成圖片總數）|
| 滑過去顯示的提示 | `galleryEgg.tooltip`（設成 `''` 就沒有提示） |

圖片放在 `images/egg/`，總共約 0.8 MB。縮圖載入失敗時整個彩蛋會自動移除，
不會在頁面上留一個破圖。


## 捐款

頁尾那一排的最後面有一個「**💰 捐款**」按鈕，點下去開一個彈窗，
列出所有付款方式。點任一張付款碼可以放大到滿版寬度，方便掃碼。

目前有 6 種：

| 名稱 | 地區 | 檔案 |
| :-- | :-- | :-- |
| 微信支付 | 中國大陸 | `images/payment/wechat-cn.jpeg` |
| WeChat Pay HK | 香港 | `images/payment/wechat-hk.jpeg` |
| 支付寶 | 中國大陸 | `images/payment/alipay-cn.jpeg` |
| AlipayHK | 香港 | `images/payment/alipay-hk.jpeg` |
| PayMe | 香港 | `images/payment/payme.jpeg` |
| BOC Pay+ | 中銀香港 | `images/payment/boc-payplus.jpeg` |

改 `data.js` 的 `donate` 區塊就能增減付款方式：`methods` 陣列裡每一項有
`name`（名稱）、`region`（地區標籤，不想要就刪掉那一行）、`image`（圖路徑）。

`donate.description` 那句話是我寫的（你當初只指定了「💰 捐款」四個字的入口），
想改直接改；設成 `''` 就只會顯示付款方式，不會有那句說明。

> 隱私提醒：付款碼圖片跟網站放在一起，所以**部署到 Cloudflare 之後任何訪客
> 都能看到並下載這些圖**（這是捐款功能的必要條件，不然別人掃不到碼）。
> 如果你不想讓原圖被下載，只能改用第三方收款頁面連結。


## 隨機漫畫

放在**留言板下面**。顯示一張四格漫畫，按「🎲 隨機換一張」就隨機換一張，
旁邊會顯示「第 N / 26 張」。

連續按不會抽到同一張（程式會比對上一次抽到的，重複就重抽），
不然連按兩次畫面沒變，會讓人以為按鈕壞掉。

漫畫放在 `images/comic/`，檔名 `01.jpeg` ～ `26.jpeg`。想加漫畫：

1. 把圖放進 `images/comic/`（**檔名用英文數字**，中文與空格在網址裡要編碼）
2. 在 `data.js` 的 `comic.images` 陣列補一行路徑

改 `data.js` 的 `comic` 區塊就能改標題與按鈕文字，`{n}` 會換成總張數、
`{i}` 會換成目前張數。

> **外框高度固定在 `min(72vh, 720px)`**（手機是 `min(60vh, 480px)`）。
> 這樣換圖時版面不會跳動、按鈕不會跑掉；但代價是**很直的漫畫會被高度限制住**，
> 顯示起來比較小。如果你希望漫畫更大，跟我說，我可以改成點圖放大。


## 注意事項

**API 金鑰**：`steam-api-key.txt` 是你的私密金鑰。這個資料夾要上傳到 GitHub
或任何公開空間之前，**務必先刪掉或排除這個檔案**。網站本身（HTML/CSS/JS）
不會讀取它，只有 `tools/fetch-steam.mjs` 在你自己電腦上跑的時候會用到。

**版權**：頁尾已經註明「非官方頁面，與 Valve 及 Steam 無關」，
以及遊戲封面版權屬各自發行者。這幾行建議保留。

**瀏覽器支援**：用到 CSS Grid、`aspect-ratio`、`backdrop-filter`、
`IntersectionObserver`，在 2021 年之後的 Chrome / Edge / Firefox / Safari 都正常。
