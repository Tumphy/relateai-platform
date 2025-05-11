'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically authenticate the user
    console.log('Login form submitted:', formData);
    // Redirect to dashboard on successful login
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-full.svg"
                  width={140}
                  height={32}
                  alt="RelateAI"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <nav>
              <Link href="/signup" className="text-sm font-medium text-neutral-700 hover:text-primary-600">
                Need an account? <span className="text-primary-600">Sign up</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-neutral-600 mt-2">Log in to access your RelateAI dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="you@company.com"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="label">Password</label>
                  <a href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full btn-primary py-2.5"
              >
                Log in
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-neutral-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <div className="h-5 w-5 bg-neutral-200 rounded-full"></div>
                  Google
                </a>

                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <div className="h-5 w-5 bg-neutral-200 rounded-full"></div>
                  Microsoft
                </a>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} RelateAI. All rights reserved.
            <div className="mt-1 space-x-4">
              <a href="#" className="hover:text-neutral-700">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-700">Terms of Service</a>
              <a href="#" className="hover:text-neutral-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}