/* ============================================================================
 *  study.js —— 溫習相關頁面的共用程式
 * ----------------------------------------------------------------------------
 *  一個檔案同時處理兩種頁面，用 <body> 上的 data 屬性區分：
 *
 *    <body data-study-page="hub">                  → 溫習中轉頁（study.html）
 *    <body data-study-page="subject" data-subject="history">
 *                                                  → 專區頁（history.html / chinese.html）
 *
 *  所有文字與書單都來自 data.js：
 *    study.subjects  中轉頁要列哪些專區
 *    study.ui        各專區頁面共用的按鈕文字
 *    <key>           各專區的書單（key 對應 data-subject）
 *
 *  刻意不共用 script.js —— 那個是主頁用的，會去找主頁才有的元素。
 * ========================================================================== */
(function () {
  'use strict';

  const D = (typeof SITE_DATA !== 'undefined') ? SITE_DATA : null;
  const UI = (D && D.study && D.study.ui) || {};
  const PAGE = document.body.getAttribute('data-study-page') || 'hub';
  const KEY = document.body.getAttribute('data-subject') || '';
  const SUBJECT = (D && KEY && D[KEY]) || null;

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
        else if (k === 'dataset') { for (const d in v) n.dataset[d] = v[d]; }
        else n.setAttribute(k, v);
      }
    }
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function setText(id, v) {
    const n = document.getElementById(id);
    if (n) n.textContent = v || '';
  }

  function fmtMB(bytes) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /* ── 頁首（兩種頁面共用）──────────────────────────────────────────────── */
  function renderHeader(cfg, backHref, backLabel) {
    setText('sub-title', cfg && cfg.title);
    setText('sub-sub', cfg && cfg.subtitle);
    setText('sub-desc', cfg && cfg.description);

    const back = document.getElementById('sub-back');
    if (back) {
      back.href = backHref;
      back.textContent = backLabel;
    }
    document.title = ((cfg && cfg.title) || '溫習') + ' — ciallo';
  }

  /* ── 閱讀器（只有專區頁會用到）────────────────────────────────────────── */
  function markCurrent(file) {
    document.querySelectorAll('.book').forEach(function (n) {
      n.classList.toggle('is-current', file !== null && n.dataset.file === file);
    });
  }

  function openReader(book) {
    const reader = document.getElementById('reader');
    const frame = document.getElementById('reader-frame');
    if (!reader || !frame) return;

    setText('reader-title', book.title);

    const open = document.getElementById('reader-open');
    if (open) open.href = book.file;
    const dl = document.getElementById('reader-download');
    if (dl) dl.href = book.file;

    // #view=FitH 請瀏覽器盡量把頁面寬度撐滿；支援的瀏覽器會照做
    frame.src = book.file + '#view=FitH&toolbar=1';
    reader.hidden = false;
    markCurrent(book.file);

    try { reader.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    catch (e) { reader.scrollIntoView(); }
  }

  function closeReader() {
    const reader = document.getElementById('reader');
    const frame = document.getElementById('reader-frame');
    // 指向空白頁，停止 PDF 繼續載入（不然會一直吃流量）
    if (frame && frame.getAttribute('src') !== 'about:blank') frame.src = 'about:blank';
    if (reader) reader.hidden = true;
    markCurrent(null);
  }

  /* ── 中轉頁：列出所有專區 ─────────────────────────────────────────────── */
  function renderHub() {
    const box = document.getElementById('study-list');
    if (!box) return;

    const cfg = D && D.study;
    const subjects = (cfg && cfg.subjects) || [];
    if (!subjects.length) {
      box.appendChild(el('p', { class: 'reader__hint', text: 'data.js 裡沒有 study.subjects。' }));
      return;
    }

    const grid = el('div', { class: 'subjects' });
    subjects.forEach(function (s) {
      const conf = D[s.key];
      const count = (conf && conf.books) ? conf.books.length : 0;

      const card = el('a', { class: 'subject', href: s.page || '#' }, [
        el('span', { class: 'subject__icon', 'aria-hidden': 'true', text: s.icon || '書' }),
        el('span', { class: 'subject__body' }, [
          el('span', { class: 'subject__name', text: s.name || s.key }),
          el('span', { class: 'subject__desc', text: s.description || '' }),
          el('span', { class: 'subject__meta', text: count + ' 份筆記' })
        ]),
        el('span', { class: 'subject__go', 'aria-hidden': 'true', text: '▸' })
      ]);
      grid.appendChild(card);
    });

    box.appendChild(grid);
  }

  /* ── 專區頁：書單 ─────────────────────────────────────────────────────── */
  function renderList() {
    const list = document.getElementById('history-list');
    if (!list) return;

    if (!SUBJECT || !(SUBJECT.books || []).length) {
      list.appendChild(el('p', {
        class: 'reader__hint',
        text: UI.missingText || '找不到這個專區的資料。'
      }));
      return;
    }

    // 依 level 分組，保持陣列原本的順序
    const groups = [];
    SUBJECT.books.forEach(function (b, i) {
      let g = groups.filter(function (x) { return x.level === b.level; })[0];
      if (!g) { g = { level: b.level, items: [] }; groups.push(g); }
      g.items.push({ book: b, index: i });
    });

    groups.forEach(function (g) {
      const grid = el('div', { class: 'books' });

      g.items.forEach(function (it) {
        const b = it.book;
        const btn = el('button', {
          class: 'book',
          type: 'button',
          dataset: { file: b.file },
          'aria-label': '閱讀《' + b.title + '》'
        }, [
          el('span', { class: 'book__no', 'aria-hidden': 'true', text: String(it.index + 1).padStart(2, '0') }),
          el('span', { class: 'book__body' }, [
            el('span', { class: 'book__title', text: b.title }),
            el('span', { class: 'book__meta' }, [
              b.note ? el('span', { class: 'book__note', text: b.note }) : null,
              b.size ? el('span', { class: 'book__size', text: b.size }) : null
            ])
          ]),
          el('span', { class: 'book__go', 'aria-hidden': 'true', text: '▸' })
        ]);
        btn.addEventListener('click', function () { openReader(b); });
        grid.appendChild(btn);
      });

      list.appendChild(el('section', { class: 'section' }, [
        el('div', { class: 'section__head' }, [
          el('h2', { class: 'section__title' }, [
            el('span', { class: 'section__icon', 'aria-hidden': 'true', text: '❐' }),
            el('span', { text: g.level || '筆記' })
          ]),
          el('p', { class: 'section__desc', text: g.items.length + ' 本' })
        ]),
        grid
      ]));
    });
  }

  /* ── 頁尾 ─────────────────────────────────────────────────────────────── */
  function renderFooter() {
    const f = document.getElementById('sub-footer');
    if (!f) return;

    if (PAGE === 'hub') {
      const n = (D && D.study && D.study.subjects) ? D.study.subjects.length : 0;
      f.appendChild(el('p', { class: 'footer__credits', text: '目前有 ' + n + ' 個專區。' }));
    } else if (SUBJECT) {
      f.appendChild(el('p', {
        class: 'footer__credits',
        text: (SUBJECT.title || '') + '共 ' + SUBJECT.books.length + ' 份資料，僅供個人溫習使用。'
      }));
    }
    f.appendChild(el('p', { class: 'footer__row' }, [
      el('a', { class: 'footer__link', href: 'index.html', text: '回到主頁' })
    ]));
  }

  /* ── 啟動 ─────────────────────────────────────────────────────────────── */
  function init() {
    if (PAGE === 'hub') {
      const cfg = (D && D.study) || { title: '溫習' };
      renderHeader(cfg, 'index.html', '← 回到主頁');
      renderHub();
    } else {
      renderHeader(
        SUBJECT || { title: '找不到專區' },
        'study.html',
        UI.backLabel || '← 回到溫習'
      );
      renderList();

      // 共用文字
      const open = document.getElementById('reader-open');
      if (open && UI.openLabel) open.textContent = UI.openLabel;
      const dl = document.getElementById('reader-download');
      if (dl && UI.downloadLabel) dl.textContent = UI.downloadLabel;
      const closeBtn = document.getElementById('reader-close');
      if (closeBtn && UI.closeLabel) closeBtn.textContent = UI.closeLabel;
      const hint = document.getElementById('reader-hint');
      if (hint && UI.readerHint) hint.textContent = UI.readerHint;

      if (closeBtn) closeBtn.addEventListener('click', closeReader);
      document.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Escape') return;
        const reader = document.getElementById('reader');
        if (reader && !reader.hidden) closeReader();
      });
    }

    renderFooter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
