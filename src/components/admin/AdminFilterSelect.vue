<script setup>
defineOptions({
  inheritAttrs: false,
});

import { computed, useAttrs } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showClear: {
    type: Boolean,
    default: false,
  },
  panelClass: {
    type: [String, Array, Object],
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);
const attrs = useAttrs();

const selectValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const mergedPanelClass = computed(() => ['admin-filter-select-panel', props.panelClass]);

const handleChange = (event) => {
  emit('change', event);
};
</script>

<template>
  <Select
    v-model="selectValue"
    v-bind="attrs"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :showClear="showClear"
    :panelClass="mergedPanelClass"
    class="admin-filter-select"
    fluid
    @change="handleChange"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  >
    <template v-if="$slots.value" #value="slotProps">
      <slot name="value" v-bind="slotProps"></slot>
    </template>

    <template v-if="$slots.option" #option="slotProps">
      <slot name="option" v-bind="slotProps"></slot>
    </template>
  </Select>
</template>

<style scoped>
.admin-filter-select {
  width: 100%;
  min-height: var(--admin-filter-select-height, 2.875rem);
  border: 1px solid var(--admin-filter-select-border, var(--border-color, #e1e5e9));
  border-radius: var(--admin-filter-select-radius, 8px);
  background: var(--admin-filter-select-background, var(--bg-surface, #ffffff));
  color: var(--admin-filter-select-color, var(--text-primary, #333333));
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.admin-filter-select:not(.p-disabled):hover {
  border-color: var(--admin-filter-select-hover-border, var(--admin-filter-select-border, var(--border-color, #e1e5e9)));
}

.admin-filter-select.p-focus {
  border-color: var(--admin-filter-select-focus, var(--accent-color, #667eea));
  box-shadow: 0 0 0 3px var(--admin-filter-select-focus-ring, rgba(102, 126, 234, 0.12));
}

.admin-filter-select:deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(var(--admin-filter-select-height, 2.875rem) - 2px);
  padding: 0 var(--admin-filter-select-padding-x, 0.875rem);
  font-size: var(--admin-filter-select-font-size, 0.95rem);
  color: inherit;
}

.admin-filter-select:deep(.p-select-label.p-placeholder) {
  color: var(--text-secondary, #666666);
}

.admin-filter-select:deep(.p-select-dropdown) {
  width: var(--admin-filter-select-dropdown-width, 2.75rem);
  color: var(--text-secondary, #666666);
}

.admin-filter-select:deep(.p-select-dropdown-icon) {
  font-size: 0.85rem;
}

:global(.admin-filter-select-panel) {
  border: 1px solid var(--admin-filter-select-panel-border, var(--border-color, #e1e5e9));
  border-radius: 12px;
  background: var(--admin-filter-select-background, var(--bg-surface, #ffffff));
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}

:global(.admin-filter-select-panel .p-select-list) {
  padding: 0.375rem;
  gap: 0.25rem;
}

:global(.admin-filter-select-panel .p-select-option) {
  min-height: 2.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--text-primary, #333333);
  white-space: normal;
  line-height: 1.35;
}

:global(.admin-filter-select-panel .p-select-option.p-focus) {
  background: rgba(102, 126, 234, 0.08);
}

:global(.admin-filter-select-panel .p-select-option.p-select-option-selected) {
  background: rgba(102, 126, 234, 0.14);
  color: var(--accent-color, #667eea);
  font-weight: 600;
}

:global(.admin-filter-select-panel .p-select-empty-message) {
  padding: 0.75rem;
  color: var(--text-secondary, #666666);
}
</style>
