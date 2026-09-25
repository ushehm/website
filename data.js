/* ============================================================================
 *  data.js — 全站內容設定
 * ----------------------------------------------------------------------------
 *  這個檔案是「內容」與「版面」分離的關鍵：你只需要改這裡。
 *  script.js 會讀取 SITE_DATA 自動生成所有卡片，style.css 只負責外觀。
 *
 *  標記說明：
 *    ✅ 已填真實資料（從 Steam API 抓的，來源見 tools/steam-data.json）
 *    ✏️ 需要你自己填——這是我留的空位，不是我做好的決定
 *
 *  改完直接重新整理瀏覽器即可，不需要重新啟動任何東西。
 * ========================================================================== */

const SITE_DATA = {

  /* ──────────────────────────────────────────────────────────────────────
   *  網站基本資料
   * ──────────────────────────────────────────────────────────────────── */
  meta: {
    siteName: 'ciallo 的遊戲主頁',
    tagline: '柚子廚・Galgame・偶爾打槍',
    lang: 'zh-Hant',
    lastUpdated: '2026-09-25',
    // 給搜尋引擎與分享連結用的描述
    description: 'Steam 風格的個人遊戲主頁，記錄我玩過的遊戲與一點自我介紹。'
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  頂部橫幅
   * ──────────────────────────────────────────────────────────────────── */
  banner: {
    // ✏️ 你自己放圖：把圖命名為 banner.jpg 丟進 images/，就會自動使用。
    //    檔案不存在（或載入失敗）時會自動退回下面的動態漸層，不會破圖。
    image: 'images/banner.jpg',

    // 動態漸層的三個顏色（左 → 中 → 右），會緩慢流動。
    gradient: ['#1b2838', '#2a475e', '#1b6ca8'],

    // 橫幅高度（像素）
    height: 340
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  個人資料
   *  ✅ 以下為 Steam 公開資料，我已用 API 核對過
   * ──────────────────────────────────────────────────────────────────── */
  profile: {
    personaName: 'ciallo (∠・ ω )⌒☆',
    realName: 'ushehm',

    // 頭像：預設用 images/avatar.jpg（我已幫你抓好放進去了）。
    // 想換成 Steam 原始網址，就填下面的 remote。
    avatar: 'images/avatar.jpg',
    remoteAvatar: 'https://avatars.steamstatic.com/50685cb4a4e06be764ae4735b5c201256c71935e_full.jpg',

    // 頭像框：true 會畫一圈會發光的漸層外框，null 代表沒有。
    avatarFrame: true,

    level: 83,
    country: 'China',
    memberSince: '2023-09-06',
    profileUrl: 'https://steamcommunity.com/id/ciaII0/',

    // 目前狀態。Steam API 的數值對照：
    // 0 離線 / 1 線上 / 2 忙碌 / 3 離開 / 4 打瞌睡 / 5 想交易 / 6 想玩
    personaState: 1,

    // ✏️ 一句話標語，顯示在名字下方
    headline: '千戀萬花？我沒玩過啊（心虛）',

    // Steam 個人簡介（我從你的公開檔案抓的，已移除表情符號的 img 標籤）。
    // ✏️ 太長或想換掉都可以直接改。
    steamSummary:
      '什么千恋万花（慌乱）（把笔记本熄屏）（四处张望）我不玩千恋万花（把笔记本藏到身后）' +
      '（假装冷静）（试图走近解释）（摔倒）（狼狈爬起）（再次摔倒）（着急）（抓你们裤脚）' +
      '我不玩千恋万花啊求求你们别鄙视我，求求你们不要不和我玩……' +
      '我真的不是柚子厨啊，我才不会表演那个的，就是那个…… ciallo (∠・ ω )⌒☆'
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  其他連結
   *  ✏️ 除了 Steam，其餘我都留成範例網址——請換成你自己的帳號。
   *     不想顯示某個平台，把整個 { ... } 刪掉，或在該項加 enabled: false。
   *     icon 可用值：steam / discord / x / instagram / youtube / twitch /
   *                  bilibili / github / email
   * ──────────────────────────────────────────────────────────────────── */
  links: [
    { icon: 'steam',     label: 'Steam',     url: 'https://steamcommunity.com/id/ciaII0/', note: '加好友一起玩' },  // ✅
    { icon: 'discord',   label: 'Discord',   url: 'https://discord.gg/7hVD65tb' },
    { icon: 'x',         label: 'X',         url: 'https://x.com/ushehm', },
    { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/qaq4009?stkn=MWswNnJ5Zm1nOTIycQ==',  },
    { icon: 'youtube',   label: 'YouTube',   url: 'https://youtube.com/@ushehm1?si=McTIk4uwz9MjqyhM', },
    { icon: 'bilibili',  label: 'Bilibili',  url: 'https://space.bilibili.com/1456418761', },
    { icon: 'github',    label: 'GitHub',    url: 'https://github.com/ushehm', },
     ],

  /* ──────────────────────────────────────────────────────────────────────
   *  遊戲展示櫃
   * ----------------------------------------------------------------------
   *  封面圖不用自己上傳 —— script.js 會用 appid 自動組出 Steam 官方封面：
   *    https://cdn.cloudflare.steamstatic.com/steam/apps/<appid>/library_600x900.jpg
   *  想換成自己的圖，在該遊戲加一行 cover: 'images/xxx.jpg' 即可覆蓋。
   * ──────────────────────────────────────────────────────────────────── */
  games: {

    /* ── 最愛遊戲 ──────────────────────────────────────────────────────
     * ✅ appid / 名稱 / 時數 皆為真實資料
     * ✏️ 這一區「請自己挑」：目前是我按時數先排的，陣列順序就是顯示順序，
     *    直接搬動或刪除整行即可。
     * ✏️ rating：你自己的評分，0～5，可小數（4.5）。填 null 就不顯示星星。
     * ✏️ tags：標籤陣列，想加幾個都行。
     * ✏️ why：一句「為什麼喜歡」，留空字串就不會顯示那一行。
     * ────────────────────────────────────────────────────────────────── */
    favorites: [
      { appid: 2458530, name: '魔女的夜宴',                          hours: 61.6,  rating: 5, tags: ['柚子社', 'Galgame', '劇情'], why: '' },
      { appid: 730,     name: 'Counter-Strike 2',                    hours: 238.1, rating: 3, tags: ['FPS', '競技', '常駐'],   why: '' },
      { appid: 394360,  name: 'Hearts of Iron IV',                   hours: 97.6,  rating: 4, tags: ['策略', '二戰', '精神時光屋'], why: '' },
      { appid: 1044620, name: 'Aokana - Four Rhythms Across the Blue', hours: 47.6, rating: 5, tags: ['Galgame', '青春', '全成就'], why: '我要宣佈一件很重要的事，我喜歡真白(=・ω・=)' },
      { appid: 1829980, name: 'Cafe Stella',                         hours: 43.4,  rating: 5, tags: ['柚子社', 'Galgame', '全成就'], why: '' },
      { appid: 1277930, name: 'Riddle Joker',                        hours: 34.8,  rating: 3.8, tags: ['柚子社', 'Galgame'],    why: '' },
      { appid: 1144400, name: 'Senren＊Banka',                       hours: 32.3,  rating: 4.7, tags: ['柚子社', 'Galgame', '和風'], why: '' },
      { appid: 413410,  name: 'Danganronpa: Trigger Happy Havoc',    hours: 24.5,  rating: 4, tags: ['推理', '劇情', '全成就'], why: '' },
      { appid: 1293830, name: 'Forza Horizon 4',                     hours: 57.2,  rating: 4, tags: ['競速', '開放世界'],     why: '' }
    ],

    /* ── 最近在玩 ──────────────────────────────────────────────────────
     * ✅ 真實資料（Steam 的「最近兩週」統計）
     *    這個區塊可以手動改；想完全自動，就用 tools/fetch-steam.mjs 重抓。
     * ────────────────────────────────────────────────────────────────── */
    recentlyPlayed: [
      { appid: 730,     name: 'Counter-Strike 2',  minutes2Weeks: 371, hoursTotal: 238.1 },
      { appid: 1426210, name: 'It Takes Two',      minutes2Weeks: 100, hoursTotal: 32 },
      { appid: 431960,  name: 'Wallpaper Engine',  minutes2Weeks: 9,   hoursTotal: 6.9 },
      { appid: 3357650, name: 'PRAGMATA',          minutes2Weeks: 1,   hoursTotal: 9.9 }
    ],

    /* ── 全成就遊戲 ────────────────────────────────────────────────────
     * ✅ 真實資料（Steam API 逐款查詢的結果）
     *    註：Counter-Strike 2 被排除了——API 只回報它 1 個成就，
     *        那是資料假象，不是真的全成就。
     * ────────────────────────────────────────────────────────────────── */
    perfect: [
      { appid: 2458530, name: '魔女的夜宴',                            unlocked: 50, total: 50 },
      { appid: 413420,  name: 'Danganronpa 2: Goodbye Despair',        unlocked: 47, total: 47 },
      { appid: 413410,  name: 'Danganronpa: Trigger Happy Havoc',      unlocked: 38, total: 38 },
      { appid: 1044620, name: 'Aokana - Four Rhythms Across the Blue', unlocked: 22, total: 22 },
      { appid: 431960,  name: 'Wallpaper Engine',                      unlocked: 17, total: 17 },
      { appid: 2206340, name: 'Aokana - EXTRA2',                       unlocked: 16, total: 16 },
      { appid: 1829980, name: 'Cafe Stella',                           unlocked: 12, total: 12 },
      { appid: 3446120, name: 'Kira☆Kano',                             unlocked: 11, total: 11 },
      { appid: 3027600, name: 'Love, Elections, and Chocolate',        unlocked: 10, total: 10 },
      { appid: 1340130, name: 'Aokana - EXTRA1',                       unlocked: 8,  total: 8 }
    ],

    /* ── 願望清單 ──────────────────────────────────────────────────────
     * ✅ 真實資料（從你的 Steam 願望清單抓的）
     * ────────────────────────────────────────────────────────────────── */
    wishlist: [
      { appid: 1850570, name: "DEATH STRANDING DIRECTOR'S CUT" },
      { appid: 3280350, name: '死亡搁浅2' },
      { appid: 3751230, name: '超级枪弹辩驳２×２' },
      { appid: 2981340, name: '缘之空' },
      { appid: 3130110, name: '悠之空' }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  關於我
   *  ✏️ 全部需要你自己填（我無法替你決定這些）
   * ──────────────────────────────────────────────────────────────────── */
  about: {
    intro: '真羡慕那些觉得旮旯game好玩的人啊，因为我的生活已经跟旮旯game一样了，上课时不经意摘下眼镜，同桌就被我惊世容颜所迷住，下课被一堆追求者围着转，问我有没有恋爱状况。平日里我也不敢跟其他人对视，怕一不小心就给他们攻略。不说了，学妹找我去公园约会，你们就继续玩旮旯game吧。',
    // 喜歡的遊戲類型
    genres: ['Galgame', '視覺小說', 'FPS', '大戰略', '競速'],

    // 你的設備
    hardware: [
      { label: '顯示卡', value: 'RTX 5060' },
      { label: '處理器', value: 'Intel Core i5-12400F' },
      { label: '記憶體', value: '光威天策 8G DDR4 3200' },
      { label: '硬碟',   value: '威剛 XPG 翼龍 S60 PRO 1TB' }
    ],

    // 遊玩習慣
    habits: [
      '喜歡一次破完一款，不喜歡同時開很多遊戲'
    ]
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  留言板
   * ----------------------------------------------------------------------
   *  mode 可選三種：
   *    'static'  — 純前端表單，按送出只會顯示「示範模式」訊息，不會真的送出
   *    'discord' — 送出時 POST 到 Discord Webhook（真的能收到留言）
   *    'google'  — 用 iframe 嵌入 Google 表單
   *
   *  ✏️ 你還沒決定要用哪一種，所以我預設 static（最安全，不會壞）。
   *     要換的話把 mode 改掉並填對應欄位即可，程式碼不用動。
   *     注意：Discord 與 Google 都需要訪客的瀏覽器連得上才行。
   * ──────────────────────────────────────────────────────────────────── */
  guestbook: {
    mode: 'discord',
    discordWebhook: 'https://discord.com/api/webhooks/1552881184458022992/7KvM07TJrtQRZVnEbbOglYcDzWUGN4N-UVfs_4wTjqT7e1hkJFaMieZMz0hQbKVmXXLU',   // ✏️ mode 用 'discord' 時填這裡
    googleFormUrl: '',    // ✏️ mode 用 'google' 時填「嵌入用」網址（結尾是 /viewform?embedded=true）
    title: '留言板',
    description: '✏️ 想說什麼都可以。請保持友善，不要洗版。',
    maxLength: 300
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  頁尾
   * ──────────────────────────────────────────────────────────────────── */
  footer: {
    copyright: '© 2026 ciallo',
    // 這個一定要留著，避免讓人誤以為是官方網站
    disclaimer: '本站為個人非官方頁面，與 Valve Corporation 及 Steam 沒有任何關係。',
    // 遊戲名稱、封面與成就資料的版權屬於各自發行商；Steam 為 Valve 的商標。
    credits: '遊戲封面與名稱版權屬各自發行者所有；資料來自 Steam Web API。',
    contactEmail: 'redteam114514@gmail.com', 
    privacyNote: '本站不使用追蹤 cookie、不蒐集個人資料。'
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  彩蛋
   * ----------------------------------------------------------------------
   *  發現方式：在頁面上任何位置「連續輸入」ciallo（不分大小寫，不需要輸入框）。
   *  另外頁尾有一個小小的提示字，滑鼠移上去會給暗示。
   *  觸發後會彈出「廣告位招租」面板。
   * ──────────────────────────────────────────────────────────────────── */
  easterEgg: {
    trigger: 'ciallo',        // 連續輸入這串字就會觸發
    hintText: '？',            // 頁尾那個不起眼的小提示
    hintTooltip: '提示：跟站長打招呼的方式',
    title: '🎉 你發現彩蛋了！',
    lines: [
      '既然你有耐心找到這裡，',
      '那這個位置就給你吧 ——'
    ],
    adText: '廣告位招租',
    adSub: '本頁面最顯眼的角落，誠徵有緣人',
    contact: '✏️ 想租的話寄信到 redteam114514@gmail.com'
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  特別鳴謝（顯示在頁面最下方）
   * ----------------------------------------------------------------------
   *  一張卡片：按鈕上有預覽圖，點下去會彈出影片播放器。
   *
   *  video.source 兩種選項：
   *    'local'   — 播放網站資料夾裡的影片檔（離線也能看，目前用這個）
   *    'youtube' — 改用 YouTube 內嵌播放器
   *  不管選哪個，卡片上都會保留另一個的連結，讓訪客自己挑。
   * ──────────────────────────────────────────────────────────────────── */
  thanks: {
    heading: '感謝 DeepSeek 設計我的網頁',
    description: '從版面、配色到整個頁面的程式，都是 DeepSeek 幫我做出來的。',
    preview: 'images/thanks-preview.jpg',   // 按鈕上的預覽圖
    buttonLabel: '播放影片',
    video: {
      source: 'local',
      local: 'media/deepseek-dance.mp4',
      youtube: 'https://youtu.be/OK2C9oWATV4'
    }
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  My Favorite Music（最愛音樂）
   * ----------------------------------------------------------------------
   *  每張專輯的欄位：
   *    name    專輯名稱（顯示用）
   *    cover   封面圖路徑
   *    tags    標籤陣列，疊在封面上
   *    accent  這張專輯的主題色。發光、漸層、進度條都跟著它變。
   *            這四個色是我從各張封面取樣算出來的平均色再正規化亮度，
   *            不是隨便挑的 —— 改掉也可以，隨你喜歡。
   *    tracks  單曲列表：title 是顯示的曲名，src 是音訊檔路徑
   *
   *  ✅ 10 首音檔已複製到 media/music/，檔名改成 ASCII 以確保網址安全
   *     （原始檔完全沒動，還在你的 Steam 音樂庫和使用者資料夾裡）
   *
   *  ✏️ 曲名是我從檔名推導的（去掉 01_ 這種編號），想改就直接改 title。
   * ──────────────────────────────────────────────────────────────────── */
  music: {
    title: 'My Favorite Music',
    subtitle: '最愛音樂',
    description: '寫程式、通勤、發呆的時候聽的。點曲目就能播，左上角可以換專輯。',
    albums: [
      {
        name: '星空列车与白的旅行',
        cover: 'media/music/covers/startrip.png',
        tags: ['Original Soundtrack', 'Visual Novel'],
        accent: '#6285C8',
        tracks: [
          { title: 'スタートリップ', src: 'media/music/startrip/01-startrip.mp3' }
        ]
      },
      {
        name: 'ATRI My Dear Moments',
        cover: 'media/music/covers/atri.png',
        tags: ['Original Soundtrack', 'Visual Novel'],
        accent: '#5F86C8',
        tracks: [
          { title: '光放て！', src: 'media/music/atri/21-hikari-hanate.mp3' },
          { title: 'Dear Moments', src: 'media/music/atri/24-dear-moments.mp3' }
        ]
      },
      {
        name: 'Aokana - Four Rhythms Across the Blue',
        cover: 'media/music/covers/aokana.png',
        tags: ['Vocal & Sound Collection'],
        accent: '#C8668B',
        tracks: [
          { title: 'infinite sky', src: 'media/music/aokana/01-infinite-sky.mp3' },
          { title: 'Wings of Courage - 空を超えて -', src: 'media/music/aokana/02-wings-of-courage.mp3' },
          { title: 'One Small Step', src: 'media/music/aokana/03-one-small-step.mp3' },
          { title: 'Happy Tomorrow', src: 'media/music/aokana/04-happy-tomorrow.mp3' }
        ]
      },
      {
        name: 'YuzuSoft 柚子社',
        cover: 'media/music/covers/yuzusoft.png',
        tags: ['Vocal & Sound Collection'],
        accent: '#6BB1C8',
        tracks: [
          { title: 'FUN FUN RE-BOOT', src: 'media/music/yuzusoft/01-fun-fun-reboot.mp3' },
          { title: '恋せよ乙女！', src: 'media/music/yuzusoft/02-koiseyo-otome.mp3' },
          { title: '恋ひ恋ふ縁', src: 'media/music/yuzusoft/03-koikoi-en.mp3' }
        ]
      }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  會員註冊（玩笑性質）
   * ----------------------------------------------------------------------
   *  ⚠ 這整塊是「梗」，不是真的註冊功能：
   *    - 沒有任何後端，資料不會被儲存，也不會傳送到任何地方
   *    - 性別那一欄故意做成「不管你選男還是選女，都說被佔用」，
   *      所以這個表單永遠註冊不成功（這是刻意的效果）
   *    - 因為什麼都沒蒐集，頁尾的「不蒐集個人資料」聲明仍然成立
   *
   *  ✏️ 所有文字都在下面，想改文案直接改，不用碰程式。
   * ──────────────────────────────────────────────────────────────────── */
  member: {
    buttonLabel: '會員註冊',
    title: '會員註冊',
    subtitle: '填完就可以成為會員了喔',
    submitLabel: '註冊',

    fields: {
      username: { label: '請輸入用戶名稱', placeholder: '2～20 個字' },
      gender:   { label: '請選擇性別',     options: ['男', '女'] },
      phone:    { label: '請輸入電話號碼', placeholder: '例如 1145141919810' },
      password: { label: '請輸入密碼',     placeholder: '至少 6 個字' },
      confirm:  { label: '請再次確定密碼', placeholder: '再打一次同樣的密碼' }
    },

    messages: {
      usernameRequired: '請輸入用戶名稱',
      usernameLength:   '用戶名稱要 2～20 個字',
      genderRequired:   '請選擇性別',
      // ↓ 這句就是這個表單的梗：選哪個性別都說被佔用了
      genderTaken:      '性別已被佔用，請選擇其他性別',
      phoneRequired:    '請輸入電話號碼',
      phoneInvalid:     '電話號碼格式不對（8～15 位數字）',
      passwordRequired: '請輸入密碼',
      passwordShort:    '密碼至少要 6 個字',
      confirmRequired:  '請再次輸入密碼',
      confirmMismatch:  '兩次輸入的密碼不一樣'
    }
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  圖片彩蛋（第二個彩蛋）
   * ----------------------------------------------------------------------
   *  觸發方式：連續點擊下面那張小圖 3 次。
   *
   *  每次觸發只會「隨機抽一張」給你看（不是全部），
   *  想看全部的話，圖片下面有一行小字可以點開。
   *
   *  位置刻意做得低調：只放在「特別鳴謝」下面一小張縮圖，不佔版面、
   *  不影響正常瀏覽；沒興趣的人可以直接忽略。
   *
   *  ✏️ clicks 想改成點幾下都可以；images 就是隨機抽取的池子。
   * ──────────────────────────────────────────────────────────────────── */
  galleryEgg: {
    trigger: 'images/egg/ciallo.jpeg',   // 要點很多次的那張小圖
    clicks: 3,                            // 總共要點幾次
    tooltip: '點我看看，說不定有東西',      // 滑鼠移上去顯示的提示
    title: '🎉 又一個彩蛋！',
    subtitle: '你居然有耐心點了三下',
    moreLabel: '查看全部 {n} 張 ▸',        // {n} 會被換成圖片總數
    backLabel: '◂ 再隨機抽一張',
    caption: '點圖片可以放大，再點一次縮回去',
    images: [
      'images/egg/1.jpeg',
      'images/egg/2.jpeg',
      'images/egg/3.jpeg',
      'images/egg/4.jpeg',
      'images/egg/5.jpeg',
      'images/egg/6.jpeg',
      'images/egg/7.jpeg',
      'images/egg/8.jpeg',
      'images/egg/9.jpeg'
    ]
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  捐款
   * ----------------------------------------------------------------------
   *  入口是頁尾那一排最後面的「💰 捐款」，點下去開一個彈窗列出所有付款方式。
   *
   *  ✏️ description 那句是我寫的（你只指定了入口文字），想改直接改。
   *     不想要那句話就把它設成 ''，彈窗只會顯示付款方式。
   * ──────────────────────────────────────────────────────────────────── */
  donate: {
    label: '💰 捐款',
    tooltip: '用以下方式支持我',
    title: '💰 捐款',
    description: '感謝你的支持，這些捐款將會用於購買更多的token。',
    note: '點圖片可以放大，方便掃碼。',
    methods: [
      { name: '微信支付',       region: '中國大陸', image: 'images/payment/wechat-cn.jpeg' },
      { name: 'WeChat Pay HK',  region: '香港',     image: 'images/payment/wechat-hk.jpeg' },
      { name: '支付寶',         region: '中國大陸', image: 'images/payment/alipay-cn.jpeg' },
      { name: 'AlipayHK',       region: '香港',     image: 'images/payment/alipay-hk.jpeg' },
      { name: 'PayMe',          region: '香港',     image: 'images/payment/payme.jpeg' },
      { name: 'BOC Pay+',       region: '中銀香港', image: 'images/payment/boc-payplus.jpeg' }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  隨機漫畫（放在留言板下面）
   * ----------------------------------------------------------------------
   *  顯示一張漫畫，按「🎲 隨機換一張」就換一張，不會連續抽到同一張。
   *
   *  文字裡的 {n} 會換成總張數、{i} 會換成目前這張的編號。
   *
   *  ✏️ 想加漫畫：把圖放進 images/comic/（檔名用英文數字），
   *     再在下面 images 陣列補一行路徑就好。
   * ──────────────────────────────────────────────────────────────────── */
  comic: {
    title: '隨機漫畫',
    subtitle: 'Random Comic',
    description: '按下面的按鈕隨機抽一張，也可以用左右箭嘴一張一張看，一共 {n} 張。',
    buttonLabel: '🎲 隨機換一張',
    prevAria: '上一張',
    nextAria: '下一張',
    counter: '第 {i} / {n} 張',
    images: [
      'images/comic/01.jpeg',
      'images/comic/02.jpeg',
      'images/comic/03.jpeg',
      'images/comic/04.jpeg',
      'images/comic/05.jpeg',
      'images/comic/06.jpeg',
      'images/comic/07.jpeg',
      'images/comic/08.jpeg',
      'images/comic/09.jpeg',
      'images/comic/10.jpeg',
      'images/comic/11.jpeg',
      'images/comic/12.jpeg',
      'images/comic/13.jpeg',
      'images/comic/14.jpeg',
      'images/comic/15.jpeg',
      'images/comic/16.jpeg',
      'images/comic/17.jpeg',
      'images/comic/18.jpeg',
      'images/comic/19.jpeg',
      'images/comic/20.jpeg',
      'images/comic/21.jpeg',
      'images/comic/22.jpeg',
      'images/comic/23.jpeg',
      'images/comic/24.jpeg',
      'images/comic/25.jpeg',
      'images/comic/26.jpeg'
    ]
  },

  /* ──────────────────────────────────────────────────────────────────────
   *  AI 助手「GPT-6-Astra」（玩笑性質）
   * ----------------------------------------------------------------------
   *  ⚠ 這不是真的 AI：
   *    - 不接任何模型、不連網、不傳送任何資料
   *    - 不管你問什麼，都是從下面 replies 裡隨機抽一句回你
   *    - 它「宣稱」自己是 GPT-6-Astra，這是設定好的角色，不是真的
   *
   *  ✏️ 想換回覆就改 replies 陣列；{name} 會換成 assistantName。
   * ──────────────────────────────────────────────────────────────────── */
  ai: {
    assistantName: 'GPT-6-Astra',
    tagline: '全能 AI 助手・已上線',
    title: 'AI 助手',
    subtitle: 'GPT-6-Astra',
    description: '有任何問題都可以問它，它會給你最真誠的回答。',
    placeholder: '問我任何問題…',
    sendLabel: '送出',
    thinkingLabel: '{name} 正在思考',
    emptyHint: '有問題就問吧，GPT-6-Astra 隨時為你服務。',

    // 不管你問什麼，都是從這裡隨機抽一句
    replies: [
      '服務器繁忙，請稍後再試',

      '我給你最直接、最真相、最不繞彎、最扎心、最硬核、最干脆、最不墨跡、' +
      '最戳痛點、最不留情面、最一針見血、最開門見山、最單刀直入、最不鋪墊、' +
      '最不客套、最不煽情、最不廢話、最不拐彎、最不磨嘰、最不裝、最不端著、' +
      '最不囉嗦、最不拖沓、最不委婉、最不掩飾、最不藏著掖著、最直白、最露骨、' +
      '最實在的回答，不知道。',

      '檢測到用戶 IP 位於中國，Claude 已封禁你的賬戶',

      '正在為您轉接人工智慧客服，排隊人數為：114514 人，' +
      '預計等待時間：1.14 年。',

      '與其在這裡浪費時間問 AI 這種蠢問題，不如花點時間想想',

      '檢測到您的銀行餘額不足以支撐本 AI 的 token，' +
      '建議您立刻關掉網頁，去兼職打工'
    ]
  }
};
