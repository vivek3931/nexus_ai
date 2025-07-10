import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white overflow-hidden p-4">
      {/* Background circles using Tailwind (no need for separate style tag) */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* First animated circle */}
        <div className="absolute w-[300px] h-[300px] -top-12 -left-12 rounded-full bg-gradient-to-br from-[#8a2be2] to-[#3f077b] opacity-30 blur-[80px] animate-[moveCircle1_15s_infinite_alternate_ease-in-out]" />
        
        {/* Second animated circle */}
        <div className="absolute w-[400px] h-[400px] -bottom-24 -right-24 rounded-full bg-gradient-to-br from-[#8a2be2] to-[#3f077b] opacity-30 blur-[80px] animate-[moveCircle2_20s_infinite_alternate_ease-in-out]" />
      </div>

      {/* Keyframes can be defined in your Tailwind config or global CSS */}
      <style jsx global>{`
        @keyframes moveCircle1 {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(20px, 20px) rotate(5deg); }
        }
        @keyframes moveCircle2 {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-20px, -20px) rotate(-5deg); }
        }
      `}</style>

      {/* Content container with max-width and centered */}
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;