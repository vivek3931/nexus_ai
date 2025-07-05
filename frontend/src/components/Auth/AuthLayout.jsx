// src/components/Auth/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // To render nested auth forms

const AuthLayout = () => {
  return (
    // Full-screen container for auth forms with background circles
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background circles styles (can be moved to index.css if preferred) */}
      <style jsx>{`
          .auth-bg-circles::before,
          .auth-bg-circles::after {
              content: '';
              position: absolute;
              border-radius: 50%;
              background: linear-gradient(135deg, #8a2be2, #3f077b);
              opacity: 0.3;
              filter: blur(80px);
              z-index: 0;
          }

          .auth-bg-circles::before {
              width: 300px;
              height: 300px;
              top: -50px;
              left: -50px;
              animation: moveCircle1 15s infinite alternate ease-in-out;
          }

          .auth-bg-circles::after {
              width: 400px;
              height: 400px;
              bottom: -100px;
              right: -100px;
              animation: moveCircle2 20s infinite alternate ease-in-out;
          }
      `}</style>
      <div className="auth-bg-circles absolute inset-0 z-0"></div>

      {/* This is where nested auth forms (Login/Register) will render */}
      <div className="p-4 z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
