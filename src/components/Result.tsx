import { Character } from '../types';
import './Result.css';

interface Answer { questionId: string; correct: boolean; }

interface Props {
  answers: Answer[];
  question: any;
  onContinue: () => void;
  character: Character;
}

function Result({ answers, question, onContinue, character }: Props) {
  // Calculate from all answers
  const correctCount = answers.filter(a => a.correct).length;
  const totalCount = answers.length;
  const percentage = Math.round((correctCount / totalCount) * 100);
  const passed = correctCount >= 3; // 60% pass rate

  const characterIcon = character === 'nana' ? '👧' : '👦';
  
  const getResultMessage = () => {
    if (percentage === 100) return { icon: '🏆', title: 'Perfect!', subtitle: 'You got every question right!' };
    if (percentage >= 80) return { icon: '🌟', title: 'Excellent!', subtitle: 'Almost perfect!' };
    if (percentage >= 60) return { icon: '👏', title: 'Good Job!', subtitle: 'You passed!' };
    if (percentage >= 40) return { icon: '💪', title: 'Keep Trying!', subtitle: 'Practice makes perfect!' };
    return { icon: '📚', title: 'Study More!', subtitle: 'Review the vocabulary and try again!' };
  };

  const result = getResultMessage();

  return (
    <div className="result fade-in">
      <div className="result-card">
        <div className="result-header">
          <span className="character">{characterIcon}</span>
          <h2>Level Complete!</h2>
        </div>

        <div className="result-icon">{result.icon}</div>
        <h3 className="result-title">{result.title}</h3>
        <p className="result-subtitle">{result.subtitle}</p>

        <div className="score-section">
          <div className="score-circle" style={{ 
            background: passed 
              ? 'conic-gradient(var(--success) 0% ' + percentage + '%, var(--bg-card) ' + percentage + '% 100%)'
              : 'conic-gradient(var(--error) 0% ' + percentage + '%, var(--bg-card) ' + percentage + '% 100%)'
          }}>
            <div className="score-inner">
              <span className="score-number">{percentage}%</span>
              <span className="score-label">{correctCount}/{totalCount}</span>
            </div>
          </div>
        </div>

        <div className="answer-summary">
          {answers.map((answer, idx) => (
            <span 
              key={idx} 
              className={`answer-dot ${answer.correct ? 'correct' : 'wrong'}`}
            >
              {idx + 1}
            </span>
          ))}
        </div>

        <div className={`status-badge ${passed ? 'passed' : 'failed'}`}>
          {passed ? '✓ Level Passed!' : '✗ Try Again'}
        </div>

        <button className="continue-btn" onClick={onContinue}>
          {passed ? 'Continue →' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}

export default Result;
