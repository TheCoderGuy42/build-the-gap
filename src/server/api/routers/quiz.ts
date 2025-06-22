import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const quizRouter = createTRPCRouter({
  // Get all quizzes for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) {
      throw new TRPCError({
        message: "User needs to be signed in",
        code: "UNAUTHORIZED",
      });
    }

    const quizzes = await ctx.db.quiz.findMany({
      where: {
        userId: userId,
      },
      include: {
        questions: true,
      },
      orderBy: {
        id: "desc", // Show newest first
      },
    });

    return quizzes;
  }),

  // Get a specific quiz by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;

      if (!userId) {
        throw new TRPCError({
          message: "User needs to be signed in",
          code: "UNAUTHORIZED",
        });
      }

      const quiz = await ctx.db.quiz.findFirst({
        where: {
          id: input.id,
          userId: userId, // Make sure user can only access their own quizzes
        },
        include: {
          questions: true,
        },
      });

      if (!quiz) {
        throw new TRPCError({
          message: "Quiz not found",
          code: "NOT_FOUND",
        });
      }

      return quiz;
    }),

  // Delete a quiz
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;

      if (!userId) {
        throw new TRPCError({
          message: "User needs to be signed in",
          code: "UNAUTHORIZED",
        });
      }

      // Verify the quiz belongs to the user
      const quiz = await ctx.db.quiz.findFirst({
        where: {
          id: input.id,
          userId: userId,
        },
      });

      if (!quiz) {
        throw new TRPCError({
          message: "Quiz not found",
          code: "NOT_FOUND",
        });
      }

      // Delete the quiz (questions will be deleted due to cascade)
      await ctx.db.quiz.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  // Check answer for a specific question
  checkAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
        selectedAnswer: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;

      if (!userId) {
        throw new TRPCError({
          message: "User needs to be signed in",
          code: "UNAUTHORIZED",
        });
      }

      // Get the question and verify it belongs to a quiz owned by the user
      const question = await ctx.db.question.findFirst({
        where: {
          id: input.questionId,
          Quiz: {
            userId: userId,
          },
        },
        include: {
          Quiz: true,
        },
      });

      if (!question) {
        throw new TRPCError({
          message: "Question not found",
          code: "NOT_FOUND",
        });
      }

      const isCorrect = question.correctAnswer === input.selectedAnswer;

      return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        selectedAnswer: input.selectedAnswer,
      };
    }),
});
