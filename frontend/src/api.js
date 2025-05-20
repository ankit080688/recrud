// Determine the backend API base URL.
// If REACT_APP_API_BASE is provided at build time (e.g. via webpack DefinePlugin
// or env substitution), use it; otherwise fall back to localhost.
const envBase =
  typeof process !== 'undefined' && process.env
    ? process.env.REACT_APP_API_BASE
    : undefined;

export const API_BASE = envBase || 'http://localhost:5000';

