import { GoogleGenAI, Type } from "@google/genai";
import { ZplAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize outside to avoid re-creation if possible, or inside if key changes dynamically
const ai = new GoogleGenAI({ apiKey });

export const analyzeZplContent = async (zplCode: string): Promise<ZplAnalysis | undefined> => {
  if (!apiKey) {
    console.warn("API_KEY not found. Skipping AI analysis.");
    return undefined;
  }

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Você é um especialista em logística e código ZPL (Zebra Programming Language).
      Analise o código ZPL abaixo e extraia as informações de envio.
      Se o código for muito complexo ou ilegível, faça o seu melhor para inferir.
      Retorne APENAS o JSON.
      
      Código ZPL:
      ${zplCode.substring(0, 5000)} 
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipientName: { type: Type.STRING, description: "Nome do destinatário" },
            trackingNumber: { type: Type.STRING, description: "Código de rastreio ou pedido" },
            carrier: { type: Type.STRING, description: "Transportadora (ex: Correios, Fedex, Loggi)" },
            destination: { type: Type.STRING, description: "Cidade e Estado de destino (ex: São Paulo, SP)" }
          },
          required: ["recipientName", "trackingNumber", "carrier", "destination"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return undefined;

    return JSON.parse(jsonText) as ZplAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return undefined;
  }
};