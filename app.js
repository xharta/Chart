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
        loadChart();
      });
      tabs.appendChild(b);
    });
    var active = tabs.querySelector('[aria-current="true"]');
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function loadChart() {
    chart.textContent = '';
    var wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    var inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrap.appendChild(inner);

    var s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    s.async = true;
    s.textContent = JSON.stringify({
      autosize: true,
      symbol: current,
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
      backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
      support_host: 'https://www.tradingview.com'
    });
    wrap.appendChild(s);
    chart.appendChild(wrap);
  }

  themeBtn.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    set('theme', theme);
    applyTheme();
    loadChart();
  });

  // Full screen: only CSS/resizing, the chart is NOT reloaded, so drawings stay
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

  // apple-touch-icon (iOS needs PNG): black background + 3 white candles, generated locally
  try {
    var c = document.createElement('canvas');
    c.width = c.height = 180;
    var ctx = c.getContext('2d');
    ctx.scale(180 / 512, 180 / 512);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#fff';
    [[170, 200, 330, 235, 300],
     [256, 150, 360, 190, 320],
     [342, 120, 300, 150, 250]].forEach(function (k) {
      ctx.fillRect(k[0] - 5, k[1], 10, k[2] - k[1]);
      ctx.fillRect(k[0] - 22, k[3], 44, k[4] - k[3]);
    });
    var l = document.createElement('link');
    l.rel = 'apple-touch-icon';
    l.href = c.toDataURL('image/png');
    document.head.appendChild(l);
  } catch (e) {}

  applyTheme();
  renderTabs();
  loadChart();

  if ('serviceWorker' in navigator) {
    addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
