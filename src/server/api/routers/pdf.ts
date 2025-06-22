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
          message: "Unexpected AI response format",
          code: "PARSE_ERROR",
        });
      }

      console.log("Questions data:", questionsData);

      if (
        !questionsData ||
        !Array.isArray(questionsData) ||
        questionsData.length === 0
      ) {
        throw new TRPCError({
          message: "No valid questions returned by the AI",
          code: "PARSE_ERROR",
        });
      }

      // Create Quiz with nested Questions
      const newQuiz = await ctx.db.quiz.create({
        data: {
          title: `Quiz from PDF - ${new Date().toISOString()}`,
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
