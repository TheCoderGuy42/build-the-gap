import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { aiService } from "./gemini";
import * as cheerio from "cheerio";

export const htmlRouter = createTRPCRouter({
  add: publicProcedure
    .input(z.string()) // expecting a URL string
    .mutation(async ({ input }) => {
      const response = await fetch(input);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text(); // get HTML string
      const $ = cheerio.load(html); // load HTML with Cheerio

      const pageText = $("body").text(); // get visible text from the body

      if (!pageText.trim()) {
        throw new Error("No text content found on the page.");
      }

      const processedSite = await aiService.generateQuizFromHtml(pageText);

      const aiResponse = processedSite.greeting;
      console.log("HTML Full response:", JSON.stringify(aiResponse, null, 2));

      // The Gemini API with structured output returns data directly, not as text
      let quizData;
      if (aiResponse.text) {
        // If it's text, parse it
        quizData = JSON.parse(aiResponse.text);
      } else if (
        aiResponse.candidates &&
        aiResponse.candidates[0]?.content?.parts?.[0]?.text
      ) {
        // Alternative response structure
        quizData = JSON.parse(aiResponse.candidates[0].content.parts[0].text);
      } else {
        console.error("Unexpected HTML response structure:", aiResponse);
        throw new Error("Unexpected AI response format for HTML");
      }

      if (!quizData) {
        throw new Error("No quiz data returned by the AI for HTML");
      }

      console.log("HTML Quiz data:", quizData);

      // If the response is already an array (due to structured output), use it directly
      return Array.isArray(quizData) ? quizData : quizData.items;
    }),
});
