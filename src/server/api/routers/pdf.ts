import { s3Router } from "./s3-router";

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env.js";
import { TRPCError } from "@trpc/server";
import { aiService } from "./gemini";

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export const pdfRouter = createTRPCRouter({
  add: publicProcedure
    .input(z.object({ s3Key: z.string() }))
    .mutation(async ({ input }) => {
      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: input.s3Key,
      });

      const s3Object = await s3Client.send(command);

      if (!s3Object.Body) {
        return;
      }

      const byteArray = await s3Object.Body.transformToByteArray();
      const fileBuffer = Buffer.from(byteArray).toString("base64");

      const processedPdf = aiService.generateQuiz(fileBuffer);

      return processedPdf;
    }),
});
