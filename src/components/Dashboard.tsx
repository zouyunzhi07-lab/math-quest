import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import './Dashboard.css';

interface DashboardProps {
  onPlayGame: () => void;
  onLogout: () => void;
}

export default function Dashboard({ onPlayGame, onLogout }: DashboardProps) {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalSchools: 0,
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, questionsRes, tenantsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalQuestions: questionsRes.count || 0,
        totalSchools: tenantsRes.count || 0,
        recentActivity: [],
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSuperAdminDashboard = () => (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Math Quest Admin</h1>
          <p className="dashboard-subtitle">Welcome, {profile?.full_name || user?.email}</p>
        </div>
        <div className="header-actions">
          <span className="role-badge super-admin">Super Admin</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon schools">🏫</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalSchools}</span>
            <span className="stat-label">Schools</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon students">👨‍🎓</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalStudents}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon questions">📝</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button onClick={onPlayGame} className="action-card play">
          <span className="action-icon">🎮</span>
          <span className="action-text">Play Game</span>
          <span className="action-desc">Start learning math!</span>
        </button>
        <SuperAdminPanel onRefresh={fetchStats} />
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Math Quest</h1>
          <p className="dashboard-subtitle">Welcome back, {profile?.full_name || user?.email}!</p>
        </div>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </header>

      <div className="welcome-section">
        <h2>Ready to learn?</h2>
        <p>Choose your character and start your math adventure!</p>
        <button onClick={onPlayGame} className="play-button">
          🎮 Start Playing
        </button>
      </div>
    </div>
  );

  if (profile?.role === 'super_admin' || profile?.role === 'school_admin') {
    return renderSuperAdminDashboard();
  }

  return renderStudentDashboard();
}

function SuperAdminPanel({ onRefresh }: { onRefresh: () => void }) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [activeTab, setActiveTab] = useState<'schools' | 'users'>('schools');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
    fetchUsers();
  }, []);

  const fetchTenants = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setTenants(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const addSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('tenants').insert({
        name: newSchoolName,
        code: newSchoolCode.toUpperCase(),
      });
      
      if (error) throw error;
      
      setNewSchoolName('');
      setNewSchoolCode('');
      setShowAddSchool(false);
      fetchTenants();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school? This will affect all users.')) return;
    
    try {
      await supabase.from('tenants').delete().eq('id', id);
      fetchTenants();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await supabase.from('users').delete().eq('id', userId);
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="super-admin-panel">
      <div className="panel-tabs">
        <button 
          className={`tab ${activeTab === 'schools' ? 'active' : ''}`}
          onClick={() => setActiveTab('schools')}
        >
          🏫 Schools
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
      </div>

      {activeTab === 'schools' && (
        <div className="panel-content">
          <div className="panel-header">
            <h3>Manage Schools</h3>
            <button onClick={() => setShowAddSchool(true)} className="add-button">
              + Add School
            </button>
          </div>

          {showAddSchool && (
            <form onSubmit={addSchool} className="add-form">
              <input
                type="text"
                placeholder="School Name"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="School Code (e.g., SCH001)"
                value={newSchoolCode}
                onChange={(e) => setNewSchoolCode(e.target.value)}
                required
              />
              <div className="form-actions">
                <button type="submit" disabled={loading}>Save</button>
                <button type="button" onClick={() => setShowAddSchool(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td><code>{tenant.code}</code></td>
                    <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => deleteTenant(tenant.id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-row">No schools yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="panel-content">
          <div className="panel-header">
            <h3>Manage Users</h3>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="school_admin">School Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => deleteUser(user.id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-row">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
