import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import CharacterSelect from './components/CharacterSelect';
import LevelSelect from './components/LevelSelect';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Reward from './components/Reward';
import Admin from './components/Admin';
import { questions, getQuestionsForLevel, getReward } from './data';
import type { GameState, Character, GameScreen, UserProgress } from './types';
import { supabase } from './supabase';
import './App.css';

const STORAGE_KEY = 'math-quest-progress';

const initialProgress: UserProgress = {
  character: null,
  currentMajorLevel: 1,
  currentMinorLevel: 1,
  totalPoints: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  achievements: [],
  characterStage: 1,
};

// Loading screen component
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading Math Quest...</p>
    </div>
  );
}

// Auth wrapper component
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

// Main content based on auth state
function MainContent() {
  const { user, profile, signOut } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [appScreen, setAppScreen] = useState<'dashboard' | 'game'>('dashboard');
  const [gameState, setGameState] = useState<GameState>({
    screen: 'select',
    progress: initialProgress,
    currentQuestion: null,
    questionIndex: 0,
    answers: [],
    showReward: false,
  });

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const progress = JSON.parse(saved);
      setGameState(prev => ({
        ...prev,
        progress: { ...prev.progress, ...progress },
      }));
    }
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState.progress));
  }, [gameState.progress]);

  // Save progress to Supabase when user is logged in
  useEffect(() => {
    if (user && gameState.progress.character) {
      saveProgressToSupabase();
    }
  }, [gameState.progress, user]);

  const saveProgressToSupabase = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          character: gameState.progress.character,
          current_major_level: gameState.progress.currentMajorLevel,
          current_minor_level: gameState.progress.currentMinorLevel,
          total_points: gameState.progress.totalPoints,
          questions_answered: gameState.progress.questionsAnswered,
          correct_answers: gameState.progress.correctAnswers,
          character_stage: gameState.progress.characterStage,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) console.error('Error saving progress:', error);
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handlePlayGame = () => {
    setAppScreen('game');
  };

  const handleBackToDashboard = () => {
    setAppScreen('dashboard');
  };

  const selectCharacter = (character: Character) => {
    setGameState(prev => ({
      ...prev,
      screen: 'level',
      progress: { ...prev.progress, character },
    }));
  };

  const startLevel = (major: number, minor: number) => {
    const levelQuestions = getQuestionsForLevel(major, minor);
    if (levelQuestions.length > 0) {
      setGameState(prev => ({
        ...prev,
        screen: 'quiz',
        currentQuestion: levelQuestions[0],
        questionIndex: 0,
        answers: [],
        progress: { 
          ...prev.progress, 
          currentMajorLevel: major, 
          currentMinorLevel: minor 
        },
      }));
    }
  };

  const answerQuestion = useCallback((answer: string) => {
    setGameState(prev => {
      if (!prev.currentQuestion) return prev;
      
      const isCorrect = answer.toLowerCase() === prev.currentQuestion.correctAnswer.toLowerCase();
      const newAnswers = [...prev.answers, { questionId: prev.currentQuestion!.id, correct: isCorrect }];
      const points = isCorrect ? 10 : 0;
      
      return {
        ...prev,
        answers: newAnswers,
        progress: {
          ...prev.progress,
          questionsAnswered: prev.progress.questionsAnswered + 1,
          correctAnswers: prev.progress.correctAnswers + (isCorrect ? 1 : 0),
          totalPoints: prev.progress.totalPoints + points,
        },
      };
    });
  }, []);

  const nextQuestion = () => {
    const { currentMajorLevel, currentMinorLevel } = gameState.progress;
    const levelQuestions = getQuestionsForLevel(currentMajorLevel, currentMinorLevel);
    const nextIndex = gameState.questionIndex + 1;
    
    if (nextIndex < levelQuestions.length) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: levelQuestions[nextIndex],
        questionIndex: nextIndex,
      }));
    } else {
      const correctCount = gameState.answers.filter(a => a.correct).length;
      const passed = correctCount >= 3;
      
      setGameState(prev => ({
        ...prev,
        screen: 'result',
        showReward: passed,
        progress: {
          ...prev.progress,
          characterStage: Math.min(10, Math.floor((prev.progress.correctAnswers / 50) + 1)),
        },
      }));
    }
  };

  const continueFromResult = () => {
    const { currentMinorLevel, currentMajorLevel } = gameState.progress;
    
    if (currentMinorLevel < 10) {
      setGameState(prev => ({ ...prev, screen: 'level' }));
    } else if (currentMajorLevel < 10) {
      setGameState(prev => ({
        ...prev,
        screen: 'level',
        progress: {
          ...prev.progress,
          currentMajorLevel: currentMajorLevel + 1,
          currentMinorLevel: 1,
        },
      }));
    } else {
      setGameState(prev => ({ ...prev, screen: 'level' }));
    }
  };

  const goToAdmin = () => {
    setGameState(prev => ({ ...prev, screen: 'admin' }));
  };

  const backToGame = () => {
    setAppScreen('dashboard');
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState({
      screen: 'select',
      progress: initialProgress,
      currentQuestion: null,
      questionIndex: 0,
      answers: [],
      showReward: false,
    });
  };

  // Not logged in - show auth screens
  if (!user) {
    if (authScreen === 'login') {
      return (
        <Login 
          onSwitchToSignup={() => setAuthScreen('signup')} 
        />
      );
    }
    return (
      <Signup 
        onSwitchToLogin={() => setAuthScreen('login')} 
      />
    );
  }

  // Logged in - show dashboard or game
  if (appScreen === 'dashboard') {
    return (
      <Dashboard 
        onPlayGame={handlePlayGame}
        onLogout={handleLogout}
      />
    );
  }

  // Game screens
  return (
    <div className="app">
      <header className="game-header">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Dashboard
        </button>
        <div className="game-stats">
          <span>⭐ {gameState.progress.totalPoints} pts</span>
          <span>🎯 {gameState.progress.correctAnswers}/{gameState.progress.questionsAnswered}</span>
        </div>
      </header>

      {gameState.screen === 'select' && (
        <CharacterSelect onSelect={selectCharacter} />
      )}
      
      {gameState.screen === 'level' && (
        <LevelSelect
          progress={gameState.progress}
          onSelectLevel={startLevel}
          onAdmin={goToAdmin}
          onReset={resetGame}
        />
      )}
      
      {gameState.screen === 'quiz' && gameState.currentQuestion && (
        <Quiz
          question={gameState.currentQuestion}
          questionIndex={gameState.questionIndex}
          totalQuestions={getQuestionsForLevel(gameState.progress.currentMajorLevel, gameState.progress.currentMinorLevel).length}
          onAnswer={answerQuestion}
          onNext={nextQuestion}
          character={gameState.progress.character!}
          progress={gameState.progress}
        />
      )}
      
      {gameState.screen === 'result' && (
        <Result
          answers={gameState.answers}
          question={gameState.currentQuestion!}
          onContinue={continueFromResult}
          character={gameState.progress.character!}
        />
      )}
      
      {gameState.screen === 'admin' && (
        <Admin onBack={backToGame} />
      )}
      
      {gameState.showReward && gameState.screen === 'result' && (
        <Reward
          level={gameState.progress.currentMajorLevel}
          character={gameState.progress.character!}
          onClose={() => setGameState(prev => ({ ...prev, showReward: false }))}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <MainContent />
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;
