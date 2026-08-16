import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Users, Plus, Trash2, Edit2, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper to generate a random password for new instructors
const generateTempPassword = () => Math.random().toString(36).slice(-8);

export const AdminPanel: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [instructors, setInstructors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'instructors' | 'students'>('instructors');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Instructor Form
  const [newInst, setNewInst] = useState({ name: '', email: '', specialization: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ManoVedaTeam' && password === 'WeWillWin') {
      setIsAuth(true);
      fetchInstructors();
      fetchStudents();
    } else {
      setAuthError('Invalid admin credentials');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('instructors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInstructors(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Create the user in Supabase Auth via a secure backend / edge function in a real app.
      // Since we don't have a backend here, we simulate it by just adding to the instructors table.
      // The admin bypass policy allows this.
      const tempPassword = generateTempPassword();
      
      const { error } = await supabase.from('instructors').insert([{
        name: newInst.name,
        email: newInst.email,
        specialization: newInst.specialization,
        description: newInst.description,
        is_active: true
      }]);

      if (error) throw error;
      
      alert(`Instructor added successfully.\nTemporary Password: ${tempPassword}\n(In a real app, this creates an Auth user and emails them)`);
      setShowAddModal(false);
      setNewInst({ name: '', email: '', specialization: '', description: '' });
      fetchInstructors();
    } catch (err: any) {
      alert(err.message || 'Failed to add instructor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('instructors').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      fetchInstructors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the student profile for ${name}? This action cannot be undone.`)) return;
    
    try {
      // NOTE: This deletes the profile from the `profiles` table.
      // It does not delete the user from auth.users.
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchStudents();
      alert(`Student profile ${name} deleted successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#2A312B] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="h-12 w-12 bg-red-100 rounded-xl mx-auto flex items-center justify-center text-red-600 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#282828] mb-2">Admin Panel</h1>
            <p className="text-[#666666] text-sm">Secure access only</p>
          </div>

          {authError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">{authError}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#282828] mb-1">Admin Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-3 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#282828] mb-1">Admin Passcode</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-3 focus:outline-none" />
            </div>
            <button type="submit" className="w-full bg-[#282828] hover:bg-black text-white py-3.5 px-4 rounded-xl font-semibold mt-2">
              Verify Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8 font-sans text-[#282828]">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">ManoVeda Admin</h1>
          <p className="text-[#666666]">Manage platform and instructors</p>
        </div>
        <button onClick={() => setIsAuth(false)} className="text-sm font-bold text-red-600 hover:text-red-800">
          Lock Panel
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('instructors')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'instructors' ? 'bg-[#325343] text-white' : 'bg-white text-[#666666] border border-[#EAEAEA] hover:bg-gray-50'}`}
          >
            <Users className="h-5 w-5" /> Instructors
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'students' ? 'bg-[#325343] text-white' : 'bg-white text-[#666666] border border-[#EAEAEA] hover:bg-gray-50'}`}
          >
            <GraduationCap className="h-5 w-5" /> Students
          </button>
        </div>

        {activeTab === 'instructors' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Instructors Directory</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-[#325343] text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                <Plus className="h-4 w-4" /> Add Instructor
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#325343]" /></div>
              ) : instructors.length === 0 ? (
                <div className="p-12 text-center text-[#666666]">No instructors found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAEAEA]">
                      <th className="p-4 font-bold text-sm text-[#666666]">Name</th>
                      <th className="p-4 font-bold text-sm text-[#666666]">Email</th>
                      <th className="p-4 font-bold text-sm text-[#666666]">Specialization</th>
                      <th className="p-4 font-bold text-sm text-[#666666]">Status</th>
                      <th className="p-4 font-bold text-sm text-[#666666] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((inst) => (
                      <tr key={inst.id} className="border-b border-[#EAEAEA] last:border-none hover:bg-gray-50">
                        <td className="p-4 font-semibold">{inst.name}</td>
                        <td className="p-4 text-[#666666] text-sm">{inst.email}</td>
                        <td className="p-4 text-[#666666] text-sm">{inst.specialization}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${inst.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {inst.is_active ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {inst.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => toggleStatus(inst.id, inst.is_active)}
                            className="text-sm font-semibold text-[#325343] hover:underline"
                          >
                            {inst.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'students' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Students Roster</h2>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
              {students.length === 0 ? (
                <div className="p-12 text-center text-[#666666]">No students registered yet.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAEAEA]">
                      <th className="p-4 font-bold text-sm text-[#666666]">Username</th>
                      <th className="p-4 font-bold text-sm text-[#666666]">Gender</th>
                      <th className="p-4 font-bold text-sm text-[#666666]">Age Range</th>
                      <th className="p-4 font-bold text-sm text-[#666666]">Joined</th>
                      <th className="p-4 font-bold text-sm text-[#666666] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-[#EAEAEA] last:border-none hover:bg-gray-50">
                        <td className="p-4 font-semibold">{student.username}</td>
                        <td className="p-4 text-[#666666] text-sm capitalize">{student.gender || '-'}</td>
                        <td className="p-4 text-[#666666] text-sm">{student.age_range || '-'}</td>
                        <td className="p-4 text-[#666666] text-sm">{new Date(student.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteStudent(student.id, student.username)}
                            className="text-sm font-semibold text-red-600 hover:underline flex items-center justify-end gap-1 w-full"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add New Instructor</h2>
            <form onSubmit={handleAddInstructor} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#282828] mb-1">Full Name</label>
                <input required type="text" value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})} className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282828] mb-1">Email (Login ID)</label>
                <input required type="email" value={newInst.email} onChange={e => setNewInst({...newInst, email: e.target.value})} className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282828] mb-1">Specialization</label>
                <input required type="text" placeholder="e.g. Anxiety, CBT" value={newInst.specialization} onChange={e => setNewInst({...newInst, specialization: e.target.value})} className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282828] mb-1">Bio / Description</label>
                <textarea required rows={3} value={newInst.description} onChange={e => setNewInst({...newInst, description: e.target.value})} className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-2.5" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold border border-[#EAEAEA] hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl font-semibold bg-[#325343] text-white hover:bg-[#264033] flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
