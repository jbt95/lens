<script lang="ts" setup>
import Input from '@/components/Input.vue'
import Lens from '@/components/Lens.vue'
import Table from '@/components/Table.vue'
import { debounceAsync, jsonRequest } from '@/utils'
import { apiGateway } from '@lens/internal'
import { computed, onBeforeMount, ref, watch } from 'vue'

type PostHistoryRequestBody = Readonly<{
  date: string
  r1: number
  r2: number
  d: number
  n: number
}>

const PRECISION = 100

const r1 = ref<number>(0)
const r2 = ref<number>(0)
const d = ref<number>(0)
const n = ref<number>(1)
const history = ref<apiGateway.history.Resource[]>([])

onBeforeMount(async () => {
  history.value = await jsonRequest<never, { items: apiGateway.history.Resource[] }>({
    url: `${import.meta.env.VITE_API_URL}/history?from=${new Date(
      0
    ).toISOString()}&to=${new Date().toISOString()}`,
    method: 'GET'
  })
    .then((res) => res.items)
    .then((items) => items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
})

watch(
  () => [r1.value, r2.value, d.value, n.value],
  debounceAsync(async () => {
    history.value = [
      {
        date: new Date().toISOString(),
        r1: r1.value,
        r2: r2.value,
        d: d.value,
        n: n.value
      },
      ...history.value
    ]
    await jsonRequest<PostHistoryRequestBody>({
      url: `${import.meta.env.VITE_API_URL}/history`,
      method: 'POST',
      body: {
        date: new Date().toISOString(),
        r1: r1.value,
        r2: r2.value,
        d: d.value,
        n: n.value
      }
    })
  })
)

function onReplayHistoryPoint(index: number) {
  const p = history.value
  r1.value = p[index].r1
  r2.value = p[index].r2
  d.value = p[index].d
  n.value = p[index].n
  if (index === 0) return
  history.value = [...p.slice(0, index), ...p.slice(index + 1)]
}

const focalLength = computed(() => {
  const value =
    Math.round(
      (1 /
        ((n.value - 1) *
          (1 / r1.value -
            1 / r2.value +
            ((n.value - 1) * d.value) / (n.value * r1.value * r2.value)))) *
        PRECISION
    ) / PRECISION

  return Number.isNaN(value) ? 0 : value
})
</script>

<template>
  <div class="absolute top-36 h-screen w-full flex flex-col items-center gap-2">
    <div class="p-4 w-full sm:w-1/2 flex flex-row gap-2">
      <Input :value="n" max="2" min="1" step=".1" @changed="(v) => (n = v)">n</Input>
      <Input :value="r1" max="100" min="1" @changed="(v) => (r1 = v)">R1</Input>
      <Input :value="r2" max="100" min="1" @changed="(v) => (r2 = v)">R2</Input>
      <Input :value="d" max="20" min="1" @changed="(v) => (d = v)">d</Input>
    </div>
    <div>
      <Lens :d="d" :f="focalLength" :r1="r1" :r2="r2" />
    </div>
    <span class="text-xs text-black font-mono pb-10">f: {{ focalLength }}</span>
    <Table :data="history" @replay="onReplayHistoryPoint"></Table>
  </div>
</template>
