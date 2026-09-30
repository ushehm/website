/* ============================================================================
 *  data.js —— 冷戰時期・歷史音樂：資料
 * ----------------------------------------------------------------------------
 *  這個檔案是「要放什麼內容」的唯一來源。換 MP3、改曲名、加國家都改這裡。
 *
 *  ⚠ 為什麼不用 data.json？
 *     data.json 要用 fetch() 讀，而本機雙擊 index.html 時（file:// 協定）
 *     瀏覽器會擋掉 fetch 本機檔案，整個頁面會載不出曲目。
 *     這支是普通的 <script>，本機開、部署後都正常。
 *
 *  ── 地圖與光點座標 ──────────────────────────────────────────────────────
 *  x / y 是「地圖圖片上的百分比」（0 開始，左上角是 0,0）。
 *  目前的數字是用 d3-geo 的羅賓森投影算出來，再校準到這張圖上的。
 *  ⚠ 這張圖的中央經線是 10.5°E（不是 0°），校準時一定要把這件事算進去，
 *    否則誤差會隨經度增加（北京、平壤、大馬士革都因此偏東約 2.7 個百分點）。
 *  ⚠ 換地圖之後這些數字要重新校準，不然光點會跑位。
 *  lat / lon 是首都的真實經緯度，留著方便重新對位用。
 *
 *  ── MP3 放哪裡 ─────────────────────────────────────────────────────────
 *  路徑是相對於 history/music/index.html，所以 ../../assets/audio/ 就是
 *  網站根目錄的 assets/audio/。檔名照下面寫好的放進去就會動。
 * ========================================================================== */

