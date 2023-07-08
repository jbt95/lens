<script lang="ts" setup>
import { formatDate } from '@/utils'
import { apiGateway } from '@lens/internal'
import { computed, ref } from 'vue'

const BATCH_SIZE = 10

const props = defineProps<{ data: apiGateway.history.Resource[] }>()
const emits = defineEmits<{ (e: 'replay', index: number): void }>()

const batchIndex = ref<number>(0)

const onReplay = (index: number) => emits('replay', index)
const isSelected = (index: number) => index === batchIndex.value

const batch = computed(() => props.data.slice(batchIndex.value, batchIndex.value + BATCH_SIZE))
const nBatches = computed(() => Math.ceil(props.data.length / BATCH_SIZE))
</script>

<template>
  <div v-if="props.data.length" class="p-6 w-full flex flex-col gap-2 overflow-x-auto">
    <span class="text-xl font-mono">History</span>
    <table class="text-sm text-left text-gray-500 table-auto">
      <thead class="text-xs text-gray-700 uppercase bg-gray-200">
        <tr>
          <th class="px-6 py-3" scope="col">Date</th>
          <th class="px-6 py-3" scope="col">n</th>
          <th class="px-6 py-3" scope="col">R1</th>
          <th class="px-6 py-3" scope="col">R2</th>
          <th class="px-6 py-3" scope="col">d</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, index) in batch" v-bind:key="r.date" class="bg-gray-50 border-b">
          <th class="px-6 py-4 font-medium text-black whitespace-nowrap" scope="row">
            {{ formatDate(r.date) }}
            <button
              class="mx-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-xs rounded-lg text-xs px-5 py-2.5 mr-2 mb-2"
              type="button"
              @click="onReplay(index)"
            >
              Replay
            </button>
          </th>
          <td class="px-6 py-4">{{ r.n }}</td>
          <td class="px-6 py-4">{{ r.r1 }}</td>
          <td class="px-6 py-4">{{ r.r2 }}</td>
          <td class="px-6 py-4">{{ r.d }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <nav class="flex flex-row justify-center p-10">
    <ul class="inline-flex -space-x-px text-sm">
      <li>
        <a
          class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
          href="#"
          @click="batchIndex = batchIndex - 1"
          >Previous</a
        >
      </li>
      <li v-for="i in nBatches" v-bind:key="i">
        <a
          :class="`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
            isSelected(i - 1) ? 'font-bold' : ''
          }`"
          href="#"
          @click="batchIndex = i - 1"
          >{{ i }}</a
        >
      </li>
      <li>
        <a
          class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
          href="#"
          @click="batchIndex = batchIndex + 1"
          >Next</a
        >
      </li>
    </ul>
  </nav>
</template>
