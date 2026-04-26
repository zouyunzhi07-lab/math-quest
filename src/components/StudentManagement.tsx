import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import './StudentManagement.css';

interface Student {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string;
  role: string;
  created_at: string;
  password_reset_required: boolean;
}

interface StudentManagementProps {
  onClose?: () => void;
}

export default function StudentManagement({ onClose }: StudentManagementProps) {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [studentForm, setStudentForm] = useState({
    email: '',
    full_name: '',
    password: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [profile?.tenant_id]);

  const fetchStudents = async () => {
    if (!profile?.tenant_id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id) return;

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: studentForm.email,
        password: studentForm.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then, create the user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: studentForm.email,
        full_name: studentForm.full_name,
        tenant_id: profile.tenant_id,
        role: 'student',
        password_reset_required: false,
      });

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      resetForm();
      setShowAddStudent(false);
      fetchStudents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: studentForm.full_name })
        .eq('id', editingStudent.id);

      if (error) throw error;
      resetForm();
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This cannot be undone.')) return;

    try {
      // Delete from auth.users first
      await supabase.auth.admin.deleteUser(id);
      // The user profile should be deleted automatically due to CASCADE, 
      // but let's also try to delete it manually if RLS prevents CASCADE
      await supabase.from('users').delete().eq('id', id);
      fetchStudents();
    } catch (err: any) {
      // If auth deletion fails due to permissions, just delete the profile
      try {
        await supabase.from('users').delete().eq('id', id);
        fetchStudents();
      } catch (profileErr) {
        alert(profileErr.message);
      }
    }
  };

  const resetPassword = async () => {
    if (!selectedStudent || !newPassword) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(selectedStudent.id, {
        password: newPassword,
      });

      if (error) throw error;

      // Mark as needing password reset on next login (optional)
      await supabase
        .from('users')
        .update({ password_reset_required: false })
        .eq('id', selectedStudent.id);

      alert('Password has been reset successfully!');
      setShowResetModal(false);
      setNewPassword('');
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openResetModal = (student: Student) => {
    setSelectedStudent(student);
    setShowResetModal(true);
  };

  const resetForm = () => {
    setStudentForm({ email: '', full_name: '', password: '' });
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      email: student.email,
      full_name: student.full_name,
      password: '',
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="student-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="student-management">
      <div className="student-management-header">
        <h2>👨‍🎓 Student Management</h2>
        {onClose && (
          <button onClick={onClose} className="close-btn">×</button>
        )}
      </div>

      <div className="student-management-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => { resetForm(); setEditingStudent(null); setShowAddStudent(true); }} className="add-btn">
          + Add Student
        </button>
      </div>

      {showAddStudent && (
        <form onSubmit={createStudent} className="student-form">
          <h4>Add New Student</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={studentForm.full_name}
                onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                placeholder="Enter student name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                placeholder="student@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Create Student</button>
            <button type="button" onClick={() => setShowAddStudent(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      {editingStudent && (
        <form onSubmit={updateStudent} className="student-form">
          <h4>Edit Student - {editingStudent.full_name}</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={studentForm.full_name}
                onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                placeholder="Enter student name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email (cannot be changed)</label>
              <input
                type="email"
                value={studentForm.email}
                disabled
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Update Student</button>
            <button type="button" onClick={() => { setEditingStudent(null); resetForm(); }} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showResetModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Reset Password for {selectedStudent.full_name}</h4>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>
            <div className="form-actions">
              <button onClick={resetPassword} className="save-btn">Reset Password</button>
              <button onClick={() => { setShowResetModal(false); setNewPassword(''); setSelectedStudent(null); }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.full_name}</td>
                <td>{student.email}</td>
                <td>{new Date(student.created_at).toLocaleDateString()}</td>
                <td>
                  {student.password_reset_required ? (
                    <span className="status-badge reset">Reset Required</span>
                  ) : (
                    <span className="status-badge active">Active</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => editStudent(student)} className="edit-btn">Edit</button>
                    <button onClick={() => openResetModal(student)} className="reset-btn">Reset Password</button>
                    <button onClick={() => deleteStudent(student.id)} className="delete-btn">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-row">
                  {searchTerm ? 'No students match your search' : 'No students yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
