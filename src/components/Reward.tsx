import { Character } from '../types';
import { getReward } from '../data';
import './Reward.css';

interface Props {
  level: number;
  character: Character;
  onClose: () => void;
}

function Reward({ level, character, onClose }: Props) {
  const reward = getReward(level);
  const characterIcon = character === 'nana' ? '👧' : '👦';
  
  const getEvolution = () => {
    if (level >= 7) {
      return { icon: character === 'nana' ? '👩‍🎓' : '👨‍🎓', title: 'Doctor', color: '#FFD700' };
    } else if (level >= 4) {
      return { icon: character === 'nana' ? '👧' : '👦', title: 'Smart Student', color: '#6BCB77' };
    }
    return { icon: characterIcon, title: 'Little Student', color: '#6C63FF' };
  };

  const evolution = getEvolution();

  return (
    <div className="reward-overlay" onClick={onClose}>
      <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reward-content">
          <div className="confetti">
            <span>🎉</span><span>⭐</span><span>🎊</span><span>✨</span><span>🎉</span>
          </div>
          
          <div className="reward-header">
            <h2>{reward.title}</h2>
            <p className="level-info">Level {level} Completed!</p>
          </div>

          <div className="character-evolution" style={{ borderColor: evolution.color }}>
            <span className="evolution-icon" style={{ fontSize: '4rem' }}>{evolution.icon}</span>
            <span className="evolution-badge" style={{ background: evolution.color }}>
              {evolution.title}
            </span>
          </div>

          <div className="reward-message">
            <p>{reward.message}</p>
          </div>

          <div className="encouragement">
            <p>Your hard work is paying off! Keep going!</p>
          </div>

          <button className="collect-btn" onClick={onClose}>
            Collect Reward 🎁
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reward;
