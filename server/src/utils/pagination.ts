import { Request } from 'express';

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    next?: number;
    prev?: number;
  };
}

/**
 * Parse pagination parameters from request query
 * @param req Express Request object
 * @param options Pagination options
 * @returns Parsed pagination parameters
 */
export const getPaginationParams = (
  req: Request,
  options: PaginationOptions = {}
): { page: number; limit: number; skip: number } => {
  // Default options
  const defaultLimit = options.defaultLimit || 10;
  const maxLimit = options.maxLimit || 100;
  
  // Parse page and limit from query parameters
  let page = parseInt(req.query.page as string) || options.page || 1;
  let limit = parseInt(req.query.limit as string) || options.limit || defaultLimit;
  
  // Validate page and limit
  page = page > 0 ? page : 1;
  limit = limit > 0 ? (limit <= maxLimit ? limit : maxLimit) : defaultLimit;
  
  // Calculate skip for MongoDB
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Create paginated response
 * @param data Array of items for current page
 * @param total Total number of items
 * @param page Current page
 * @param limit Items per page
 * @returns Paginated result object
 */
export const paginateResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  // Calculate total pages
  const pages = Math.ceil(total / limit) || 1;
  
  // Determine if there are next/previous pages
  const hasNext = page < pages;
  const hasPrev = page > 1;
  
  // Create paginated response
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext,
      hasPrev,
      next: hasNext ? page + 1 : undefined,
      prev: hasPrev ? page - 1 : undefined
    }
  };
};

/**
 * Generate MongoDB query for pagination
 * @param paginationParams Pagination parameters
 * @returns MongoDB query options
 */
export const paginationQuery = (
  { skip, limit }: { skip: number; limit: number }
) => {
  return {
    skip,
    limit
  };
};

/**
 * Generate pagination links for API response headers
 * @param req Express Request object
 * @param total Total number of items
 * @param page Current page
 * @param limit Items per page
 * @returns Object with Link header and X-Total-Count header
 */
export const paginationLinks = (
  req: Request,
  total: number,
  page: number,
  limit: number
): { 'Link': string; 'X-Total-Count': string } => {
  // Calculate total pages
  const pages = Math.ceil(total / limit) || 1;
  
  // Get base URL
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  
  // Create query parameters without page and limit
  const query = { ...req.query };
  delete query.page;
  delete query.limit;
  
  // Convert query to string
  const queryString = Object.keys(query)
    .map(key => `${key}=${query[key as keyof typeof query]}`)
    .join('&');
  
  // Create base URL with query parameters
  const url = queryString ? `${baseUrl}?${queryString}&` : `${baseUrl}?`;
  
  // Create links array
  const links = [];
  
  // Add first page link
  links.push(`<${url}page=1&limit=${limit}>; rel="first"`);
  
  // Add previous page link if available
  if (page > 1) {
    links.push(`<${url}page=${page - 1}&limit=${limit}>; rel="prev"`);
  }
  
  // Add next page link if available
  if (page < pages) {
    links.push(`<${url}page=${page + 1}&limit=${limit}>; rel="next"`);
  }
  
  // Add last page link
  links.push(`<${url}page=${pages}&limit=${limit}>; rel="last"`);
  
  // Return headers
  return {
    'Link': links.join(', '),
    'X-Total-Count': total.toString()
  };
};

export default {
  getPaginationParams,
  paginateResponse,
  paginationQuery,
  paginationLinks
};
