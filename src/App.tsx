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
import AdminLogin from './components/AdminLogin';
import OwnerSetup from './components/OwnerSetup';
import { getQuestionsForLevel } from './data';
import type { GameState, Character, UserProgress } from './types';
import { supabase } from './supabase';
import './App.css';

const STORAGE_KEY = 'math-quest-progress';
const OWNER_EMAIL = 'zouyunzhi07@gmail.com';

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
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

// Main content based on auth state
function MainContent() {
  const { user, signOut, profile } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [appScreen, setAppScreen] = useState<'dashboard' | 'game'>('dashboard');
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isSetupRoute, setIsSetupRoute] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    screen: 'select',
    progress: initialProgress,
    currentQuestion: null,
    questionIndex: 0,
    answers: [],
    unsureQuestions: [],
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

  const markQuestionUnsure = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentQuestion) return prev;
      if (prev.unsureQuestions.includes(prev.currentQuestion.id)) return prev;
      
      return {
        ...prev,
        unsureQuestions: [...prev.unsureQuestions, prev.currentQuestion.id],
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
      unsureQuestions: [],
      showReward: false,
    });
  };

  // Check if this is admin route or setup route
  useEffect(() => {
    const path = window.location.pathname;
    setIsAdminRoute(path.startsWith('/admin'));
    setIsSetupRoute(path === '/setup');
  }, []);

  // Setup route
  if (isSetupRoute) {
    return (
      <OwnerSetup onSetupComplete={() => window.location.href = '/admin'} />
    );
  }

  // Admin route - handle admin login
  if (isAdminRoute) {
    if (!user) {
      return (
        <AdminLogin 
          onSwitchToPublic={() => window.location.href = '/'}
        />
      );
    }
    
    // Admin must be super_admin or school_admin
    const isAdmin = profile?.role === 'super_admin' || profile?.role === 'school_admin';
    
    if (!isAdmin) {
      return (
        <div className="admin-access-denied">
          <div className="access-denied-card">
            <h1>Access Denied</h1>
            <p>You don't have permission to access the admin portal.</p>
            <p className="admin-note">Only Super Admins and School Admins can access this area.</p>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <Dashboard 
        onPlayGame={handlePlayGame}
        onLogout={handleLogout}
        isAdminMode={true}
      />
    );
  }

  // Not logged in - show auth screens
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${authScreen === 'login' ? 'active' : ''}`}
            onClick={() => setAuthScreen('login')}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${authScreen === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthScreen('signup')}
          >
            Sign Up
          </button>
          <button 
            className="auth-tab admin-tab"
            onClick={() => window.location.href = '/admin'}
          >
            Admin
          </button>
        </div>
        {authScreen === 'login' ? (
          <Login onSwitchToSignup={() => setAuthScreen('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthScreen('login')} />
        )}
      </div>
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
          onMarkUnsure={markQuestionUnsure}
          onNext={nextQuestion}
          character={gameState.progress.character!}
        />
      )}
      
      {gameState.screen === 'result' && (
        <Result
          answers={gameState.answers}
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
