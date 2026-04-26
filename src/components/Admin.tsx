import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { questions as initialQuestions } from '../data';
import { Question, QuestionType } from '../types';
import { useAuth } from '../AuthContext';
import './Admin.css';

interface Props {
  onBack: () => void;
}

function Admin({ onBack }: Props) {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState({ major: 0, minor: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'database'>('local');

  const [formData, setFormData] = useState<Partial<Question>>({
    majorLevel: 1,
    minorLevel: 1,
    type: 'choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    vocabulary: [],
  });

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      fetchDbQuestions();
    }
  }, [profile]);

  const fetchDbQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('major_level')
        .order('minor_level');
      
      if (error) throw error;
      setDbQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter.major && q.majorLevel !== filter.major) return false;
    if (filter.minor && q.minorLevel !== filter.minor) return false;
    return true;
  });

  const filteredDbQuestions = dbQuestions.filter(q => {
    if (filter.major && q.major_level !== filter.major) return false;
    if (filter.minor && q.minor_level !== filter.minor) return false;
    return true;
  });

  const startEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormData({ ...q, options: q.options || ['', '', '', ''] });
    setIsAddingNew(false);
  };

  const startEditDb = (q: any) => {
    setEditingQuestion({
      id: q.id,
      majorLevel: q.major_level,
      minorLevel: q.minor_level,
      type: q.question_type === 'multiple_choice' ? 'choice' : q.question_type === 'fill_blank' ? 'fill' : 'boolean',
      question: q.question_text,
      options: q.options || ['', '', '', ''],
      correctAnswer: q.correct_answer,
      explanation: q.explanation || '',
      vocabulary: [],
    });
    setIsAddingNew(false);
  };

  const startAdd = () => {
    setEditingQuestion(null);
    setFormData({
      majorLevel: 1,
      minorLevel: 1,
      type: 'choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      vocabulary: [],
    });
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!formData.question || !formData.correctAnswer) {
      alert('Please fill in question and answer!');
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion?.id || `${formData.majorLevel}-${formData.minorLevel}-${Date.now()}`,
      majorLevel: formData.majorLevel!,
      minorLevel: formData.minorLevel!,
      type: formData.type!,
      question: formData.question,
      options: formData.type === 'choice' ? formData.options : undefined,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation || '',
      vocabulary: formData.vocabulary || [],
    };

    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? newQuestion : q));
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setEditingQuestion(null);
    setIsAddingNew(false);
  };

  const handleSaveToDb = async () => {
    if (!formData.question || !formData.correctAnswer) {
      alert('Please fill in question and answer!');
      return;
    }

    if (!user) return;
    setLoading(true);

    try {
      const questionData = {
        tenant_id: profile?.tenant_id || '',
        major_level: formData.majorLevel!,
        minor_level: formData.minorLevel!,
        question_text: formData.question,
        question_type: formData.type === 'choice' ? 'multiple_choice' : formData.type === 'fill' ? 'fill_blank' : 'true_false',
        options: formData.options?.filter(Boolean) || null,
        correct_answer: formData.correctAnswer,
        explanation: formData.explanation || null,
        created_by: user.id,
      };

      if (editingQuestion?.id && !editingQuestion.id.includes('-')) {
        // Update existing
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('questions')
          .insert(questionData);
        
        if (error) throw error;
      }

      await fetchDbQuestions();
      setEditingQuestion(null);
      setIsAddingNew(false);
      alert('Question saved successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleDeleteFromDb = async (id: string) => {
    if (!confirm('Delete this question from database?')) return;

    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      await fetchDbQuestions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateOption = (idx: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[idx] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'choice': return 'MCQ';
      case 'fill': return 'Fill';
      case 'boolean': return 'TF';
    }
  };

  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <div className="admin fade-in">
      <div className="admin-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Question Bank Admin</h1>
        <button className="add-btn" onClick={startAdd}>+ Add Question</button>
      </div>

      {isSuperAdmin && (
        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            📁 Local Questions ({questions.length})
          </button>
          <button 
            className={`tab ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            🗄️ Database Questions ({dbQuestions.length})
          </button>
        </div>
      )}

      <div className="filters">
        <select onChange={(e) => setFilter({ ...filter, major: Number(e.target.value) })}>
          <option value={0}>All Major Levels</option>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={i + 1}>Level {i + 1}</option>
          ))}
        </select>
        <select onChange={(e) => setFilter({ ...filter, minor: Number(e.target.value) })}>
          <option value={0}>All Minor Levels</option>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={i + 1}>Level {i + 1}</option>
          ))}
        </select>
        <span className="count">
          Total: {(activeTab === 'local' ? filteredQuestions : filteredDbQuestions).length} questions
        </span>
      </div>

      {(isAddingNew || editingQuestion) ? (
        <div className="edit-form">
          <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
          {activeTab === 'database' && (
            <p className="db-notice">💾 Saving to database</p>
          )}
          
          <div className="form-row">
            <label>
              Major Level:
              <input 
                type="number" 
                min="1" max="10" 
                value={formData.majorLevel}
                onChange={(e) => setFormData({ ...formData, majorLevel: Number(e.target.value) })}
              />
            </label>
            <label>
              Minor Level:
              <input 
                type="number" 
                min="1" max="10" 
                value={formData.minorLevel}
                onChange={(e) => setFormData({ ...formData, minorLevel: Number(e.target.value) })}
              />
            </label>
            <label>
              Type:
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
              >
                <option value="choice">Multiple Choice</option>
                <option value="fill">Fill in Blank</option>
                <option value="boolean">True/False</option>
              </select>
            </label>
          </div>

          <label className="full-width">
            Question (English):
            <textarea 
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={2}
              placeholder="Enter the question in English..."
            />
          </label>

          {formData.type === 'choice' && (
            <div className="options-input">
              <label>Options:</label>
              {formData.options?.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                />
              ))}
              <label className="correct-option">
                Correct Answer:
                <input 
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  placeholder="Enter correct answer"
                />
              </label>
            </div>
          )}

          {formData.type === 'fill' && (
            <label>
              Correct Answer:
              <input 
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                placeholder="Enter correct answer"
              />
            </label>
          )}

          {formData.type === 'boolean' && (
            <label>
              Correct Answer:
              <select 
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>
          )}

          <label className="full-width">
            Explanation:
            <textarea 
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={2}
              placeholder="Explain the answer..."
            />
          </label>

          <div className="form-actions">
            <button className="cancel-btn" onClick={() => { setEditingQuestion(null); setIsAddingNew(false); }}>
              Cancel
            </button>
            <button 
              className="save-btn" 
              onClick={activeTab === 'database' ? handleSaveToDb : handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      ) : (
        <div className="questions-list">
          {activeTab === 'local' ? (
            filteredQuestions.map((q, idx) => (
              <div key={q.id} className="question-item">
                <div className="question-meta">
                  <span className="level-badge">{q.majorLevel}-{q.minorLevel}</span>
                  <span className={`type-badge ${q.type}`}>{getTypeLabel(q.type)}</span>
                  <span className="q-num">#{idx + 1}</span>
                </div>
                <p className="question-preview">{q.question}</p>
                <div className="question-actions">
                  <button className="edit-btn" onClick={() => startEdit(q)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(q.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            filteredDbQuestions.map((q, idx) => (
              <div key={q.id} className="question-item">
                <div className="question-meta">
                  <span className="level-badge">{q.major_level}-{q.minor_level}</span>
                  <span className={`type-badge ${q.question_type === 'multiple_choice' ? 'choice' : q.question_type === 'fill_blank' ? 'fill' : 'boolean'}`}>
                    {q.question_type === 'multiple_choice' ? 'MCQ' : q.question_type === 'fill_blank' ? 'Fill' : 'TF'}
                  </span>
                  <span className="q-num">#{idx + 1}</span>
                </div>
                <p className="question-preview">{q.question_text}</p>
                <div className="question-actions">
                  <button className="edit-btn" onClick={() => startEditDb(q)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteFromDb(q.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
