import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client. 
// Note: You need to set GEMINI_API_KEY in your .env file.
const ai = new GoogleGenAI({}); 

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string;
}

/**
 * Generates an optimized YouTube title, description, and tags based on a raw filename.
 */
export async function generateVideoMetadata(filename: string): Promise<VideoMetadata> {
  const prompt = `
You are an expert YouTube SEO specialist. A user is uploading a video with the raw filename: "${filename}".
Generate an optimized, catchy, and engaging YouTube title, a detailed description, and a comma-separated list of relevant tags.
The title should be compelling and click-worthy but not overly clickbait.
The description should be at least 3-4 sentences, explaining what the video is about based on the filename, and include a call to action (like, subscribe).
The tags should be 10-15 highly relevant keywords.

Return the result STRICTLY as a valid JSON object with the following structure, and NO markdown formatting (do not wrap in \`\`\`json):
{
  "title": "Your Generated Title Here",
  "description": "Your generated description here.\\n\\nDon't forget to like and subscribe!",
  "tags": "tag1, tag2, tag3, tag4"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("No response from Gemini");
    }

    // Clean up response if it accidentally includes markdown code blocks
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```/g, '').trim();
    }

    const metadata = JSON.parse(cleanJson) as VideoMetadata;
    return metadata;
  } catch (error) {
    console.error("Error generating metadata with Gemini:", error);
    // Fallback if AI generation fails
    const fallbackTitle = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
    return {
      title: fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1),
      description: "A new video uploaded from Google Drive.",
      tags: "video, upload",
    };
  }
}
