<template>
  <el-card shadow="never">
    <template #header>
      <el-button text>
        <i class="bi bi-three-dots"></i>
      </el-button>
    </template>
    <v-chart class="chart" :option="chartOption" autoresize />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

interface SensorItem {
  id: number
  name: string
  value: number
  max: number
  unit: string
}

interface SysData {
  cpuLoad: number
  menData: { usage: number }
  diskDataList: { usage: number }[]
}

const sysData = ref<SysData>({
  cpuLoad: 0,
  menData: { usage: 0 },
  diskDataList: [{ usage: 0 }, { usage: 0 }],
})
const sensorData = ref<SensorItem[]>([])

let timer: ReturnType<typeof setInterval> | null = null

const fetchData = async () => {
  sysData.value = (await axios.get('http://localhost:3500/sysData')).data
  sensorData.value = [
    { id: 1, name: 'CPU使用率', value: sysData.value.cpuLoad, max: 100, unit: '%' },
    { id: 2, name: '内存使用率', value: sysData.value.menData.usage, max: 100, unit: '%' },
    { id: 3, name: 'C盘使用率', value: sysData.value.diskDataList[0].usage, max: 100, unit: '%' },
    { id: 4, name: 'D盘使用率', value: sysData.value.diskDataList[1].usage, max: 100, unit: '%' },
  ]
}

timer = setInterval(fetchData, 2000)
fetchData()

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const chartOption = computed(() => {
  const seriesList = sensorData.value.map((item) => {
    const centerX = `${((item.id - 1) % 4) * 25 + 12.5}%`
    const centerY = '50%'

    return {
      type: 'gauge',
      center: [centerX, centerY],
      radius: '75%',
      min: 0,
      max: item.max,
      title: { offsetCenter: [0, '80%'] },
      detail: { valueAnimation: true, formatter: `{value}${item.unit}`, offsetCenter: [0, '50%'] },
      data: [{ value: item.value, name: item.name }],
      progress: {
        show: true,
      },
    }
  })

  return { series: seriesList }
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
