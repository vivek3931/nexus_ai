import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/soul_logo.svg'

const LoginForm = ({ onSwitchForm, onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (usernameOrEmail && password) {
        setMessage("Login successful!");
        setMessageType("success");
        
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            console.log("Login successful - redirect to dashboard");
          }
        }, 1000);
      } else {
        setMessage("Please fill in all fields");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Network error. Could not connect to the server.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4  w-[400px] " style={{
    
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        
      />
      
      {/* Glass Container */}
      <div 
        className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl"
        style={{
          background: 'var(--glass-background)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'var(--glass-backdrop-filter)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8 flex flex-col justify-center items-center">
          <img src={logo} alt="" className="h-14 w-14"/>
          
          
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-accent)' }}
          >
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Username/Email Field */}
          <div>
            <label 
              htmlFor="usernameOrEmail"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Email or Username
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your email or username"
              required
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-light)',
                fontSize: 'var(--font-size-md)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-accent)';
                e.target.style.boxShadow = `0 0 0 3px rgba(108, 92, 231, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Password Field */}
          <div>
            <label 
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--background-tertiary)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-light)',
                  fontSize: 'var(--font-size-md)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-accent)';
                  e.target.style.boxShadow = `0 0 0 3px rgba(108, 92, 231, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 hover:opacity-80"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-right mt-2">
              <a
                href="#"
                className="text-sm transition-colors duration-300 hover:opacity-80"
                style={{ color: 'var(--secondary-accent)' }}
              >
                Forgot password?
              </a>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
              isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
            }`}
            disabled={isLoading}
            onClick={handleSubmit}
            style={{
              background: `#8a2be2`,
              color: 'var(--text-accent)',
              border: 'var(--glass-border)',
              fontSize: 'var(--font-size-md)',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.3)'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`text-center mt-6 p-3 rounded-lg text-sm transition-all duration-300 ${
              messageType === "success"
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message}
          </div>
        )}

        {/* Register Link */}
        <div className="text-center mt-8">
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Don't have an account?{' '}
            <a
              href="#"
              className="font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: 'var(--secondary-accent)' }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;