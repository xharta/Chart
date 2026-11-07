(function () {
  'use strict';
  var SYMBOLS = [
    ['Nasdaq', 'OANDA:NAS100USD'],
    ['Dow Jones', 'OANDA:US30USD'],
    ['XAUUSD', 'OANDA:XAUUSD'],
    ['EURUSD', 'OANDA:EURUSD'],
    ['USDJPY', 'OANDA:USDJPY'],
    ['AUDUSD', 'OANDA:AUDUSD'],
    ['NZDUSD', 'OANDA:NZDUSD'],
    ['GBPUSD', 'OANDA:GBPUSD'],
    ['USDCAD', 'OANDA:USDCAD']
  ];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var theme = get('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var current = SYMBOLS.some(function (s) { return s[1] === get('sym'); })
    ? get('sym') : SYMBOLS[0][1];
  var panes = {}; // symbol -> container; each symbol keeps its own chart alive

  var tabs = document.getElementById('tabs');
  var chart = document.getElementById('chart');
  var themeBtn = document.getElementById('theme');
  var fsBtn = document.getElementById('fs');
  var exitBtn = document.getElementById('exit');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    themeMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }

  function renderTabs() {
    tabs.textContent = '';
    SYMBOLS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s[0];
      if (s[1] === current) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () {
        current = s[1];
        set('sym', current);
        renderTabs();
        showSymbol();
      });
      tabs.appendChild(b);
    });
    var active = tabs.querySelector('[aria-current="true"]');
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function createPane(sym) {
    var wrap = document.createElement('div');
    wrap.className = 'pane tradingview-widget-container';
    var inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrap.appendChild(inner);

    var s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    s.async = true;
    s.textContent = JSON.stringify({
      autosize: true,
      symbol: sym,
      interval: '1',
      timezone: 'Asia/Tehran',
      theme: theme,
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      overrides: { 'mainSeriesProperties.showCountdown': true },
      backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
      support_host: 'https://www.tradingview.com'
    });
    wrap.appendChild(s);
    chart.appendChild(wrap);
    panes[sym] = wrap;
  }

  // Switching symbol only shows/hides charts: nothing reloads, drawings stay
  function showSymbol() {
    if (!panes[current]) createPane(current);
    Object.keys(panes).forEach(function (k) {
      panes[k].classList.toggle('on', k === current);
    });
  }

  function resetPanes() {
    Object.keys(panes).forEach(function (k) { chart.removeChild(panes[k]); });
    panes = {};
    showSymbol();
  }

  // Theme change must rebuild the charts (drawings are lost)
  themeBtn.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    set('theme', theme);
    applyTheme();
    resetPanes();
  });

  // Full screen: only CSS/resizing, charts are NOT reloaded
  function setFs(on) {
    document.body.classList.toggle('fs', on);
    try {
      var el = document.documentElement;
      if (on && el.requestFullscreen) {
        var p = el.requestFullscreen();
        if (p && p.catch) p.catch(function () {});
      } else if (!on && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (e) {}
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 150);
  }

  fsBtn.addEventListener('click', function () { setFs(true); });
  exitBtn.addEventListener('click', function () { setFs(false); });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) document.body.classList.remove('fs');
  });

  // apple-touch-icon (iOS needs PNG): black background + white flying saucer, generated locally
  try {
    var c = document.createElement('canvas');
    c.width = c.height = 180;
    var ctx = c.getContext('2d');
    ctx.scale(180 / 512, 180 / 512);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(256, 290, 120, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(196, 266);
    ctx.bezierCurveTo(196, 206, 226, 180, 256, 180);
    ctx.bezierCurveTo(286, 180, 316, 206, 316, 266);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fillStyle = '#000';
    [[196, 292], [256, 300], [316, 292]].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 9, 0, Math.PI * 2);
      ctx.fill();
    });
    var l = document.createElement('link');
    l.rel = 'apple-touch-icon';
    l.href = c.toDataURL('image/png');
    document.head.appendChild(l);
  } catch (e) {}

  applyTheme();
  renderTabs();
  showSymbol();

  if ('serviceWorker' in navigator) {
    addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
