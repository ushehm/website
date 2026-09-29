/* ============================================================================
 *  history.js —— 歷史專區子頁面的邏輯
 * ----------------------------------------------------------------------------
 *  只做三件事：把頁首文字填好、產生書單、開關閱讀器。
 *  書單與文字全部來自 data.js 的 history 區塊；PDF 在 history/ 資料夾。
 *
 *  刻意不共用 script.js —— 那個是主頁用的，會去找主頁才有的元素。
 * ========================================================================== */
(function () {
  'use strict';

  const D = (typeof SITE_DATA !== 'undefined') ? SITE_DATA : null;
  const H = (D && D.history) || null;

  /* ── 小工具：建立元素 ─────────────────────────────────────────────────── */
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

  /* ── 頁首 ─────────────────────────────────────────────────────────────── */
  function renderHeader() {
    if (!H) return;
    setText('sub-title', H.title);
    setText('sub-sub', H.subtitle);
    setText('sub-desc', H.description);

    const back = document.getElementById('sub-back');
    if (back && H.backLabel) back.textContent = H.backLabel;

    const open = document.getElementById('reader-open');
    if (open && H.openLabel) open.textContent = H.openLabel;
    const dl = document.getElementById('reader-download');
    if (dl && H.downloadLabel) dl.textContent = H.downloadLabel;
    const close = document.getElementById('reader-close');
    if (close && H.closeLabel) close.textContent = H.closeLabel;
    const hint = document.getElementById('reader-hint');
    if (hint && H.readerHint) hint.textContent = H.readerHint;

    document.title = (H.title || '歷史專區') + ' — ciallo';
  }

  /* ── 書單 ─────────────────────────────────────────────────────────────── */
  let currentFile = null;

  function markCurrent(file) {
    document.querySelectorAll('.book').forEach(function (n) {
      n.classList.toggle('is-current', file !== null && n.dataset.file === file);
    });
  }

  function openReader(book) {
    const reader = document.getElementById('reader');
    const frame = document.getElementById('reader-frame');
    if (!reader || !frame) return;

    currentFile = book.file;
    setText('reader-title', book.title);

    const open = document.getElementById('reader-open');
    if (open) open.href = book.file;
    const dl = document.getElementById('reader-download');
    if (dl) dl.href = book.file;

    // #view=FitH 請瀏覽器盡量把頁面寬度撐滿；支援的瀏覽器會照做
    frame.src = book.file + '#view=FitH&toolbar=1';
    reader.hidden = false;
    markCurrent(book.file);

    // 讓閱讀器進到畫面裡
    try { reader.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    catch (e) { reader.scrollIntoView(); }
  }

  function closeReader() {
    const reader = document.getElementById('reader');
    const frame = document.getElementById('reader-frame');
    // 把 iframe 指向空白頁，停止 PDF 繼續載入（不然會一直吃流量）
    if (frame) frame.src = 'about:blank';
    if (reader) reader.hidden = true;
    currentFile = null;
    markCurrent(null);
  }

  function renderList() {
    const list = document.getElementById('history-list');
    if (!list) return;

    if (!H || !(H.books || []).length) {
      list.appendChild(el('p', {
        class: 'reader__hint',
        text: '找不到書單資料 —— 請確認 data.js 裡的 history 區塊還在。'
      }));
      return;
    }

    // 依 level 分組，保持陣列原本的順序
    const groups = [];
    H.books.forEach(function (b, i) {
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
    const total = H && H.books ? H.books.length : 0;
    f.appendChild(el('p', { class: 'footer__credits', text: '歷史科筆記共 ' + total + ' 本，僅供個人溫習使用。' }));
    f.appendChild(el('p', { class: 'footer__row' }, [
      el('a', { class: 'footer__link', href: 'index.html', text: '回到主頁' })
    ]));
  }

  /* ── 啟動 ─────────────────────────────────────────────────────────────── */
  function init() {
    renderHeader();
    renderList();
    renderFooter();

    const close = document.getElementById('reader-close');
    if (close) close.addEventListener('click', closeReader);

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      const reader = document.getElementById('reader');
      if (reader && !reader.hidden) closeReader();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
