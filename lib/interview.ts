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

// BYOK：前端把使用者自己的 OpenAI API 金鑰放在這個 header 送給 /interview
export const API_KEY_HEADER = "x-openai-api-key";
