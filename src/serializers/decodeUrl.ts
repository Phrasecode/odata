import { parse } from 'qs';

interface IDecodeUrlResponse {
  fullPath: string;
  path: string;
  basepath: string;
  queryParams: Record<string, unknown>;
}

export const decodeUrl = (url: string): IDecodeUrlResponse => {
  validatePath(url);
  const trimmedUrl = url.trim();
  // Decode only once to prevent double-decoding bypass attacks
  const formatedUrl = trimmedUrl.startsWith('/')
    ? decodeURIComponent(trimmedUrl.substring(1))
    : decodeURIComponent(trimmedUrl);

  const urlParts = formatedUrl.split('?');
  const queryParams = urlParts[1];
  const path = urlParts[0];
  const basepath = path.split('/')[0];

  // Remove trailing slash without re-decoding
  const fullPath = formatedUrl.endsWith('/')
    ? formatedUrl.slice(0, -1)
    : formatedUrl;

  return {
    fullPath,
    path,
    queryParams: parse(queryParams) || {},
    basepath,
  };
};

export function validatePath(path: string): void {
  // Check if empty
  if (!path || typeof path !== 'string') {
    throw new Error('Path is required');
  }

  // Check for any schema (http://, https://, ftp://, ws://, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(path)) {
    throw new Error('Full URL not supported. Provide path only (e.g., /products?id=123)');
  }

  // Check for protocol-relative URLs (//example.com)
  if (path.startsWith('//')) {
    throw new Error('Full URL not supported. Provide path only (e.g., /products?id=123)');
  }
}
