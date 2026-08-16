import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { supabase, usernameToEmail } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });

      if (authError) throw authError;

      navigate('/'); // Redirect to dashboard
    } catch (err: any) {
      console.error(err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 font-sans relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 text-[#666666] hover:text-[#282828] flex items-center gap-1 font-medium"
      >
        <ChevronLeft className="h-5 w-5" /> Back
      </button>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-[#EAEAEA]">
        <h1 className="text-2xl font-bold text-[#282828] mb-2 text-center">Welcome Back</h1>
        <p className="text-[#666666] mb-8 text-center text-sm">
          Log in to continue your mental wellness journey.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#282828] mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#325343]/20 focus:border-[#325343]"
              placeholder="Your username"
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#325343] hover:bg-[#264033] text-white py-3.5 px-4 rounded-xl font-semibold transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};
