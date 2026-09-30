/* ============================================================================
 *  script.js —— 冷戰時期・歷史音樂
 * ----------------------------------------------------------------------------
 *  重點：
 *    - 全頁只有一個 <audio>，切歌只換 src
 *    - 同時只會播一首；換國家或換曲目都會先停掉上一首
 *    - 頁面載入時不自動播放（只有使用者點光點才會）
 *    - 音訊載入失敗只影響那一首，其他首照常
 * ========================================================================== */
(function () {
  'use strict';

  const D = (typeof HISTORY_MUSIC !== 'undefined') ? HISTORY_MUSIC : null;
  const UI = (D && D.ui) || {};
  const COUNTRIES = (D && D.countries) || [];

  /* ── DOM ──────────────────────────────────────────────────────────────── */
  const $ = function (id) { return document.getElementById(id); };

  const audio    = $('cw-audio');
  const dotsBox  = $('cw-dots');
  const panel    = $('cw-panel');
  const infoBox  = $('cw-info');
  const emptyBox = $('cw-empty');
  const trackBox = $('cw-tracks');
  const player   = $('cw-player');
  const seek     = $('cw-seek');
  const seekFill = $('cw-seek-fill');
  const seekKnob = $('cw-seek-knob');
  const errBox   = $('cw-error');

  /* ── 狀態 ─────────────────────────────────────────────────────────────── */
  const state = {
    country: -1,     // 目前選中的國家索引
    track: -1,       // 目前播放的曲目索引
    playing: false,
    shuffle: false,
    repeat: true,    // 規格：播完自動下一首，最後一首後在同一國家內循環
    failed: {}       // 載入失敗過的音訊路徑
  };

  /* ── 小工具 ───────────────────────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k === 'html') n.innerHTML = v;
        else n.setAttribute(k, v);
      }
    }
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function currentCountry() { return state.country >= 0 ? COUNTRIES[state.country] : null; }

  function tracksOf(ci) {
    const c = COUNTRIES[ci];
    return (c && c.tracks) || [];
  }

  /* ── 頁首、地圖 ───────────────────────────────────────────────────────── */
  function renderHead() {
    if (!D) return;
    document.getElementById('cw-title').textContent = D.title || '歷史音樂';
    document.getElementById('cw-sub').textContent = D.subtitle || '';
    document.getElementById('cw-intro').textContent = D.intro || '';
    const back = $('cw-back');
    if (back) { back.href = D.backHref || '../../history.html'; back.textContent = D.backLabel || '← 回上一頁'; }
    document.title = (D.title || '歷史音樂') + ' — ciallo';
    $('cw-tracks-title').textContent = UI.tracksTitle || '曲目';
    $('cw-maphint').textContent = UI.hint || '';
  }

  function renderMap() {
    const img = $('cw-map');
    const cfg = (D && D.map) || {};
    if (!img) return;
    img.src = cfg.src || '';
    img.alt = cfg.alt || '世界地圖';
    if (cfg.width) img.setAttribute('width', cfg.width);
    if (cfg.height) img.setAttribute('height', cfg.height);

    // 地圖授權標註（CC BY-SA 4.0 要求寫出處）
    const credit = $('cw-credit');
    if (credit) credit.textContent = cfg.credit || '';

    img.addEventListener('error', function () {
      img.hidden = true;
      const err = $('cw-maperr');
      if (err) {
        err.hidden = false;
        err.textContent = '地圖圖片載入失敗：' + (cfg.src || '(未設定)');
      }
    });
  }

  /* ── 光點 ─────────────────────────────────────────────────────────────── */
  // 每個國家一個顏色（暗紅 / 琥珀 / 綠，冷戰地圖感）
  const DOT_COLORS = ['#f0a441', '#7ddf8a', '#d9534f', '#66c0f4', '#c9a227', '#e07a5f', '#9ad0c2'];

  function renderDots() {
    if (!dotsBox) return;
    dotsBox.innerHTML = '';

    COUNTRIES.forEach(function (c, i) {
      const dot = el('button', {
        class: 'cw-dot',
        type: 'button',
        style: 'left:' + c.x + '%;top:' + c.y + '%;--dot:' + DOT_COLORS[i % DOT_COLORS.length],
        'aria-label': '播放' + c.country + c.capital + '民俗音樂',
        'aria-pressed': 'false',
        dataset: { country: String(i) }
      }, [
        el('span', { class: 'cw-dot__label', text: c.country + '・' + c.capital })
      ]);
      dot.addEventListener('click', function () { selectCountry(i, true); });
      dotsBox.appendChild(dot);
    });
  }

  function markDots() {
    if (!dotsBox) return;
    const all = dotsBox.querySelectorAll('.cw-dot');
    for (let i = 0; i < all.length; i++) {
      all[i].setAttribute('aria-pressed', i === state.country ? 'true' : 'false');
    }
  }

  /* ── 曲目列表 ─────────────────────────────────────────────────────────── */
  function renderTracks() {
    if (!trackBox) return;
    trackBox.innerHTML = '';
    const ci = state.country;
    const list = tracksOf(ci);
    const c = currentCountry();

    list.forEach(function (t, i) {
      const timeText = t.duration || (state.failed[t.audio] ? '—' : '--:--');
      const btn = el('button', {
        class: 'cw-track',
        type: 'button',
        dataset: { index: String(i) },
        'aria-current': i === state.track ? 'true' : 'false',
        'aria-label': '播放 ' + (c ? c.country : '') + ' 的 ' + (t.title || ('第 ' + (i + 1) + ' 首'))
      }, [
        el('span', { class: 'cw-track__no', 'aria-hidden': 'true', text: String(i + 1).padStart(2, '0') }),
        el('span', { class: 'cw-track__title', text: t.title || ('第 ' + (i + 1) + ' 首') }),
        el('span', { class: 'cw-track__time', text: timeText })
      ]);
      btn.addEventListener('click', function () { loadTrack(i, true); });
      trackBox.appendChild(btn);
    });
  }

  /** 只更新「哪一首在播」的高亮，不重建整個列表 */
  function markTracks() {
    if (!trackBox) return;
    const all = trackBox.querySelectorAll('.cw-track');
    for (let i = 0; i < all.length; i++) {
      all[i].setAttribute('aria-current', i === state.track ? 'true' : 'false');
    }
  }

  /** 把某一首的長度填進列表（讀到 metadata 之後才會有） */
  function fillDuration(ti, sec) {
    if (!trackBox) return;
    const row = trackBox.querySelector('.cw-track[data-index="' + ti + '"] .cw-track__time');
    if (row) row.textContent = fmtTime(sec);
  }

  function renderInfo() {
    const c = currentCountry();
    if (!c) {
      if (infoBox) infoBox.hidden = true;
      if (emptyBox) { emptyBox.hidden = false; emptyBox.textContent = UI.noTrack || '請點地圖上的光點'; }
      return;
    }
    if (emptyBox) emptyBox.hidden = true;
    if (infoBox) infoBox.hidden = false;
    $('cw-country').textContent = c.country;
    $('cw-capital').textContent = c.capital;
    $('cw-desc').textContent = c.description || '';
  }

  /* ── 選擇國家 ─────────────────────────────────────────────────────────── */
  function selectCountry(ci, autoplay) {
    if (ci < 0 || ci >= COUNTRIES.length) return;

    // 換國家：先停掉上一首（規格要求）
    if (state.country !== ci) {
      stopAudio();
      state.country = ci;
      state.track = -1;
    }

    markDots();
    renderInfo();
    renderTracks();
    openPanel();

    if (autoplay) {
      loadTrack(0, true);
    } else {
      updateNowPlaying();
      renderTracks();
    }
    syncHash();
  }

  /* ── 載入並播放某一首 ─────────────────────────────────────────────────── */
  function loadTrack(ti, autoplay) {
    const list = tracksOf(state.country);
    const t = list[ti];
    if (!t) return;

    // 同一首而且已經在播 → 當成播放/暫停切換
    if (state.track === ti && audio.getAttribute('src')) {
      if (autoplay) togglePlay();
      return;
    }

    state.track = ti;
    hideError();

    // 換 src 之前先停掉，確保不會同時有兩首在跑
    audio.pause();
    state.playing = false;
    setPlayUI(false);

    audio.src = t.audio;
    audio.load();

    markTracks();
    updateNowPlaying();
    syncHash();
    scrollCurrentIntoView();

    if (autoplay) {
      const p = audio.play();
      // 瀏覽器可能擋下自動播放 —— 那就維持暫停，使用者自己按播放
      if (p && typeof p.catch === 'function') {
        p.catch(function () { setPlayUI(false); });
      }
    }
  }

  function stopAudio() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    state.playing = false;
    setPlayUI(false);
    updateProgress();
  }

  function togglePlay() {
    if (state.track < 0) {
      // 還沒選曲目：如果有選國家就從第一首開始
      if (state.country >= 0) loadTrack(0, true);
      return;
    }
    if (audio.paused) {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } else {
      audio.pause();
    }
  }

  /** 下一首（同一國家內）。shuffle = 隨機挑一首 */
  function stepTrack(delta) {
    const list = tracksOf(state.country);
    const n = list.length;
    if (!n) return;

    if (state.shuffle && n > 1) {
      let pick;
      do { pick = Math.floor(Math.random() * n); } while (pick === state.track);
      loadTrack(pick, true);
      return;
    }

    const cur = state.track < 0 ? 0 : state.track;
    const next = ((cur + delta) % n + n) % n;   // 負數也能繞回
    loadTrack(next, true);
  }

  /** 一首播完：自動下一首；到最後一首後在同一國家內循環（除非關掉循環） */
  function onEnded() {
    const list = tracksOf(state.country);
    const n = list.length;
    if (!n) return;
    const isLast = state.track >= n - 1;
    if (isLast && !state.repeat && !state.shuffle) {
      state.playing = false;
      setPlayUI(false);
      return;
    }
    stepTrack(1);
  }

  /* ── 播放器 UI ────────────────────────────────────────────────────────── */
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

  function setPlayUI(playing) {
    const btn = $('cw-play');
    if (!btn) return;
    state.playing = playing;
    btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    btn.setAttribute('aria-label', playing ? (UI.pause || '暫停') : (UI.play || '播放'));
    btn.title = btn.getAttribute('aria-label');
  }

  function updateNowPlaying() {
    const c = currentCountry();
    const t = c && (c.tracks || [])[state.track];
    const titleEl = $('cw-now-title');
    const subEl = $('cw-now-sub');
    if (!titleEl) return;
    if (t) {
      titleEl.textContent = t.title || '';
      subEl.textContent = c.country + '・' + c.capital;
    } else {
      titleEl.textContent = UI.noTrack || '尚未選擇曲目';
      subEl.textContent = c ? (c.country + '・' + c.capital) : '';
    }
  }

  function updateProgress() {
    const dur = audio.duration;
    const cur = audio.currentTime;
    const pct = (isFinite(dur) && dur > 0) ? Math.max(0, Math.min(100, (cur / dur) * 100)) : 0;
    if (seekFill) seekFill.style.width = pct + '%';
    if (seekKnob) seekKnob.style.left = pct + '%';
    if (seek) seek.setAttribute('aria-valuenow', String(Math.round(pct)));
    $('cw-cur').textContent = fmtTime(cur);
    $('cw-dur').textContent = (isFinite(dur) && dur > 0) ? fmtTime(dur) : '0:00';
  }

  function showError(msg) {
    if (!errBox) return;
    errBox.hidden = false;
    errBox.textContent = msg;
    // 錯誤那一列會把播放器撐高，抽屜的位置要跟著更新
    updatePlayerHeight();
  }
  function hideError() {
    if (!errBox) return;
    errBox.hidden = true;
    errBox.textContent = '';
    updatePlayerHeight();
  }

  function scrollCurrentIntoView() {
    if (!trackBox) return;
    const row = trackBox.querySelector('.cw-track[aria-current="true"]');
    if (row && row.scrollIntoView) {
      try { row.scrollIntoView({ block: 'nearest' }); } catch (e) { /* 舊瀏覽器忽略 */ }
    }
  }

  /* ── 手機抽屜 ─────────────────────────────────────────────────────────── */
  function openPanel() {
    if (panel && window.matchMedia('(max-width: 860px)').matches) panel.classList.add('is-open');
  }
  function closePanel() {
    if (panel) panel.classList.remove('is-open');
  }

  /* ── 進度條拖曳 ───────────────────────────────────────────────────────── */
  function bindSeek() {
    if (!seek) return;
    let dragging = false;

    function seekTo(ev) {
      const dur = audio.duration;
      if (!isFinite(dur) || dur <= 0) return;
      const rect = seek.getBoundingClientRect();
      const x = (ev.touches && ev.touches.length) ? ev.touches[0].clientX : ev.clientX;
      const ratio = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      audio.currentTime = ratio * dur;
      updateProgress();
    }

    seek.addEventListener('mousedown', function (ev) { ev.preventDefault(); dragging = true; seekTo(ev); });
    window.addEventListener('mousemove', function (ev) { if (dragging) seekTo(ev); });
    window.addEventListener('mouseup', function () { dragging = false; });
    seek.addEventListener('touchstart', function (ev) { dragging = true; seekTo(ev); }, { passive: true });
    seek.addEventListener('touchmove', function (ev) { if (dragging) seekTo(ev); }, { passive: true });
    seek.addEventListener('touchend', function () { dragging = false; });

    // 鍵盤：左右鍵快進 / 倒轉 5 秒
    seek.addEventListener('keydown', function (ev) {
      const dur = audio.duration;
      if (!isFinite(dur) || dur <= 0) return;
      if (ev.key === 'ArrowRight') { audio.currentTime = Math.min(dur, audio.currentTime + 5); ev.preventDefault(); ev.stopPropagation(); }
      else if (ev.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); ev.preventDefault(); ev.stopPropagation(); }
      updateProgress();
    });
  }

  /* ── 音量（記在 localStorage）───────────────────────────────────────────── */
  const VOL_KEY = 'cw-music-volume';

  function bindVolume() {
    const range = $('cw-vol');
    const mute = $('cw-mute');
    if (!range) return;

    let saved = null;
    try { saved = window.localStorage.getItem(VOL_KEY); } catch (e) { saved = null; }
    const v = (saved !== null && isFinite(parseFloat(saved))) ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.8;
    audio.volume = v;
    range.value = String(v);

    range.addEventListener('input', function () {
      audio.volume = parseFloat(range.value);
      audio.muted = false;
      if (mute) mute.setAttribute('aria-pressed', 'false');
      try { window.localStorage.setItem(VOL_KEY, range.value); } catch (e) { /* 無痕模式忽略 */ }
    });

    if (mute) {
      mute.addEventListener('click', function () {
        audio.muted = !audio.muted;
        mute.setAttribute('aria-pressed', audio.muted ? 'true' : 'false');
        mute.setAttribute('aria-label', audio.muted ? '取消靜音' : '靜音');
      });
    }
  }

  /* ── URL hash：#ussr 或 #ussr/track-2 ─────────────────────────────────── */
  function syncHash() {
    const c = currentCountry();
    if (!c) return;
    let h = '#' + c.id;
    if (state.track >= 0) h += '/track-' + (state.track + 1);
    try { history.replaceState(null, '', h); } catch (e) { /* file:// 可能不支援，忽略 */ }
  }

  function readHash() {
    const h = (window.location.hash || '').replace(/^#/, '');
    if (!h) return null;
    const parts = h.split('/');
    const idx = COUNTRIES.map(function (c) { return c.id; }).indexOf(parts[0]);
    if (idx < 0) return null;
    const m = /^track-(\d+)$/.exec(parts[1] || '');
    return { country: idx, track: m ? (parseInt(m[1], 10) - 1) : -1 };
  }

  /* ── 綁定 ─────────────────────────────────────────────────────────────── */
  function bind() {
    $('cw-play').addEventListener('click', togglePlay);
    $('cw-prev').addEventListener('click', function () { stepTrack(-1); });
    $('cw-next').addEventListener('click', function () { stepTrack(1); });

    const sh = $('cw-shuffle');
    sh.addEventListener('click', function () {
      state.shuffle = !state.shuffle;
      sh.setAttribute('aria-pressed', state.shuffle ? 'true' : 'false');
    });

    const rp = $('cw-repeat');
    rp.setAttribute('aria-pressed', state.repeat ? 'true' : 'false');
    rp.addEventListener('click', function () {
      state.repeat = !state.repeat;
      rp.setAttribute('aria-pressed', state.repeat ? 'true' : 'false');
    });

    $('cw-close').addEventListener('click', closePanel);
    const grip = $('cw-grip');
    if (grip) {
      grip.addEventListener('click', closePanel);
      grip.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); closePanel(); }
      });
    }

    // ── 音訊事件 ──
    audio.addEventListener('play', function () { setPlayUI(true); });
    audio.addEventListener('pause', function () { setPlayUI(false); });
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('durationchange', updateProgress);
    audio.addEventListener('loadedmetadata', function () {
      updateProgress();
      if (state.track >= 0) fillDuration(state.track, audio.duration);
    });
    audio.addEventListener('error', function () {
      const c = currentCountry();
      const t = c && (c.tracks || [])[state.track];
      if (t) state.failed[t.audio] = true;
      // 只影響這一首，其他首照常
      setPlayUI(false);
      showError((UI.loadError || '音訊載入失敗') + (t ? '（' + t.title + '）' : ''));
      markTracks();
    });

    // ── 播放器實際高度 → CSS 變數（抽屜與頁尾留白要對齊）──
    // 用 ResizeObserver 持續追蹤：播放器的高度會變（手機變成兩列、
    // 出現錯誤訊息那一列…），只量一次的話抽屜會跟它重疊。
    watchPlayerHeight();

    // ── 鍵盤：空白 = 播放/暫停，左右 = 上下首 ──
    document.addEventListener('keydown', function (ev) {
      const tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (ev.target && ev.target.isContentEditable)) return;
      // 焦點在進度條上時左右鍵是快進，讓它自己處理
      if (ev.target && ev.target.id === 'cw-seek') return;

      if (ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        togglePlay();
      } else if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        stepTrack(-1);
      } else if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        stepTrack(1);
      }
    });
  }

  function updatePlayerHeight() {
    if (!player) return;
    const h = Math.round(player.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty('--cw-player-h', h + 'px');
  }

  /** 持續追蹤播放器高度（它會隨版面與錯誤訊息變化） */
  function watchPlayerHeight() {
    updatePlayerHeight();
    if (typeof ResizeObserver === 'function' && player) {
      const ro = new ResizeObserver(function () { updatePlayerHeight(); });
      ro.observe(player);
    } else {
      // 舊瀏覽器：退回用 resize 事件
      window.addEventListener('resize', updatePlayerHeight);
    }
  }

  /* ── 啟動 ─────────────────────────────────────────────────────────────── */
  function init() {
    if (!D || !COUNTRIES.length) {
      if (emptyBox) emptyBox.textContent = '找不到資料（history/music/data.js）。';
      return;
    }

    renderHead();
    renderMap();
    renderDots();
    renderInfo();
    bindSeek();
    bindVolume();
    bind();

    updateNowPlaying();
    updateProgress();

    // 有 hash 就還原（但**不自動播放**）
    const fromHash = readHash();
    if (fromHash) {
      state.country = fromHash.country;
      state.track = -1;
      markDots();
      renderInfo();
      renderTracks();
      if (fromHash.track >= 0 && tracksOf(fromHash.country)[fromHash.track]) {
        // 只載入、不播
        const t = tracksOf(fromHash.country)[fromHash.track];
        state.track = fromHash.track;
        audio.src = t.audio;
        markTracks();
        updateNowPlaying();
      }
    }

    updatePlayerHeight();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
