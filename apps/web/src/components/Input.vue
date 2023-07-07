<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{ value?: number; step?: string; max?: string; min?: string }>()

const emit = defineEmits<{
  (e: 'changed', v: number): void
}>()

const value = ref<number>(props.value ?? 0)

watch(
  () => props.value,
  (v) => (value.value = v ?? 0)
)

watch(value, (v) => emit('changed', v))
</script>

<template>
  <div class="w-full">
    <label class="block mb-2 text-sm font-medium text-black font-mono">
      <slot></slot>
    </label>
    <input
      id="input"
      v-model="value"
      :max="props.max"
      :min="props.min"
      :step="props.step"
      class="font-mono border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      type="number"
    />
  </div>
</template>
