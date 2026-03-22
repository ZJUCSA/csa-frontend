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

const mergedPanelClass = computed(() => props.panelClass || undefined);

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
    :panelClass="mergedPanelClass"
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
