<script lang="ts" setup>
import { computed } from 'vue'

const applyMultiplier = (v: number) => v * Math.pow(10, 2)

const props = defineProps<{
  r1: number
  r2: number
  d: number
  f: number
}>()

const r1 = computed(() => applyMultiplier(props.r1))
const r2 = computed(() => applyMultiplier(props.r2))
</script>
<template>
  <svg id="svg10" height="200" width="400">
    <path
      id="path4"
      :d="`M 95 50 a ${r1} 500 0 0 0 0 100 l ${props.d} 0 a ${r2} 300 0 0 0 0 -100 Z`"
      fill="none"
      stroke="#7393B3"
      stroke-width="2"
    />
    <path id="path6" d="M 0 100 l 400 0" fill="none" stroke="black" stroke-width="2" />
    <path
      id="path8"
      :d="`M 0 70 l 100 0 l ${props.f} 40`"
      fill="none"
      stroke="red"
      stroke-width="2"
    />
  </svg>
</template>
