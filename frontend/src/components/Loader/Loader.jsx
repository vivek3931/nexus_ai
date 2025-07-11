import { useEffect, useState } from "react";

const Loader = ({ isLoading = true }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing Nexus AI");

  useEffect(() => {
    if (!isLoading) return;

    const messages = [
      "Initializing Nexus AI",
      "Loading neural networks",
      "Processing algorithms", 
      "Preparing interface",
      "Almost ready"
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 12;
        return newProgress > 100 ? 100 : newProgress;
      });

      setMessage((prev) => {
        const currentIndex = messages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 glass-effect-backdrop"
      style={{
        background: 'var(--background-dark)',
        transitionDuration: 'var(--transition-slow)'
      }}
    >
      <div 
        className="flex flex-col items-center gap-8 rounded-2xl p-10 shadow-2xl"
        style={{
          background: 'var(--glass-background)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 32px var(--glass-shadow)',
          backdropFilter: 'var(--glass-backdrop-filter)'
        }}
      >
        
        {/* Nexus AI Logo */}
        <div className="relative">
          <div 
            className="relative h-24 w-24 rounded-2xl p-1 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))',
              boxShadow: '0 10px 25px rgba(108, 92, 231, 0.25)'
            }}
          >
            <div 
              className="flex h-full w-full items-center justify-center rounded-xl"
              style={{ background: 'var(--background-dark)' }}
            >
              <svg viewBox="0 0 100 100" className="h-16 w-16">
                {/* Neural Network Nodes */}
                <circle cx="20" cy="30" r="3" fill="var(--primary-accent)" className="animate-pulse" />
                <circle cx="50" cy="20" r="3" fill="var(--secondary-accent)" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                <circle cx="80" cy="30" r="3" fill="var(--primary-accent)" className="animate-pulse" style={{animationDelay: '0.4s'}} />
                <circle cx="20" cy="70" r="3" fill="var(--secondary-accent)" className="animate-pulse" style={{animationDelay: '0.6s'}} />
                <circle cx="50" cy="80" r="3" fill="var(--primary-accent)" className="animate-pulse" style={{animationDelay: '0.8s'}} />
                <circle cx="80" cy="70" r="3" fill="var(--secondary-accent)" className="animate-pulse" style={{animationDelay: '1s'}} />
                
                {/* Central AI Core */}
                <circle cx="50" cy="50" r="8" fill="var(--primary-accent)" opacity="0.9" />
                <circle cx="50" cy="50" r="5" fill="var(--text-accent)" opacity="0.2" className="animate-pulse" />
                
                {/* Connection Lines */}
                <line x1="20" y1="30" x2="50" y2="20" stroke="var(--primary-accent)" strokeWidth="1" opacity="0.6" />
                <line x1="50" y1="20" x2="80" y2="30" stroke="var(--secondary-accent)" strokeWidth="1" opacity="0.6" />
                <line x1="20" y1="30" x2="50" y2="50" stroke="var(--primary-accent)" strokeWidth="1.5" opacity="0.8" />
                <line x1="50" y1="20" x2="50" y2="50" stroke="var(--secondary-accent)" strokeWidth="1.5" opacity="0.8" />
                <line x1="80" y1="30" x2="50" y2="50" stroke="var(--primary-accent)" strokeWidth="1.5" opacity="0.8" />
                <line x1="20" y1="70" x2="50" y2="50" stroke="var(--secondary-accent)" strokeWidth="1.5" opacity="0.8" />
                <line x1="50" y1="80" x2="50" y2="50" stroke="var(--primary-accent)" strokeWidth="1.5" opacity="0.8" />
                <line x1="80" y1="70" x2="50" y2="50" stroke="var(--secondary-accent)" strokeWidth="1.5" opacity="0.8" />
              </svg>
            </div>
          </div>
          
          {/* Rotating Ring */}
          <div 
            className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-30 animate-spin" 
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))',
              animationDuration: '3s'
            }}
          ></div>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 
            className="text-2xl font-bold mb-2 bg-clip-text text-transparent"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            NEXUS AI
          </h1>
          <p 
            className="font-light tracking-wide"
            style={{ 
              color: 'var(--text-muted)',
              transition: 'var(--transition-base)'
            }}
          >
            {message}
            <span className="inline-flex space-x-1 pl-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rounded-full opacity-40 animate-pulse"
                  style={{
                    background: 'var(--primary-accent)',
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </span>
          </p>
        </div>

        {/* Progress Bar */}
        <div 
          className="w-64 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--background-tertiary)' }}
        >
          <div 
            className="h-full transition-all duration-500 ease-out rounded-full shadow-lg"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))',
              boxShadow: '0 2px 10px rgba(108, 92, 231, 0.25)',
              transition: 'var(--transition-slow)'
            }}
          />
        </div>

        {/* Progress Percentage */}
        <div 
          className="text-xs font-mono tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {Math.min(100, Math.round(progress))}%
        </div>
      </div>
    </div>
  );
};

export default Loader;