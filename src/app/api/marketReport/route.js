import { systemPrompt } from './systemPrompt';
import { userQuery } from './userQuery';
import { NextResponse } from 'next/server';

export async function GET(){
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "API Key missing on server" }, {status: 500});
      }
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ google_search: {} }],
      };

      let response;
      let retries = 0;
      const maxRetries = 1;
      while (retries <= maxRetries) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break; // Success
        }

        if (response.status === 429 || response.status >= 500) {
          // Throttling or server error, wait and retry
          retries++;
          if (retries > maxRetries) {
            throw new Error(`API Error: ${response.status} ${response.statusText}. Max retries reached.`);
          }
          const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Other client-side error (like 400)
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
      }

  
      const result = await response.json();
      return NextResponse.json(result, {status: 200});
    } catch (error) {
      console.error("Market Route Error:", error);
      return NextResponse.json({ error: "Failed to fetch market report" },{ status: 500});
    }
  }
  