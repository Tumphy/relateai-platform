import React, { useState } from 'react';
import { emailService } from '@/lib/api';
import toast from 'react-hot-toast';

interface EmailTestFormProps {
  onSuccess?: (messageId: string) => void;
}

const EmailTestForm: React.FC<EmailTestFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.to || !formData.subject || !formData.content) {
        throw new Error('Please fill out all fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.to)) {
        throw new Error('Please enter a valid email address');
      }

      // Send test email
      const response = await emailService.sendTestEmail(
        formData.to,
        formData.subject,
        formData.content
      );

      if (response.data.success) {
        toast.success('Test email sent successfully!');
        if (onSuccess && response.data.messageId) {
          onSuccess(response.data.messageId);
        }
        
        // Clear form
        setFormData({
          to: '',
          subject: '',
          content: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to send test email');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="recipient@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Email Subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter your email content here..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white font-medium rounded-md ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          This will send a test email with tracking enabled. You can use this to test the email delivery and tracking functionality.
        </p>
      </div>
    </div>
  );
};

export default EmailTestForm;