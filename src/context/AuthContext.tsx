import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, usernameToEmail } from '../lib/supabase';

interface AuthContextType {
  user: User | any | null;
  session: Session | any | null;
  loading: boolean;
  profile: any | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signUp: (username: string, password: string) => Promise<{ user?: any; error?: string }>;
  signIn: (identifier: string, password: string) => Promise<{ user?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  signOut: async () => {},
  refreshProfile: async () => {},
  signUp: async () => ({ error: 'Not implemented' }),
  signIn: async () => ({ error: 'Not implemented' }),
});

const DEMO_INSTRUCTOR = {
  id: 'instructor_demo_1',
  username: 'Dr. Ananya Sharma',
  email: 'instructor@manoveda.com',
  password: 'instructor123',
  role: 'instructor',
  created_at: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [session, setSession] = useState<Session | any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 2500))
      ]);
      
      if (data) {
        setProfile(data);
        return;
      }
    } catch (err) {
      // Fallback to local profile
      const localProfileStr = localStorage.getItem('manoveda_current_profile');
      if (localProfileStr) {
        try {
          setProfile(JSON.parse(localProfileStr));
        } catch {}
      }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Ensure default instructor exists in local storage for demonstration
    const localUsersStr = localStorage.getItem('manoveda_local_users');
    let localUsers: any[] = [];
    try {
      localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
    } catch {
      localUsers = [];
    }
    if (!localUsers.some(u => u.email === DEMO_INSTRUCTOR.email || u.username === DEMO_INSTRUCTOR.username)) {
      localUsers.push(DEMO_INSTRUCTOR);
      localStorage.setItem('manoveda_local_users', JSON.stringify(localUsers));
    }

    // 1. Check if we already have an active local session
    const localSessionStr = localStorage.getItem('manoveda_current_session');
    const localProfileStr = localStorage.getItem('manoveda_current_profile');
    if (localSessionStr) {
      try {
        const parsedSession = JSON.parse(localSessionStr);
        const parsedProfile = localProfileStr ? JSON.parse(localProfileStr) : null;
        setSession(parsedSession);
        setUser(parsedSession.user ?? null);
        setProfile(parsedProfile);
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Failed to parse local session', e);
      }
    }

    // 2. Otherwise check Supabase session with a timeout safeguard
    let isSettled = false;
    const timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        setLoading(false);
      }
    }, 2000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeoutId);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutId);
          setLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        fetchProfile(session.user.id);
      } else if (!localStorage.getItem('manoveda_current_session')) {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (username: string, password: string): Promise<{ user?: any; error?: string }> => {
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return { error: 'Username must be at least 3 characters' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    // Attempt Supabase sign up with timeout
    try {
      const res = await Promise.race([
        supabase.auth.signUp({
          email: usernameToEmail(cleanUsername),
          password,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Supabase network timeout')), 3000))
      ]);

      if (res.data?.user && !res.error) {
        try {
          await supabase.from('profiles').insert([
            {
              id: res.data.user.id,
              username: cleanUsername,
              role: 'student',
            },
          ]);
        } catch {}

        setUser(res.data.user);
        setSession(res.data.session);
        setProfile({ id: res.data.user.id, username: cleanUsername, role: 'student' });
        return { user: res.data.user };
      }
    } catch (err) {
      console.warn('Supabase sign up unavailable or failed; using local offline auth mode.', err);
    }

    // Fallback: Local offline account creation
    try {
      const localUsers: any[] = JSON.parse(localStorage.getItem('manoveda_local_users') || '[]');
      const existing = localUsers.find(
        u => u.username.toLowerCase() === cleanUsername.toLowerCase() ||
             u.email.toLowerCase() === usernameToEmail(cleanUsername).toLowerCase()
      );

      if (existing) {
        return { error: 'This username is already taken. Please choose another or log in.' };
      }

      const newUserId = 'usr_' + Math.random().toString(36).substring(2, 11);
      const newUser = {
        id: newUserId,
        username: cleanUsername,
        email: usernameToEmail(cleanUsername),
        password, // For offline demo authentication
        role: 'student',
        created_at: new Date().toISOString()
      };

      localUsers.push(newUser);
      localStorage.setItem('manoveda_local_users', JSON.stringify(localUsers));

      const newSession = {
        access_token: 'local_session_' + Date.now(),
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: { username: newUser.username }
        }
      };

      const newProfile = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      };

      localStorage.setItem('manoveda_current_session', JSON.stringify(newSession));
      localStorage.setItem('manoveda_current_profile', JSON.stringify(newProfile));

      // Sync onboarding flag and name into localStorage profile
      try {
        const storedProfile = localStorage.getItem('manoveda_profile_v2');
        const parsed = storedProfile ? JSON.parse(storedProfile) : {};
        localStorage.setItem('manoveda_profile_v2', JSON.stringify({
          ...parsed,
          name: newUser.username,
          completedOnboarding: true
        }));
      } catch {}

      setUser(newSession.user);
      setSession(newSession);
      setProfile(newProfile);

      return { user: newSession.user };
    } catch (localErr: any) {
      return { error: localErr?.message || 'Failed to create account locally' };
    }
  };

  const signIn = async (identifier: string, password: string): Promise<{ user?: any; error?: string }> => {
    const cleanId = identifier.trim();

    // 1. Check local users first
    try {
      const localUsers: any[] = JSON.parse(localStorage.getItem('manoveda_local_users') || '[]');
      const found = localUsers.find(
        u => u.username.toLowerCase() === cleanId.toLowerCase() ||
             u.email.toLowerCase() === cleanId.toLowerCase() ||
             u.email.toLowerCase() === usernameToEmail(cleanId).toLowerCase()
      );

      if (found) {
        if (found.password === password) {
          const session = {
            access_token: 'local_session_' + Date.now(),
            user: {
              id: found.id,
              email: found.email,
              user_metadata: { username: found.username }
            }
          };
          const prof = {
            id: found.id,
            username: found.username,
            role: found.role
          };

          localStorage.setItem('manoveda_current_session', JSON.stringify(session));
          localStorage.setItem('manoveda_current_profile', JSON.stringify(prof));

          // Sync into localStorage profile
          try {
            const storedProfile = localStorage.getItem('manoveda_profile_v2');
            const parsed = storedProfile ? JSON.parse(storedProfile) : {};
            localStorage.setItem('manoveda_profile_v2', JSON.stringify({
              ...parsed,
              name: found.username,
              completedOnboarding: true
            }));
          } catch {}

          setUser(session.user);
          setSession(session);
          setProfile(prof);
          return { user: session.user };
        } else {
          return { error: 'Invalid username or password' };
        }
      }
    } catch (e) {
      console.warn('Error reading local users', e);
    }

    // 2. Try Supabase sign in
    try {
      const email = cleanId.includes('@') ? cleanId : usernameToEmail(cleanId);
      const res = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Supabase sign-in timeout')), 3000))
      ]);

      if (res.data?.user && !res.error) {
        setUser(res.data.user);
        setSession(res.data.session);
        fetchProfile(res.data.user.id);
        return { user: res.data.user };
      }
    } catch (err) {
      console.warn('Supabase sign in failed or unavailable', err);
    }

    return { error: 'Invalid username or password' };
  };

  const signOut = async () => {
    localStorage.removeItem('manoveda_current_session');
    localStorage.removeItem('manoveda_current_profile');
    setUser(null);
    setSession(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signOut, refreshProfile, signUp, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
