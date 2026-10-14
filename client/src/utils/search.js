// Searching itself happens on the server (GET /api/search). This file keeps the UI helpers.
export const suggestionTerms = ['Gondal', 'Stepwell', 'Navratri', 'Block printing', 'Folk stories', 'Temples in Rajkot', 'Bajra rotla']

export function groupResults(results) {
  return results.reduce((acc, r) => {
    ;(acc[r.group] ||= []).push(r)
    return acc
  }, {})
}
