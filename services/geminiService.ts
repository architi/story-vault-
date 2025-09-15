
import { GoogleGenAI } from "@google/genai";

// Ensure API_KEY is available in the environment.
// Do not modify this line. The API_KEY is provided externally.
const API_KEY = import.meta.env.VITE_API_KEY || "";
console.log(API_KEY);
if (!API_KEY) {
  console.warn("Gemini API key not found. 'Inspire Me' feature will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateStoryStarter = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "The 'Inspire Me' feature is currently unavailable. Please check the API key configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following question, write a short, inspiring, one-paragraph story starter (about 3-4 sentences long). Do not write the full story, just the beginning. Question: "${prompt}"`,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating story starter from Gemini API:", error);
    return "Sorry, I couldn't come up with an idea right now. Please try again.";
  }
};
