import {
  z
} from "zod";
import {
  GoogleGenAI, Type
} from "@google/genai";
import type {
  Part
} from "@google/genai";

import {
  createTRPCRouter,
  publicProcedure
} from "~/server/api/trpc";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCtR__UlBpYtNKt0h5TSiKFu6v_1l-MCjU"
});

const prompt_text = `
I will provide you with a base64 encoded string representing a PDF document. Your task is to:

1. Decode the base64 string into its PDF format.
2. Extract the text content from the PDF document.
3. Analyze the content to generate a quiz based on the material found in the document.
4. For each question, provide 4 multiple choice answers. The answers should be plausible and relevant to the material.

Please ensure that the quiz questions are directly related to the content of the PDF and that the correct answer is one of the choices provided.
`;

export const aiService = {
  generateQuiz: async (b64pdf: string) => {
    const pdf: Part = {
      inlineData: {
        mimeType: "application/pdf",
        data: b64pdf
      }
    };

    const prompt: Part = {
      text: prompt_text
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [pdf, prompt] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
              },
              answers: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },
            propertyOrdering: ["question", "answers"],
          },
          },
      },
    });

    return {
      greeting: response
    };
  }
}