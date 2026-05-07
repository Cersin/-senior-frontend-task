<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ $t('app.title') }}</h1>
      <nav class="tabs">
        <button :class="['tab', { active: tab === 'graph' }]" @click="tab = 'graph'">
          {{ $t('app.tabs.graph') }}
        </button>
        <button :class="['tab', { active: tab === 'sources' }]" @click="tab = 'sources'">
          {{ $t('app.tabs.sources') }}
        </button>
      </nav>
      <span v-if="tab === 'graph'" class="status">
        {{ $t('app.statusChunks', graphData.nodes.length, { count: graphData.nodes.length }) }}
        ·
        {{ $t('app.statusLinks', graphData.links.length, { count: graphData.links.length }) }}
      </span>

      <SearchBox
        v-if="tab === 'graph'"
        ref="searchBoxEl"
        v-model="filterQuery"
        :match-count="matchCount"
      />

      <div class="language-selector">
        <button
          :class="['lang-btn', { active: $i18n.locale === 'pl' }]"
          @click="$i18n.locale = 'pl'"
        >
          PL
        </button>
        <button
          :class="['lang-btn', { active: $i18n.locale === 'en' }]"
          @click="$i18n.locale = 'en'"
        >
          EN
        </button>
      </div>
    </header>

    <div v-if="tab === 'graph'" class="app-body">
      <div class="graph-pane">
        <Graph
          :data="graphData"
          :selected-slug="selectedSlug"
          :filter-query="filterQuery"
          @select="onSelect"
        />
      </div>
      <div :class="['detail-pane', { open: !!selectedSlug }]">
        <div v-if="chunkLoading" class="panel-loading">{{ $t('app.loading') }}</div>
        <ChunkPanel
          v-else-if="chunk"
          :chunk="chunk"
          @navigate="selectedSlug = $event"
          @close="selectedSlug = null"
        />
        <div v-else class="empty-state">{{ $t('app.selectNode') }}</div>
      </div>
    </div>

    <SourcesView v-if="tab === 'sources'" />
  </div>
</template>

<script setup>
  import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
  import { graphData, getChunk } from './data/mock.js'
  import Graph from './components/Graph.vue'
  import ChunkPanel from './components/ChunkPanel.vue'
  import SourcesView from './components/SourcesView.vue'
  import SearchBox from './components/SearchBox.vue'

  const tab = ref('graph')
  const selectedSlug = ref(null)
  const chunk = ref(null)
  const chunkLoading = ref(false)
  const filterQuery = ref('')
  const searchBoxEl = ref(null)

  function onSelect(slug) {
    selectedSlug.value = selectedSlug.value === slug ? null : slug
  }

  watch(selectedSlug, async (slug) => {
    if (!slug) {
      chunk.value = null
      return
    }
    chunkLoading.value = true
    await new Promise((r) => setTimeout(r, 80))
    chunk.value = getChunk(slug)
    chunkLoading.value = false
  })

  const matchCount = computed(() => {
    const query = filterQuery.value.trim().toLowerCase()
    if (!query) return 0
    return graphData.nodes.filter((n) => n.title.toLowerCase().includes(query)).length
  })

  function handleKeyDown(event) {
    // "/" to focus search input
    if (event.key === '/' && tab.value === 'graph') {
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.contentEditable === 'true')
      ) {
        return
      }
      event.preventDefault()
      searchBoxEl.value?.focus()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
</script>
