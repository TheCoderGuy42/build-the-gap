"use client";

//import { signOut } from "better-auth/api";
import { useState } from "react";
import { useSession } from "~/lib/auth-client";
import { signIn, signOut } from "~/lib/auth-client";
import { api } from "~/trpc/react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Upload,
  Link,
  BookOpen,
  Trash2,
  Play,
  ArrowLeft,
  Check,
  X,
  User,
  LogOut,
  LogIn,
  FileText,
  Globe,
} from "lucide-react";

type Quiz = {
  id: number;
  title: string;
  userId: string;
  questions: {
    id: number;
    questionToAsk: string;
    answers: string[];
    correctAnswer: string;
    quizId: number;
  }[];
};

type QuizState = {
  currentQuestionIndex: number;
  answers: Record<number, string>;
  showResults: boolean;
  score: number;
};

export function HomePage() {
  const session = useSession();
  const [currentView, setCurrentView] = useState<"home" | "quiz">("home");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    showResults: false,
    score: 0,
  });

  // API hooks
  const { data: quizzes = [], refetch: refetchQuizzes } =
    api.quiz.getAll.useQuery();

  const { mutateAsync: getPresignedUrlAsync } =
    api.s3.getPresignedUrl.useMutation();

  const { mutateAsync: addPdfAsync } = api.pdf.add.useMutation({
    onSuccess: () => {
      refetchQuizzes();
    },
  });

  const { mutateAsync: addHtmlAsync } = api.html.add.useMutation({
    onSuccess: () => {
      refetchQuizzes();
    },
  });

  const { mutateAsync: deleteQuizAsync } = api.quiz.delete.useMutation({
    onSuccess: () => {
      refetchQuizzes();
      toast.success("Quiz deleted successfully!");
    },
  });

  const { mutateAsync: checkAnswerAsync } = api.quiz.checkAnswer.useMutation();

  // Handlers
  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files![0];
    if (!file) {
      toast("No file selected!");
      return;
    }

    const processingPromise = (async () => {
      const { signedUrl, key } = await getPresignedUrlAsync({
        filename: file.name,
        contentType: file.type,
      });
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await addPdfAsync({ s3Key: key });
    })();

    toast.promise(processingPromise, {
      loading: "Processing PDF...",
      success: "PDF processed! Quiz created.",
      error: (err) => `PDF processing failed: ${err.message}`,
    });
  };

  const handleHtml = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const url = e.currentTarget.value;
    if (e.key !== "Enter") return;

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    e.currentTarget.value = "";

    toast.promise(addHtmlAsync(url), {
      loading: "Processing URL...",
      success: "URL processed! Quiz created.",
      error: (err) => `URL processing failed: ${err.message}`,
    });
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      showResults: false,
      score: 0,
    });
    setCurrentView("quiz");
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion =
      selectedQuiz?.questions[quizState.currentQuestionIndex];
    if (!currentQuestion) return;

    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answer,
      },
    }));
  };

  const goToNextQuestion = () => {
    if (!selectedQuiz) return;

    if (quizState.currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!selectedQuiz) return;

    let score = 0;
    for (const question of selectedQuiz.questions) {
      const userAnswer = quizState.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        score++;
      }
    }

    setQuizState((prev) => ({
      ...prev,
      showResults: true,
      score,
    }));
  };

  const restartQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      showResults: false,
      score: 0,
    });
  };

  const backToHome = () => {
    setCurrentView("home");
    setSelectedQuiz(null);
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      showResults: false,
      score: 0,
    });
  };

  const isSignedIn = !!session.data?.user;

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <BookOpen className="text-primary mx-auto mb-4 h-12 w-12" />
            <CardTitle className="text-2xl">Welcome to QuizRizz</CardTitle>
            <CardDescription>
              Sign in to create quizzes from PDFs and websites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => signIn.social({ provider: "google" })}
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "quiz" && selectedQuiz) {
    const currentQuestion =
      selectedQuiz.questions[quizState.currentQuestionIndex];

    if (!currentQuestion) {
      // If no current question, go back to home
      setCurrentView("home");
      return null;
    }

    const progress =
      ((quizState.currentQuestionIndex + 1) / selectedQuiz.questions.length) *
      100;

    if (quizState.showResults) {
      const percentage = Math.round(
        (quizState.score / selectedQuiz.questions.length) * 100,
      );

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <Button variant="outline" onClick={backToHome}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>

            <Card>
              <CardHeader className="text-center">
                <div className="mb-4">
                  {percentage >= 70 ? (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                <CardDescription>
                  You scored {quizState.score} out of{" "}
                  {selectedQuiz.questions.length} questions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold">{percentage}%</div>
                  <Badge
                    variant={
                      percentage >= 70
                        ? "success"
                        : percentage >= 50
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {percentage >= 70
                      ? "Great Job!"
                      : percentage >= 50
                        ? "Good Effort!"
                        : "Keep Practicing!"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {selectedQuiz.questions.map((question, index) => {
                    const userAnswer = quizState.answers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <div
                        key={question.id}
                        className="rounded-lg border p-4 text-left"
                      >
                        <div className="mb-2 font-medium">
                          {index + 1}. {question.questionToAsk}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div
                            className={`${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            Your answer: {userAnswer || "Not answered"}
                          </div>
                          {!isCorrect && (
                            <div className="text-green-600 dark:text-green-400">
                              Correct answer: {question.correctAnswer}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={restartQuiz}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button onClick={backToHome} className="flex-1">
                  Back to Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={backToHome}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Badge variant="outline">
              Question {quizState.currentQuestionIndex + 1} of{" "}
              {selectedQuiz.questions.length}
            </Badge>
          </div>

          <div className="mb-6">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestion.questionToAsk}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.answers.map((answer, index) => (
                  <Button
                    key={index}
                    variant={
                      quizState.answers[currentQuestion.id] === answer
                        ? "default"
                        : "outline"
                    }
                    className="h-auto w-full justify-start p-4 text-left"
                    onClick={() => handleAnswerSelect(answer)}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-current">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{answer}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={goToNextQuestion}
                disabled={!quizState.answers[currentQuestion.id]}
                className="w-full"
              >
                {quizState.currentQuestionIndex <
                selectedQuiz.questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold">QuizRizz</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{session.data?.user.name}</span>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-6">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Create New Quiz
            </CardTitle>
            <CardDescription>
              Upload a PDF or enter a website URL to generate a quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Upload PDF
                </label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdf}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com (press Enter)"
                  onKeyDown={handleHtml}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Quizzes</h2>
            <Badge variant="outline">
              {quizzes.length} {quizzes.length === 1 ? "Quiz" : "Quizzes"}
            </Badge>
          </div>

          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">No quizzes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a PDF or enter a website URL to create your first quiz
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">
                      {quiz.title}
                    </CardTitle>
                    <CardDescription>
                      {quiz.questions.length}{" "}
                      {quiz.questions.length === 1 ? "Question" : "Questions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant="secondary">
                        {quiz.title.includes("PDF") ? "PDF" : "Website"}
                      </Badge>
                      <Badge variant="outline">
                        {new Date().toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button onClick={() => startQuiz(quiz)} className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteQuizAsync({ id: quiz.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
