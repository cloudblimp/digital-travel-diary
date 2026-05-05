# Example: Completed Master Prompt for Login.jsx

Copy everything below (from the next line to the closing triple backticks) and paste it directly into **Copilot Pro**.

---

```
**Project Context:**
I have a React + Vite project using Tailwind CSS 4.x.
- React version: 19.1.1
- Vite: 7.1.12
- Tailwind CSS: 4.x (configured with proper content scanning)
- Design System:
  - Primary Color: emerald-600 (hover: emerald-700, active: emerald-800)
  - Secondary: cyan-600, teal-500
  - Dark BG: bg-slate-900/95, bg-slate-800/50
  - Glass Effect: backdrop-blur-xl border-emerald-500/30
  - Text: white → emerald-100 → emerald-200/70
  - Inputs: bg-slate-800/50 text-white border-emerald-500/30 focus:ring-emerald-500

**Task:**
Your task is to refactor the following React page component to be **fully responsive for mobile (iPhone), tablet (iPad), and desktop**. The final code must be clean, maintainable, and follow Tailwind's **mobile-first best practices**.

**Page to Refactor:**
src/pages/Login.jsx

**The Problem:**
This page's current styling is not mobile-first and breaks on small screens. The layout may overflow, elements are cropped, or text is too large.

**Critical Requirements:**

1. **Mobile-First Approach (MANDATORY):**
   - Base utility classes (no prefix) apply to mobile (375px+)
   - Use `sm:` prefix for tablets (640px+)
   - Use `md:` prefix for tablets/small laptops (768px+)
   - Use `lg:` prefix for desktops (1024px+)
   - Use `xl:` prefix for large desktops (1280px+)
   - **Never use `max-width` media queries** - only `min-width`

2. **Use ONLY Tailwind Utility Classes:**
   - Convert ALL styling to inline Tailwind utilities in the `className` props
   - Do NOT use `@apply`, custom CSS, or separate CSS files
   - Do NOT use hardcoded pixel values or custom styles

3. **No Horizontal Overflow:**
   - The final layout must NOT have any horizontal scrolling on 375px width (iPhone SE)
   - All text must wrap correctly
   - All padding and margins must scale with viewport
   - Images must be responsive and constrained

4. **Preserve All Functionality:**
   - Keep ALL React hooks, state management, and `onClick` handlers identical
   - Only modify `className` props and HTML structure if necessary
   - Do NOT remove any JSX elements unless absolutely necessary for layout
   - Do NOT change component logic or data flow

5. **Accessibility & UX:**
   - Buttons must be at least 44px in height (mobile touch target)
   - Form inputs must have proper labels and error states
   - Text should be readable at all sizes (min 12px on mobile)
   - Maintain proper spacing and visual hierarchy

**Current Page Code:**
```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      const errorMsg = err.message || 'Failed to log in';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google! 🚀');
      navigate('/');
    } catch (err) {
      console.error('Google sign-in error', err);
      const errorMsg = err.message || 'Google sign-in failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email) {
      toast.error('Please enter your email to reset password');
      return setError('Please enter your email to reset password');
    }
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! 📧');
      setResetMessage('Password reset email sent. Check your inbox.');
      setForgotMode(false);
    } catch (err) {
      console.error('Reset password error', err);
      const errorMsg = err.message || 'Failed to send reset email';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Log In</h2>
        
        {error && (
          <div className="p-3 bg-red-500/20 text-red-200 rounded-md mb-4 border border-red-500/30">
            {error}
          </div>
        )}
        
        {!forgotMode ? (
          // Normal Login Mode
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-emerald-100 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-emerald-100 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors mb-4 block"
            >
              Forgot password?
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 disabled:bg-slate-600 transition-all duration-75 font-medium min-h-[48px]"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
        ) : (
          // Forgot Password Mode
          <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
            <div className="mb-4">
              <label className="block text-emerald-100 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                required
              />
            </div>
            {resetMessage && (
              <div className="text-sm text-emerald-300 mb-4 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                {resetMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 active:bg-cyan-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 disabled:bg-slate-600 transition-all duration-75 font-medium min-h-[48px] mb-3"
            >
              {loading ? 'Sending...' : 'Send reset email'}
            </button>
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="w-full text-emerald-400 hover:text-emerald-300 transition-colors py-2 text-sm border border-emerald-500/30 rounded-lg hover:bg-emerald-500/5"
            >
              Back to login
            </button>
          </form>
        )}
        
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-2 border border-emerald-500/30 py-2 px-4 rounded-lg hover:bg-emerald-500/10 disabled:opacity-60 text-white transition-colors"
          >
            {/* Inline Google logo to avoid external asset dependency */}
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.3H272v95.3h147.5c-6.4 34.7-25 64.1-53.4 83.7v69.6h86.2c50.4-46.4 81.2-115 81.2-198.3z"/>
              <path fill="#34a853" d="M272 544.3c72.6 0 133.7-24 178.3-65.2l-86.2-69.6c-24 16.1-54.7 25.6-92.1 25.6-70.7 0-130.6-47.8-152-112.1H31.6v70.6C75.9 486 167.6 544.3 272 544.3z"/>
              <path fill="#fbbc04" d="M120 323.1c-10.7-31.5-10.7-65.6 0-97.1V155.4H31.6c-39.3 77.6-39.3 169.1 0 246.7L120 323.1z"/>
              <path fill="#ea4335" d="M272 107.7c39 0 74 13.4 101.6 39.6l76.1-76.1C401.1 24.3 342 0 272 0 167.6 0 75.9 58.3 31.6 145.6l88.4 70.4C141.4 155.5 201.3 107.7 272 107.7z"/>
            </svg>
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
        </div>
        
        <p className="text-center text-emerald-200/60 text-sm mt-6">
          Don't have an account? 
          {/* Use Link instead of <a> for internal app navigation */}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 ml-1 transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
```

**Please provide:**
1. The **complete, refactored JSX code** (single code block, ready to copy-paste)
2. A **brief summary** of the changes made (list of key responsive adjustments)

**Do NOT:**
- Break the component logic
- Remove or add new React hooks
- Change state management
- Use custom CSS or @apply
- Use hardcoded sizes or max-width media queries
```

---

## After You Get the Response

1. Copy the refactored code from Copilot
2. Open `src/pages/Login.jsx` in your editor
3. Replace ALL the code with the response
4. Save the file
5. Check your terminal for any errors
6. Test in your browser at mobile (375px), tablet (768px), and desktop (1024px+)

---

## Tips

- The response will likely include responsive classes like `text-sm md:text-lg` instead of hardcoded sizes
- Padding/margins will use classes like `p-4 md:p-6` instead of fixed values
- The form card will constrain itself with `max-w-md md:max-w-lg` or similar
- The heading will use `text-2xl md:text-3xl` for responsive sizing
- Buttons will maintain `min-h-[48px]` or `min-h-12` for touch targets

Good luck! 🚀
