<template>
  <!-- 渲染一个大画布，里面通过 series 布局多个仪表盘 -->
  <el-card shadow="never">
    <template #header>
      <!-- <el-text size="large">仪表盘配置</el-text> -->
      <el-button text>
        <i class="bi bi-three-dots"></i>
      </el-button>
    </template>
    <v-chart class="chart" :option="chartOption" autoresize />
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted } from 'vue';

import axios from 'axios';
// import VChart from 'vue-echarts';


const sysData = ref({});
const sensorData = ref([]);
setInterval(async () => {
  sysData.value = (await axios.get('http://localhost:3500/sysData')).data;
  // console.log(sysData.value);
  sensorData.value = [
    { id: 1, name: 'CPU使用率', value: sysData.value.cpuLoad, max: 100, unit: '%' },
    { id: 2, name: '内存使用率', value: sysData.value.menData.usage, max: 100, unit: '%' },
    { id: 3, name: 'C盘使用率', value: sysData.value.diskDataList[0].usage, max: 100, unit: '%' },
    { id: 4, name: 'D盘使用率', value: sysData.value.diskDataList[1].usage, max: 100, unit: '%' }
  ];
}, 2000);





// 2. 动态计算 series 配置
const chartOption = computed(() => {
  // 根据数据数量动态计算每个仪表盘的位置（这里演示一行最多放4个的简单逻辑）
  const seriesList = sensorData.value.map((item, index) => {
    const total = sensorData.value.length
    const centerX = ((index % 4) * 25) + 12.5 + '%' // 动态计算圆心 X 轴位置
    const centerY = '50%'

    return {
      type: 'gauge',
      center: [centerX, centerY],
      radius: '75%',
      min: 0,
      max: item.max,
      title: { offsetCenter: [0, '80%'] }, // 标题位置
      detail: { valueAnimation: true, formatter: `{value}${item.unit}`, offsetCenter: [0, '50%'] },
      data: [{ value: item.value, name: item.name }],
      progress: {
        show: true
      }
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