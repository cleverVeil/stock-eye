const currentDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export const userQuery = `Generate a comprehensive market analysis and trading outlook for today, ${currentDate}. Focus on Indian markets (Nifty, Bank Nifty) and key global factors.
Provide ALL of the following data points, using your search tool for the most recent information:
1.  A "marketOutlook" (India and Global).
2.  A list of "globalIndices" (Dow, NASDAQ, FTSE, Nikkei, etc.).
3.  Key "keyIndicators" (India VIX, Nifty Put-Call Ratio, Market Breadth).
4.  A list of recent "fiiDiiFlows" for the last 3-5 days.
5.  A list of "sectoralPerformance" (e.g., Nifty IT, Nifty Bank).
6.  A "sectorOutlook" (positive and caution sectors).
7.  A "stocksInFocus" (positive and caution individual stocks).
8.  A "tradingView" with "niftyLevels" and "bankNiftyLevels".
9.  A list of upcoming/current "ipoListings", including a "companyDetailsUrl" for each.
10. A detailed "inDepthAnalysis".

Return ONLY the JSON object.`;