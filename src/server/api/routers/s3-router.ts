import { z } from "zod";
import { env } from "../../../env";
import { uuid } from "zod/v4";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Router = createTRPCRouter({
  getPresignedUrl: publicProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const key = `uploads/${uuid()}-${input.filename.replace(/\s+/g, "-")}`;

      const signedUrl = await (async () => {
        const s3Client = new S3Client({
          region: env.AWS_S3_REGION,
          credentials: {
            accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
          },
        });

        const command = new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Key: key,
          ContentType: input.contentType,
        });

        return await getSignedUrl(s3Client, command, {
          expiresIn: 60 * 5,
        });
      });

      return {
        signedUrl,
        key,
      };
    }),
});
