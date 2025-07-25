// src/components/TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';
import useIsMobile from '@/hooks/use-mobile';

function normalizeInterval(interval) {
  if (!interval) return 'D';
  const map = {
    '1min': '1', '01min': '1', '1m': '1',
    '5min': '5', '05min': '5', '5m': '5',
    '15min': '15', '15m': '15',
    '30min': '30', '30m': '30',
    '60min': '60', '60m': '60',
    '120min': '120', '120m': '120',
    '180min': '180', '180m': '180',
    '240min': '240', '240m': '240',
    '1day': 'D', '1d': 'D', 'D': 'D',
    '1week': 'W', '1w': 'W', 'W': 'W',
    '1month': 'M', '1mo': 'M', 'M': 'M',
  };
  const norm = interval.toLowerCase().replace(/\s/g, '');
  return map[norm] || interval;
}

function TradingViewWidget({ symbol, theme = "dark", locale = "en", artifact }) {
  const container = useRef();
  const isMobile = useIsMobile ? useIsMobile() : (typeof window !== 'undefined' && window.innerWidth <= 640);
  console.log("artifact", artifact);
  // Lấy thông tin từ artifact nếu có
  const chartSymbol = artifact?.exchange_symbol || symbol || "NASDAQ:AAPL";
  const chartInterval = normalizeInterval(artifact?.interval) || "D";
  const chartStudies = Array.isArray(artifact?.studies) ? artifact.studies : [];
  const chartTheme = artifact?.theme || theme;
  const chartLocale = artifact?.locale || locale;

  useEffect(() => {
    // Xóa widget cũ nếu có
    container.current.innerHTML = "";

    const config = {
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: chartInterval,
      locale: chartLocale,
      save_image: true,
      style: "1",
      symbol: chartSymbol,
      theme: chartTheme,
      timezone: "Asia/Ho_Chi_Minh",
      backgroundColor: "#0F0F0F",
      gridColor: "rgba(242, 242, 242, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: chartStudies,
      autosize: true
    };
    // Log config để debug
    console.log("[TradingViewWidget] config:", config);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.current.appendChild(script);
  }, [chartSymbol, chartTheme, chartLocale, chartInterval, JSON.stringify(chartStudies)]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: isMobile ? '300px' : '650px', width: '100%' }}
    >
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);