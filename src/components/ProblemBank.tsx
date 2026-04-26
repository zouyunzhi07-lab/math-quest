import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import './ProblemBank.css';

interface QuestionBank {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  subject: string;
  is_active: boolean;
  created_at: string;
}

interface Question {
  id: string;
  tenant_id: string;
  question_bank_id: string;
  major_level: number;
  minor_level: number;
  type: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: number;
  vocabulary: string[];
  created_at: string;
}

interface ProblemBankProps {
  onClose?: () => void;
}

export default function ProblemBank({ onClose }: ProblemBankProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'banks' | 'questions'>('banks');
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [bankForm, setBankForm] = useState({
    name: '',
    description: '',
    subject: 'Math',
  });

  const [questionForm, setQuestionForm] = useState({
    major_level: 1,
    minor_level: 1,
    type: 'multiple_choice',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 1,
    vocabulary: '',
  });

  useEffect(() => {
    fetchQuestionBanks();
  }, [profile?.tenant_id]);

  useEffect(() => {
    if (selectedBank) {
      fetchQuestions(selectedBank.id);
    }
  }, [selectedBank]);

  const fetchQuestionBanks = async () => {
    if (!profile?.tenant_id) return;
    
    try {
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestionBanks(data || []);
    } catch (err) {
      console.error('Error fetching question banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_bank_id', bankId)
        .order('major_level', { ascending: true })
        .order('minor_level', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const createQuestionBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id) return;

    try {
      const { error } = await supabase.from('question_banks').insert({
        tenant_id: profile.tenant_id,
        name: bankForm.name,
        description: bankForm.description,
        subject: bankForm.subject,
        is_active: true,
      });

      if (error) throw error;
      setBankForm({ name: '', description: '', subject: 'Math' });
      setShowAddBank(false);
      fetchQuestionBanks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteQuestionBank = async (id: string) => {
    if (!confirm('Are you sure? This will delete all questions in this bank.')) return;

    try {
      await supabase.from('question_banks').delete().eq('id', id);
      fetchQuestionBanks();
      if (selectedBank?.id === id) {
        setSelectedBank(null);
        setQuestions([]);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const createOrUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id || !selectedBank) return;

    const options = questionForm.options.filter(o => o.trim() !== '');
    const vocabulary = questionForm.vocabulary
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '');

    const questionData = {
      tenant_id: profile.tenant_id,
      question_bank_id: selectedBank.id,
      major_level: questionForm.major_level,
      minor_level: questionForm.minor_level,
      type: questionForm.type,
      question_text: questionForm.question_text,
      options: questionForm.type === 'multiple_choice' ? options : [],
      correct_answer: questionForm.correct_answer,
      explanation: questionForm.explanation,
      difficulty: questionForm.difficulty,
      vocabulary: vocabulary,
    };

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('questions').insert(questionData);
        if (error) throw error;
      }

      resetQuestionForm();
      setShowAddQuestion(false);
      setEditingQuestion(null);
      fetchQuestions(selectedBank.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await supabase.from('questions').delete().eq('id', id);
      if (selectedBank) fetchQuestions(selectedBank.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      major_level: question.major_level,
      minor_level: question.minor_level,
      type: question.type,
      question_text: question.question_text,
      options: question.options?.length ? question.options : ['', '', '', ''],
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      vocabulary: question.vocabulary?.join(', ') || '',
    });
    setShowAddQuestion(true);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      major_level: 1,
      minor_level: 1,
      type: 'multiple_choice',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      difficulty: 1,
      vocabulary: '',
    });
  };

  if (loading) {
    return (
      <div className="problem-bank-loading">
        <div className="loading-spinner"></div>
        <p>Loading problem bank...</p>
      </div>
    );
  }

  return (
    <div className="problem-bank">
      <div className="problem-bank-header">
        <h2>📚 Problem Bank Management</h2>
        {onClose && (
          <button onClick={onClose} className="close-btn">×</button>
        )}
      </div>

      <div className="problem-bank-tabs">
        <button
          className={`tab ${activeTab === 'banks' ? 'active' : ''}`}
          onClick={() => setActiveTab('banks')}
        >
          📁 Question Banks
        </button>
        <button
          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
          disabled={!selectedBank}
        >
          📝 Questions
          {selectedBank && ` (${questions.length})`}
        </button>
      </div>

      {activeTab === 'banks' && (
        <div className="banks-section">
          <div className="section-header">
            <h3>My Question Banks</h3>
            <button onClick={() => setShowAddBank(true)} className="add-btn">
              + New Bank
            </button>
          </div>

          {showAddBank && (
            <form onSubmit={createQuestionBank} className="add-form">
              <input
                type="text"
                placeholder="Bank Name"
                value={bankForm.name}
                onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={bankForm.description}
                onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })}
              />
              <select
                value={bankForm.subject}
                onChange={(e) => setBankForm({ ...bankForm, subject: e.target.value })}
              >
                <option value="Math">Math</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
              </select>
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setShowAddBank(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="banks-grid">
            {questionBanks.map((bank) => (
              <div
                key={bank.id}
                className={`bank-card ${selectedBank?.id === bank.id ? 'selected' : ''}`}
                onClick={() => setSelectedBank(bank)}
              >
                <div className="bank-icon">📁</div>
                <div className="bank-info">
                  <h4>{bank.name}</h4>
                  <p>{bank.description || 'No description'}</p>
                  <span className="bank-subject">{bank.subject}</span>
                </div>
                <div className="bank-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteQuestionBank(bank.id);
                    }}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {questionBanks.length === 0 && (
              <div className="empty-state">
                <p>No question banks yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'questions' && selectedBank && (
        <div className="questions-section">
          <div className="section-header">
            <div className="bank-title">
              <button onClick={() => setActiveTab('banks')} className="back-btn">
                ← Back
              </button>
              <h3>{selectedBank.name} - Questions</h3>
            </div>
            <button onClick={() => { resetQuestionForm(); setEditingQuestion(null); setShowAddQuestion(true); }} className="add-btn">
              + Add Question
            </button>
          </div>

          {showAddQuestion && (
            <form onSubmit={createOrUpdateQuestion} className="question-form">
              <h4>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Major Level</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={questionForm.major_level}
                    onChange={(e) => setQuestionForm({ ...questionForm, major_level: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Minor Level</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={questionForm.minor_level}
                    onChange={(e) => setQuestionForm({ ...questionForm, minor_level: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="fill_blank">Fill in Blank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Question Text</label>
                <textarea
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="Enter your math question..."
                  required
                  rows={3}
                />
              </div>

              {questionForm.type === 'multiple_choice' && (
                <div className="options-group">
                  <label>Options (mark correct answer)</label>
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={questionForm.correct_answer === option}
                        onChange={() => setQuestionForm({ ...questionForm, correct_answer: option })}
                        disabled={!option}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                      />
                      {index >= 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = questionForm.options.filter((_, i) => i !== index);
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          className="remove-option-btn"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {questionForm.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => setQuestionForm({ ...questionForm, options: [...questionForm.options, ''] })}
                      className="add-option-btn"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              )}

              {questionForm.type === 'fill_blank' && (
                <div className="form-group full-width">
                  <label>Correct Answer</label>
                  <input
                    type="text"
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    placeholder="Enter the correct answer"
                    required
                  />
                </div>
              )}

              <div className="form-group full-width">
                <label>Explanation (optional)</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Explain the answer..."
                  rows={2}
                />
              </div>

              <div className="form-group full-width">
                <label>Vocabulary (comma-separated)</label>
                <input
                  type="text"
                  value={questionForm.vocabulary}
                  onChange={(e) => setQuestionForm({ ...questionForm, vocabulary: e.target.value })}
                  placeholder="e.g., addition, sum, plus"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingQuestion ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); resetQuestionForm(); }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="questions-list">
            {questions.map((q) => (
              <div key={q.id} className="question-card">
                <div className="question-header">
                  <span className="level-badge">Level {q.major_level}.{q.minor_level}</span>
                  <span className="type-badge">{q.type}</span>
                  <span className="difficulty-badge">{'⭐'.repeat(q.difficulty)}</span>
                </div>
                <p className="question-text">{q.question_text}</p>
                {q.options?.length > 0 && (
                  <div className="question-options">
                    {q.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`option ${q.correct_answer === opt ? 'correct' : ''}`}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </span>
                    ))}
                  </div>
                )}
                {q.type === 'fill_blank' && (
                  <p className="correct-answer">Answer: {q.correct_answer}</p>
                )}
                {q.explanation && (
                  <p className="explanation">💡 {q.explanation}</p>
                )}
                <div className="question-actions">
                  <button onClick={() => editQuestion(q)} className="edit-btn">Edit</button>
                  <button onClick={() => deleteQuestion(q.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
            {questions.length === 0 && !showAddQuestion && (
              <div className="empty-state">
                <p>No questions yet. Click "Add Question" to create one!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
