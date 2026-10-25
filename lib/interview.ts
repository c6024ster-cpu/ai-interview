export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;
export const DEFAULT_QUESTIONS = 5;

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export type Evaluation = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  perQuestion: { question: string; feedback: string; betterAnswer: string; score: number }[];
};

export type InterviewRequest = {
  jobTitle: string;
  totalQuestions: number;
  messages: ChatMessage[];
};

export type InterviewResponse =
  | { done: false; reply: string; questionNumber: number }
  | { done: true; evaluation: Evaluation };
