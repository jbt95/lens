<script lang="ts" setup>
import { apiGateway } from '@lens/internal'
import { computed, ref } from 'vue'

const BATCH_SIZE = 10

const props = defineProps<{ data: apiGateway.history.Resource[] }>()
const emits = defineEmits<{ (e: 'replay', index: number): void }>()
const batchIndex = ref<number>(0)

const formatDate = (d: string) => {
  return Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid'
  }).format(new Date(d))
}

const onReplay = (index: number) => emits('replay', index)

const batch = computed(() => props.data.slice(batchIndex.value, batchIndex.value + BATCH_SIZE))
const nBatches = computed(() => Math.ceil(props.data.length / BATCH_SIZE))
const isSelected = (index: number) => index === batchIndex.value
</script>

<template>
  <div class="flex flex-col gap-2 overflow-x-auto justify-center items-center">
    <div v-if="!props.data.length" role="status">
      <svg
        aria-hidden="true"
        class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        fill="none"
        viewBox="0 0 100 101"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
    <table v-if="props.data.length" class="text-sm text-left text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-200">
        <tr>
          <th class="px-6 py-3" scope="col">Date</th>
          <th class="px-6 py-3" scope="col">R1</th>
          <th class="px-6 py-3" scope="col">R2</th>
          <th class="px-6 py-3" scope="col">n</th>
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
          <td class="px-6 py-4">{{ r.r1 }}</td>
          <td class="px-6 py-4">{{ r.r2 }}</td>
          <td class="px-6 py-4">{{ r.n }}</td>
          <td class="px-6 py-4">{{ r.d }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <nav class="flex flex-row justify-center pt-10">
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
