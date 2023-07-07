<script lang="ts" setup>
import Lens from '@/components/Lens.vue'
import Input from '@/components/Input.vue'
import { computed, reactive, watch } from 'vue'
import { apiGateway } from '@lens/internal'

const PRECISION = 100

function debounceAsync(fn: (...args: any[]) => Promise<unknown>) {
  let timer: number | undefined
  return async () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(async () => {
      timer = undefined
      await fn()
    }, 400)
  }
}

const state = reactive({
  r1: 0,
  r2: 0,
  d: 0,
  n: 1
})

const focalLength = computed(() => {
  const value =
    Math.round(
      (1 /
        ((state.n - 1) *
          (1 / state.r1 -
            1 / state.r2 +
            ((state.n - 1) * state.d) / (state.n * state.r1 * state.r2)))) *
        PRECISION
    ) / PRECISION

  return Number.isNaN(value) ? 0 : value
})

const history = Array.from({ length: 10 }).map(
  (_, i): apiGateway.history.Resource => ({
    date: new Date().toISOString(),
    r2: Math.random() * i,
    r1: Math.random() * i,
    d: Math.random() * i,
    n: Math.random() * i
  })
)

watch(
  state,
  debounceAsync(async () => {
    console.log(state)
  })
)
</script>

<template>
  <div class="h-screen w-full flex flex-col items-center justify-center gap-2">
    <div class="flex flex-row gap-2">
      <Input :value="state.n" max="2" min="1" step=".1" @changed="(v) => (state.n = v)">n</Input>
      <Input :value="state.r1" max="100" min="1" @changed="(v) => (state.r1 = v)">R1</Input>
      <Input :value="state.r2" max="100" min="1" @changed="(v) => (state.r2 = v)">R2</Input>
      <Input :value="state.d" max="20" min="1" @changed="(v) => (state.d = v)">d</Input>
    </div>
    <Lens :d="state.d" :f="focalLength" :r1="state.r1" :r2="state.r2" />
    <span class="text-xs text-black font-mono">f: {{ focalLength }}</span>
    <hr class="border-solid border-gray-300 w-1/2" />
    <div class="flex flex-col gap-2 pt-10">
      <p v-for="h in history" v-bind:key="h.date" class="text-xs font-mono">
        {{ h.date }}
      </p>
    </div>
  </div>
</template>
