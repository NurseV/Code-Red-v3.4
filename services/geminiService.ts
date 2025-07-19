

import { GoogleGenAI, Type } from "@google/genai";
import { User, Asset } from '../types';

// Ensure you have your API_KEY in an .env file
// In this sandboxed environment, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const systemInstruction = `You are an expert fire department report writer. Your task is to take a list of keywords and generate a clear, concise, and professional incident narrative suitable for an official report. The narrative should be written in the third person, past tense, and follow a logical timeline (Dispatch, Arrival, Actions Taken, Resolution). Do not include any patient information or ePHI. Do not use markdown or any special formatting in your response. Just return the plain text narrative.`;

export const generateIncidentNarrative = async (keywords: string, user: User | null): Promise<string> => {
    if (!API_KEY) {
        return "AI service is not configured. Please add an API key.";
    }

    try {
        const fullPrompt = `Generate an incident narrative based on the following information:
- Keywords: ${keywords}
- Reporting Officer Role: ${user?.role || 'Firefighter'}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating narrative with Gemini:", error);
        return "An error occurred while generating the AI narrative. Please try again or write the narrative manually.";
    }
};


const summarizeSystemInstruction = `You are an expert technical writer for emergency services. Your task is to summarize the provided user manual content into a concise quick-start guide. The output should be plain text with bullet points using hyphens. Focus on the most critical operational steps and safety warnings. Be brief and clear.`;

export const summarizeDocument = async (fileContent: string): Promise<string> => {
    if (!API_KEY) {
        return "AI service is not configured. Please add an API key.";
    }

    try {
        const fullPrompt = `Please summarize the following document content:\n\n---\n${fileContent}\n---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction: summarizeSystemInstruction,
                temperature: 0.3,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing document with Gemini:", error);
        return "An error occurred while generating the AI summary.";
    }
};

const assetDetailsSystemInstruction = `You are a fire department asset manager. Given an asset name, provide its most likely Category, Asset Type, and standard Lifespan in years. The Category must be one of: 'Equipment', 'PPE', 'Kit'. Do not invent new categories.`;

export const suggestAssetDetails = async (assetName: string): Promise<{ category: 'Equipment' | 'PPE' | 'Kit', assetType: string, lifespanYears: number | null }> => {
    if (!API_KEY) {
        return Promise.reject("AI service is not configured.");
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the asset name: "${assetName}"`,
            config: {
                systemInstruction: assetDetailsSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: {
                            type: Type.STRING,
                            description: "The asset category. Must be 'Equipment', 'PPE', or 'Kit'.",
                            enum: ['Equipment', 'PPE', 'Kit']
                        },
                        assetType: {
                            type: Type.STRING,
                            description: "The specific type of the asset (e.g., 'SCBA', 'Turnout Gear', 'Forcible Entry Tool')."
                        },
                        lifespanYears: {
                            type: Type.INTEGER,
                            description: "The typical lifespan of the asset in years. Use null if not applicable.",
                            nullable: true
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { category: 'Equipment' | 'PPE' | 'Kit', assetType: string, lifespanYears: number | null };

    } catch (error) {
        console.error("Error suggesting asset details with Gemini:", error);
        throw new Error("An error occurred while generating AI suggestions.");
    }
};
