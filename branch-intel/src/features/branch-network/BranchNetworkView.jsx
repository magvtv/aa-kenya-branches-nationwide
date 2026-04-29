import { useCallback, useMemo } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useBranchIntel } from '../../app/useBranchIntel'
import './BranchNetworkView.css'

function nodeColor(node, selectedId, branches, branchMatches) {
  const branch = branches.find((b) => b.branchId === node.id)
  const dimmed =
    node.category !== 'hq' && branch && !branchMatches(branch)
  let base =
    node.category === 'hq'
      ? '#00512f'
      : node.category === 'flagship'
        ? '#00643a'
        : '#c2a700'
  if (dimmed) base = '#6b7280'
  if (selectedId === node.id) return '#f3d109'
  return base
}

export function BranchNetworkView({ branches, branchMatches }) {
  const { hq, graphLinks, selectedId, selectById } = useBranchIntel()

  const graphData = useMemo(() => {
    const nodes = [
      {
        id: hq.id,
        name: hq.name,
        category: 'hq',
        services: [],
      },
      ...branches.map((b) => ({
        id: b.branchId,
        name: b.name,
        category: b.category,
        services: b.services,
      })),
    ]
    const nodeIds = new Set(nodes.map((n) => n.id))
    const links = graphLinks
      .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
      .map((l) => ({
        source: l.source,
        target: l.target,
      }))
    return { nodes, links }
  }, [hq, branches, graphLinks])

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const label = node.name
      const fontSize = 12 / globalScale
      ctx.font = `${fontSize}px ${getComputedStyle(document.documentElement).fontFamily || 'sans-serif'}`
      const radius = node.category === 'hq' ? 10 : 7
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = nodeColor(node, selectedId, branches, branchMatches)
      ctx.fill()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-h').trim() || '#111'
      ctx.fillText(label, node.x, node.y + radius + 2 / globalScale)
    },
    [selectedId, branchMatches, branches],
  )

  return (
    <div className="branch-network">
      <ForceGraph2D
        className="branch-network__canvas"
        graphData={graphData}
        nodeId="id"
        linkDirectionalArrowLength={0}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color
          const r = node.category === 'hq' ? 12 : 9
          ctx.beginPath()
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false)
          ctx.fill()
        }}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={paintNode}
        onNodeClick={(node) => selectById(node.id)}
        cooldownTicks={120}
        d3VelocityDecay={0.25}
        linkWidth={1}
        linkColor={() => '#7a8f83'}
      />
    </div>
  )
}
