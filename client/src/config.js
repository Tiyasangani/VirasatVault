// Settings that change between development and the live site (see .env.example).
export const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'contact@yourdomain.com'
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'VirasatVault'
export const TAGLINE = 'Every Place Has a Past. Every Story Deserves a Future.'
export const DESCRIPTION = 'A digital platform to discover, document, and preserve cultural heritage, village histories, and local traditions.'
