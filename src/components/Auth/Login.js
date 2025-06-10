import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Mock API call
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: '1',
          username: email.split('@')[0],
          email,
          role: 'admin'
        })
      );

      toast.success('Login successful!');
      // Hard redirect so our router will re-evaluate auth and land on /dashboard
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold">
          Sign in to Tractor Sales
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm">Email Address</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
