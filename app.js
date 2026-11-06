(function () {
  'use strict';
  var SYMBOLS = [
    ['US100', 'OANDA:NAS100USD'],
    ['US30', 'OANDA:US30USD'],
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
      interval: '15',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_top_toolbar: false,
      hide_side_toolbar: true,
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

  // Solid black apple-touch-icon (iOS needs PNG), generated locally
  try {
    var c = document.createElement('canvas');
    c.width = c.height = 180;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 180, 180);
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
