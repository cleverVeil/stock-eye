const currentDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});
export const userQuery = `Generate a comprehensive market analysis and trading outlook for today, ${currentDate}. Focus on Indian markets (Nifty, Bank Nifty) and key global factors. Provide:
1.  A "sectorOutlook" (positive and caution sectors).
2.  A "stocksInFocus" (positive and caution individual stocks).
3.  A "globalIndices" snapshot (Dow Jones, NASDAQ, FTSE, Nikkei).
4.  An "inDepthAnalysis".
Return ONLY the JSON object with structured data for niftyLevels, bankNiftyLevels, sectorOutlook, stocksInFocus, and globalIndices.`;
