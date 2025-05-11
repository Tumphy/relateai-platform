'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    jobTitle: '',
    teamSize: '',
    goals: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setFormData({
        ...formData,
        goals: [...formData.goals, value],
      });
    } else {
      setFormData({
        ...formData,
        goals: formData.goals.filter(goal => goal !== value),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Here you would typically send the form data to your API
      console.log('Form submitted:', formData);
      // Redirect to workspace setup or dashboard
      window.location.href = '/workspace-setup';
    }
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
              <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-primary-600">
                Already have an account? <span className="text-primary-600">Log in</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 w-full max-w-md">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < step ? 'bg-primary-600 text-white' : 
                      i === step ? 'border-2 border-primary-600 text-primary-600' : 
                      'border border-neutral-300 text-neutral-400'
                    }`}
                  >
                    {i < step ? '✓' : i}
                  </div>
                  <div 
                    className={`text-xs mt-1 ${
                      i <= step ? 'text-primary-600' : 'text-neutral-400'
                    }`}
                  >
                    {i === 1 ? 'Account' : i === 2 ? 'Profile' : 'Goals'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between px-4">
              <div className="h-1 w-full bg-primary-600"></div>
              <div className={`h-1 w-full ${step >= 2 ? 'bg-primary-600' : 'bg-neutral-200'}`}></div>
              <div className={`h-1 w-full ${step >= 3 ? 'bg-primary-600' : 'bg-neutral-200'}`}></div>
            </div>
          </div>

          {/* Back button (for steps 2 and 3) */}
          {step > 1 && (
            <button 
              type="button"
              onClick={() => setStep(step - 1)}
              className="mb-4 flex items-center text-sm text-neutral-600 hover:text-primary-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Create your account</h2>
                
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
                    <label htmlFor="password" className="label">Password</label>
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
                    <p className="mt-1 text-xs text-neutral-500">
                      Must be at least 8 characters with one uppercase letter and one number
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="label">Confirm password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    By continuing, you agree to our <a href="#" className="text-primary-600">Terms</a> and <a href="#" className="text-primary-600">Privacy Policy</a>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Profile Information */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Your profile</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="label">Full name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="John Smith"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="companyName" className="label">Company name</label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Acme Inc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="jobTitle" className="label">Job title</label>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Founder & CEO"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="teamSize" className="label">Team size</label>
                    <select
                      id="teamSize"
                      name="teamSize"
                      required
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="" disabled>Select your team size</option>
                      <option value="solo">Just me</option>
                      <option value="2-10">2-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201+">201+ employees</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Goals and Interests */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Your goals</h2>
                <p className="text-neutral-600 mb-6">What are you looking to accomplish with RelateAI? Select all that apply:</p>
                
                <div className="space-y-3">
                  {[
                    { id: 'goal1', value: 'save-time', label: 'Save time on research and outreach' },
                    { id: 'goal2', value: 'better-responses', label: 'Improve email response rates' },
                    { id: 'goal3', value: 'qualify-leads', label: 'Better qualify leads and opportunities' },
                    { id: 'goal4', value: 'find-prospects', label: 'Find more qualified prospects' },
                    { id: 'goal5', value: 'track-pipeline', label: 'Track my sales pipeline better' },
                    { id: 'goal6', value: 'integrate-tools', label: 'Integrate with my existing tools' }
                  ].map((goal) => (
                    <div key={goal.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={goal.id}
                          name="goals"
                          type="checkbox"
                          value={goal.value}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={goal.id} className="font-medium text-neutral-700">
                          {goal.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <label htmlFor="additional-info" className="label">Anything else you'd like us to know?</label>
                  <textarea
                    id="additional-info"
                    name="additionalInfo"
                    rows={3}
                    className="input"
                    placeholder="Any specific features you're looking for, or challenges you're facing..."
                  ></textarea>
                </div>
              </>
            )}

            {/* Submit button */}
            <div className="mt-8">
              <button
                type="submit"
                className="w-full btn-primary py-2.5"
              >
                {step < 3 ? 'Continue' : 'Create Account'}
              </button>
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