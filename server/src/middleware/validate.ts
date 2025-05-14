import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate (body, query, params)
 * @returns Express middleware function
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data against the schema
      const validatedData = await schema.parseAsync(req[source]);
      
      // Replace the request data with the validated data
      req[source] = validatedData;
      
      // Continue to the next middleware
      return next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        success: false,
        message: 'Internal server error during validation',
        error: (error as Error).message
      });
    }
  };
};

export default validate;
