import { useContext } from 'react'
import { BranchIntelContext } from './branchIntelContext'

export function useBranchIntel() {
  const ctx = useContext(BranchIntelContext)
  if (!ctx) throw new Error('useBranchIntel must be used within BranchIntelProvider')
  return ctx
}
