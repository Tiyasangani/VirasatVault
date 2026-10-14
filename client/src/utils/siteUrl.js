// Address used inside QR codes. Set VITE_SITE_URL to your real domain when you deploy,
// so QR codes made on a laptop still point to the public site.
export const siteUrl = () => (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
export const heritageUrl = (slug) => `${siteUrl()}/heritage/${slug}`
