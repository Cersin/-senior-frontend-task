<template>
  <div class="search-box">
    <input
      ref="searchInputEl"
      :value="modelValue"
      type="text"
      :placeholder="$t('app.search.placeholder')"
      class="search-input"
      @input="emit('update:modelValue', $event.target.value)"
      @keydown="handleKeyDown"
    />
    <span v-if="modelValue.trim()" class="search-count">
      {{ $t('app.search.matches', matchCount, { count: matchCount }) }}
    </span>
    <button
      v-if="modelValue.trim()"
      @click="emit('update:modelValue', '')"
      class="search-clear"
      :title="$t('app.search.clear')"
    >
      ×
    </button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  defineProps({
    modelValue: { type: String, default: '' },
    matchCount: { type: Number, default: 0 },
  })

  const emit = defineEmits(['update:modelValue'])

  const searchInputEl = ref(null)

  function handleKeyDown(event) {
    // Escape to clear search (only if search input is focused)
    if (event.key === 'Escape' && searchInputEl.value === document.activeElement) {
      emit('update:modelValue', '')
      searchInputEl.value?.blur()
    }
  }

  // Expose method to focus the search input (called from App.vue)
  defineExpose({
    focus: () => searchInputEl.value?.focus(),
  })
</script>

<style scoped>
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
  }

  .search-input {
    background-color: #2c3e50;
    border: 1px solid #7f8c8d;
    border-radius: 4px;
    color: #ecf0f1;
    padding: 6px 8px;
    font-size: 12px;
    min-width: 150px;
    transition: border-color 0.2s ease;
  }

  .search-input::placeholder {
    color: #95a5a6;
  }

  .search-input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 4px rgba(52, 152, 219, 0.3);
  }

  .search-count {
    color: #bdc3c7;
    font-size: 11px;
    white-space: nowrap;
  }

  .search-clear {
    background-color: transparent;
    border: none;
    color: #ecf0f1;
    cursor: pointer;
    padding: 4px 6px;
    font-size: 16px;
    border-radius: 2px;
    transition: background-color 0.2s ease;
  }

  .search-clear:hover {
    background-color: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }
</style>

