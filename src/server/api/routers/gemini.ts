import {
  GoogleGenAI, Type
} from "@google/genai";
import type {
  Part
} from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCtR__UlBpYtNKt0h5TSiKFu6v_1l-MCjU"
});

const prompt_text = `
You will be provided with a PDF or HTML document. Your goal is to generate a quiz based on the contents of the document, with 4 multiple choice answers for each question. Below are some examples of the expected output:

{
"items": [
{
"questionToAsk": "What is 2+2?",
"answers": [
"1",
"3",
"4",
"9"
],
"correctAnswer": "4"
},
{
"questionToAsk": "What is 12x12?",
"answers": [
"96",
"144",
"34",
"2"
],
"correctAnswer": "144"
}
]
}
`;

const structuredOutputConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionToAsk: {
                type: Type.STRING,
              },
              answers: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
              correctAnswer: {
                type: Type.STRING
              }
            },
            propertyOrdering: ["questionToAsk", "answers", "correctAnswer"],
          },
          },
      };

export const aiService = {
  generateQuizFromPdf: async (b64pdf: string) => {
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
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [pdf, prompt] }],
      config: structuredOutputConfig
    });

    return {
      greeting: response
    };
  },
  generateQuizFromHtml: async (website: string) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt_text + "\nBegin HTML document:\n" + website,
      config: structuredOutputConfig
    });

    return {
      greeting: response
    };
  }
}