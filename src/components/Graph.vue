<template>
  <div style="width: 100%; height: 100%; position: relative">
    <!-- Canvas Container -->
    <div ref="containerEl" style="width: 100%; height: 100%" />

    <!-- Path Mode Button (overlay) -->
    <button
      :class="['path-mode-btn', { active: pathModeActive }]"
      @click="pathModeActive = !pathModeActive"
      :title="$t('graph.pathMode.clickFirst')"
    >
      {{ $t('graph.pathButton') }}
    </button>

    <!-- Path Status Display (overlay) -->
    <div v-if="pathModeActive" class="path-status">
      <span v-if="!pathStart">{{ $t('graph.pathMode.clickFirst') }}</span>
      <span v-else-if="!pathEnd">{{ $t('graph.pathMode.clickSecond') }}</span>
      <span v-else-if="currentPath.size > 0">{{
        $t('graph.pathMode.pathFound', { count: currentPath.size })
      }}</span>
      <span v-else-if="pathNotFound" class="no-path">{{ $t('graph.pathMode.noPath') }}</span>
    </div>

    <!-- No Path Found Overlay -->
    <div v-if="pathNotFound && pathModeActive" class="no-path-overlay">
      <div class="no-path-message">{{ $t('graph.pathMode.noPath') }}</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
  import ForceGraph from 'force-graph'
  import { TYPE_COLORS, DEFAULT_COLOR } from '../utils/types'

  const props = defineProps({
    data: { type: Object, default: () => ({ nodes: [], links: [] }) },
    selectedSlug: { type: String, default: null },
    filterQuery: { type: String, default: '' },
  })
  const emit = defineEmits(['select'])

  const containerEl = ref(null)
  let fg = null

  const pathModeActive = ref(false)
  const pathStart = ref(null)
  const pathEnd = ref(null)
  const currentPath = ref(new Set())
  const pathLinkIds = ref(new Set())
  const pathNotFound = ref(false)

  // Pre-compute matching node slugs instead of searching per render
  const matchingNodeSlugs = computed(() => {
    const query = props.filterQuery?.trim().toLowerCase()
    if (!query) return new Set()
    return new Set(
      props.data.nodes.filter((n) => n.title.toLowerCase().includes(query)).map((n) => n.slug)
    )
  })

  function getNodeSlug(endpoint) {
    return typeof endpoint === 'string' ? endpoint : endpoint?.slug
  }

  function generateLinkKey(sourceSlug, targetSlug) {
    // Stable key for undirected edges (always sorted order)
    const sorted = [sourceSlug, targetSlug].sort()
    return sorted.join('→')
  }

  function buildAdjacencyList(links) {
    const adj = new Map()
    for (const link of links) {
      const source = getNodeSlug(link.source)
      const target = getNodeSlug(link.target)
      if (!source || !target) continue

      if (!adj.has(source)) adj.set(source, [])
      if (!adj.has(target)) adj.set(target, [])

      adj.get(source).push({ slug: target, linkKey: generateLinkKey(source, target) })
      adj.get(target).push({ slug: source, linkKey: generateLinkKey(source, target) })
    }
    return adj
  }

  function runBFS(startSlug, endSlug) {
    if (!startSlug || !endSlug || startSlug === endSlug) {
      currentPath.value = new Set()
      pathLinkIds.value = new Set()
      return
    }

    const adj = buildAdjacencyList(props.data.links)
    const visited = new Set()
    const predecessors = new Map()
    const queue = [startSlug]
    visited.add(startSlug)

    let found = false
    while (queue.length > 0 && !found) {
      const current = queue.shift()
      if (current === endSlug) {
        found = true
        break
      }

      const neighbors = adj.get(current) || []
      for (const { slug: neighbor } of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          predecessors.set(neighbor, current)
          queue.push(neighbor)
        }
      }
    }

    if (!found) {
      currentPath.value = new Set()
      pathLinkIds.value = new Set()
      pathNotFound.value = true
      return
    }

    const path = []
    let node = endSlug
    while (node) {
      path.unshift(node)
      node = predecessors.get(node)
    }

    const linkIds = new Set()
    for (let i = 0; i < path.length - 1; i++) {
      const key = generateLinkKey(path[i], path[i + 1])
      linkIds.add(key)
    }

    currentPath.value = new Set(path)
    pathLinkIds.value = linkIds
    pathNotFound.value = false
  }

  function resetPath() {
    pathStart.value = null
    pathEnd.value = null
    currentPath.value = new Set()
    pathLinkIds.value = new Set()
    pathNotFound.value = false
  }

  function onNodeClickHandler(node) {
    if (!pathModeActive.value) {
      emit('select', node.slug)
      return
    }

    if (!pathStart.value) {
      pathStart.value = node.slug
    } else if (!pathEnd.value) {
      pathEnd.value = node.slug
      runBFS(pathStart.value, pathEnd.value)
    } else {
      resetPath()
      pathStart.value = node.slug
    }

    fg?._tick?.()
  }

  function nodeColor(node) {
    return TYPE_COLORS[node.type] ?? DEFAULT_COLOR
  }

  function isNodeOnPath(slug) {
    return currentPath.value.has(slug)
  }

  function isLinkOnPath(link) {
    const sourceSlug = getNodeSlug(link.source)
    const targetSlug = getNodeSlug(link.target)
    if (!sourceSlug || !targetSlug) return false
    const linkKey = generateLinkKey(sourceSlug, targetSlug)
    return pathLinkIds.value.has(linkKey)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Watchers
  // ─────────────────────────────────────────────────────────────────────────────
  watch(pathModeActive, (active) => {
    if (!active) {
      resetPath()
    }

    fg?._tick?.()
  })

  watch(
    () => props.filterQuery,
    () => {
      fg?._tick?.()
    }
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Mount & Unmount
  // ─────────────────────────────────────────────────────────────────────────────
  onMounted(() => {
    fg = ForceGraph()(containerEl.value)
      .graphData(props.data)
      .nodeId('slug')
      .nodeLabel('title')
      .linkColor((link) => {
        if (!pathModeActive.value || currentPath.value.size === 0) return '#334455'
        return isLinkOnPath(link) ? '#ffd700' : '#1a3a52'
      })
      .linkWidth((link) => {
        if (!pathModeActive.value || currentPath.value.size === 0) return 1
        return isLinkOnPath(link) ? 2.5 : 0.5
      })
      .linkDirectionalArrowLength(3)
      .linkDirectionalArrowRelPos(1)
      .linkLabel('label')
      .backgroundColor('#1a1a2e')
      .onNodeClick(onNodeClickHandler)
      .nodeCanvasObject((node, ctx, globalScale) => {
        const isSelected = node.slug === props.selectedSlug
        const isOnPath = isNodeOnPath(node.slug)
        const pathActive = pathModeActive.value && currentPath.value.size > 0

        // Task 3: Use pre-computed matching set (optimized)
        const isMatch = matchingNodeSlugs.value.size === 0 || matchingNodeSlugs.value.has(node.slug)

        // Opacity priority: path mode > search mode
        if (pathActive) {
          ctx.globalAlpha = isOnPath ? 1 : 0.2
        } else if (matchingNodeSlugs.value.size > 0) {
          ctx.globalAlpha = isMatch ? 1 : 0.2
        }

        const color = nodeColor(node)
        const r = isSelected ? 7 : isOnPath ? 6 : 4

        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()

        if (isSelected || isOnPath) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, r + 2.5, 0, 2 * Math.PI)
          ctx.strokeStyle = isOnPath ? '#ffd700' : '#ffffff'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        if (globalScale >= 1.2) {
          const fontSize = Math.min(12 / globalScale, 3)
          ctx.font = `${fontSize}px Sans-Serif`
          ctx.fillStyle = 'rgba(220,220,220,0.85)'
          ctx.textAlign = 'center'
          ctx.fillText(node.title, node.x, node.y + r + fontSize + 1)
        }

        ctx.globalAlpha = 1
      })
      .nodeCanvasObjectMode(() => 'replace')

    const { width, height } = containerEl.value.getBoundingClientRect()
    if (width && height) fg.width(width).height(height)

    const ro = new ResizeObserver(([e]) => {
      fg?.width(e.contentRect.width).height(e.contentRect.height)
    })
    ro.observe(containerEl.value)

    onUnmounted(() => {
      ro.disconnect()
    })
  })

  onUnmounted(() => {
    fg?.pauseAnimation()
    fg = null
  })

  watch(
    () => props.data,
    (d) => {
      fg?.graphData(d)
      resetPath()
    }
  )

  watch(
    () => props.selectedSlug,
    (slug) => {
      if (!slug || !fg) return
      const node = fg.graphData().nodes.find((n) => n.slug === slug)
      if (node?.x != null) fg.centerAt(node.x, node.y, 400)
    }
  )
</script>

<style scoped>
  .path-mode-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 100;
    padding: 8px 16px;
    background-color: #2c3e50;
    color: #ecf0f1;
    border: 1px solid #7f8c8d;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .path-mode-btn:hover {
    background-color: #34495e;
    border-color: #95a5a6;
  }

  .path-mode-btn.active {
    background-color: #3498db;
    border-color: #2980b9;
    color: #ffffff;
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
  }

  .path-status {
    position: absolute;
    top: 12px;
    left: 100px;
    z-index: 100;
    padding: 8px 12px;
    background-color: rgba(44, 62, 80, 0.85);
    color: #ecf0f1;
    border-radius: 4px;
    font-size: 12px;
  }

  .path-status .no-path {
    color: #e74c3c;
  }

  .no-path-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .no-path-message {
    padding: 24px 32px;
    background-color: #c0392b;
    color: #ffffff;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
  }
</style>
