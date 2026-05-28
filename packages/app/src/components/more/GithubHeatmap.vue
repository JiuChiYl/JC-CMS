<template>
  <div class="github-heatmap" ref="heatmapContainer">
    <div v-if="loading" class="message">加载贡献数据中...</div>
    <div v-else-if="error" class="message error">{{ error }}</div>
    <div v-else class="heatmap-wrapper">
      <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="heatmap-svg" @mousemove="handleMouseMove"
        @mouseleave="hideTooltip">
        <g class="month-labels">
          <text v-for="month in monthLabels" :key="month.index" :x="month.x" :y="month.y"
            class="month-text">{{ month.name }}</text>
        </g>

        <g class="week-labels">
          <text v-for="(label, idx) in weekLabels" :key="idx" x="20" :y="getWeekLabelY(idx)"
            class="week-text">{{ label }}</text>
        </g>

        <g>
          <rect v-for="(cell, idx) in cells" :key="idx" :x="cell.x" :y="cell.y" :width="cellSize"
            :height="cellSize" :rx="cellRadius" :fill="cell.color" :data-date="cell.date"
            :data-count="cell.count" @mouseenter="showTooltip($event, cell)" />
        </g>
      </svg>

      <div class="stats">
        <span class="total">总计贡献：{{ totalContributions }}</span>
        <div class="legend">
          <span>少</span>
          <div v-for="(color, index) in colorPalette" :key="index" class="legend-color"
            :style="{ backgroundColor: color }"></div>
          <span>多</span>
        </div>
      </div>

      <div v-show="tooltipVisible" class="heatmap-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }">
        <span>{{ tooltipDate }}</span>
        <strong>有{{ tooltipCount }}次贡献</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  username?: string
}>(), {
  username: 'JiuChiYl',
})

const cellSize = 12
const cellGap = 3
const cellRadius = 2
const colCount = 53
const rowCount = 7
const leftMargin = 32
const topMargin = 24
const monthLabelHeight = 16

const svgWidth = computed(() => leftMargin + colCount * (cellSize + cellGap) + 10)
const svgHeight = computed(() => topMargin + monthLabelHeight + rowCount * (cellSize + cellGap) + 10)

const colorPalette = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const loading = ref(true)
const error = ref<string | null>(null)
const contributionsMap = ref<Map<string, number>>(new Map())
const totalContributions = ref(0)

const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipCount = ref(0)
const tooltipDate = ref('')
const heatmapContainer = ref<HTMLElement | null>(null)

interface CellData {
  date: string
  count: number
  color: string
  x: number
  y: number
}

interface MonthLabel {
  name: string
  index: number
  x: number
  y: number
}

const cells = computed((): CellData[] => {
  const result: CellData[] = []
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() - today.getDay())
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - (colCount - 1) * 7)

  for (let week = 0; week < colCount; week++) {
    for (let day = 0; day < rowCount; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + week * 7 + day)
      const dateStr = formatDate(currentDate)
      const count = contributionsMap.value.get(dateStr) || 0
      const color = getColorByCount(count)
      const x = leftMargin + week * (cellSize + cellGap)
      const y = topMargin + monthLabelHeight + day * (cellSize + cellGap)
      result.push({ date: dateStr, count, color, x, y })
    }
  }
  return result
})

const monthLabels = computed((): MonthLabel[] => {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() - today.getDay())
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - (colCount - 1) * 7)

  const monthMap = new Map<string, { firstWeekIndex: number, name: string }>()
  for (let week = 0; week < colCount; week++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + week * 7)
    const yearMonth = `${date.getFullYear()}-${date.getMonth()}`
    const monthName = `${date.getMonth() + 1}月`
    if (!monthMap.has(yearMonth)) {
      monthMap.set(yearMonth, { firstWeekIndex: week, name: monthName })
    }
  }
  const labels: MonthLabel[] = []
  let idx = 0
  for (const [, { firstWeekIndex, name }] of monthMap) {
    const x = leftMargin + firstWeekIndex * (cellSize + cellGap) + cellSize / 2
    labels.push({ name, index: idx++, x, y: topMargin - 4 })
  }
  return labels
})

const getWeekLabelY = (index: number): number => {
  return topMargin + monthLabelHeight + index * (cellSize + cellGap) + cellSize / 2 + 2
}

const getColorByCount = (count: number): string => {
  if (count === 0) return colorPalette[0]
  if (count <= 3) return colorPalette[1]
  if (count <= 6) return colorPalette[2]
  if (count <= 9) return colorPalette[3]
  return colorPalette[4]
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const showTooltip = (event: MouseEvent, cell: CellData) => {
  if (!heatmapContainer.value) return
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const containerRect = heatmapContainer.value.getBoundingClientRect()
  let left = rect.left + rect.width / 2 - containerRect.left
  let top = rect.top - containerRect.top - 55
  if (left < 10) left = 10
  if (left > containerRect.width - 100) left = containerRect.width - 100
  tooltipX.value = left
  tooltipY.value = top
  tooltipCount.value = cell.count
  tooltipDate.value = dayjs(cell.date).format('YYYY年MM月DD日')
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (!tooltipVisible.value) return
  const target = event.target as HTMLElement
  if (target.tagName === 'rect' && target.hasAttribute('data-date')) {
    return
  }
  if (target.tagName !== 'rect') {
    hideTooltip()
  }
}

const fetchContributions = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`https://gh-calendar.rschristian.dev/user/${props.username}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const map = new Map<string, number>()
    let total = 0
    data.contributions.forEach((week: { count: number, date: string }[]) => {
      week.forEach((day) => {
        const count = day.count || 0
        map.set(day.date, count)
        total += count
      })
    })
    contributionsMap.value = map
    totalContributions.value = total
  }
  catch (err) {
    console.error(err)
    error.value = (err as Error).message || '数据加载失败'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContributions()
})
</script>

<style scoped>
.github-heatmap {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  background: white;
  border-radius: 5px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow-x: auto;
}

.message {
  text-align: center;
  padding: 40px;
  color: #586069;
}

.error {
  color: #d73a49;
}

.heatmap-wrapper {
  position: relative;
}

.heatmap-svg {
  display: block;
  width: 100%;
  height: auto;
  background: white;
}

.month-text {
  font-size: 10px;
  fill: #586069;
  text-anchor: middle;
  font-weight: normal;
}

.week-text {
  font-size: 10px;
  fill: #24292e;
  text-anchor: end;
  dominant-baseline: middle;
  font-weight: 500;
}

.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 12px;
  color: #586069;
}

.total {
  font-weight: 500;
}

.legend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.heatmap-tooltip {
  position: absolute;
  background: rgba(9, 46, 18, 0.71);
  color: white;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
  transform: translateX(-50%);
  transition: opacity 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.4;
}
</style>
