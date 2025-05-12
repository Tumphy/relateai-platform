import { z } from 'zod';

// User registration validation schema
export const registrationSchema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().min(1, 'Company name is required'),
});

// User login validation schema
export const loginSchema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Validate user registration
export const validateRegistration = (data: unknown) => {
  try {
    registrationSchema.parse(data);
    return { error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: {
          details: [{ message: error.errors[0].message }]
        }
      };
    }
    return {
      error: {
        details: [{ message: 'Invalid input data' }]
      }
    };
  }
};

// Validate user login
export const validateLogin = (data: unknown) => {
  try {
    loginSchema.parse(data);
    return { error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: {
          details: [{ message: error.errors[0].message }]
        }
      };
    }
    return {
      error: {
        details: [{ message: 'Invalid input data' }]
      }
    };
  }
};