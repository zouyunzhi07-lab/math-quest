import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './GameHistory.css';

interface GameHistoryProps {
  userId: string;
}

interface HistoryItem {
  id: string;
  character: string;
  current_major_level: number;
  current_minor_level: number;
  total_points: number;
  questions_answered: number;
  correct_answers: number;
  character_stage: number;
  last_played_at: string;
}

export default function GameHistory({ userId }: GameHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_played_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCharacterIcon = (character: string) => {
    return character === 'nana' ? '👧' : '👦';
  };

  const getStageName = (stage: number) => {
    if (stage <= 3) return 'Little Student';
    if (stage <= 6) return 'Smart Student';
    return 'Little Doctor';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="history-loading">
        <div className="loading-spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="game-history">
      <h3>📊 Recent Game History</h3>
      
      {history.length === 0 ? (
        <div className="history-empty">
          <p>No game history yet. Start playing to track your progress!</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div 
              key={item.id} 
              className={`history-card ${expandedId === item.id ? 'expanded' : ''}`}
            >
              <div 
                className="history-header"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="history-character">
                  <span className="character-icon">{getCharacterIcon(item.character)}</span>
                  <div className="character-info">
                    <span className="character-name">
                      {item.character === 'nana' ? 'Nana' : 'Jimi'}
                    </span>
                    <span className="character-stage">{getStageName(item.character_stage)}</span>
                  </div>
                </div>
                <div className="history-level">
                  <span className="level-badge">
                    Level {item.current_major_level}.{item.current_minor_level}
                  </span>
                </div>
                <div className="history-stats">
                  <span className="points">⭐ {item.total_points}</span>
                  <span className="accuracy">
                    🎯 {item.questions_answered > 0 
                      ? Math.round((item.correct_answers / item.questions_answered) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="history-date">
                  {formatDate(item.last_played_at)}
                </div>
                <span className="expand-icon">{expandedId === item.id ? '▲' : '▼'}</span>
              </div>
              
              {expandedId === item.id && (
                <div className="history-details">
                  <div className="detail-row">
                    <span>Questions Answered:</span>
                    <span>{item.questions_answered}</span>
                  </div>
                  <div className="detail-row correct">
                    <span>Correct Answers:</span>
                    <span>{item.correct_answers}</span>
                  </div>
                  <div className="detail-row wrong">
                    <span>Wrong Answers:</span>
                    <span>{item.questions_answered - item.correct_answers}</span>
                  </div>
                  <div className="detail-row">
                    <span>Character Stage:</span>
                    <span>{item.character_stage}/10</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
