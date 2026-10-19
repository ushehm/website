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

    // 跨網域的檔案（例如 Cloudflare R2 的 PDF）瀏覽器會忽略 download 屬性，
    // 按下去只會開啟，不會下載。所以那種情況改成「開啟 PDF」並開新分頁，
    // 不要讓按鈕寫著「下載」卻做不到。
    const dl = document.getElementById('reader-download');
    if (dl) {
      dl.href = book.file;
      const remote = /^https?:/i.test(book.file);
      if (remote) {
        dl.removeAttribute('download');
        dl.setAttribute('target', '_blank');
        dl.setAttribute('rel', 'noopener noreferrer');
        dl.textContent = UI.remoteOpenLabel || '開啟 PDF ↗';
        dl.title = '這個檔案放在外部空間，瀏覽器不允許強制下載，會開新分頁顯示';
      } else {
        dl.setAttribute('download', '');
        dl.removeAttribute('target');
        dl.textContent = UI.downloadLabel || '下載 PDF';
        dl.removeAttribute('title');
      }
    }

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
      // 單位詞可以各自設定（筆記 / 試卷…），沒設定就用「份筆記」
      const unit = s.unit || '份筆記';
      const meta = count > 0 ? (count + ' ' + unit) : (s.emptyMeta || '尚未加入');

      const card = el('a', { class: 'subject', href: s.page || '#' }, [
        el('span', { class: 'subject__icon', 'aria-hidden': 'true', text: s.icon || '書' }),
        el('span', { class: 'subject__body' }, [
          el('span', { class: 'subject__name', text: s.name || s.key }),
          el('span', { class: 'subject__desc', text: s.description || '' }),
          el('span', { class: 'subject__meta', text: meta })
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

    if (!SUBJECT) {
      list.appendChild(el('p', {
        class: 'reader__hint',
        text: UI.missingText || '找不到這個專區的資料。'
      }));
      return;
    }

    if (!(SUBJECT.books || []).length) {
      // 專區存在但還沒放清單（例如 DSE 試卷庫還沒填檔案）
      list.appendChild(el('p', {
        class: 'reader__hint',
        text: UI.emptyText || '這個專區的清單還沒加入。'
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
      // 份數很多時（例如 DSE 試卷庫 111 份）改成多欄排列，
      // 不然一張一張往下排，頁面會長到一萬多 px。
      const dense = (SUBJECT.books || []).length > 24;
      const grid = el('div', { class: 'books' + (dense ? ' books--dense' : '') });

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
          el('p', { class: 'section__desc', text: g.items.length + ' ' + (SUBJECT.unit || '本') })
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

  /* ── DSE 倒計時 ───────────────────────────────────────────────────────── */
  const DAY = 86400000;

  function renderCountdown() {
    const box = document.getElementById('dse-countdown');
    if (!box) return;

    const cfg = (D && D.dseCountdown) || null;
    const target = cfg && cfg.targetISO ? new Date(cfg.targetISO) : null;
    if (!cfg || !target || isNaN(target.getTime())) return;   /* 沒設定就不顯示 */

    const units = cfg.units || ['天', '時', '分', '秒'];

    /* ── 外框 ── */
    const wrap = el('div', { class: 'quest' });

    /* 左：標題 */
    const head = el('div', { class: 'quest__head' });
    head.appendChild(el('p', { class: 'quest__kicker', text: cfg.kicker || 'MAIN QUEST' }));
    head.appendChild(el('h2', { class: 'quest__title' }, [
      el('span', { class: 'quest__icon', 'aria-hidden': 'true', text: cfg.icon || '⚔️' }),
      el('span', { text: cfg.title || 'DSE 倒數' })
    ]));
    head.appendChild(el('p', { class: 'quest__slogan', id: 'quest-slogan' }));

    /* 中：倒數 */
    const clock = el('div', { class: 'quest__clock' });
    const cells = [];
    units.forEach(function (u, i) {
      const num = el('span', { class: 'quest__num', text: '--' });
      cells.push(num);
      clock.appendChild(el('div', { class: 'quest__cell' }, [
        num,
        el('span', { class: 'quest__unit', text: u })
      ]));
    });
    /* 螢幕閱讀器用的一句話（每秒更新會很吵，所以用 aria-live 只在分鐘變動時更新） */
    const sr = el('p', { class: 'visually-hidden', id: 'quest-sr', 'aria-live': 'polite' });

    /* 右：下一科 */
    const side = el('div', { class: 'quest__side' });
    const nextBox = el('div', { class: 'quest__next' });
    nextBox.appendChild(el('p', { class: 'quest__next-label', text: '下一科' }));
    const nextName = el('p', { class: 'quest__next-name', id: 'quest-next' });
    const nextWhen = el('p', { class: 'quest__next-when', id: 'quest-next-when' });
    nextBox.appendChild(nextName);
    nextBox.appendChild(nextWhen);
    side.appendChild(nextBox);

    wrap.appendChild(head);
    wrap.appendChild(clock);
    wrap.appendChild(side);
    box.appendChild(wrap);
    box.appendChild(sr);

    /* ── 任務清單 ── */
    const exams = (cfg.exams || []).map(function (e) {
      return { date: new Date(e.date), subject: e.subject, paper: e.paper };
    }).filter(function (e) { return !isNaN(e.date.getTime()); });

    let list = null;
    if (exams.length) {
      list = el('ol', { class: 'quests' });
      exams.forEach(function (e) {
        const li = el('li', { class: 'quest-item', dataset: {} }, [
          el('span', { class: 'quest-item__date', text: fmtDate(e.date) }),
          el('span', { class: 'quest-item__subject', text: e.subject + (e.paper ? '・' + e.paper : '') }),
          el('span', { class: 'quest-item__left' })
        ]);
        list.appendChild(li);
        e.el = li;
      });
      wrap.appendChild(list);   /* 放進 banner 裡面，跟其他內容同一張卡 */
    }

    /* ── 更新 ── */
    const sloganEl = document.getElementById('quest-slogan');
    let lastMinute = -1;

    function pickSlogan(daysLeft) {
      const s = (cfg.slogans || []).slice().sort(function (a, b) { return a.untilDays - b.untilDays; });
      for (let i = 0; i < s.length; i++) {
        if (daysLeft <= s[i].untilDays) return s[i].text;
      }
      return s.length ? s[s.length - 1].text : '';
    }

    function tick() {
      const now = Date.now();
      const ms = target.getTime() - now;

      if (ms <= 0) {
        cells.forEach(function (c) { c.textContent = '00'; });
        if (sloganEl) sloganEl.textContent = cfg.doneText || '';
        if (nextName) nextName.textContent = '—';
        if (nextWhen) nextWhen.textContent = '';
      } else {
        const d = Math.floor(ms / DAY);
        const h = Math.floor(ms % DAY / 3600000);
        const m = Math.floor(ms % 3600000 / 60000);
        const s = Math.floor(ms % 60000 / 1000);
        const vals = [d, h, m, s];
        cells.forEach(function (c, i) {
          const v = vals[i];
          c.textContent = i === 0 ? String(v) : String(v).padStart(2, '0');
        });
        if (sloganEl) sloganEl.textContent = pickSlogan(d);

        /* 螢幕閱讀器：每分鐘更新一次就好 */
        const minute = Math.floor(ms / 60000);
        if (minute !== lastMinute) {
          lastMinute = minute;
          sr.textContent = '距離 ' + (cfg.targetLabel || '') + ' 開考還有 ' +
            d + ' 天 ' + h + ' 小時 ' + m + ' 分鐘。';
        }
      }

      /* 任務清單：跟大倒數用同一種算法（floor），天數才會一致 */
      if (list) {
        let next = null;
        exams.forEach(function (e) {
          const start = e.date.getTime();
          const left = Math.floor((start - now) / DAY);
          const done = now >= start + DAY;      /* 整日考完之後才算「已考」 */
          const span = e.el.querySelector('.quest-item__left');
          if (done) {
            e.el.classList.add('is-done');
            e.el.classList.remove('is-today');
            span.textContent = '已考';
          } else if (left <= 0) {
            e.el.classList.remove('is-done');
            e.el.classList.add('is-today');
            span.textContent = '今天';
            if (!next) next = { e: e, left: 0 };
          } else {
            e.el.classList.remove('is-done');
            e.el.classList.remove('is-today');
            span.textContent = left + ' 天';
            if (!next) next = { e: e, left: left };
          }
        });
        if (next) {
          if (nextName) nextName.textContent = next.e.subject + (next.e.paper ? '・' + next.e.paper : '');
          if (nextWhen) nextWhen.textContent = fmtDate(next.e.date) + '　' +
            (next.left === 0 ? '就是今天' : '還有 ' + next.left + ' 天');
        } else {
          if (nextName) nextName.textContent = '全部考完 ✓';
          if (nextWhen) nextWhen.textContent = '';
        }
      }
    }

    function fmtDate(d) {
      return (d.getMonth() + 1) + '/' + d.getDate();
    }

    tick();
    /* 每秒更新；分頁在背景時瀏覽器會自動減慢，不影響正確性 */
    setInterval(tick, 1000);
  }

  /* ── 啟動 ─────────────────────────────────────────────────────────────── */
  function init() {
    if (PAGE === 'hub') {
      const cfg = (D && D.study) || { title: '溫習' };
      renderHeader(cfg, 'index.html', '← 回到主頁');
      renderCountdown();
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
