import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { aiService } from "./gemini";
import * as cheerio from "cheerio";
import { TRPCError } from "@trpc/server";

export const htmlRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.string()) // expecting a URL string
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;

      if (!userId) {
        throw new TRPCError({
          message: "User needs to be signed in",
          code: "BAD_REQUEST",
        });
      }

      const fetchResponse = await fetch(input);

      if (!fetchResponse.ok) {
        throw new TRPCError({
          message: `Failed to fetch URL: ${fetchResponse.statusText}`,
          code: "BAD_REQUEST",
        });
      }

      const html = await fetchResponse.text(); // get HTML string
      const $ = cheerio.load(html); // load HTML with Cheerio

      const pageText = $("body").text(); // get visible text from the body

      if (!pageText.trim()) {
        throw new TRPCError({
          message: "No text content found on the page.",
          code: "BAD_REQUEST",
        });
      }

      const processedSite = await aiService.generateQuizFromHtml(pageText);

      const response = processedSite.greeting;
      console.log("HTML Full response:", JSON.stringify(response, null, 2));

      let questionsData;
      if (response.text) {
        questionsData = JSON.parse(response.text);
      } else if (
        response.candidates &&
        response.candidates[0]?.content?.parts?.[0]?.text
      ) {
        questionsData = JSON.parse(
          response.candidates[0].content.parts[0].text,
        );
      } else {
        throw new TRPCError({
          message: "Unexpected AI response format for HTML",
          code: "PARSE_ERROR",
        });
      }

      console.log("HTML Questions data:", questionsData);

      if (
        !questionsData ||
        !Array.isArray(questionsData) ||
        questionsData.length === 0
      ) {
        throw new TRPCError({
          message: "No valid questions returned by the AI for HTML",
          code: "PARSE_ERROR",
        });
      }

      // Create Quiz with nested Questions
      const newQuiz = await ctx.db.quiz.create({
        data: {
          title: `Quiz from URL: ${input}`,
          userId: userId,
          questions: {
            create: questionsData.map((q: any) => ({
              questionToAsk: q.questionToAsk,
              answers: q.answers,
              correctAnswer: q.correctAnswer,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      return newQuiz;
    }),
});
