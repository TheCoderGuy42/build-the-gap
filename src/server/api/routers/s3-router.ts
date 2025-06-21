import { z } from "zod";
import { env } from "../../../env";
import { v4 as uuidv4 } from "uuid";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export const s3Router = createTRPCRouter({
  getPresignedUrl: publicProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ input }) => {
      const key = `uploads/${uuidv4()}-${input.filename.replace(/\s+/g, "-")}`;

      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: input.contentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 5,
      });

      return {
        signedUrl,
        key,
      };
    }),
});
