<script setup>
const model = defineModel({
    default: '',
})

const props = defineProps({
    label: {
        type: String,
        default: '',
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
    rowClass: {
        type: [String, Array, Object],
        default: '',
    },
    labelClass: {
        type: [String, Array, Object],
        default: '',
    },
    selectClass: {
        type: [String, Array, Object],
        default: '',
    },
    selectProps: {
        type: Object,
        default: () => ({}),
    },
})

const mergedSelectProps = computed(() => ({
    fluid: true,
    ...props.selectProps,
}))
</script>

<template>
    <div :class="['admin-filter-select', rowClass]">
        <label
            v-if="label"
            :class="['admin-filter-select__label', labelClass]"
        >
            {{ label }}
        </label>

        <Select
            v-model="model"
            :options="options"
            :option-label="optionLabel"
            :option-value="optionValue"
            :placeholder="placeholder"
            :class="['admin-filter-select__control', selectClass]"
            v-bind="mergedSelectProps"
        />
    </div>
</template>

<style scoped>
.admin-filter-select {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.admin-filter-select__label {
    font-weight: 700;
    color: var(--text-primary);
}

.admin-filter-select :deep(.admin-filter-select__control.p-select) {
    min-height: var(--recruit-filter-control-height, 42px);
    border-radius: 8px;
    border-color: var(--border-color);
    background: var(--bg-surface);
    color: var(--text-primary);
}

.admin-filter-select :deep(.admin-filter-select__control .p-select-label) {
    display: flex;
    align-items: center;
}
</style>
