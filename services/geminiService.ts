import { GoogleGenAI, Type } from "@google/genai";
import { Section } from "../types";

// Initialize Gemini with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: "AIzaSyANOV9umdYEKoAQwyf3nG5ZlMSvpArCMcM" });

export const generateLandingPageContent = async (topic: string): Promise<Section[]> => {
  const prompt = `
    Generate a structure for a high-converting landing page for: "${topic}".
    Return a JSON array of sections.
    Include the following section types in order: 'hero', 'features', 'testimonials', 'cta', 'footer'.
    For 'hero', include title, subtitle, buttonText.
    For 'features', include a list of 3 items with title, description, and an emoji icon.
    For 'testimonials', include 2 items with name, role, description (as the text).
    For 'cta', include title, text, buttonText.
    For 'footer', include text (copyright).
    Ensure the copy is marketing-focused and persuasive.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['hero', 'features', 'cta', 'testimonials', 'footer'] },
              content: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, nullable: true },
                  subtitle: { type: Type.STRING, nullable: true },
                  text: { type: Type.STRING, nullable: true },
                  buttonText: { type: Type.STRING, nullable: true },
                  items: {
                    type: Type.ARRAY,
                    nullable: true,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, nullable: true },
                        description: { type: Type.STRING, nullable: true },
                        icon: { type: Type.STRING, nullable: true },
                        name: { type: Type.STRING, nullable: true },
                        role: { type: Type.STRING, nullable: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const sections = JSON.parse(response.text) as Section[];
      // Add client-side IDs to ensure keys work and uniqueness
      return sections.map(s => ({ ...s, id: crypto.randomUUID() }));
    }
    return [];
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};