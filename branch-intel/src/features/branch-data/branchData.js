import branchModel from '../../data/branch-model.json'
import extraBranches from '../../data/aak-branches.json'

/**
 * Merge supplemental branch rows when `aak-branches.json` contains a non-empty list.
 * Expected shape: `{ "branches": [ ... ] }` matching branch objects from branch-model.
 */
function mergeBranches(baseBranches, extra) {
  if (!extra || typeof extra !== 'object') return baseBranches
  const list = extra.branches
  if (!Array.isArray(list) || list.length === 0) return baseBranches
  const seen = new Set(baseBranches.map((b) => b.branchId))
  const merged = [...baseBranches]
  for (const row of list) {
    if (row && row.branchId && !seen.has(row.branchId)) {
      merged.push(row)
      seen.add(row.branchId)
    }
  }
  return merged
}

/**
 * Returns normalized intel bundle used by map, graph, and recommendation layers.
 */
export function getBranchIntelData() {
  const hq = { ...branchModel.hq }
  if (!hq.address) {
    hq.address = 'Renaissance Corporate Park, Upper Hill, Nairobi'
  }
  const serviceCatalog = [...branchModel.services]
  const branches = mergeBranches([...branchModel.branches], extraBranches)
  const rawLinks = Array.isArray(branchModel.links) ? branchModel.links : []

  const graphLinks = rawLinks.map((l) => ({
    source: String(l.source),
    target: String(l.target),
    type: l.type ?? 'RELATED',
    distanceKm: l.distance_km ?? l.distanceKm,
  }))

  return {
    hq,
    serviceCatalog,
    branches,
    graphLinks,
  }
}
