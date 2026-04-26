import { UserProgress } from '../types';
import './LevelSelect.css';

interface Props {
  progress: UserProgress;
  onSelectLevel: (major: number, minor: number) => void;
  onAdmin: () => void;
  onReset: () => void;
}

function LevelSelect({ progress, onSelectLevel, onAdmin, onReset }: Props) {
  const characterIcon = progress.character === 'nana' ? '👧' : '👦';
  const characterName = progress.character === 'nana' ? 'Nana' : 'Jimi';
  const stageName = progress.characterStage <= 3 ? 'Little Student' 
    : progress.characterStage <= 6 ? 'Smart Student' 
    : 'Little Doctor';
  
  const getCharacterDoctor = () => {
    if (progress.characterStage >= 7) {
      return progress.character === 'nana' ? '👩‍🎓' : '👨‍🎓';
    }
    return characterIcon;
  };

  return (
    <div className="level-select fade-in">
      <div className="header">
        <div className="player-info">
          <div className="player-avatar">{getCharacterDoctor()}</div>
          <div className="player-stats">
            <h3>{characterName}</h3>
            <p className="stage">{stageName}</p>
            <p className="points">⭐ {progress.totalPoints} points</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-admin" onClick={onAdmin}>⚙️ Admin</button>
          <button className="btn-reset" onClick={onReset}>🔄 Reset</button>
        </div>
      </div>

      <div className="level-header">
        <h2>Select Level</h2>
        <p>Major Level {progress.currentMajorLevel} - Minor Level {progress.currentMinorLevel}</p>
      </div>

      <div className="levels-grid">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="level-section">
            <h3 className="level-title">Level {i + 1}</h3>
            <div className="level-buttons">
              {Array.from({ length: 10 }, (_, j) => {
                const isUnlocked = (i + 1) < progress.currentMajorLevel || 
                  ((i + 1) === progress.currentMajorLevel && (j + 1) <= progress.currentMinorLevel);
                const isCompleted = (i + 1) < progress.currentMajorLevel || 
                  ((i + 1) === progress.currentMajorLevel && (j + 1) < progress.currentMinorLevel);
                
                return (
                  <button
                    key={j}
                    className={`level-btn ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => isUnlocked && onSelectLevel(i + 1, j + 1)}
                    disabled={!isUnlocked}
                  >
                    {isCompleted ? '✓' : j + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="vocab-tip">
        <p>💡 Vocabulary Focus: Numbers, Addition, Subtraction, Multiplication, Division</p>
      </div>
    </div>
  );
}

export default LevelSelect;
