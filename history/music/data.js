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
 *  目前的數字是照 assets/map/cold-war-map.svg 這張圖算出來的。
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
    hint: '用手機的話，曲目列表在下面的抽屜裡。'
  },

  /* ── 七個國家 ─────────────────────────────────────────────────────────
   * tracks 裡的 audio 路徑相對於 index.html。
   * duration 故意留空 —— 播放器會自己從音訊檔讀出真正的長度，
   * 不需要手寫（手寫的數字一旦跟檔案不符反而困擾）。
   * ─────────────────────────────────────────────────────────────────── */
  countries: [

    /* ── 英國 ── */
    {
      id: 'uk',
      country: '英國',
      capital: '倫敦',
      lat: 51.51, lon: -0.13,
      x: 49.97, y: 18.22,
      description: '冷戰時期英國的民俗音樂。',
      tracks: [
        { title: '英國民俗曲 1', audio: '../../assets/audio/uk-01.mp3' }
      ]
    },

    /* ── 法國 ── */
    {
      id: 'france',
      country: '法國',
      capital: '巴黎',
      lat: 48.86, lon: 2.35,
      x: 50.57, y: 19.81,
      description: '冷戰時期法國的民俗音樂。',
      tracks: [
        { title: '法國民俗曲 1', audio: '../../assets/audio/france-01.mp3' }
      ]
    },

    /* ── 東德 ── */
    {
      id: 'eastgermany',
      country: '東德',
      capital: '柏林',
      lat: 52.52, lon: 13.40,
      x: 53.17, y: 17.62,
      description: '冷戰時期東德（德意志民主共和國）的民俗音樂。',
      tracks: [
        { title: '東德民俗曲 1', audio: '../../assets/audio/eastgermany-01.mp3' },
        { title: '東德民俗曲 2', audio: '../../assets/audio/eastgermany-02.mp3' },
        { title: '東德民俗曲 3', audio: '../../assets/audio/eastgermany-03.mp3' },
        { title: '東德民俗曲 4', audio: '../../assets/audio/eastgermany-04.mp3' },
        { title: '東德民俗曲 5', audio: '../../assets/audio/eastgermany-05.mp3' }
      ]
    },

    /* ── 敘利亞 ── */
    {
      id: 'syria',
      country: '敘利亞',
      capital: '大馬士革',
      lat: 33.51, lon: 36.29,
      x: 59.56, y: 29.22,
      description: '冷戰時期敘利亞的民俗音樂。',
      tracks: [
        { title: '敘利亞民俗曲 1', audio: '../../assets/audio/syria-01.mp3' }
      ]
    },

    /* ── 蘇聯 ── */
    {
      id: 'ussr',
      country: '蘇聯',
      capital: '莫斯科',
      lat: 55.75, lon: 37.62,
      x: 58.67, y: 15.72,
      description: '冷戰時期蘇聯的民俗音樂。',
      tracks: [
        { title: '蘇聯民俗曲 1', audio: '../../assets/audio/ussr-01.mp3' },
        { title: '蘇聯民俗曲 2', audio: '../../assets/audio/ussr-02.mp3' },
        { title: '蘇聯民俗曲 3', audio: '../../assets/audio/ussr-03.mp3' },
        { title: '蘇聯民俗曲 4', audio: '../../assets/audio/ussr-04.mp3' },
        { title: '蘇聯民俗曲 5', audio: '../../assets/audio/ussr-05.mp3' }
      ]
    },

    /* ── 中國 ── */
    {
      id: 'china',
      country: '中國',
      capital: '北京',
      lat: 39.90, lon: 116.41,
      x: 79.81, y: 25.27,
      description: '冷戰時期中國的民俗音樂。',
      tracks: [
        { title: '中國民俗曲 1',  audio: '../../assets/audio/china-01.mp3' },
        { title: '中國民俗曲 2',  audio: '../../assets/audio/china-02.mp3' },
        { title: '中國民俗曲 3',  audio: '../../assets/audio/china-03.mp3' },
        { title: '中國民俗曲 4',  audio: '../../assets/audio/china-04.mp3' },
        { title: '中國民俗曲 5',  audio: '../../assets/audio/china-05.mp3' },
        { title: '中國民俗曲 6',  audio: '../../assets/audio/china-06.mp3' },
        { title: '中國民俗曲 7',  audio: '../../assets/audio/china-07.mp3' },
        { title: '中國民俗曲 8',  audio: '../../assets/audio/china-08.mp3' },
        { title: '中國民俗曲 9',  audio: '../../assets/audio/china-09.mp3' },
        { title: '中國民俗曲 10', audio: '../../assets/audio/china-10.mp3' },
        { title: '中國民俗曲 11', audio: '../../assets/audio/china-11.mp3' },
        { title: '中國民俗曲 12', audio: '../../assets/audio/china-12.mp3' },
        { title: '中國民俗曲 13', audio: '../../assets/audio/china-13.mp3' },
        { title: '中國民俗曲 14', audio: '../../assets/audio/china-14.mp3' },
        { title: '中國民俗曲 15', audio: '../../assets/audio/china-15.mp3' },
        { title: '中國民俗曲 16', audio: '../../assets/audio/china-16.mp3' },
        { title: '中國民俗曲 17', audio: '../../assets/audio/china-17.mp3' }
      ]
    },

    /* ── 北韓 ── */
    {
      id: 'dprk',
      country: '北韓',
      capital: '平壤',
      lat: 39.03, lon: 125.75,
      x: 82.34, y: 25.81,
      description: '冷戰時期北韓（朝鮮民主主義人民共和國）的民俗音樂。',
      tracks: [
        { title: '北韓民俗曲 1', audio: '../../assets/audio/dprk-01.mp3' },
        { title: '北韓民俗曲 2', audio: '../../assets/audio/dprk-02.mp3' },
        { title: '北韓民俗曲 3', audio: '../../assets/audio/dprk-03.mp3' }
      ]
    }

  ]
};
