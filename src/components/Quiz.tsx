import { useState, useEffect, useRef } from 'react';
import { Question, Character, UserProgress } from '../types';
import './Quiz.css';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  character: Character;
  progress: UserProgress;
}

function Quiz({ question, questionIndex, totalQuestions, onAnswer, onNext, character, progress }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setUserInput('');
    setShowResult(false);
    window.speechSynthesis.cancel();
  }, [question]);

  const playTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${question.question}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    
    // Try to get Microsoft voices (in browser)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Microsoft') || v.name.includes('Natural') || v.lang.startsWith('en')
    );
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
          <button className={`tts-btn ${isSpeaking ? 'speaking' : ''}`} onClick={playTTS}>
            {isSpeaking ? '🔊 Playing...' : '🔈 Play Question'}
          </button>
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
