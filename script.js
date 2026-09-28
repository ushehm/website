/* ============================================================================
 *  script.js — 自動生成卡片
 * ----------------------------------------------------------------------------
 *  這裡只負責「讀資料 → 產生 DOM」，不含任何內容文字。
 *  所有文字與資料都來自 data.js，樣式都來自 style.css。
 *
 *  區塊順序：
 *    1. 小工具函式
 *    2. 頂部橫幅
 *    3. 最愛遊戲／最近在玩／全成就／願望清單
 *    4. 其他連結
 *    5. 關於我
 *    6. 留言板（三種模式）
 *    7. 頁尾
 *    8. 彩蛋
 * ========================================================================== */

(function () {
  'use strict';

  /* ── 取得 data.js 的內容 ────────────────────────────────────────────────
   * data.js 用 `const SITE_DATA = {...}` 宣告，那是全域的語彙綁定，
   * 不會變成 window 的屬性，所以要直接用 typeof 檢查。
   */
  const D = (typeof SITE_DATA !== 'undefined') ? SITE_DATA : null;
  if (!D) {
    document.body.innerHTML =
      '<p style="padding:2rem;color:#f66;font-family:sans-serif">' +
      '找不到 SITE_DATA — 請確認 index.html 有先載入 data.js。</p>';
    return;
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  1. 小工具函式
   * ══════════════════════════════════════════════════════════════════════ */

  /** 建立元素：el('div', {class:'x'}, ['文字' 或 子元素]) */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children) {
      for (const c of [].concat(children)) {
        if (c === null || c === undefined || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  /** 轉義 HTML，避免資料裡的 < > 破壞版面（留言板尤其重要） */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Steam 官方封面網址（直式，收藏庫用的那種）。可用 cover 欄位覆蓋。 */
  function coverUrl(game, size) {
    if (game.cover) return game.cover;
    const file = size === 'header' ? 'header.jpg' : 'library_600x900.jpg';
    return 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + game.appid + '/' + file;
  }

  /** Steam 商店頁網址 */
  function storeUrl(game) {
    return 'https://store.steampowered.com/app/' + game.appid + '/';
  }

  /** 把分鐘數變成人看得懂的字串 */
  function fmtMinutes(min) {
    if (min == null) return '—';
    if (min < 60) return min + ' 分鐘';
    const h = min / 60;
    return (h >= 10 ? Math.round(h) : Math.round(h * 10) / 10) + ' 小時';
  }

  /** 時數（已經是小時） */
  function fmtHours(h) {
    if (h == null) return '—';
    return (h >= 100 ? Math.round(h) : Math.round(h * 10) / 10) + ' 小時';
  }

  /** 產生星等（0～5，可小數） */
  function stars(rating) {
    if (rating == null) {
      return el('div', { class: 'stars stars--empty', title: '尚未評分（可在 data.js 設定 rating）' },
        [el('span', { class: 'stars__row', text: '★★★★★' })]);
    }
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    return el('div', { class: 'stars', title: rating + ' / 5' }, [
      el('span', { class: 'stars__row', text: '★★★★★' }),
      el('span', { class: 'stars__row stars__row--fill', style: 'width:' + pct + '%', text: '★★★★★' })
    ]);
  }

  /** 平台圖示（內嵌 SVG，避免依賴外部圖示庫） */
  /* 品牌圖示。
   *
   * svg 路徑全部取自 Simple Icons（simpleicons.org）的官方品牌向量，CC0 授權。
   * 顏色沿用原本配合深色底調過的值 —— 官方品牌色裡 Steam / X / GitHub
   * 是接近黑色的，直接用在深色卡片上會看不見。
   *
   * AcFun 沒有官方向量（Simple Icons 與 Iconify 都沒有收錄），
   * 所以用官方 App 圖示 PNG，走 img 欄位而不是 svg。
   */
  const ICONS = {
    // Steam
    steam: {
      color: '#66c0f4',
      svg: '<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>'
    },
    // Discord
    discord: {
      color: '#5865F2',
      svg: '<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>'
    },
    // X
    x: {
      color: '#ffffff',
      svg: '<path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>'
    },
    // Instagram
    instagram: {
      color: '#E1306C',
      svg: '<path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/>'
    },
    // YouTube
    youtube: {
      color: '#FF0000',
      svg: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>'
    },
    // Bilibili
    bilibili: {
      color: '#00A1D6',
      svg: '<path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/>'
    },
    // GitHub
    github: {
      color: '#e6edf3',
      svg: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>'
    },
    // OpenAI（給 GPT-6-Astra 用）
    openai: {
      color: '#ffffff',
      svg: '<path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>'
    },
    // AcFun：官方 App 圖示（AC 娘），不是向量
    acfun: { color: '#fd4c5c', img: 'images/icons/acfun.png' },
    email: {
      color: '#8fb8d8',
      svg: '<rect x="2.6" y="5" width="18.8" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>' +
           '<path d="M3.8 7.2l8.2 5.8 8.2-5.8" fill="none" stroke="currentColor" stroke-width="2"/>'
    }
  };

  const PERSONA_STATE = {
    0: { text: '離線', cls: 'off' },
    1: { text: '線上', cls: 'on' },
    2: { text: '忙碌', cls: 'busy' },
    3: { text: '離開', cls: 'away' },
    4: { text: '打瞌睡', cls: 'snooze' },
    5: { text: '想交易', cls: 'trade' },
    6: { text: '想玩', cls: 'play' }
  };

  /* ══════════════════════════════════════════════════════════════════════
   *  2. 頂部橫幅
   * ══════════════════════════════════════════════════════════════════════ */
  function renderBanner() {
    const p = D.profile || {};
    const b = D.banner || {};

    // 動態漸層：把 data.js 的三個顏色設成 CSS 變數
    const bg = document.getElementById('banner-bg');
    if (bg) {
      const g = b.gradient || ['#1b2838', '#2a475e', '#1b6ca8'];
      bg.style.setProperty('--g1', g[0]);
      bg.style.setProperty('--g2', g[1] || g[0]);
      bg.style.setProperty('--g3', g[2] || g[1] || g[0]);
      if (b.height) document.getElementById('banner').style.setProperty('--banner-h', b.height + 'px');

      // 有橫幅圖就用圖；載入失敗自動退回漸層（不會留破圖）
      if (b.image) {
        const probe = new Image();
        probe.onload = function () { bg.style.backgroundImage = 'url("' + b.image + '")'; bg.classList.add('has-image'); };
        probe.onerror = function () { /* 保持漸層 */ };
        probe.src = b.image;
      }
    }

    const wrap = document.getElementById('banner-content');
    if (!wrap) return;
    wrap.innerHTML = '';

    /* 頭像 + 頭像框 */
    const avatarBox = el('div', { class: 'avatar' + (p.avatarFrame ? ' avatar--framed' : '') });
    const img = el('img', { class: 'avatar__img', src: p.avatar || p.remoteAvatar || '', alt: (p.personaName || '') + ' 的頭像' });
    // 頭像載入失敗就退回 Steam 遠端網址
    img.addEventListener('error', function () {
      if (p.remoteAvatar && img.src !== p.remoteAvatar) img.src = p.remoteAvatar;
    });
    avatarBox.appendChild(img);
    if (p.level != null) avatarBox.appendChild(el('span', { class: 'avatar__level', text: p.level, title: 'Steam 等級' }));

    /* 名字與狀態 */
    const st = PERSONA_STATE[p.personaState] || PERSONA_STATE[0];
    const info = el('div', { class: 'banner__info' }, [
      el('h1', { class: 'banner__name', text: p.personaName || '未命名' }),
      p.headline ? el('p', { class: 'banner__headline', text: p.headline }) : null,
      el('div', { class: 'banner__meta' }, [
        el('span', { class: 'status status--' + st.cls }, [
          el('span', { class: 'status__dot' }), st.text
        ]),
        p.country ? el('span', { class: 'meta-item', text: '📍 ' + p.country }) : null,
        p.memberSince ? el('span', { class: 'meta-item', text: '🗓 自 ' + p.memberSince }) : null,
        p.realName ? el('span', { class: 'meta-item', text: '🏷 ' + p.realName }) : null
      ]),
      p.profileUrl
        ? el('a', { class: 'btn btn--steam', href: p.profileUrl, target: '_blank', rel: 'noopener noreferrer', text: '開啟 Steam 個人檔案' })
        : null
    ]);

    wrap.appendChild(avatarBox);
    wrap.appendChild(info);
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  3. 遊戲卡片
   * ══════════════════════════════════════════════════════════════════════ */

  /** 產生封面圖，載入失敗時退回橫式 header.jpg，再失敗才顯示佔位 */
  function coverNode(game, extraClass) {
    const box = el('div', { class: 'cover ' + (extraClass || '') });
    const img = el('img', { class: 'cover__img', src: coverUrl(game), alt: game.name + ' 封面', loading: 'lazy' });
    let triedHeader = false;
    img.addEventListener('error', function () {
      if (!triedHeader && !game.cover) { triedHeader = true; img.src = coverUrl(game, 'header'); return; }
      box.classList.add('cover--missing');
      img.remove();
      box.appendChild(el('span', { class: 'cover__fallback', text: game.name }));
    });
    box.appendChild(img);
    return box;
  }

  /** 成就進度條 */
  function progressBar(unlocked, total) {
    const pct = total > 0 ? (unlocked / total) * 100 : 0;
    return el('div', { class: 'progress', title: unlocked + ' / ' + total + ' 成就' }, [
      el('div', { class: 'progress__bar', style: 'width:' + pct.toFixed(1) + '%' }),
      el('span', { class: 'progress__label', text: unlocked + ' / ' + total })
    ]);
  }

  /** 最愛遊戲卡片 */
  function favoriteCard(g) {
    const card = el('a', {
      class: 'card card--game', href: storeUrl(g), target: '_blank', rel: 'noopener noreferrer',
      title: '在 Steam 商店開啟 ' + g.name
    });

    card.appendChild(coverNode(g, 'cover--tall'));

    const body = el('div', { class: 'card__body' });
    body.appendChild(el('h3', { class: 'card__title', text: g.name }));

    const stats = el('div', { class: 'card__stats' });
    if (g.hours != null) stats.appendChild(el('span', { class: 'stat', title: '總遊玩時數' }, ['⏱ ', fmtHours(g.hours)]));
    if (g.rating != null) stats.appendChild(stars(g.rating));
    body.appendChild(stats);

    // 成就進度（只有在 data.js 有填 unlocked/total 時才顯示）
    if (g.unlocked != null && g.total != null) body.appendChild(progressBar(g.unlocked, g.total));

    if (Array.isArray(g.tags) && g.tags.length) {
      body.appendChild(el('div', { class: 'tags' }, g.tags.map(function (t) {
        return el('span', { class: 'tag', text: t });
      })));
    }

    if (g.why) body.appendChild(el('p', { class: 'card__why', text: '「' + g.why + '」' }));

    card.appendChild(body);
    return card;
  }

  function renderFavorites() {
    const grid = document.getElementById('favorites-grid');
    const list = (D.games && D.games.favorites) || [];
    grid.innerHTML = '';
    if (!list.length) { hideSection('sec-favorites'); return; }
    list.forEach(function (g) { grid.appendChild(favoriteCard(g)); });
  }

  function renderRecent() {
    const grid = document.getElementById('recent-grid');
    const list = (D.games && D.games.recentlyPlayed) || [];
    grid.innerHTML = '';
    if (!list.length) { hideSection('sec-recent'); return; }

    list.forEach(function (g) {
      const card = el('a', {
        class: 'card card--recent', href: storeUrl(g), target: '_blank', rel: 'noopener noreferrer'
      });
      card.appendChild(coverNode(g, 'cover--wide'));
      card.appendChild(el('div', { class: 'card__body' }, [
        el('h3', { class: 'card__title', text: g.name }),
        el('div', { class: 'card__stats' }, [
          el('span', { class: 'stat stat--hot', title: '最近兩週' }, ['◷ ', fmtMinutes(g.minutes2Weeks)]),
          el('span', { class: 'stat', title: '總時數' }, ['Σ ', fmtHours(g.hoursTotal)])
        ])
      ]));
      grid.appendChild(card);
    });
  }

  function renderPerfect() {
    const grid = document.getElementById('perfect-grid');
    const list = (D.games && D.games.perfect) || [];
    grid.innerHTML = '';
    if (!list.length) { hideSection('sec-perfect'); return; }

    list.forEach(function (g) {
      const card = el('a', {
        class: 'card card--perfect', href: storeUrl(g), target: '_blank', rel: 'noopener noreferrer'
      });
      card.appendChild(el('span', { class: 'perfect-badge', text: '100%', title: '成就全部達成' }));
      card.appendChild(coverNode(g, 'cover--tall'));
      card.appendChild(el('div', { class: 'card__body' }, [
        el('h3', { class: 'card__title', text: g.name }),
        progressBar(g.unlocked, g.total)
      ]));
      grid.appendChild(card);
    });
  }

  function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const list = (D.games && D.games.wishlist) || [];
    grid.innerHTML = '';
    if (!list.length) { hideSection('sec-wishlist'); return; }

    list.forEach(function (g) {
      const card = el('a', {
        class: 'card card--wishlist', href: storeUrl(g), target: '_blank', rel: 'noopener noreferrer'
      });
      card.appendChild(coverNode(g, 'cover--tall'));
      card.appendChild(el('div', { class: 'card__body' }, [
        el('h3', { class: 'card__title', text: g.name }),
        el('span', { class: 'wishlist-hint', text: '加入願望清單' })
      ]));
      grid.appendChild(card);
    });
  }

  function hideSection(id) {
    const s = document.getElementById(id);
    if (s) s.hidden = true;
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  4. My Favorite Music（音樂播放器）
   * ----------------------------------------------------------------------
   *  整個頁面只用「一個」 <audio>：切歌只換 src，不重新建立元素，
   *  這樣才不會有殘留的播放狀態。三個狀態放在 music 物件裡。
   * ══════════════════════════════════════════════════════════════════════ */

  const music = {
    albumIndex: 0,    // 目前「顯示」第幾張專輯
    playingAlbum: -1, // 目前「播放中」那首所屬的專輯（可能與顯示中的不同）
    trackIndex: -1,   // 目前播放第幾首（-1 = 還沒播）
    audio: null,      // 共用的 <audio>
    root: null,       // 整個區塊的根元素（拿來切換 CSS 變數與過場 class）
    busy: false       // 換專輯的動畫進行中，避免連按造成錯亂
  };

  const ICON_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

  function musicAlbums() {
    return (D.music && D.music.albums) || [];
  }

  /** 秒數 → m:ss */
  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /** 建立音樂區塊骨架，只做一次；之後換專輯只更新內容 */
  function renderMusic() {
    const box = document.getElementById('music-content');
    const cfg = D.music;
    if (!box) return;
    if (!cfg || !musicAlbums().length) { hideSection('sec-music'); return; }

    const titleEl = document.getElementById('music-title');
    if (titleEl) titleEl.textContent = (cfg.title || 'Music') + (cfg.subtitle ? '（' + cfg.subtitle + '）' : '');
    const descEl = document.getElementById('music-desc');
    if (descEl) descEl.textContent = cfg.description || '';

    box.innerHTML = '';
    music.root = el('div', { class: 'music' });

    /* ── 上半：封面 + 左右切換 + 曲目 ── */
    const prev = el('button', { class: 'music__nav music__nav--prev', type: 'button', 'aria-label': '上一張專輯' });
    prev.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.5 4.5 8 12l7.5 7.5 1.4-1.4L10.8 12l6.1-6.1z"/></svg>';
    const next = el('button', { class: 'music__nav music__nav--next', type: 'button', 'aria-label': '下一張專輯' });
    next.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 4.5 16 12l-7.5 7.5-1.4-1.4L13.2 12 7.1 5.9z"/></svg>';

    const coverWrap = el('div', { class: 'music__cover-wrap' }, [
      el('img', { class: 'music__cover', id: 'music-cover', alt: '', loading: 'lazy' }),
      el('div', { class: 'music__tags', id: 'music-tags' })
    ]);

    const stage = el('div', { class: 'music__stage' }, [
      el('div', { class: 'music__left' }, [prev, coverWrap, next]),
      el('div', { class: 'music__right' }, [
        el('h3', { class: 'music__album', id: 'music-album' }),
        el('p', { class: 'music__meta', id: 'music-meta' }),
        el('ol', { class: 'music__tracks', id: 'music-tracks' })
      ])
    ]);

    /* ── 下半：播放器控制列 ── */
    const playBtn = el('button', { class: 'music__play', id: 'music-play', type: 'button', 'aria-label': '播放／暫停' });
    playBtn.innerHTML = ICON_PLAY;

    const now = el('div', { class: 'music__now' }, [
      el('span', { class: 'music__now-title', id: 'music-now-title', text: '尚未播放' }),
      el('span', { class: 'music__now-album', id: 'music-now-album' })
    ]);

    const bar = el('div', {
      class: 'music__bar', id: 'music-bar', role: 'slider', tabindex: '0',
      'aria-label': '播放進度', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0'
    }, [
      el('div', { class: 'music__bar-fill', id: 'music-bar-fill' }),
      el('div', { class: 'music__bar-knob', id: 'music-bar-knob' })
    ]);

    const time = el('div', { class: 'music__time' }, [
      el('span', { id: 'music-cur', text: '0:00' }),
      el('span', { class: 'music__time-sep', text: '/' }),
      el('span', { id: 'music-dur', text: '0:00' })
    ]);

    const volRange = el('input', {
      class: 'music__vol-range', id: 'music-vol', type: 'range',
      min: '0', max: '1', step: '0.01', value: '0.8', 'aria-label': '音量'
    });
    const vol = el('div', { class: 'music__vol' }, [
      el('span', {
        class: 'music__vol-icon',
        html: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>'
      }),
      volRange
    ]);

    const player = el('div', { class: 'music__player' }, [playBtn, now, bar, time, vol]);

    /* 真正發聲的元素。控制列是自己畫的，所以原生控制列不需要。 */
    const audio = el('audio', { id: 'music-audio', preload: 'metadata' });
    music.audio = audio;

    music.root.appendChild(stage);
    music.root.appendChild(player);
    music.root.appendChild(audio);
    box.appendChild(music.root);

    prev.addEventListener('click', function () { stepAlbum(-1); });
    next.addEventListener('click', function () { stepAlbum(1); });
    playBtn.addEventListener('click', togglePlay);
    bindProgress(bar);
    bindVolume(volRange);
    bindAudio(audio);

    showAlbum(0, 0);
  }

  /** 單一曲目列 */
  function trackRow(track, i) {
    const btn = el('button', { class: 'track__btn', type: 'button' }, [
      el('span', { class: 'track__lead' }, [
        el('span', { class: 'track__num', text: (i + 1 < 10 ? '0' : '') + (i + 1) }),
        // 播放中時用跳動的等化器取代編號
        el('span', { class: 'track__eq', html: '<i></i><i></i><i></i><i></i>' })
      ]),
      el('span', { class: 'track__title', text: track.title || '未命名' }),
      el('span', { class: 'track__hint', text: '播放' })
    ]);
    btn.addEventListener('click', function () { onTrackClick(i); });
    return el('li', { class: 'track' }, [btn]);
  }

  /**
   * 切到第 index 張專輯。
   * direction 只用來決定過場往左還是往右滑，0 表示第一次載入不做動畫。
   */
  function showAlbum(index, direction) {
    const albums = musicAlbums();
    if (!albums.length) return;
    const n = albums.length;
    const target = ((index % n) + n) % n;   // 頭尾可以繞回來
    const album = albums[target];
    const first = music.albumIndex === target && music.trackIndex === -1 && !music.root.classList.contains('is-ready');

    music.albumIndex = target;
    const root = music.root;
    const delay = (direction === 0 || first) ? 0 : 160;

    if (root && delay) {
      root.classList.remove('is-out-left', 'is-out-right');
      root.classList.add(direction < 0 ? 'is-out-left' : 'is-out-right');
    }

    const apply = function () {
      // 主題色跟著專輯換，發光、漸層、進度條都會一起變
      if (root) root.style.setProperty('--album-accent', album.accent || '#66c0f4');

      const cover = document.getElementById('music-cover');
      if (cover) { cover.src = album.cover || ''; cover.alt = (album.name || '') + ' 封面'; }

      const albumEl = document.getElementById('music-album');
      if (albumEl) albumEl.textContent = album.name || '';

      const tags = document.getElementById('music-tags');
      if (tags) {
        tags.innerHTML = '';
        (album.tags || []).forEach(function (t) {
          tags.appendChild(el('span', { class: 'music__tag', text: t }));
        });
      }

      const meta = document.getElementById('music-meta');
      const tracks = album.tracks || [];
      if (meta) {
        meta.textContent = '第 ' + (target + 1) + ' / ' + n + ' 張專輯 ・ ' + tracks.length + ' 首';
      }

      const list = document.getElementById('music-tracks');
      if (list) {
        list.innerHTML = '';
        tracks.forEach(function (t, i) { list.appendChild(trackRow(t, i)); });
      }

      if (root) {
        root.classList.remove('is-out-left', 'is-out-right');
        root.classList.add('is-in');
        setTimeout(function () { root.classList.remove('is-in'); }, 420);
        root.classList.add('is-ready');
      }
      updateTrackHighlight();
    };

    if (delay) setTimeout(apply, delay); else apply();
  }

  function stepAlbum(delta) {
    // 連按時忽略，避免動畫還沒結束就被打斷
    if (music.busy) return;
    music.busy = true;
    setTimeout(function () { music.busy = false; }, 260);
    showAlbum(music.albumIndex + delta, delta);
  }

  function onTrackClick(i) {
    if (music.trackIndex === i) { togglePlay(); return; }
    loadTrack(i, true);
  }

  function loadTrack(i, autoplay) {
    const album = musicAlbums()[music.albumIndex];
    const track = album && (album.tracks || [])[i];
    const audio = music.audio;
    if (!track || !audio) return;

    music.trackIndex = i;
    music.playingAlbum = music.albumIndex;
    audio.src = track.src;
    const t = document.getElementById('music-now-title');
    const a = document.getElementById('music-now-album');
    if (t) t.textContent = track.title || '未命名';
    if (a) a.textContent = album.name || '';
    const d = document.getElementById('music-dur');
    if (d) d.textContent = '0:00';
    setPlayingUI(false);
    updateTrackHighlight();

    if (autoplay) {
      const p = audio.play();
      // 瀏覽器若擋下自動播放，就讓使用者自己按播放鍵，不要跳錯誤
      if (p && typeof p.catch === 'function') p.catch(function () { setPlayingUI(false); });
    }
  }

  function togglePlay() {
    const audio = music.audio;
    if (!audio) return;
    // 還沒選歌 → 從目前專輯的第一首開始
    if (!audio.getAttribute('src')) {
      const album = musicAlbums()[music.albumIndex];
      if (album && (album.tracks || []).length) loadTrack(0, true);
      return;
    }
    if (audio.paused) {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } else {
      audio.pause();
    }
  }

  /** 一首播完自動接下一首；到底了就停 */
  function playNext() {
    const album = musicAlbums()[music.albumIndex];
    if (!album) return;
    const count = (album.tracks || []).length;
    if (music.trackIndex + 1 < count) loadTrack(music.trackIndex + 1, true);
    else { music.trackIndex = -1; setPlayingUI(false); updateTrackHighlight(); }
  }

  function setPlayingUI(playing) {
    const btn = document.getElementById('music-play');
    if (btn) { btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; btn.classList.toggle('is-playing', playing); }
    if (music.root) music.root.classList.toggle('is-playing', playing);
  }

  function updateTrackHighlight() {
    const playing = !!music.audio && !music.audio.paused;
    // 只有「顯示中的專輯」就是「播放中那首所屬的專輯」時才標記，
    // 否則切換專輯後，新專輯同一個位置的曲目會被誤標成播放中。
    const sameAlbum = music.playingAlbum === music.albumIndex;
    const rows = document.querySelectorAll('.music__tracks .track');
    for (let i = 0; i < rows.length; i++) {
      const current = sameAlbum && i === music.trackIndex;
      rows[i].classList.toggle('is-current', current);
      rows[i].classList.toggle('is-playing', current && playing);
    }
  }

  function updateProgress() {
    const audio = music.audio;
    if (!audio || !audio.duration) return;
    const pct = Math.max(0, Math.min(100, (audio.currentTime / audio.duration) * 100));
    const fill = document.getElementById('music-bar-fill');
    const knob = document.getElementById('music-bar-knob');
    const bar = document.getElementById('music-bar');
    const cur = document.getElementById('music-cur');
    if (fill) fill.style.width = pct + '%';
    if (knob) knob.style.left = pct + '%';
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (cur) cur.textContent = fmtTime(audio.currentTime);
  }

  /** 進度條：點擊、拖曳、觸控都能跳秒 */
  function bindProgress(bar) {
    let dragging = false;

    function seek(ev) {
      const audio = music.audio;
      if (!audio || !audio.duration) return;
      const rect = bar.getBoundingClientRect();
      const clientX = ev.touches && ev.touches.length ? ev.touches[0].clientX : ev.clientX;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      audio.currentTime = ratio * audio.duration;
      updateProgress();
    }

    bar.addEventListener('mousedown', function (ev) { ev.preventDefault(); dragging = true; seek(ev); });
    window.addEventListener('mousemove', function (ev) { if (dragging) seek(ev); });
    window.addEventListener('mouseup', function () { dragging = false; });
    bar.addEventListener('touchstart', function (ev) { dragging = true; seek(ev); }, { passive: true });
    bar.addEventListener('touchmove', function (ev) { if (dragging) seek(ev); }, { passive: true });
    bar.addEventListener('touchend', function () { dragging = false; });

    // 焦點在進度條上時，左右鍵是快進/倒轉，所以要攔下來，
    // 不然會同時觸發「切換專輯」。
    bar.addEventListener('keydown', function (ev) {
      const audio = music.audio;
      if (!audio || !audio.duration) return;
      if (ev.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); ev.preventDefault(); ev.stopPropagation(); }
      else if (ev.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); ev.preventDefault(); ev.stopPropagation(); }
    });
  }

  function bindVolume(range) {
    if (!range) return;
    range.addEventListener('input', function () {
      if (music.audio) music.audio.volume = parseFloat(range.value);
    });
  }

  function bindAudio(audio) {
    audio.volume = 0.8;
    audio.addEventListener('play', function () { setPlayingUI(true); updateTrackHighlight(); });
    audio.addEventListener('pause', function () { setPlayingUI(false); updateTrackHighlight(); });
    audio.addEventListener('ended', playNext);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', function () {
      const d = document.getElementById('music-dur');
      if (d) d.textContent = fmtTime(audio.duration);
    });
    audio.addEventListener('error', function () {
      const t = document.getElementById('music-now-title');
      if (t) t.textContent = '載入失敗，檔案可能不存在';
      setPlayingUI(false);
    });
  }

  /**
   * 用鍵盤左右方向鍵切換專輯。
   * 這裡的守門條件很多，因為左右鍵同時也是「文字輸入游標移動」和
   * 「影片/進度條快進」在用，搶錯會很煩人。
   */
  function initMusicKeys() {
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;

      // 正在輸入框打字（留言板）→ 不要搶
      const tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (ev.target && ev.target.isContentEditable) return;

      // 任何彈窗開著 → 不要搶（彩蛋、影片、會員註冊都算）
      if (anyModalOpen()) return;

      // 焦點在進度條或音量上 → 讓它們自己處理
      if (ev.target && (ev.target.id === 'music-bar' || ev.target.id === 'music-vol')) return;

      // 焦點在漫畫區（那裡也有左右箭頭）→ 不要搶，不然按了會去換音樂專輯
      if (ev.target && ev.target.closest && ev.target.closest('#sec-comic')) return;

      const sec = document.getElementById('sec-music');
      if (!sec || sec.hidden) return;

      ev.preventDefault();
      stepAlbum(ev.key === 'ArrowRight' ? 1 : -1);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  5. 其他連結
   * ══════════════════════════════════════════════════════════════════════ */
  function renderLinks() {
    const grid = document.getElementById('links-grid');
    const list = (D.links || []).filter(function (l) { return l && l.enabled !== false; });
    grid.innerHTML = '';
    if (!list.length) { hideSection('sec-links'); return; }

    list.forEach(function (l) {
      const ic = ICONS[l.icon] || { color: '#8fb8d8', svg: '<circle cx="12" cy="12" r="8"/>' };
      // 大部分品牌是向量（svg 欄位）；AcFun 只有官方點陣圖，走 img 欄位
      const iconHtml = ic.img
        ? '<img src="' + esc(ic.img) + '" alt="" loading="lazy" decoding="async">'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ic.svg + '</svg>';
      const card = el('a', {
        class: 'link-card',
        href: l.url,
        target: l.url.indexOf('mailto:') === 0 ? null : '_blank',
        rel: 'noopener noreferrer',
        style: '--brand:' + ic.color
      }, [
        el('span', { class: 'link-card__icon', html: iconHtml }),
        el('span', { class: 'link-card__body' }, [
          el('span', { class: 'link-card__label', text: l.label }),
          l.note ? el('span', { class: 'link-card__note', text: l.note }) : null
        ])
      ]);
      grid.appendChild(l.card || card);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  6. 關於我
   * ══════════════════════════════════════════════════════════════════════ */
  function renderAbout() {
    const box = document.getElementById('about-content');
    const a = D.about || {};
    const p = D.profile || {};
    box.innerHTML = '';

    if (a.intro) box.appendChild(el('p', { class: 'about__intro', text: a.intro }));

    // Steam 簡介（自動從 profile 帶過來）
    if (p.steamSummary) {
      box.appendChild(el('details', { class: 'about__steam' }, [
        el('summary', { text: 'Steam 個人簡介（原文）' }),
        el('p', { class: 'about__quote', text: p.steamSummary })
      ]));
    }

    // 喜歡的類型
    if (Array.isArray(a.genres) && a.genres.length) {
      box.appendChild(el('div', { class: 'about__block' }, [
        el('h3', { class: 'about__subtitle', text: '喜歡的類型' }),
        el('div', { class: 'tags' }, a.genres.map(function (g) { return el('span', { class: 'tag tag--lg', text: g }); }))
      ]));
    }

    // 設備
    if (Array.isArray(a.hardware) && a.hardware.length) {
      box.appendChild(el('div', { class: 'about__block' }, [
        el('h3', { class: 'about__subtitle', text: '我的設備' }),
        el('dl', { class: 'specs' }, a.hardware.map(function (h) {
          return el('div', { class: 'specs__row' }, [
            el('dt', { text: h.label }), el('dd', { text: h.value })
          ]);
        }))
      ]));
    }

    // 遊玩習慣
    if (Array.isArray(a.habits) && a.habits.length) {
      box.appendChild(el('div', { class: 'about__block' }, [
        el('h3', { class: 'about__subtitle', text: '遊玩習慣' }),
        el('ul', { class: 'habits' }, a.habits.map(function (h) { return el('li', { text: h }); }))
      ]));
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  7. 留言板（三種模式）
   * ══════════════════════════════════════════════════════════════════════ */
  function renderGuestbook() {
    const box = document.getElementById('guestbook-content');
    const g = D.guestbook || {};
    const desc = document.getElementById('guestbook-desc');
    if (desc && g.description) desc.textContent = g.description;
    box.innerHTML = '';

    /* 模式一：Google 表單（iframe 嵌入） */
    if (g.mode === 'google' && g.googleFormUrl) {
      box.appendChild(el('iframe', {
        class: 'guestbook__frame', src: g.googleFormUrl, loading: 'lazy',
        title: '留言表單', referrerpolicy: 'no-referrer'
      }));
      return;
    }

    /* 模式二與三都需要表單，差別只在送出時做什麼 */
    const max = g.maxLength || 300;
    const form = el('form', { class: 'guestbook', novalidate: true });

    const nameInput = el('input', {
      class: 'field__input', type: 'text', name: 'name', maxlength: '40',
      placeholder: '你的名字（留空會顯示「匿名」）', autocomplete: 'nickname'
    });
    const msgInput = el('textarea', {
      class: 'field__input field__input--area', name: 'message', rows: '4',
      maxlength: String(max), placeholder: '想說的話…', required: true
    });
    const counter = el('span', { class: 'field__counter', text: '0 / ' + max });
    msgInput.addEventListener('input', function () {
      counter.textContent = msgInput.value.length + ' / ' + max;
    });

    const submit = el('button', { class: 'btn btn--primary', type: 'submit', text: '送出留言' });
    const notice = el('p', { class: 'guestbook__notice', hidden: true });

    form.appendChild(el('div', { class: 'field' }, [
      el('label', { class: 'field__label', for: 'gb-name', text: '名字' }), nameInput
    ]));
    form.appendChild(el('div', { class: 'field' }, [
      el('label', { class: 'field__label', for: 'gb-msg', text: '留言' }), msgInput, counter
    ]));
    form.appendChild(el('div', { class: 'guestbook__actions' }, [submit, notice]));

    function say(text, ok) {
      notice.hidden = false;
      notice.textContent = text;
      notice.className = 'guestbook__notice ' + (ok ? 'is-ok' : 'is-err');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = nameInput.value.trim() || '匿名';
      const message = msgInput.value.trim();

      if (!message) { say('留言不能是空的。', false); msgInput.focus(); return; }
      if (message.length > max) { say('超過 ' + max + ' 字了。', false); return; }

      /* 純靜態模式：只顯示示範訊息，不會真的送出 */
      if (g.mode !== 'discord' || !g.discordWebhook) {
        say('（示範模式）已收到你的留言：「' + message + '」— 目前沒有連接後端，所以不會真的送出。', true);
        return;
      }

      /* Discord Webhook 模式 */
      submit.disabled = true;
      say('傳送中…', true);
      fetch(g.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '**' + name + '**：' + message })
      }).then(function (res) {
        if (res.ok) { form.reset(); counter.textContent = '0 / ' + max; say('留言已送出，謝謝！', true); }
        else { say('送出失敗（HTTP ' + res.status + '），請稍後再試。', false); }
      }).catch(function () {
        say('送出失敗，可能是網路問題或 Webhook 設定有誤。', false);
      }).then(function () { submit.disabled = false; });
    });

    // 給 label 的 for 補上 id
    nameInput.id = 'gb-name';
    msgInput.id = 'gb-msg';

    box.appendChild(form);

    if (g.mode === 'discord' && !g.discordWebhook) {
      box.appendChild(el('p', { class: 'guestbook__warn', text: '⚠ data.js 選了 discord 模式但沒填 webhook，目前會以靜態模式運作。' }));
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  8. 特別鳴謝（含影片播放器）
   * ══════════════════════════════════════════════════════════════════════ */

  /** 從各種 YouTube 網址形式取出影片 ID（youtu.be、watch?v=、embed、shorts 都吃） */
  function youtubeId(url) {
    if (!url) return '';
    const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }

  function renderThanks() {
    const box = document.getElementById('thanks-content');
    const t = D.thanks;
    if (!box) return;
    if (!t) { hideSection('sec-thanks'); return; }

    const v = t.video || {};
    const ytId = youtubeId(v.youtube);
    const useLocal = v.source !== 'youtube' && !!v.local;

    box.innerHTML = '';
    const card = el('div', { class: 'thanks' });

    /* 左邊：有預覽圖的按鈕 */
    const btn = el('button', {
      class: 'thanks__button', type: 'button',
      'aria-label': (t.buttonLabel || '播放影片') + '：' + (t.heading || '')
    });
    if (t.preview) {
      const img = el('img', {
        class: 'thanks__preview', src: t.preview, alt: (t.heading || '') + ' 預覽圖', loading: 'lazy'
      });
      img.addEventListener('error', function () { img.remove(); btn.classList.add('is-nopreview'); });
      btn.appendChild(img);
    } else {
      btn.classList.add('is-nopreview');
    }
    btn.appendChild(el('span', { class: 'thanks__play' }, [
      el('span', {
        class: 'thanks__play-icon',
        html: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
      }),
      el('span', { class: 'thanks__play-label', text: t.buttonLabel || '播放影片' })
    ]));

    /* 右邊：文字與替代來源 */
    const side = el('div', { class: 'thanks__body' }, [
      el('h3', { class: 'thanks__heading', text: t.heading || '' }),
      t.description ? el('p', { class: 'thanks__desc', text: t.description }) : null
    ]);

    const alts = el('div', { class: 'thanks__alts' });
    if (useLocal && ytId) {
      alts.appendChild(el('a', {
        class: 'btn btn--ghost', href: v.youtube, target: '_blank', rel: 'noopener noreferrer',
        text: '在 YouTube 上看'
      }));
    } else if (!useLocal && v.local) {
      alts.appendChild(el('a', {
        class: 'btn btn--ghost', href: v.local, target: '_blank', rel: 'noopener noreferrer',
        text: '播放站內影片'
      }));
    }
    if (alts.childNodes.length) side.appendChild(alts);

    btn.addEventListener('click', function () { openVideo(t); });

    card.appendChild(btn);
    card.appendChild(side);
    box.appendChild(card);
  }

  /** 開啟影片彈窗。source 決定用站內 mp4 還是 YouTube 內嵌。 */
  function openVideo(t) {
    const modal = document.getElementById('video-modal');
    const box = document.getElementById('video-box');
    const alt = document.getElementById('video-alt');
    const title = document.getElementById('video-title');
    if (!modal || !box) return;

    const v = t.video || {};
    const ytId = youtubeId(v.youtube);
    const useLocal = v.source !== 'youtube' && !!v.local;

    box.innerHTML = '';
    alt.innerHTML = '';
    title.textContent = t.heading || '影片';

    if (useLocal) {
      const video = el('video', {
        class: 'video-box__player', src: v.local, controls: true,
        playsinline: true, preload: 'metadata'
      });
      video.autoplay = true;
      box.appendChild(video);
      // 這是使用者點擊後才觸發的，通常可以自動播放；
      // 若瀏覽器仍擋下，就讓訪客自己按播放鍵，不要跳錯誤。
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* 忽略 */ });
    } else if (ytId) {
      box.appendChild(el('iframe', {
        class: 'video-box__frame',
        src: 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&rel=0',
        title: t.heading || '影片',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true
      }));
    } else {
      box.appendChild(el('p', {
        class: 'video-box__error',
        text: '找不到可播放的來源，請檢查 data.js 的 thanks.video 設定。'
      }));
    }

    if (useLocal && ytId) {
      alt.appendChild(document.createTextNode('也可以 '));
      alt.appendChild(el('a', { href: v.youtube, target: '_blank', rel: 'noopener noreferrer', text: '在 YouTube 上觀看' }));
    } else if (!useLocal && v.local) {
      alt.appendChild(document.createTextNode('站內也有一份影片檔：'));
      alt.appendChild(el('a', { href: v.local, target: '_blank', rel: 'noopener noreferrer', text: '直接開啟' }));
    }

    modal.hidden = false;
    document.body.classList.add('is-locked');
  }

  function closeVideo() {
    const modal = document.getElementById('video-modal');
    const box = document.getElementById('video-box');
    if (!modal || modal.hidden) return;
    // 一定要清空，否則關掉彈窗後影片會在背景繼續播放
    if (box) box.innerHTML = '';
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function initVideoModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    modal.addEventListener('click', function (ev) {
      if (ev.target.hasAttribute('data-close-video')) closeVideo();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeVideo();
    });
  }

  /** 影片彈窗是否開著（給彩蛋的鍵盤偵測用，避免兩個彈窗疊在一起） */
  function isVideoOpen() {
    const m = document.getElementById('video-modal');
    return !!m && !m.hidden;
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  9. 頁尾
   * ══════════════════════════════════════════════════════════════════════ */
  function renderFooter() {
    const f = document.getElementById('footer');
    const c = D.footer || {};
    const egg = D.easterEgg || {};
    f.innerHTML = '';

    f.appendChild(el('p', { class: 'footer__disclaimer', text: c.disclaimer || '' }));
    f.appendChild(el('p', { class: 'footer__credits', text: c.credits || '' }));
    f.appendChild(el('p', { class: 'footer__privacy', text: c.privacyNote || '' }));

    // 捐款入口：放在這一排的最後面（在彩蛋小提示之前）
    let donateBtn = null;
    if (D.donate) {
      donateBtn = el('button', {
        class: 'footer__donate', id: 'donate-open', type: 'button',
        title: D.donate.tooltip || '', text: D.donate.label || '捐款'
      });
      donateBtn.addEventListener('click', openDonate);
    }

    f.appendChild(el('p', { class: 'footer__row' }, [
      el('span', { text: c.copyright || '' }),
      c.contactEmail ? el('a', { class: 'footer__link', href: 'mailto:' + c.contactEmail, text: c.contactEmail }) : null,
      el('span', { class: 'footer__updated', text: '最後更新：' + ((D.meta && D.meta.lastUpdated) || '—') }),
      donateBtn,
      // 彩蛋提示：滑鼠移上去會給暗示
      el('span', {
        class: 'footer__egg-hint', title: egg.hintTooltip || '', text: egg.hintText || '？',
        'aria-label': '隱藏提示'
      })
    ]));
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  10. 彩蛋
   * ----------------------------------------------------------------------
   *  觸發方式：在頁面上任何位置連續輸入 data.js 裡的 easterEgg.trigger
   *           （預設是 "ciallo"），不分大小寫、不需要點輸入框。
   * ══════════════════════════════════════════════════════════════════════ */
  function initEasterEgg() {
    const e = D.easterEgg;
    if (!e || !e.trigger) return;

    const modal = document.getElementById('egg-modal');
    const content = document.getElementById('egg-content');
    const target = e.trigger.toLowerCase();
    let buffer = '';
    let opened = false;

    /* 內容 */
    content.innerHTML = '';
    content.appendChild(el('h2', { class: 'egg__title', id: 'egg-title', text: e.title || '彩蛋' }));
    (e.lines || []).forEach(function (line) {
      content.appendChild(el('p', { class: 'egg__line', text: line }));
    });
    content.appendChild(el('div', { class: 'egg__ad' }, [
      el('span', { class: 'egg__ad-label', text: 'AD' }),
      el('strong', { class: 'egg__ad-text', text: e.adText || '廣告位招租' }),
      el('span', { class: 'egg__ad-sub', text: e.adSub || '' }),
      e.contact ? el('span', { class: 'egg__ad-contact', text: e.contact }) : null
    ]));

    function open() {
      if (opened) return;
      opened = true;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      spawnConfetti();
    }
    function close() {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
    }

    modal.addEventListener('click', function (ev) {
      if (ev.target.hasAttribute('data-close-egg')) close();
    });
    document.addEventListener('keydown', function (ev) {
      // Esc 關閉（只有在開著時才有意義）
      if (ev.key === 'Escape' && !modal.hidden) { close(); return; }
      // 彈窗已經開著就不再重複偵測
      if (!modal.hidden) return;
      // 其他彈窗（影片、會員註冊）開著時也不要觸發，免得疊在一起
      if (anyModalOpen()) return;

      // 打字偵測（忽略輸入框與修飾鍵）
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (ev.target && ev.target.isContentEditable)) return;
      if (!ev.key || ev.key.length !== 1) return;

      buffer = (buffer + ev.key.toLowerCase()).slice(-target.length);
      if (buffer === target) open();
    });

    /* 撒一點小慶祝粒子 */
    function spawnConfetti() {
      const box = el('div', { class: 'confetti' });
      for (let i = 0; i < 40; i++) {
        const bit = el('i', {
          class: 'confetti__bit',
          style: 'left:' + (Math.random() * 100).toFixed(2) + '%;' +
                 'animation-delay:' + (Math.random() * 0.6).toFixed(2) + 's;' +
                 'background:' + ['#66c0f4', '#a4d007', '#f5c542', '#ffffff'][i % 4] + ';' +
                 '--spin:' + (Math.random() * 720 - 360).toFixed(0) + 'deg;'
        });
        box.appendChild(bit);
      }
      document.body.appendChild(box);
      setTimeout(function () { box.remove(); }, 3500);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  11. 會員註冊（玩笑性質）
   * ----------------------------------------------------------------------
   *  ⚠ 這不是真的註冊功能，是刻意做的梗：
   *    - 沒有後端，不儲存、也不傳送任何資料
   *    - 性別那一欄「選男也說被佔用、選女也說被佔用」，所以永遠送不出去
   *    這是 data.js 的 member.messages.genderTaken 所描述的效果，不是 bug。
   * ══════════════════════════════════════════════════════════════════════ */

  /** 橫幅右上角的那顆按鈕 */
  function renderMemberButton() {
    const box = document.getElementById('banner-corner');
    const cfg = D.member;
    if (!box) return;
    if (!cfg) { box.remove(); return; }

    box.innerHTML = '';
    const btn = el('button', { class: 'member-btn', id: 'member-open', type: 'button' }, [
      el('span', {
        class: 'member-btn__icon',
        html: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0 2c4.4 0 8 2.2 8 5v2H4v-2c0-2.8 3.6-5 8-5z"/></svg>'
      }),
      el('span', { text: cfg.buttonLabel || '會員註冊' })
    ]);
    btn.addEventListener('click', openMember);
    box.appendChild(btn);
  }

  /** 一個欄位的外框：標籤 + 控制項 + 錯誤訊息 */
  function memberField(key, label, control) {
    if (control.id) control.setAttribute('aria-describedby', 'member-error-' + key);
    return el('div', { class: 'member__field', dataset: { field: key } }, [
      el('label', { class: 'field__label', for: control.id || null, text: label || '' }),
      control,
      el('p', { class: 'member__error', id: 'member-error-' + key })
    ]);
  }

  function openMember() {
    const modal = document.getElementById('member-modal');
    const host = document.getElementById('member-content');
    const cfg = D.member;
    if (!modal || !host || !cfg) return;

    const f = cfg.fields || {};
    host.innerHTML = '';
    host.appendChild(el('h2', { class: 'member__title', id: 'member-title', text: cfg.title || '會員註冊' }));
    if (cfg.subtitle) host.appendChild(el('p', { class: 'member__subtitle', text: cfg.subtitle }));

    const form = el('form', { class: 'member__form', novalidate: true });

    // 1. 用戶名稱
    form.appendChild(memberField('username', f.username && f.username.label,
      el('input', {
        class: 'field__input', id: 'member-username', type: 'text',
        maxlength: '20', autocomplete: 'off',
        placeholder: (f.username && f.username.placeholder) || ''
      })));

    // 2. 性別（就是這裡要玩梗）
    const radios = el('div', { class: 'member__radios', id: 'member-gender' });
    ((f.gender && f.gender.options) || []).forEach(function (opt, i) {
      const rid = 'member-gender-' + i;
      radios.appendChild(el('label', { class: 'member__radio', for: rid }, [
        el('input', { type: 'radio', name: 'member-gender', id: rid, value: opt }),
        el('span', { text: opt })
      ]));
    });
    form.appendChild(memberField('gender', f.gender && f.gender.label, radios));

    // 3. 電話號碼
    form.appendChild(memberField('phone', f.phone && f.phone.label,
      el('input', {
        class: 'field__input', id: 'member-phone', type: 'tel', inputmode: 'tel',
        autocomplete: 'off', placeholder: (f.phone && f.phone.placeholder) || ''
      })));

    // 4. 密碼
    form.appendChild(memberField('password', f.password && f.password.label,
      el('input', {
        class: 'field__input', id: 'member-password', type: 'password',
        autocomplete: 'new-password', placeholder: (f.password && f.password.placeholder) || ''
      })));

    // 5. 再次確定密碼
    form.appendChild(memberField('confirm', f.confirm && f.confirm.label,
      el('input', {
        class: 'field__input', id: 'member-confirm', type: 'password',
        autocomplete: 'new-password', placeholder: (f.confirm && f.confirm.placeholder) || ''
      })));

    form.appendChild(el('button', {
      class: 'btn btn--primary member__submit', type: 'submit',
      text: cfg.submitLabel || '註冊'
    }));
    form.addEventListener('submit', function (ev) { ev.preventDefault(); submitMember(); });
    host.appendChild(form);

    modal.hidden = false;
    document.body.classList.add('is-locked');
    const first = document.getElementById('member-username');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function closeMember() {
    const modal = document.getElementById('member-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function setMemberError(key, msg) {
    const field = document.querySelector('.member__field[data-field="' + key + '"]');
    const err = document.getElementById('member-error-' + key);
    if (field) field.classList.toggle('is-invalid', !!msg);
    if (err) err.textContent = msg || '';
  }

  function submitMember() {
    const cfg = D.member || {};
    const m = cfg.messages || {};
    const val = function (id) { const e = document.getElementById(id); return e ? e.value : ''; };

    const uname = val('member-username').trim();
    const phone = val('member-phone').trim();
    const pass = val('member-password');
    const confirm = val('member-confirm');
    const picked = document.querySelector('input[name="member-gender"]:checked');
    const gender = picked ? picked.value : '';

    Object.keys({ username: 1, gender: 1, phone: 1, password: 1, confirm: 1 })
      .forEach(function (k) { setMemberError(k, ''); });

    let firstBad = null;
    function fail(key, msg) {
      setMemberError(key, msg);
      if (!firstBad) firstBad = key;
    }

    if (!uname) fail('username', m.usernameRequired);
    else if (uname.length < 2 || uname.length > 20) fail('username', m.usernameLength);

    /* ↓↓↓ 這個表單的梗就在這裡 ↓↓↓
       不論訪客選「男」還是「女」，一律回報「性別已被佔用」，
       所以這個表單永遠註冊不成功。這是 data.js 設定出來的效果。 */
    if (!gender) fail('gender', m.genderRequired);
    else fail('gender', m.genderTaken);

    const digits = phone.replace(/[^0-9]/g, '');
    if (!phone) fail('phone', m.phoneRequired);
    else if (digits.length < 8 || digits.length > 15) fail('phone', m.phoneInvalid);

    if (!pass) fail('password', m.passwordRequired);
    else if (pass.length < 6) fail('password', m.passwordShort);

    if (!confirm) fail('confirm', m.confirmRequired);
    else if (confirm !== pass) fail('confirm', m.confirmMismatch);

    if (firstBad) {
      const field = document.querySelector('.member__field[data-field="' + firstBad + '"]');
      if (field) {
        field.classList.remove('is-shake');
        void field.offsetWidth;   // 強制重排，讓晃動動畫可以重播
        field.classList.add('is-shake');
      }
      // 把焦點移到第一個有問題的欄位，性別是電台按鈕所以找它的 input
      const focusable = field && field.querySelector('input');
      if (focusable && focusable.focus) focusable.focus();
      return;
    }

    /* 正常情況下永遠到不了這裡 —— 性別那一關一定會擋下來。
       保留這段是為了讓邏輯完整：如果哪天把那個梗拿掉，這裡就會生效。 */
  }

  function initMemberModal() {
    const modal = document.getElementById('member-modal');
    if (!modal) return;
    modal.addEventListener('click', function (ev) {
      if (ev.target.hasAttribute('data-close-member')) closeMember();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.hidden) closeMember();
    });
  }

  /** 有沒有任何彈窗開著（音樂的鍵盤切換與彩蛋都要避開） */
  function anyModalOpen() {
    const ids = ['egg-modal', 'video-modal', 'member-modal', 'gallery-modal', 'donate-modal', 'lightbox-modal', 'reader-modal'];
    for (let i = 0; i < ids.length; i++) {
      const m = document.getElementById(ids[i]);
      if (m && !m.hidden) return true;
    }
    return false;
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  12. 圖片彩蛋（點小圖 3 次開畫廊）
   * ----------------------------------------------------------------------
   *  刻意做得很低調：只是「特別鳴謝」下面一小張縮圖，不佔版面、
   *  不影響正常瀏覽。點擊次數達到 data.js 設定的 clicks 之後開畫廊。
   * ══════════════════════════════════════════════════════════════════════ */

  const galleryEgg = { count: 0 };

  function renderGalleryEgg() {
    const host = document.getElementById('gallery-egg-trigger');
    const cfg = D.galleryEgg;
    if (!host) return;
    if (!cfg || !cfg.trigger) { host.remove(); return; }

    const total = cfg.clicks || 3;
    host.innerHTML = '';

    const btn = el('button', {
      class: 'egg-thumb__btn', type: 'button',
      title: cfg.tooltip || '', 'aria-label': cfg.tooltip || '隱藏內容'
    });
    const img = el('img', { class: 'egg-thumb__img', src: cfg.trigger, alt: '', loading: 'lazy' });
    // 圖片載入失敗就直接把整個彩蛋移除，不要在頁面上留一個破圖
    img.addEventListener('error', function () { host.remove(); });
    btn.appendChild(img);

    // 點幾下就亮幾個點，讓人知道「有在算」
    const dots = el('span', { class: 'egg-thumb__dots' });
    for (let i = 0; i < total; i++) dots.appendChild(el('i'));
    btn.appendChild(dots);

    btn.addEventListener('click', function () {
      galleryEgg.count++;
      btn.classList.remove('is-tap');
      void btn.offsetWidth;          // 強制重排，讓縮放動畫可以重播
      btn.classList.add('is-tap');

      const marks = dots.querySelectorAll('i');
      const lit = galleryEgg.count % (total + 1);
      for (let i = 0; i < marks.length; i++) marks[i].classList.toggle('is-on', i < lit);

      if (galleryEgg.count >= total) {
        galleryEgg.count = 0;
        for (let i = 0; i < marks.length; i++) marks[i].classList.remove('is-on');
        openGallery();
      }
    });

    host.appendChild(btn);
  }

  /** 開啟彩蛋彈窗：先隨機給一張，想看全部再點下面那行小字 */
  function openGallery() {
    const modal = document.getElementById('gallery-modal');
    const host = document.getElementById('gallery-content');
    const cfg = D.galleryEgg;
    if (!modal || !host || !cfg) return;

    host.innerHTML = '';
    host.appendChild(el('h2', { class: 'gallery__title', id: 'gallery-title', text: cfg.title || '彩蛋' }));
    if (cfg.subtitle) host.appendChild(el('p', { class: 'gallery__subtitle', text: cfg.subtitle }));
    // 內容會在這個容器裡被換掉（隨機單張 ↔ 全部）
    host.appendChild(el('div', { class: 'gallery__stage', id: 'gallery-stage' }));

    showGalleryRandom();

    modal.hidden = false;
    document.body.classList.add('is-locked');
  }

  /** 從 images 裡隨機抽一張顯示 */
  function showGalleryRandom() {
    const stage = document.getElementById('gallery-stage');
    const cfg = D.galleryEgg;
    const list = (cfg && cfg.images) || [];
    if (!stage || !list.length) return;

    // 抽到跟上一張一樣的話就再抽一次（只有兩張以上時才需要）
    let pick = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1 && pick === showGalleryRandom.last) {
      pick = list[(list.indexOf(pick) + 1) % list.length];
    }
    showGalleryRandom.last = pick;

    stage.innerHTML = '';
    const wrap = el('button', {
      class: 'gallery__single-wrap', type: 'button', 'aria-label': '放大圖片'
    }, [el('img', { class: 'gallery__single', src: pick, alt: '' })]);
    wrap.addEventListener('click', function () { wrap.classList.toggle('is-zoom'); });
    stage.appendChild(wrap);

    // 圖片下面那行小字：點開可以看全部
    const label = (cfg.moreLabel || '查看全部 {n} 張 ▸').replace('{n}', String(list.length));
    const more = el('button', { class: 'gallery__more', type: 'button', text: label });
    more.addEventListener('click', showGalleryAll);
    stage.appendChild(more);
  }

  /** 展開成全部圖片的網格 */
  function showGalleryAll() {
    const stage = document.getElementById('gallery-stage');
    const cfg = D.galleryEgg;
    const list = (cfg && cfg.images) || [];
    if (!stage) return;

    stage.innerHTML = '';
    const grid = el('div', { class: 'gallery__grid' });
    list.forEach(function (src, i) {
      const item = el('button', {
        class: 'gallery__item', type: 'button',
        'aria-label': '放大第 ' + (i + 1) + ' 張圖片'
      }, [el('img', { class: 'gallery__img', src: src, alt: '', loading: 'lazy' })]);
      item.addEventListener('click', function () {
        // 同時只放大一張；再點同一張就縮回去
        const zoomed = grid.querySelector('.gallery__item.is-zoom');
        if (zoomed && zoomed !== item) zoomed.classList.remove('is-zoom');
        item.classList.toggle('is-zoom');
      });
      grid.appendChild(item);
    });
    stage.appendChild(grid);
    if (cfg.caption) stage.appendChild(el('p', { class: 'gallery__caption', text: cfg.caption }));

    const back = el('button', { class: 'gallery__more', type: 'button', text: cfg.backLabel || '◂ 再隨機抽一張' });
    back.addEventListener('click', showGalleryRandom);
    stage.appendChild(back);
  }

  function closeGallery() {
    const modal = document.getElementById('gallery-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function initGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    modal.addEventListener('click', function (ev) {
      if (ev.target.hasAttribute('data-close-gallery')) closeGallery();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.hidden) closeGallery();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  13. 捐款
   * ----------------------------------------------------------------------
   *  入口是頁尾那一排最後面的「💰 捐款」，點了開一個彈窗列出所有付款方式。
   *  付款碼圖片跟網站放在同一個資料夾，所以離線也看得到。
   * ══════════════════════════════════════════════════════════════════════ */

  function openDonate() {
    const modal = document.getElementById('donate-modal');
    const host = document.getElementById('donate-content');
    const cfg = D.donate;
    if (!modal || !host || !cfg) return;

    host.innerHTML = '';
    host.appendChild(el('h2', { class: 'donate__title', id: 'donate-title', text: cfg.title || '捐款' }));
    if (cfg.description) host.appendChild(el('p', { class: 'donate__desc', text: cfg.description }));

    const grid = el('div', { class: 'donate__grid' });
    (cfg.methods || []).forEach(function (m) {
      const card = el('div', { class: 'donate__card' });
      const wrap = el('button', {
        class: 'donate__qr-wrap', type: 'button',
        'aria-label': '放大 ' + (m.name || '') + ' 的付款碼'
      }, [el('img', { class: 'donate__qr', src: m.image, alt: (m.name || '') + ' 付款碼', loading: 'lazy' })]);
      wrap.addEventListener('click', function () {
        // 跟畫廊一樣：一次只放大一張，再點一次縮回去
        const zoomed = grid.querySelector('.donate__card.is-zoom');
        if (zoomed && zoomed !== card) zoomed.classList.remove('is-zoom');
        card.classList.toggle('is-zoom');
      });
      card.appendChild(wrap);
      card.appendChild(el('div', { class: 'donate__meta' }, [
        el('span', { class: 'donate__name', text: m.name || '' }),
        m.region ? el('span', { class: 'donate__region', text: m.region }) : null
      ]));
      grid.appendChild(card);
    });
    host.appendChild(grid);
    if (cfg.note) host.appendChild(el('p', { class: 'donate__note', text: cfg.note }));

    modal.hidden = false;
    document.body.classList.add('is-locked');
  }

  function closeDonate() {
    const modal = document.getElementById('donate-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function initDonateModal() {
    const modal = document.getElementById('donate-modal');
    if (!modal) return;
    modal.addEventListener('click', function (ev) {
      if (ev.target.hasAttribute('data-close-donate')) closeDonate();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.hidden) closeDonate();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  14. 隨機漫畫（放在留言板下面）
   * ----------------------------------------------------------------------
   *  顯示一張，按按鈕隨機換一張。跟彩蛋一樣會避開「連續抽到同一張」，
   *  不然連按兩次卻沒變，會讓人以為按鈕壞了。
   * ══════════════════════════════════════════════════════════════════════ */

  const comicState = { index: -1 };

  /** 抽一個不跟目前重複的索引 */
  function pickComic() {
    const list = (D.comic && D.comic.images) || [];
    if (list.length <= 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (i === comicState.index);
    return i;
  }

  /** 依序往前／往後一張。走到兩端會繞回另一頭，可以一直看下去。 */
  function stepComic(delta) {
    const list = (D.comic && D.comic.images) || [];
    const n = list.length;
    if (!n) return 0;
    const cur = comicState.index < 0 ? 0 : comicState.index;
    return ((cur + delta) % n + n) % n;   // 負數也能正確繞回
  }

  /** 把目前這張漫畫丟進放大檢視 */
  function zoomComic() {
    const img = document.getElementById('comic-img');
    if (!img || !img.getAttribute('src')) return;
    openLightbox(img.getAttribute('src'), img.getAttribute('alt') || '');
  }

  function showComic(i) {
    const cfg = D.comic;
    const list = (cfg && cfg.images) || [];
    if (!list.length || i < 0 || i >= list.length) return;
    comicState.index = i;

    const img = document.getElementById('comic-img');
    const frame = document.getElementById('comic-frame');
    if (frame) frame.classList.remove('is-error');
    if (img) {
      img.src = list[i];
      img.alt = (cfg.title || '漫畫') + ' 第 ' + (i + 1) + ' 張';
    }
    const counter = document.getElementById('comic-counter');
    if (counter) {
      counter.textContent = (cfg.counter || '第 {i} / {n} 張')
        .replace('{i}', String(i + 1))
        .replace('{n}', String(list.length));
    }
  }

  function renderComic() {
    const box = document.getElementById('comic-content');
    const cfg = D.comic;
    if (!box) return;
    const list = (cfg && cfg.images) || [];
    if (!cfg || !list.length) { hideSection('sec-comic'); return; }

    const titleEl = document.getElementById('comic-title');
    if (titleEl) {
      titleEl.textContent = (cfg.title || '隨機漫畫') + (cfg.subtitle ? '（' + cfg.subtitle + '）' : '');
    }
    const descEl = document.getElementById('comic-desc');
    if (descEl) descEl.textContent = (cfg.description || '').replace('{n}', String(list.length));

    box.innerHTML = '';

    /* 外框高度固定：漫畫的比例從 0.67 到 1.50 都有，
       不固定的話每換一張版面就會跳動，按鈕會跑來跑去。
       圖片本身可以點（或按 Enter／空白）放大檢視。 */
    const img = el('img', {
      class: 'comic__img', id: 'comic-img', alt: '', loading: 'lazy',
      tabindex: '0', role: 'button', 'aria-label': '放大這張漫畫'
    });
    img.addEventListener('error', function () {
      const f = document.getElementById('comic-frame');
      if (f) f.classList.add('is-error');
    });
    img.addEventListener('click', zoomComic);
    img.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); zoomComic(); }
    });
    const frame = el('div', { class: 'comic__frame', id: 'comic-frame' }, [
      img,
      el('span', { class: 'comic__error', text: '這張圖載入失敗，再按一次換一張。' })
    ]);

    const counter = el('div', { class: 'comic__counter', id: 'comic-counter' });

    const prev = el('button', {
      class: 'comic__arrow', id: 'comic-prev', type: 'button',
      'aria-label': cfg.prevAria || '上一張', title: cfg.prevAria || '上一張', text: '◀'
    });
    prev.addEventListener('click', function () { showComic(stepComic(-1)); });

    const next = el('button', {
      class: 'comic__arrow', id: 'comic-next', type: 'button',
      'aria-label': cfg.nextAria || '下一張', title: cfg.nextAria || '下一張', text: '▶'
    });
    next.addEventListener('click', function () { showComic(stepComic(1)); });

    const btn = el('button', {
      class: 'btn btn--primary comic__btn', id: 'comic-btn', type: 'button',
      text: cfg.buttonLabel || '🎲 隨機換一張'
    });
    btn.addEventListener('click', function () {
      btn.classList.remove('is-tap');
      void btn.offsetWidth;
      btn.classList.add('is-tap');
      showComic(pickComic());
    });

    box.appendChild(el('div', { class: 'comic' }, [
      frame,
      el('div', { class: 'comic__bar' }, [
        counter,
        el('div', { class: 'comic__controls' }, [prev, btn, next])
      ])
    ]));

    showComic(pickComic());
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  15. AI 助手「GPT-6-Astra」（玩笑性質）
   * ----------------------------------------------------------------------
   *  ⚠ 這不是真的 AI：
   *    - 不接任何模型、不連網、不傳送任何資料（Network 面板不會有請求）
   *    - 不管你問什麼，都是從 data.js 的 ai.replies 隨機抽一句回你
   *    - 「GPT-6-Astra」是設定好的角色名字，不是真的存在
   * ══════════════════════════════════════════════════════════════════════ */

  const aiState = { last: -1, busy: false };

  /** GPT-6-Astra 的頭像：OpenAI 官方標誌（Simple Icons，CC0） */
  const AI_ICON = (function () {
    const ic = ICONS.openai;
    return ic && ic.svg
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ic.svg + '</svg>'
      : '✦';
  })();

  /** 抽一句回覆，避開上一次抽到的（連問兩次同一句就露餡了） */
  function pickReply() {
    const list = (D.ai && D.ai.replies) || [];
    if (!list.length) return '';
    if (list.length === 1) return list[0];
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (i === aiState.last);
    aiState.last = i;
    return list[i];
  }

  /** 產生一顆對話泡泡。isThinking = 顯示跳動的點而不是文字 */
  function aiBubble(role, text, isThinking) {
    const body = el('div', { class: 'ai__bubble' });
    if (isThinking) {
      body.classList.add('ai__bubble--thinking');
      body.appendChild(el('span', { class: 'ai__dots', html: '<i></i><i></i><i></i>', 'aria-hidden': 'true' }));
      body.appendChild(el('span', { text: text }));
    } else {
      body.textContent = text;
    }

    const row = el('div', { class: 'ai__msg ai__msg--' + role });
    if (role === 'bot') {
      row.appendChild(el('div', { class: 'ai__avatar', html: AI_ICON, 'aria-hidden': 'true' }));
    }
    row.appendChild(body);
    return row;
  }

  function scrollAILog() {
    const log = document.getElementById('ai-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

  function askAI() {
    const cfg = D.ai || {};
    const log = document.getElementById('ai-log');
    const input = document.getElementById('ai-input');
    if (!log || !input || aiState.busy) return;

    const q = input.value.trim();
    if (!q) { input.focus(); return; }
    input.value = '';

    const empty = document.getElementById('ai-empty');
    if (empty) empty.remove();

    log.appendChild(aiBubble('user', q));

    // 先假裝思考，等一下再彈出罐頭回覆
    const label = (cfg.thinkingLabel || '{name} 正在思考').replace('{name}', cfg.assistantName || 'AI');
    const thinking = aiBubble('bot', label, true);
    log.appendChild(thinking);
    scrollAILog();

    aiState.busy = true;
    // 每次等 0.7～1.6 秒不等，比固定秒數更像真的在算
    setTimeout(function () {
      thinking.remove();
      log.appendChild(aiBubble('bot', pickReply()));
      aiState.busy = false;
      scrollAILog();
    }, 700 + Math.random() * 900);
  }

  function renderAI() {
    const box = document.getElementById('ai-content');
    const cfg = D.ai;
    if (!box) return;
    if (!cfg || !(cfg.replies || []).length) { hideSection('sec-ai'); return; }

    const name = cfg.assistantName || 'AI';

    const titleEl = document.getElementById('ai-title');
    if (titleEl) {
      titleEl.textContent = (cfg.title || 'AI 助手') + (cfg.subtitle ? '（' + cfg.subtitle + '）' : '');
    }
    const descEl = document.getElementById('ai-desc');
    if (descEl) descEl.textContent = cfg.description || '';

    box.innerHTML = '';

    const log = el('div', { class: 'ai__log', id: 'ai-log', role: 'log', 'aria-live': 'polite' });
    if (cfg.emptyHint) log.appendChild(el('p', { class: 'ai__empty', id: 'ai-empty', text: cfg.emptyHint }));

    const input = el('input', {
      class: 'ai__input', id: 'ai-input', type: 'text',
      placeholder: cfg.placeholder || '問我任何問題…',
      autocomplete: 'off', 'aria-label': '輸入你的問題'
    });
    const form = el('form', { class: 'ai__form' }, [
      input,
      el('button', { class: 'ai__send', id: 'ai-send', type: 'submit', text: cfg.sendLabel || '送出' })
    ]);
    form.addEventListener('submit', function (ev) { ev.preventDefault(); askAI(); });

    box.appendChild(el('div', { class: 'ai' }, [
      el('div', { class: 'ai__head' }, [
        el('div', { class: 'ai__avatar ai__avatar--lg', html: AI_ICON, 'aria-hidden': 'true' }),
        el('div', { class: 'ai__id' }, [
          el('div', { class: 'ai__name', text: name }),
          el('div', { class: 'ai__status' }, [
            el('span', { class: 'ai__dot', 'aria-hidden': 'true' }),
            el('span', { text: cfg.tagline || '' })
          ])
        ])
      ]),
      log,
      form
    ]));
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  16. 圖片放大檢視（漫畫用）
   * ----------------------------------------------------------------------
   *  漫畫的比例從 0.67 到 1.50 都有，在頁面上被外框高度限制住，
   *  很直的那幾張字會偏小。點一下就在覆蓋層裡放大來看。
   *  預設「符合畫面」，再點圖片可切成「原始大小」（可捲動）。
   * ══════════════════════════════════════════════════════════════════════ */

  function openLightbox(src, alt) {
    const modal = document.getElementById('lightbox-modal');
    const host = document.getElementById('lightbox-content');
    if (!modal || !host) return;

    host.innerHTML = '';
    host.classList.remove('is-actual');

    const img = el('img', { class: 'lightbox__img', src: src, alt: alt || '' });
    img.addEventListener('click', function (ev) {
      // 點圖片只切換大小，不要順便關掉
      ev.stopPropagation();
      img.classList.toggle('is-actual');
      host.classList.toggle('is-actual');
    });
    host.appendChild(img);
    host.appendChild(el('p', {
      class: 'lightbox__hint',
      text: '點圖片切換「符合畫面」／「原始大小」　·　按 Esc 或點空白處關閉'
    }));

    modal.hidden = false;
    document.body.classList.add('is-locked');
  }

  function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    modal.addEventListener('click', function (ev) {
      const t = ev.target;
      // 覆蓋層舖滿整個畫面，所以空白處的點擊目標會是 .lightbox 本身
      if (t.hasAttribute('data-close-lightbox') || t === modal ||
          (t.classList && t.classList.contains('lightbox'))) {
        closeLightbox();
      }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.hidden) closeLightbox();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  17. 小說
   * ----------------------------------------------------------------------
   *  內文在 novels.js（不是 data.js），這裡只負責接起來顯示。
   *  點封面或「閱讀」→ 開閱讀彈窗。
   * ══════════════════════════════════════════════════════════════════════ */

  /** 取 novels.js 裡某一篇的內文；載入失敗回 null */
  function novelText(key) {
    if (typeof NOVELS === 'undefined' || !NOVELS) return null;
    return NOVELS[key] || null;
  }

  /** 字數：中日韓字逐字算，英文數字以空白分詞算 */
  function countWords(paragraphs) {
    const s = (paragraphs || []).join('');
    const cjk = (s.match(/[\u3400-\u9fff\u3040-\u30ff]/g) || []).length;
    const latin = (s.replace(/[\u3400-\u9fff\u3040-\u30ff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
    return cjk + latin;
  }

  function isChapterLine(t) {
    return /^第[0-9零一二三四五六七八九十百千]+章/.test(t);
  }

  /** 沒有手寫簡介時，抓第一段真正的正文當簡介（跳過章節行） */
  function autoBlurb(novel) {
    if (!novel) return '';
    const ps = novel.paragraphs || [];
    for (let i = 0; i < ps.length; i++) {
      if (!isChapterLine(ps[i]) && ps[i].length >= 20) {
        return ps[i].length > 68 ? ps[i].slice(0, 68) + '……' : ps[i];
      }
    }
    return ps.length ? ps[0] : '';
  }

  function openReader(key) {
    const modal = document.getElementById('reader-modal');
    const host = document.getElementById('reader-content');
    const cfg = D.novels || {};
    if (!modal || !host) return;

    const novel = novelText(key);
    host.innerHTML = '';

    if (!novel) {
      // novels.js 沒載入或 key 打錯，給個看得懂的訊息而不是空白
      host.appendChild(el('p', { class: 'reader__missing', text: cfg.missingText || '找不到內文。' }));
      host.appendChild(el('button', {
        class: 'btn reader__close', type: 'button', text: cfg.closeLabel || '關閉', 'data-close-reader': ''
      }));
      modal.hidden = false;
      document.body.classList.add('is-locked');
      return;
    }

    const ps = novel.paragraphs || [];
    host.appendChild(el('h2', { class: 'reader__title', id: 'reader-title', text: novel.title || key }));
    host.appendChild(el('p', {
      class: 'reader__meta',
      text: (cfg.wordsLabel || '{n} 字').replace('{n}', countWords(ps).toLocaleString())
    }));

    const body = el('div', { class: 'reader__body' });
    ps.forEach(function (t) {
      const chapter = isChapterLine(t);
      body.appendChild(el(chapter ? 'h3' : 'p', {
        class: chapter ? 'reader__chapter' : 'reader__p',
        text: t
      }));
    });
    host.appendChild(body);
    host.appendChild(el('button', {
      class: 'btn reader__close', type: 'button', text: cfg.closeLabel || '關閉', 'data-close-reader': ''
    }));

    modal.hidden = false;
    document.body.classList.add('is-locked');
    host.scrollTop = 0;   // 每次打開都從頭讀
  }

  function closeReader() {
    const modal = document.getElementById('reader-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function initReaderModal() {
    const modal = document.getElementById('reader-modal');
    if (!modal) return;
    modal.addEventListener('click', function (ev) {
      if (ev.target.hasAttribute('data-close-reader')) closeReader();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.hidden) closeReader();
    });
  }

  function renderNovels() {
    const box = document.getElementById('novel-content');
    const cfg = D.novels;
    if (!box) return;
    const books = (cfg && cfg.books) || [];
    if (!cfg || !books.length) { hideSection('sec-novel'); return; }

    const titleEl = document.getElementById('novel-title');
    if (titleEl) {
      titleEl.textContent = (cfg.title || '小說') + (cfg.subtitle ? '（' + cfg.subtitle + '）' : '');
    }
    const descEl = document.getElementById('novel-desc');
    if (descEl) descEl.textContent = cfg.description || '';

    box.innerHTML = '';

    // 有 recommended 的排最前面
    const sorted = books.slice().sort(function (a, b) {
      return (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0);
    });

    const grid = el('div', { class: 'novels' });
    sorted.forEach(function (b) {
      const novel = novelText(b.key);
      const title = (novel && novel.title) || b.key;
      const blur = b.description || autoBlurb(novel);
      const chars = novel ? countWords(novel.paragraphs || []) : 0;

      const card = el('div', { class: 'novel' + (b.recommended ? ' novel--pick' : '') });

      const coverBtn = el('button', {
        class: 'novel__cover-wrap', type: 'button', 'aria-label': '閱讀《' + title + '》'
      }, [el('img', { class: 'novel__cover', src: b.cover || '', alt: '', loading: 'lazy' })]);
      if (b.recommended) {
        coverBtn.appendChild(el('span', {
          class: 'novel__badge', text: '★ ' + (cfg.recommendedLabel || '推薦')
        }));
      }
      coverBtn.addEventListener('click', function () { openReader(b.key); });
      card.appendChild(coverBtn);

      const readBtn = el('button', {
        class: 'novel__read', type: 'button', text: (cfg.readLabel || '閱讀') + ' ▸'
      });
      readBtn.addEventListener('click', function () { openReader(b.key); });

      const info = el('div', { class: 'novel__info' }, [
        el('h3', { class: 'novel__name', text: title }),
        blur ? el('p', { class: 'novel__blurb', text: blur }) : null
      ]);
      if (b.tags && b.tags.length) {
        const tags = el('div', { class: 'novel__tags' });
        b.tags.forEach(function (t) { tags.appendChild(el('span', { class: 'tag', text: t })); });
        info.appendChild(tags);
      }
      info.appendChild(el('div', { class: 'novel__foot' }, [
        el('span', {
          class: 'novel__words',
          text: chars ? (cfg.wordsLabel || '{n} 字').replace('{n}', chars.toLocaleString()) : ''
        }),
        readBtn
      ]));

      card.appendChild(info);
      grid.appendChild(card);
    });

    box.appendChild(grid);
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  分區導覽列
   * ══════════════════════════════════════════════════════════════════════ */
  function renderNav() {
    const nav = document.getElementById('section-nav');
    const items = [
      ['sec-favorites', '最愛'], ['sec-recent', '最近'], ['sec-perfect', '全成就'],
      ['sec-wishlist', '願望'], ['sec-music', '音樂'], ['sec-links', '連結'],
      ['sec-about', '關於'], ['sec-guestbook', '留言'], ['sec-comic', '漫畫'],
      ['sec-novel', '小說'], ['sec-ai', 'AI'], ['sec-thanks', '鳴謝']
    ];
    items.forEach(function (pair) {
      const sec = document.getElementById(pair[0]);
      if (!sec || sec.hidden) return;
      nav.appendChild(el('a', { class: 'section-nav__link', href: '#' + pair[0], text: pair[1] }));
    });

    // 捲動時高亮目前區塊
    const links = Array.prototype.slice.call(nav.querySelectorAll('.section-nav__link'));
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    items.forEach(function (pair) {
      const sec = document.getElementById(pair[0]);
      if (sec && !sec.hidden) obs.observe(sec);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  啟動
   * ══════════════════════════════════════════════════════════════════════ */
  function init() {
    const m = D.meta || {};
    if (m.siteName) {
      document.title = m.siteName;
      const h1 = document.querySelector('.banner__name');
      if (h1 && m.tagline) h1.setAttribute('data-tagline', m.tagline);
    }
    if (m.description) {
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', m.description);
    }
    if (m.lang) document.documentElement.lang = m.lang;

    renderBanner();
    renderMemberButton();
    renderFavorites();
    renderRecent();
    renderPerfect();
    renderWishlist();
    renderMusic();
    renderLinks();
    renderAbout();
    renderGuestbook();
    renderComic();
    renderNovels();
    renderAI();
    renderThanks();
    renderGalleryEgg();
    renderFooter();
    renderNav();
    initVideoModal();
    initMemberModal();
    initGalleryModal();
    initDonateModal();
    initLightbox();
    initReaderModal();
    initMusicKeys();
    initEasterEgg();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
