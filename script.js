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
  const ICONS = {
    // Steam 官方「活塞」圓形標記的真實向量路徑（取自 Valve 官方品牌資產）
    steam: {
      color: '#66c0f4',
      svg: '<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>'
    },
    discord: {
      color: '#5865F2',
      svg: '<path d="M8.2 6.4c-1.8.3-3.1.8-4.1 1.4C2.7 10.3 2.2 13.4 2.5 16.4c1.2 1 2.5 1.6 3.9 1.9l.8-1.3c-.5-.2-.9-.4-1.3-.7 2.6 1.2 5.6 1.2 8.2 0-.4.3-.8.5-1.3.7l.8 1.3c1.4-.3 2.7-.9 3.9-1.9.3-3-.2-6.1-1.6-8.6-1-.6-2.3-1.1-4.1-1.4l-.7 1.2a12 12 0 0 0-3.6 0l-.7-1.2z"/>' +
           '<circle cx="9.3" cy="13.2" r="1.4" fill="#0e1621"/><circle cx="14.7" cy="13.2" r="1.4" fill="#0e1621"/>'
    },
    x: { color: '#ffffff', svg: '<path d="M4 3.5l6.8 8.4L4.6 20.5H7l5-6 4.9 6H20l-6.9-8.6L19.6 3.5H17.2l-4.6 5.5-4.5-5.5H4z"/>' },
    instagram: {
      color: '#E1306C',
      svg: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>' +
           '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>' +
           '<circle cx="16.9" cy="7.1" r="1.3"/>'
    },
    youtube: { color: '#FF0000', svg: '<rect x="2" y="5.6" width="20" height="12.8" rx="4"/><path d="M10.4 9.4v5.2l4.6-2.6z" fill="#0e1621"/>' },
    twitch: { color: '#9146FF', svg: '<path d="M4.4 3L3 6.6v11.9h4.2V21l3.5-2.5h4.6L20.5 13V3h-16zm14.1 8.6l-2 2h-4.6l-3 3v-3H6.6V4.8h11.9v6.8z"/>' },
    bilibili: {
      color: '#00A1D6',
      svg: '<rect x="2" y="6.2" width="20" height="13.6" rx="4"/>' +
           '<path d="M7.2 2.8l2.9 3M16.8 2.8l-2.9 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>' +
           '<circle cx="8.6" cy="13" r="1.4" fill="#0e1621"/><circle cx="15.4" cy="13" r="1.4" fill="#0e1621"/>'
    },
    github: {
      color: '#e6edf3',
      svg: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>'
    },
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
      const card = el('a', {
        class: 'link-card',
        href: l.url,
        target: l.url.indexOf('mailto:') === 0 ? null : '_blank',
        rel: 'noopener noreferrer',
        style: '--brand:' + ic.color
      }, [
        el('span', { class: 'link-card__icon', html:
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ic.svg + '</svg>' }),
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

    f.appendChild(el('p', { class: 'footer__row' }, [
      el('span', { text: c.copyright || '' }),
      c.contactEmail ? el('a', { class: 'footer__link', href: 'mailto:' + c.contactEmail, text: c.contactEmail }) : null,
      el('span', { class: 'footer__updated', text: '最後更新：' + ((D.meta && D.meta.lastUpdated) || '—') }),
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
    const ids = ['egg-modal', 'video-modal', 'member-modal', 'gallery-modal'];
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

  function openGallery() {
    const modal = document.getElementById('gallery-modal');
    const host = document.getElementById('gallery-content');
    const cfg = D.galleryEgg;
    if (!modal || !host || !cfg) return;

    host.innerHTML = '';
    host.appendChild(el('h2', { class: 'gallery__title', id: 'gallery-title', text: cfg.title || '彩蛋' }));
    if (cfg.subtitle) host.appendChild(el('p', { class: 'gallery__subtitle', text: cfg.subtitle }));

    const grid = el('div', { class: 'gallery__grid' });
    (cfg.images || []).forEach(function (src, i) {
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
    host.appendChild(grid);
    if (cfg.caption) host.appendChild(el('p', { class: 'gallery__caption', text: cfg.caption }));

    modal.hidden = false;
    document.body.classList.add('is-locked');
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
   *  分區導覽列
   * ══════════════════════════════════════════════════════════════════════ */
  function renderNav() {
    const nav = document.getElementById('section-nav');
    const items = [
      ['sec-favorites', '最愛'], ['sec-recent', '最近'], ['sec-perfect', '全成就'],
      ['sec-wishlist', '願望'], ['sec-music', '音樂'], ['sec-links', '連結'],
      ['sec-about', '關於'], ['sec-guestbook', '留言'], ['sec-thanks', '鳴謝']
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
    renderThanks();
    renderGalleryEgg();
    renderFooter();
    renderNav();
    initVideoModal();
    initMemberModal();
    initGalleryModal();
    initMusicKeys();
    initEasterEgg();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
