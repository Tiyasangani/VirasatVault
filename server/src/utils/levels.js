// Contributor level from points. Keep in sync with the badge list in the client (data/admin.js).
const LEVELS = [['Top Contributor', 500], ['Verified Researcher', 250], ['Community Historian', 100], ['Heritage Contributor', 10]]
export const levelFor = (points) => LEVELS.find(([, min]) => points >= min)?.[0] ?? 'New member'
