// Types
export type Character = 'nana' | 'jimi';
export type QuestionType = 'choice' | 'fill' | 'boolean';
export type GameScreen = 'select' | 'level' | 'quiz' | 'result' | 'reward' | 'admin';

export interface Question {
  id: string;
  majorLevel: number;
  minorLevel: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  vocabulary: string[];
}

export interface UserProgress {
  character: Character | null;
  currentMajorLevel: number;
  currentMinorLevel: number;
  totalPoints: number;
  questionsAnswered: number;
  correctAnswers: number;
  achievements: string[];
  characterStage: number; // 1-3: student, 4-6: smart student, 7-10: doctor
}

export interface GameState {
  screen: GameScreen;
  progress: UserProgress;
  currentQuestion: Question | null;
  questionIndex: number;
  answers: { questionId: string; correct: boolean }[];
  unsureQuestions: string[]; // Question IDs marked as unsure
  showReward: boolean;
}

export interface GameHistory {
  id: string;
  userId: string;
  character: Character;
  currentLevel: number;
  currentMinorLevel: number;
  status: 'in_progress' | 'completed';
  totalPoints: number;
  correctCount: number;
  wrongCount: number;
  unsureCount: number;
  completedAt: string | null;
  createdAt: string;
}
