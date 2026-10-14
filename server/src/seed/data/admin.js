import { IMG } from './images.js'

export const seedContributions = [
  { id: 'c1', title: 'Kalyan Rai Temple Steps, Jetpur', category: 'Historical Places', contributor: 'Nilesh Dave', village: 'Jetpur', district: 'Rajkot', submitted: '2026-10-02', status: 'Pending', period: 'Medieval (1200–1750)', description: 'The temple steps lead down to the Bhadar and have carved panels on both sides. My family has lived next to them for four generations and my grandfather said the lower panels were added after a flood.', images: [IMG.templeTwo, IMG.village], sources: 'Family oral tradition; photographs taken in 2024.', reference: 'None yet, requesting help to find local records.', extra: 'Priest has agreed to be interviewed.', adminNote: '' },
  { id: 'c2', title: 'Pattern Books of the Solanki Workshop', category: 'Handicrafts', contributor: 'Bhavna Solanki', village: 'Jetpur', district: 'Rajkot', submitted: '2026-09-28', status: 'Under Review', period: 'Princely era (1750–1947)', description: 'Scanned pages from three hand-drawn pattern books used in our family workshop, with notes on which blocks were cut from which designs.', images: [IMG.craft], sources: 'Family archive, original books in the workshop.', reference: 'Book 2 includes dated entries from the 1940s.', extra: 'Scans available at higher resolution.', adminNote: 'Checking dated entries with another printer.' },
  { id: 'c3', title: 'The Founding of the Dhoraji Well Committee', category: 'Historical Stories', contributor: 'Ramesh Vaghela', village: 'Dhoraji', district: 'Rajkot', submitted: '2026-09-20', status: 'Changes Requested', period: 'Modern (after 1947)', description: 'A summary of how the residents formed a committee to repair the stepwell, including names of volunteers.', images: [IMG.stepwell], sources: 'Committee notebook.', reference: '', extra: '', adminNote: 'Please add dates and the notebook’s page references.' },
  { id: 'c4', title: 'Palace Gate Photograph, Wankaner (1930s)', category: 'Old Photographs', contributor: 'Hetal Gohil', village: 'Wankaner', district: 'Morbi', submitted: '2026-09-15', status: 'Pending', period: 'Princely era (1750–1947)', description: 'A black and white photograph of the palace gate with a procession. Printed on the back is a studio name and a partial date.', images: [IMG.palaceTwo], sources: 'Photograph from my late grandfather’s album.', reference: 'Studio stamp on reverse.', extra: 'I can scan the back of the print.', adminNote: '' },
  { id: 'c5', title: 'The Legend of the Hundred Steps', category: 'Folk Stories', contributor: 'Anonymous visitor', village: 'Morbi', district: 'Morbi', submitted: '2026-09-10', status: 'Rejected', period: 'Living tradition', description: 'A story claiming a hidden treasure under the steps of a local temple.', images: [], sources: 'Heard from friends.', reference: '', extra: '', adminNote: 'No source or contributor details provided; cannot be verified.' },
]

export const seedReports = [
  { id: 'r1', target: 'Old Stepwell of XYZ Village', reason: 'Incorrect information', detail: 'The inscription is said to be from 1620 but the stone is damaged. Date should be shown as uncertain.', reporter: 'Hetal Gohil', date: '2026-10-03', status: 'Open' },
  { id: 'r2', target: 'Mani Mandir, Morbi', reason: 'Wrong location', detail: 'The marker is slightly north of the temple.', reporter: 'Dipti Raval', date: '2026-09-29', status: 'Open' },
  { id: 'r3', target: 'The Night the River Rose', reason: 'Copyright issue', detail: 'The lead photograph looks like it was taken from a news website.', reporter: 'Meera Joshi', date: '2026-09-21', status: 'Resolved' },
]

export const seedUsers = [
  { id: 'u1', name: 'Meera Joshi', email: 'meera@example.com', village: 'Gondal', role: 'Community Historian', contributions: 14, joined: '2025-11-02' },
  { id: 'u2', name: 'Ramesh Vaghela', email: 'ramesh@example.com', village: 'Dhoraji', role: 'Top Contributor', contributions: 22, joined: '2025-10-18' },
  { id: 'u3', name: 'Bhavna Solanki', email: 'bhavna@example.com', village: 'Jetpur', role: 'Heritage Contributor', contributions: 6, joined: '2026-02-11' },
  { id: 'u4', name: 'Kishan Zala', email: 'kishan@example.com', village: 'Wankaner', role: 'Verified Researcher', contributions: 9, joined: '2026-01-05' },
  { id: 'u5', name: 'Dipti Raval', email: 'dipti@example.com', village: 'Morbi', role: 'Heritage Contributor', contributions: 5, joined: '2026-03-19' },
]

export const seedNotifications = [
  { id: 'n1', type: 'approved', text: 'Your heritage submission “Stepwell Steps at Dusk” was approved.', time: '2026-10-06T09:30:00', read: false },
  { id: 'n2', type: 'comment', text: 'Hetal Gohil commented on your story “The Well That Never Ran Dry”.', time: '2026-10-05T18:10:00', read: false },
  { id: 'n3', type: 'like', text: '12 people liked your heritage post “Old Gateway of Dhoraji”.', time: '2026-10-05T11:00:00', read: false },
  { id: 'n4', type: 'district', text: 'New heritage has been added from your district: Block Printing and Dyeing of Jetpur.', time: '2026-10-03T14:20:00', read: true },
  { id: 'n5', type: 'event', text: 'Navratri Garba Evenings in Wankaner begins in four days.', time: '2026-10-02T08:00:00', read: true },
  { id: 'n6', type: 'changes', text: 'Your contribution “The Founding of the Dhoraji Well Committee” requires changes.', time: '2026-09-30T16:45:00', read: true },
]

export const BADGES = [
  { name: 'Heritage Contributor', points: 10, text: 'First approved contribution' },
  { name: 'Community Historian', points: 100, text: 'Ten or more approved records' },
  { name: 'Verified Researcher', points: 250, text: 'Records cited with strong sources' },
  { name: 'Top Contributor', points: 500, text: 'Among the most active in your district' },
]
export const REPORT_REASONS = ['Incorrect information', 'Wrong location', 'Fake image', 'Copyright issue', 'Offensive content', 'Other']
export const REVIEW_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Changes Requested']
