'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Upload, Users, Briefcase } from 'lucide-react';

export default function WorkspaceSetupPage() {
  const [step, setStep] = useState<number>(1);
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    logo: null,
    inviteEmails: '',
    startOption: '', // 'upload' or 'create'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setWorkspaceData({
      ...workspaceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStartOptionSelect = (option: string) => {
    setWorkspaceData({
      ...workspaceData,
      startOption: option,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Here you would typically send the workspace data to your API
      console.log('Workspace setup completed:', workspaceData);
      // Redirect to dashboard
      window.location.href = '/dashboard';
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
              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="text-sm font-medium text-neutral-700 hover:text-primary-600"
              >
                Skip setup for now
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 w-full max-w-xl">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-500">Step {step} of 3</span>
              <div className="w-full mx-4 bg-neutral-200 rounded-full h-1.5">
                <div
                  className="bg-primary-600 h-1.5 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Workspace details */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Set up your workspace</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="label">Workspace name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={workspaceData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Your company or team name"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Workspace logo (optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-neutral-300 rounded-md hover:border-primary-300 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-neutral-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-neutral-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Invite Team Members */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Invite your team</h2>
                <p className="text-neutral-600 mb-6">Invite team members to collaborate on accounts, campaigns and messaging.</p>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="inviteEmails" className="label">Email addresses</label>
                    <textarea
                      id="inviteEmails"
                      name="inviteEmails"
                      rows={4}
                      className="input"
                      placeholder="Enter email addresses separated by commas"
                      value={workspaceData.inviteEmails}
                      onChange={handleInputChange}
                    ></textarea>
                    <p className="mt-1 text-xs text-neutral-500">
                      Team members will get an email with instructions to join your workspace.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-sm text-neutral-600 hover:text-primary-600"
                    >
                      Skip for now
                    </button>
                    
                    <button
                      type="submit"
                      className="btn-primary py-2 px-4"
                    >
                      Send invites & continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Get Started Options */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Let's get started</h2>
                <p className="text-neutral-600 mb-6">Choose how you'd like to begin with RelateAI:</p>
                
                <div className="space-y-4">
                  {/* Upload accounts option */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50 ${
                      workspaceData.startOption === 'upload' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                    }`}
                    onClick={() => handleStartOptionSelect('upload')}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Upload className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-neutral-900">Upload your account list</h3>
                        <p className="mt-1 text-sm text-neutral-600">
                          Import your existing accounts and contacts from a CSV or Excel file
                        </p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <input
                          type="radio"
                          name="startOption"
                          value="upload"
                          checked={workspaceData.startOption === 'upload'}
                          onChange={() => handleStartOptionSelect('upload')}
                          className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Create from scratch option */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50 ${
                      workspaceData.startOption === 'create' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                    }`}
                    onClick={() => handleStartOptionSelect('create')}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-neutral-900">Create an account from scratch</h3>
                        <p className="mt-1 text-sm text-neutral-600">
                          Start with a blank slate and add accounts and contacts manually
                        </p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <input
                          type="radio"
                          name="startOption"
                          value="create"
                          checked={workspaceData.startOption === 'create'}
                          onChange={() => handleStartOptionSelect('create')}
                          className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* AI integration option */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50 ${
                      workspaceData.startOption === 'ai' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                    }`}
                    onClick={() => handleStartOptionSelect('ai')}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                          AI
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-neutral-900">Let AI find accounts for you</h3>
                        <p className="mt-1 text-sm text-neutral-600">
                          Describe your ideal customer profile and we'll suggest matching accounts
                        </p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <input
                          type="radio"
                          name="startOption"
                          value="ai"
                          checked={workspaceData.startOption === 'ai'}
                          onChange={() => handleStartOptionSelect('ai')}
                          className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit button - always at bottom except for step 2 which has its own */}
            {step !== 2 && (
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full btn-primary py-2.5"
                  disabled={step === 3 && !workspaceData.startOption}
                >
                  {step === 3 ? 'Get Started' : 'Continue'}
                </button>
              </div>
            )}
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