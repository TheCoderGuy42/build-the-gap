import { s3Router } from "./s3-router";

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env.js";
import { TRPCError } from "@trpc/server";
import { aiService } from "./gemini";
import type { GenerateContentResponse } from "@google/genai";

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export const pdfRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({ s3Key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;

      if (!userId) {
        return new TRPCError({
          message: "User needs to be signed in",
          code: "BAD_REQUEST",
        });
      }

      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: input.s3Key,
      });

      const s3Object = await s3Client.send(command);

      if (!s3Object.Body) {
        return new TRPCError({
          message: "s3 object wasn't reterived properly ",
          code: "BAD_REQUEST",
        });
      }

      const byteArray = await s3Object.Body.transformToByteArray();
      const fileBuffer = Buffer.from(byteArray).toString("base64");

      const processedPdf = await aiService.generateQuizFromPdf(fileBuffer);

      const response = processedPdf.greeting;
      console.log("Full response:", JSON.stringify(response, null, 2));

      // The Gemini API with structured output returns data directly, not as text
      let quizData;
      if (response.text) {
        // If it's text, parse it
        quizData = JSON.parse(response.text);
      } else if (
        response.candidates &&
        response.candidates[0]?.content?.parts?.[0]?.text
      ) {
        // Alternative response structure
        quizData = JSON.parse(response.candidates[0].content.parts[0].text);
      } else {
        console.error("Unexpected response structure:", response);
        throw new TRPCError({
          message: "Unexpected AI response format",
          code: "PARSE_ERROR",
        });
      }

      if (!quizData) {
        throw new TRPCError({
          message: "No quiz data returned by the AI",
          code: "PARSE_ERROR",
        });
      }

      console.log("Quiz data:", quizData);

      // If the response is already an array (due to structured output), use it directly
      const quiz = Array.isArray(quizData) ? quizData : quizData.items;

      // const newQuiz = await ctx.db.quiz.create({
      //   data: quiz,
      // });

      return quiz;
    }),
});
