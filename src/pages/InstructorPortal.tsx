import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, Users, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const InstructorPortal: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      // Note: We check if they are actually an instructor in the effect below
    } catch (err: any) {
      setError('Invalid instructor credentials');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#FAF8F5]" />;

  // If logged in as instructor, show dashboard
  if (user && profile?.role === 'instructor') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-8 font-sans text-[#282828]">
        <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold">Instructor Portal</h1>
            <p className="text-[#666666]">Welcome back, {profile.username}</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-bold text-[#666666] hover:text-[#325343]"
          >
            Log out
          </button>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-[#325343]/10 rounded-xl flex items-center justify-center text-[#325343]">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#666666]">Upcoming Sessions</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-[#325343]/10 rounded-xl flex items-center justify-center text-[#325343]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#666666]">Active Students</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-[#325343]/10 rounded-xl flex items-center justify-center text-[#325343]">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#666666]">Pending Reviews</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If logged in but not an instructor, we still show the login form
  // The sign-in action will replace their current session.

  // Show login form
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-[#EAEAEA]">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-[#325343]/10 rounded-xl mx-auto flex items-center justify-center text-[#325343] mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#282828] mb-2">Instructor Login</h1>
          <p className="text-[#666666] text-sm">
            Sign in to access your counseling dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#282828] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#325343]/20 focus:border-[#325343]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#282828] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#325343]/20 focus:border-[#325343]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#325343] hover:bg-[#264033] text-white py-3.5 px-4 rounded-xl font-semibold transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Access Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
