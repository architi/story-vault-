
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { User } from '../types';

// New GlobalAlert component to be rendered in a portal as requested
const GlobalAlert: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Use createPortal to render the alert at the top of the body
  return ReactDOM.createPortal(
    (
      <div
        className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--accent-primary)] text-white text-base font-bold px-6 py-3 rounded-md shadow-lg animate-fade-in z-[2000]"
        role="alert"
      >
        {message}
      </div>
    ),
    document.body
  );
};


interface AuthPopupProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ onSuccess, onClose }) => {
  const [authMode, setAuthMode] = useState<'options' | 'form'>('options');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  const showAlert = (message: string) => {
    setAlert(message);
  };
  
  const validateAndProceed = () => {
    if (!name.trim()) {
      showAlert('Please fill out the Name field.');
      return;
    }
    if (!email.trim()) {
      showAlert('Please fill out the Email field.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        showAlert('Please enter a valid email address.');
        return;
    }
    if (!phone.trim()) {
      showAlert('Please fill out the Phone Number field.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      showAlert('Please enter a valid 10-digit phone number.');
      return;
    }
    onSuccess({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      validateAndProceed();
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-md rounded-lg flex flex-col justify-center items-center p-8 md:p-10 popup-card-animate bg-[var(--background-secondary)] shadow-2xl border border-[var(--border-color)] notebook-lines"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)] transition-colors z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full text-center">
          <h2 className="text-4xl md:text-5xl text-[var(--accent-primary)] mb-8" style={{fontFamily: 'var(--font-script)'}}>Let's get you logged in</h2>

          {authMode === 'options' && (
            <div className="space-y-4">
              <button
                onClick={() => setAuthMode('form')}
                className="w-full text-lg font-bold bg-[var(--accent-primary)] text-white py-3 rounded-md shadow-md hover:bg-[var(--accent-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] focus:ring-offset-[var(--background-secondary)]"
              >
                Create Account
              </button>
              <button
                onClick={() => setAuthMode('form')}
                className="w-full text-lg font-bold bg-transparent text-[var(--accent-primary)] py-3 rounded-md border-2 border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] focus:ring-offset-[var(--background-secondary)]"
              >
                Log In
              </button>
            </div>
          )}

          {authMode === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/80"
                style={{fontFamily: 'var(--font-typewriter)'}}
                aria-label="Name"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/80"
                style={{fontFamily: 'var(--font-typewriter)'}}
                aria-label="Email"
              />
              <input
                type="tel"
                placeholder="10-Digit Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/80"
                style={{fontFamily: 'var(--font-typewriter)'}}
                aria-label="Phone Number"
              />
              <button
                type="submit"
                className="w-full text-lg font-bold bg-[var(--accent-primary)] text-white py-3 rounded-md shadow-md hover:bg-[var(--accent-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] focus:ring-offset-[var(--background-secondary)] mt-2"
              >
                Continue
              </button>
            </form>
          )}
        </div>
      </div>
      {alert && <GlobalAlert message={alert} onDismiss={() => setAlert(null)} />}
    </div>
  );
};

export default AuthPopup;
