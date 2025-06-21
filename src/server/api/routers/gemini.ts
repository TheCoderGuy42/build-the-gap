import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCtR__UlBpYtNKt0h5TSiKFu6v_1l-MCjU" });

export const postRouter = createTRPCRouter({
  gemini: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        I will provide you with a base64 encoded string representing a PDF document. Your task is to:

1. Decode the base64 string into its PDF format.
2. Extract the text content from the PDF document.
3. Analyze the content to generate a quiz based on the material found in the document.
4. For each question, provide 4 multiple choice answers. The answers should be plausible and relevant to the material.
5. Return the quiz in valid JSON format with the following structure:

{
  "quiz": [
    {
      "question": "<Question Text>",
      "choices": [
        "<Answer 1>",
        "<Answer 2>",
        "<Answer 3>",
        "<Answer 4>"
      ],
      "correct_answer": "<The correct answer>"
    },
    ...
  ]
}

Please ensure that the quiz questions are directly related to the content of the PDF and that the correct answer is one of the choices provided.
The base64 string to decode and analyze is:

${input}
        `,
      });
      return {
        greeting: `${response.text}`,
      };
    })
});