const HISTORY_MUSIC = {

  /* ── 頁面文字 ─────────────────────────────────────────────────────────── */
  title: '冷戰時期・歷史音樂',
  subtitle: 'Cold War Folk Music',
  intro: '點地圖上的光點，聽那個國家的民俗音樂。',
  backLabel: '← 回到歷史專區',
  backHref: 'history.html',

  /* ── 地圖底圖 ───────────────────────────────────────────────────────── */
  map: {
    src: '../../assets/map/Cold_War_Map_1959.svg',
    // 底圖的實際繪圖範圍（光點百分比就是對這個範圍算的）
    // ⚠ 換地圖一定要重新校準 x/y，不然光點會跑位
    width: 1400,
    height: 710,
    // 底圖載入失敗時顯示的替代文字
    alt: '冷戰時期世界地圖（1959 年）',
    // 授權（CC BY-SA 4.0 要求標註出處）
    credit: '地圖：Sémhur／Wikimedia Commons，CC BY-SA 4.0'
  },

  /* ── 播放器文字 ───────────────────────────────────────────────────────── */
  ui: {
    play: '播放',
    pause: '暫停',
    prev: '上一首',
    next: '下一首',
    shuffle: '隨機播放',
    repeat: '循環播放',
    volume: '音量',
    progress: '播放進度',
    noTrack: '尚未選擇曲目',
    loading: '載入中…',
    loadError: '這個音訊檔載入失敗（可能還沒放進 assets/audio/）',
    tracksTitle: '曲目',
    noTracks: '這個國家目前還沒有曲目。',
    hint: '點光點聽音樂。地圖可以縮放 —— 右下角的 ＋／－、滑鼠滾輪、雙指，或在空白處連點兩下。手機的曲目列表在下面的抽屜裡。'
  },

  /* ── 七個國家 ─────────────────────────────────────────────────────────
   * tracks 裡的 audio 路徑相對於 index.html。
   * duration 故意留空 —— 播放器會自己從音訊檔讀出真正的長度，
   * 不需要手寫（手寫的數字一旦跟檔案不符反而困擾）。
   * ─────────────────────────────────────────────────────────────────── */
  countries: [

    /* ── 英國（目前沒有曲目） ── */
    {
      id: 'uk',
      country: '英國',
      capital: '倫敦',
      lat: 51.51, lon: -0.13,
      x: 47.47, y: 18.22,
      description: '冷戰時期英國的民俗音樂。',
      // 目前沒有曲目 —— 把 m4a / mp3 放進 assets/audio/ 再照上面格式加進來就好
      tracks: []
    },

    /* ── 法國（1 首） ── */
    {
      id: 'france',
      country: '法國',
      capital: '巴黎',
      lat: 48.86, lon: 2.35,
      x: 48.02, y: 19.81,
      description: '冷戰時期法國的民俗音樂。',
      tracks: [
        { title: '馬賽曲 La Marseillaise', audio: '../../assets/audio/france-01.m4a' }
      ]
    },

    /* ── 東德（5 首） ── */
    {
      id: 'eastgermany',
      country: '東德',
      capital: '柏林',
      lat: 52.52, lon: 13.4,
      x: 50.69, y: 17.62,
      description: '冷戰時期德國的歌曲。這裡同時收了東德（德意志民主共和國）與西德的曲子 —— 因為這批歌裡只有《從廢墟中崛起》是東德國歌，其餘都是德國民謠與西德的。',
      tracks: [
        { title: '東德國歌：從廢墟中崛起', audio: '../../assets/audio/eastgermany-01.m4a' },
        { title: '德意志之歌 Das Deutschlandlied', audio: '../../assets/audio/eastgermany-02.m4a' },
        { title: '守望萊茵蘭 Die Wacht am Rhein', audio: '../../assets/audio/eastgermany-03.m4a' },
        { title: '艾麗卡 Erika', audio: '../../assets/audio/eastgermany-04.m4a' },
        { title: '莉莉瑪蓮 Lili Marleen（1959）', audio: '../../assets/audio/eastgermany-05.m4a' }
      ]
    },

    /* ── 敘利亞（1 首） ── */
    {
      id: 'syria',
      country: '敘利亞',
      capital: '大馬士革',
      lat: 33.51, lon: 36.29,
      x: 56.79, y: 29.22,
      description: '冷戰時期敘利亞的音樂。',
      tracks: [
        { title: 'God, Syria, and Bashar', audio: '../../assets/audio/syria-01.m4a' }
      ]
    },

    /* ── 蘇聯（6 首） ── */
    {
      id: 'ussr',
      country: '蘇聯',
      capital: '莫斯科',
      lat: 55.75, lon: 37.62,
      x: 56.25, y: 15.72,
      description: '冷戰時期蘇聯的音樂。',
      tracks: [
        { title: '蘇聯國歌：牢不可破的聯盟', audio: '../../assets/audio/ussr-01.m4a' },
        { title: '喀秋莎 Катюша', audio: '../../assets/audio/ussr-02.m4a' },
        { title: '紅軍最強大 Красная Армия', audio: '../../assets/audio/ussr-03.m4a' },
        { title: '國際歌（俄語）', audio: '../../assets/audio/ussr-04.m4a' },
        { title: '戰鬥仍將繼續／列寧是如此的年輕', audio: '../../assets/audio/ussr-05.m4a' },
        { title: '國際歌（中文）', audio: '../../assets/audio/ussr-06.m4a' }
      ]
    },

    /* ── 中國（17 首） ── */
    {
      id: 'china',
      country: '中國',
      capital: '北京',
      lat: 39.9, lon: 116.41,
      x: 77.12, y: 25.27,
      description: '冷戰時期中國的歌曲，主要是文革前後的紅色歌曲。',
      tracks: [
        { title: '繼續革命的戰歌（1978-1982 國歌）', audio: '../../assets/audio/china-01.m4a' },
        { title: '東方紅', audio: '../../assets/audio/china-02.m4a' },
        { title: '歌唱社會主義祖國（1968）', audio: '../../assets/audio/china-03.m4a' },
        { title: '沒有共產黨就沒有新中國', audio: '../../assets/audio/china-04.m4a' },
        { title: '大海航行靠舵手', audio: '../../assets/audio/china-05.m4a' },
        { title: '中國人民志願軍戰歌', audio: '../../assets/audio/china-06.m4a' },
        { title: '我們走在大路上（1970）', audio: '../../assets/audio/china-07.m4a' },
        { title: '社會主義好', audio: '../../assets/audio/china-08.m4a' },
        { title: '人民軍隊忠於黨（文革版）', audio: '../../assets/audio/china-09.m4a' },
        { title: '三大紀律八項注意', audio: '../../assets/audio/china-10.m4a' },
        { title: '文化大革命就是好', audio: '../../assets/audio/china-11.m4a' },
        { title: '把文化大革命進行到底', audio: '../../assets/audio/china-12.m4a' },
        { title: '回擊翻案風 粉碎復辟夢', audio: '../../assets/audio/china-13.m4a' },
        { title: '奮起千鈞棒 痛打落水狗', audio: '../../assets/audio/china-14.m4a' },
        { title: '永遠不能忘', audio: '../../assets/audio/china-15.m4a' },
        { title: '偉大的毛澤東思想燦爛輝煌（1968）', audio: '../../assets/audio/china-16.m4a' },
        { title: '三大紀律八項注意（另一版本）', audio: '../../assets/audio/china-17.m4a' }
      ]
    },

    /* ── 北韓（2 首） ── */
    {
      id: 'dprk',
      country: '北韓',
      capital: '平壤',
      lat: 39.03, lon: 125.75,
      x: 79.64, y: 25.81,
      description: '冷戰時期北韓（朝鮮民主主義人民共和國）的音樂。',
      tracks: [
        { title: '愛國歌（朝鮮國歌）', audio: '../../assets/audio/dprk-01.m4a' },
        { title: '朝鮮人民軍軍歌', audio: '../../assets/audio/dprk-02.m4a' }
      ]
    }

  ]

};
