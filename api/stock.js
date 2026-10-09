// api/stock.js
export default async function handler(req, res) {
  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/005930.KS?range=3mo&interval=1d';
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await response.json();

    const quote = data.chart.result[0].indicators.quote[0];
    const closes = quote.close;
    const volumes = quote.volume;

    const tradingDays = [];
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] !== null && volumes[i] !== null && volumes[i] > 0) {
        tradingDays.push({ price: closes[i], volume: volumes[i] });
      }
    }

    if (tradingDays.length < 20) throw new Error('거래일 데이터 부족');

    const calcVWAP = (days) => {
      const slice = tradingDays.slice(-days);
      const sumPV = slice.reduce((acc, cur) => acc + (cur.price * cur.volume), 0);
      const sumV = slice.reduce((acc, cur) => acc + cur.volume, 0);
      return sumV > 0 ? (sumPV / sumV) : 0;
    };

    const vwap1w = calcVWAP(5);
    const vwap1m = calcVWAP(20);
    const vwap2m = calcVWAP(40);
    const finalBasePrice = Math.round((vwap1w + vwap1m + vwap2m) / 3);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({
      success: true,
      basePrice: finalBasePrice,
      vwap1w: Math.round(vwap1w),
      vwap1m: Math.round(vwap1m),
      vwap2m: Math.round(vwap2m)
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
