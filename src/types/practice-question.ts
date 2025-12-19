export type QuestionType =
  | "mcq"
  | "open"
  | "matching"
  | "code"
  | "truefalse"
  | "system-design";

export type DifficultyLevel = "entry" | "junior" | "middle" | "senior";
export type QuestionStatus = "draft" | "published" | "archived";
export type CompanyType = "faang" | "startup" | "enterprise";
export type QuestionInterviewMode =
  | "regular"
  | "practice"
  | "flash"
  | "play"
  | "competitive"
  | "teacher";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  status: QuestionStatus;
  isDemoMode: boolean;
  companyType: CompanyType;

  title: string;
  description: string;
  prompt: string;

  topic: string;
  subtopics: string[];
  tags: string[];
  estimatedTimeMinutes: number;
  aiEvaluationHint?: string;

  companies?: Array<{
    name: string;
    logo: string;
    size?: string[];
    description: string;
  }>;
  positions?: string[];
  primaryTechStack?: string[];

  interviewTypes?: QuestionInterviewMode[];
  seniorityLevels?: Array<"entry" | "junior" | "mid" | "senior">;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: MCQOption[];
  multiChoiceAnswers?: string[];
  allowMultipleAnswers: boolean;
  shuffleOptions: boolean;
}

export interface ReferenceAnswer {
  id: string;
  text: string;
  weight: number;
  keyPoints: string[];
}

export interface OpenQuestion extends BaseQuestion {
  type: "open";
  referenceAnswers: ReferenceAnswer[];
  minWords?: number;
  maxWords?: number;
  evaluationCriteria: {
    completeness: number;
    accuracy: number;
    clarity: number;
    depth: number;
  };
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  explanation?: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  pairs: MatchingPair[];
  shuffleLeft: boolean;
  shuffleRight: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
}

export interface CodeQuestion extends BaseQuestion {
  type: "code";
  language: string;
  starterCode?: string;
  testCases: TestCase[];
  evaluationCriteria: {
    correctness: number;
    efficiency: number;
    codeQuality: number;
    edgeCases: number;
  };
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "truefalse";
  correctAnswer: boolean;
  explanation: string;
  trickinessLevel?: number;
}

export type Question =
  | MCQQuestion
  | OpenQuestion
  | MatchingQuestion
  | CodeQuestion
  | TrueFalseQuestion;

export interface QuestionFilters {
  topic?: string;
  subtopics?: string[];
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  tags?: string[];
  companyName?: string;
  position?: string;
  status?: QuestionStatus;
}

export interface QuestionQueryOptions {
  filters: QuestionFilters;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "difficulty" | "random";
  orderDirection?: "asc" | "desc";
}
