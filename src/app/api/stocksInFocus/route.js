import { systemPrompt } from "./systemPrompt";
import { userQuery } from "./userQuery";
import { NextResponse } from "next/server";

// --- Response Schema ---
// This formally defines the JSON structure we expect from the API.
// I have changed all `type: "NUMBER"` to `type: "STRING"` to prevent
// validation errors from the API, as the AI often returns numbers as strings.
const responseSchema = {
  type: "OBJECT",
  properties: {
    reportDate: { type: "STRING" },
    stocksInFocus: {
      type: "OBJECT",
      properties: {
        positive: { type: "ARRAY", items: { type: "STRING" } },
        caution: { type: "ARRAY", items: { type: "STRING" } },
      },
    }
  },
};

export async function GET() {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key missing on server" },
        { status: 500 }
      );
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: [{ google_search: {} }],
      generationConfig: {
        responseSchema: responseSchema,
      },
    };

    let response;
    let retries = 0;
    const maxRetries = 2; // Increased max retries
    let lastError = null;

    while (retries <= maxRetries) {
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          break; // Success
        }

        // Specific check for 429 (Too Many Requests) or 5xx server errors
        if (response.status === 429 || response.status >= 500) {
          retries++;
          if (retries > maxRetries) {
            lastError = new Error(
              `API Error: ${response.status} ${response.statusText}. Max retries reached.`
            );
            break;
          }
          // Exponential backoff
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000; // 2s, 4s, 8s + jitter
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Other client-side error (like 400 Bad Request)
          lastError = new Error(
            `API Error: ${response.status} ${response.statusText}`
          );
          break; // Don't retry on non-retriable errors
        }
      } catch (fetchError) {
        // Handle network errors
        retries++;
        lastError = fetchError;
        if (retries > maxRetries) {
          break;
        }
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If response is still not 'ok' after retries, throw the last error
    if (!response || !response.ok) {
      console.error(
        "Failed to fetch from API after retries:",
        lastError
          ? lastError.message
          : response
          ? `${response.status} ${response.statusText}`
          : "Unknown error"
      );
      return NextResponse.json(
        {
          error: `Failed to fetch API: ${
            lastError
              ? lastError.message
              : response
              ? `${response.status} ${response.statusText}`
              : "Unknown error"
          }`,
        },
        { status: response ? response.status : 500 }
      );
    }

    const result = await response.json();

    // --- Response Validation & Parsing ---
    // The model might still return a markdown block. This tries to clean it.
    const candidate = result.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      console.error("Invalid API response structure:", result);
      return NextResponse.json(
        { error: "Invalid API response structure" },
        { status: 500 }
      );
    }

    let jsonText = candidate.content.parts[0].text;

    // Clean up potential markdown code blocks
    if (jsonText.startsWith("```json\n")) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }

    // Try to parse the cleaned text
    try {
      const jsonData = JSON.parse(jsonText);
      // Return the valid JSON data
      return NextResponse.json(jsonData, { status: 200 });
    } catch (parseError) {
      console.error("Failed to parse JSON response from AI:", parseError);
      console.error("Raw AI response:", jsonText); // Log the problematic text
      return NextResponse.json(
        {
          error: "Failed to parse JSON response from AI.",
          rawResponse: jsonText,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Market Route Error:", error);
    return NextResponse.json(
      { error: `Failed to fetch market report: ${error.message}` },
      { status: 500 }
    );
  }
}
