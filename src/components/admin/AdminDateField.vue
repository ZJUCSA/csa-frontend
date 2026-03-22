<script setup>
defineOptions({
  inheritAttrs: false,
});

import { computed, useAttrs } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
const attrs = useAttrs();

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setHours(0, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateValue = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '';
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const dateValue = computed({
  get() {
    return parseDateValue(props.modelValue);
  },
  set(value) {
    emit('update:modelValue', formatDateValue(value));
  },
});
</script>

<template>
  <DatePicker
    v-model="dateValue"
    v-bind="attrs"
    :placeholder="placeholder"
    dateFormat="yy-mm-dd"
    fluid
  />
</template>
