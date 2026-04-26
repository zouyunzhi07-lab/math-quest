import { useState, useEffect, useRef } from 'react';
import { Question, Character, UserProgress } from '../types';
import './Quiz.css';

// Voice types
type VoiceType = 'male' | 'female' | 'girl';

interface VoiceOption {
  id: VoiceType;
  label: string;
  icon: string;
  voiceName: string;
  pitch: number;
  rate: number;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'male', label: 'Male', icon: '👨', voiceName: 'Microsoft David', pitch: 1, rate: 0.9 },
  { id: 'female', label: 'Female', icon: '👩', voiceName: 'Microsoft Zira', pitch: 1.1, rate: 0.9 },
  { id: 'girl', label: 'Cheerful Girl', icon: '👧', voiceName: 'Microsoft Aria', pitch: 1.3, rate: 1 },
];

const VOICE_STORAGE_KEY = 'math-quest-tts-voice';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onMarkUnsure: () => void;
  onNext: () => void;
  character: Character;
  progress?: UserProgress;
}

function Quiz({ question, questionIndex, totalQuestions, onAnswer, onMarkUnsure, onNext, character }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [markedUnsure, setMarkedUnsure] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>(() => {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    return (saved as VoiceType) || 'female';
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setUserInput('');
    setShowResult(false);
    setMarkedUnsure(false);
    window.speechSynthesis.cancel();
  }, [question]);

  const handleVoiceChange = (voiceId: VoiceType) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
  };

  const handleMarkUnsure = () => {
    setMarkedUnsure(true);
    onMarkUnsure();
  };

  const playTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const voiceConfig = VOICE_OPTIONS.find(v => v.id === selectedVoice) || VOICE_OPTIONS[1];
    const text = `${question.question}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = voiceConfig.rate;
    utterance.pitch = voiceConfig.pitch;
    
    // Try to find the preferred Microsoft voice
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(v => v.name.includes(voiceConfig.voiceName));
    
    // Fallback to any Microsoft English voice
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en'));
    }
    
    // Fallback to any available English voice
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith('en'));
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleChoiceSelect = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
    setShowResult(true);
    onAnswer(option);
  };

  const handleFillSubmit = () => {
    if (!userInput.trim() || showResult) return;
    setSelectedAnswer(userInput);
    setShowResult(true);
    onAnswer(userInput);
  };

  const handleBooleanSelect = (value: string) => {
    if (showResult) return;
    setSelectedAnswer(value);
    setShowResult(true);
    onAnswer(value);
  };

  const isCorrect = selectedAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
  const characterIcon = character === 'nana' ? '👧' : '👦';

  const getTypeLabel = () => {
    switch (question.type) {
      case 'choice': return 'Multiple Choice';
      case 'fill': return 'Fill in the Blank';
      case 'boolean': return 'True or False';
    }
  };

  return (
    <div className="quiz fade-in">
      <div className="quiz-header">
        <div className="quiz-info">
          <span className="character-badge">{characterIcon}</span>
          <span className="progress-text">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-section">
          <span className="question-type">{getTypeLabel()}</span>
          <h2 className="question-text">{question.question}</h2>
          <div className="tts-controls">
            <button className={`tts-btn ${isSpeaking ? 'speaking' : ''}`} onClick={playTTS}>
              {isSpeaking ? '🔊 Playing...' : '🔈 Play'}
            </button>
            <button 
              className={`voice-settings-btn ${showVoiceSettings ? 'active' : ''}`} 
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              title="Voice Settings"
            >
              ⚙️ Voice
            </button>
          </div>
          {showVoiceSettings && (
            <div className="voice-settings-panel">
              <div className="voice-settings-header">
                <span>🎙️ Select Voice</span>
                <button className="voice-settings-close" onClick={() => setShowVoiceSettings(false)}>×</button>
              </div>
              <div className="voice-options">
                {VOICE_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    className={`voice-option-btn ${selectedVoice === option.id ? 'selected' : ''}`}
                    onClick={() => {
                      handleVoiceChange(option.id);
                      setShowVoiceSettings(false);
                    }}
                  >
                    <span className="voice-icon">{option.icon}</span>
                    <span className="voice-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="answer-section">
          {question.type === 'choice' && question.options && (
            <div className="choices-grid">
              {question.options.map((option, idx) => {
                let className = 'choice-btn';
                if (showResult) {
                  if (option.toLowerCase() === question.correctAnswer.toLowerCase()) {
                    className += ' correct';
                  } else if (option === selectedAnswer && !isCorrect) {
                    className += ' wrong';
                  }
                } else if (option === selectedAnswer) {
                  className += ' selected';
                }
                return (
                  <button
                    key={idx}
                    className={className}
                    onClick={() => handleChoiceSelect(option)}
                    disabled={showResult}
                  >
                    <span className="choice-letter">{String.fromCharCode(65 + idx)}</span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'fill' && (
            <div className="fill-section">
              <input
                type="text"
                className="fill-input"
                placeholder="Type your answer..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFillSubmit()}
                disabled={showResult}
              />
              {!showResult && (
                <button className="submit-btn" onClick={handleFillSubmit}>
                  Submit
                </button>
              )}
              {showResult && (
                <div className={`result-badge ${isCorrect ? 'correct' : 'wrong'}`}>
                  {isCorrect ? '✓ Correct!' : `✗ Answer: ${question.correctAnswer}`}
                </div>
              )}
            </div>
          )}

          {question.type === 'boolean' && (
            <div className="boolean-buttons">
              <button
                className={`bool-btn true-btn ${showResult ? (question.correctAnswer === 'true' ? 'correct' : selectedAnswer === 'true' ? 'wrong' : '') : selectedAnswer === 'true' ? 'selected' : ''}`}
                onClick={() => handleBooleanSelect('true')}
                disabled={showResult}
              >
                ✓ True
              </button>
              <button
                className={`bool-btn false-btn ${showResult ? (question.correctAnswer === 'false' ? 'correct' : selectedAnswer === 'false' ? 'wrong' : '') : selectedAnswer === 'false' ? 'selected' : ''}`}
                onClick={() => handleBooleanSelect('false')}
                disabled={showResult}
              >
                ✗ False
              </button>
            </div>
          )}
        </div>

        {showResult && (
          <div className={`explanation ${isCorrect ? 'correct' : 'wrong'}`}>
            <p><strong>{isCorrect ? '🎉 Correct!' : '💡 Hint:'}</strong></p>
            <p>{isCorrect ? question.explanation : `The answer is: ${question.correctAnswer}. ${question.explanation}`}</p>
            <div className="vocabulary">
              <strong>📚 Vocabulary:</strong>
              {question.vocabulary.map((word, idx) => (
                <span key={idx} className="vocab-word">{word}</span>
              ))}
            </div>
          </div>
        )}

        {!showResult && !markedUnsure && (
          <button className="unsure-btn" onClick={handleMarkUnsure}>
            🤔 Mark as Unsure
          </button>
        )}

        {markedUnsure && (
          <div className="unsure-badge">🤔 Marked as Unsure</div>
        )}

        {showResult && (
          <button className="next-btn" onClick={onNext}>
            {questionIndex + 1 < totalQuestions ? 'Next Question →' : 'Finish Level →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
