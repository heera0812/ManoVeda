import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export const AuthGatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        
        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#EAEAEA] text-center relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="ManoVeda Logo" className="h-36 w-auto object-contain mb-6" />
          <h1 className="text-3xl font-extrabold font-outfit text-[#282828] mb-2">Welcome to ManoVeda</h1>
          <p className="text-[#666666] mb-8 font-medium">
            Your safe space for mental wellness and guidance.
          </p>

          <div className="space-y-4 relative">
            <button
              onClick={() => navigate('/signup')}
              className="w-full flex items-center justify-center gap-2 bg-[#325343] hover:bg-[#264033] text-white py-3.5 px-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] relative"
            >
              <UserPlus className="h-5 w-5" />
              Get Started
              
              {/* Highlighting pulse for the Get Started button */}
              <div className="absolute inset-0 rounded-xl ring-2 ring-[#325343] ring-offset-2 animate-ping opacity-20 pointer-events-none" />
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#325343] border border-[#325343] py-3.5 px-4 rounded-xl font-bold transition-colors"
            >
              <LogIn className="h-5 w-5" />
              Log In
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
