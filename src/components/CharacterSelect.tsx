import { Character } from '../types';
import './CharacterSelect.css';

interface Props {
  onSelect: (character: Character) => void;
}

function CharacterSelect({ onSelect }: Props) {
  return (
    <div className="character-select fade-in">
      <div className="title-section">
        <h1 className="game-title">Math Quest</h1>
        <p className="subtitle">Learn English Math with Fun!</p>
      </div>
      
      <p className="instruction">Choose Your Character</p>
      
      <div className="characters">
        <button className="character-card nana" onClick={() => onSelect('nana')}>
          <div className="character-avatar">
            <span className="avatar-icon">👧</span>
            <div className="avatar-glow"></div>
          </div>
          <h2>Nana</h2>
          <p>A smart and curious girl</p>
        </button>
        
        <button className="character-card jimi" onClick={() => onSelect('jimi')}>
          <div className="character-avatar">
            <span className="avatar-icon">👦</span>
            <div className="avatar-glow"></div>
          </div>
          <h2>Jimi</h2>
          <p>A brave and clever boy</p>
        </button>
      </div>
      
      <div className="decorations">
        <span className="star s1">⭐</span>
        <span className="star s2">✨</span>
        <span className="star s3">🌟</span>
      </div>
    </div>
  );
}

export default CharacterSelect;
