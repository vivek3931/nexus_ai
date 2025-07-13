import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden p-4"
      style={{
        backgroundColor: 'var(--auth-bg)', // Use theme variable for background
        color: 'var(--auth-text)', // Use theme variable for text color
      }}
    >
      {/* Background circles using Tailwind (no need for separate style tag) */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* First animated circle */}
        <div
          className="absolute w-[300px] h-[300px] -top-12 -left-12 rounded-full opacity-30 blur-[80px] animate-[moveCircle1_15s_infinite_alternate_ease-in-out]"
          style={{
            background: 'linear-gradient(to bottom right, var(--auth-circle-gradient-from), var(--auth-circle-gradient-to))', // Use theme variables for gradient
          }}
        />
        
        {/* Second animated circle */}
        <div
          className="absolute w-[400px] h-[400px] -bottom-24 -right-24 rounded-full opacity-30 blur-[80px] animate-[moveCircle2_20s_infinite_alternate_ease-in-out]"
          style={{
            background: 'linear-gradient(to bottom right, var(--auth-circle-gradient-from), var(--auth-circle-gradient-to))', // Use theme variables for gradient
          }}
        />
      </div>

      {/* Content container with max-width and centered */}
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
