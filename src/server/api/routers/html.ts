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

      return processedSite.greeting.text;
    }),
});
