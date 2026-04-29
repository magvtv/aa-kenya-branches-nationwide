import { haversineKm } from '../../shared/lib/haversine'

const WEIGHT_DISTANCE = 0.45
const WEIGHT_LOAD = 0.4
/** Points subtracted from raw score when branch is flagship (lower score is better). */
const FLAGSHIP_SCORE_BONUS = 5

/**
 * Lower score is better. Requires branch to offer `requiredService`.
 */
export function scoreBranch(branch, userLat, userLon, requiredService) {
  if (!branch.services.includes(requiredService)) return Number.POSITIVE_INFINITY
  const distKm = haversineKm(userLat, userLon, branch.lat, branch.lon)
  const load = branch.loadPercent ?? 50
  const flagshipAdj = branch.category === 'flagship' ? -FLAGSHIP_SCORE_BONUS : 0
  return distKm * WEIGHT_DISTANCE + load * WEIGHT_LOAD + flagshipAdj
}

/**
 * Returns top branches sorted by score ascending with breakdown for display.
 */
export function findBestBranches(branches, userLat, userLon, requiredService, limit = 3) {
  const rows = branches
    .filter((b) => b.services.includes(requiredService))
    .map((b) => {
      const distKm = haversineKm(userLat, userLon, b.lat, b.lon)
      const score = scoreBranch(b, userLat, userLon, requiredService)
      return {
        branch: b,
        distKm,
        score,
        loadPercent: b.loadPercent ?? 50,
      }
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)

  return rows
}
