import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini client if a valid key is provided
const genAI = apiKey && apiKey !== 'YOUR_API_KEY' ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generates content using Google Gemini (gemini-2.0-flash) based on instructions and input data.
 * 
 * @param inputText Contextual data or message from the input node.
 * @param promptText Instructions/prompts to guide the model's generation.
 * @returns Generated response text or a fallback message on failure.
 */
export async function generateAIResponse(
  inputText: string,
  promptText: string
): Promise<string> {
  // Validate configuration before request
  if (!genAI) {
    const errorMsg = 'Gemini API Key is missing or set to the default placeholder. Please configure VITE_GEMINI_API_KEY in your .env file.';
    console.error('[aiService]', errorMsg);
    return `Error: ${errorMsg}`;
  }

  try {
    // Using the requested gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Structure prompt instructions
    const prompt = `Prompt:\n${promptText}\n\nInput:\n${inputText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || 'Error: Empty response received from Gemini.';
  } catch (error: unknown) {
    console.error('[aiService] Complete error object:', error);
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown> & Error;
      console.log('[aiService] Error keys:', Object.keys(err));
      console.log('[aiService] Error Name:', err.name);
      console.log('[aiService] Error Message:', err.message);
      console.log('[aiService] Error Status Code (error.status):', err.status);
      console.log('[aiService] Error Status Text (error.statusText):', err.statusText);
      console.log('[aiService] Error Details:', err.details);
      
      // Check if there is an inner fetch response or payload
      if (err.response && typeof err.response === 'object') {
        const resp = err.response as { clone: () => { json: () => Promise<unknown> } };
        console.log('[aiService] Exact response:', resp);
        if (typeof resp.clone === 'function') {
          try {
            resp.clone().json().then((json: unknown) => {
              console.log('[aiService] JSON response details:', json);
            });
          } catch (jsonErr) {
            console.error('[aiService] Failed parsing response JSON:', jsonErr);
          }
        }
      }
    }
    return 'Fallback: Unable to fetch response from Gemini. Please check the console logs and verify your API key/network connection.';
  }
}

/**
 * Fetches the list of all available models accessible by the current API key.
 * Uses direct fetch REST API since the legacy @google/generative-ai SDK does not expose listModels.
 */
export async function listAvailableModels(): Promise<unknown[]> {
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    console.error('[aiService] Cannot list models: API key is not configured.');
    throw new Error('API key is not configured. Please check your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {
      // Ignore text read error
    }
    console.error('[aiService] Failed to list models:', response.status, response.statusText, errorText);
    throw new Error(`Failed to list models: HTTP ${response.status} ${response.statusText}. Response: ${errorText}`);
  }

  const data = (await response.json()) as { models?: unknown[] };
  return data.models || [];
}

