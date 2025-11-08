const currentDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export const userQuery = `Generate a comprehensive market analysis and trading outlook for today, ${currentDate}. Focus on Indian markets (Nifty, Bank Nifty) and key global factors.
Provide ALL of the following data points, using your search tool for the most recent information:
1.  A "stocksInFocus" (positive and caution individual stocks).

Return ONLY the JSON object.`;