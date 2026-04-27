<template>
    <div class="github-heatmap" ref="heatmapContainer">
        <div v-if="loading" class="message">加载贡献数据中...</div>
        <div v-else-if="error" class="message error">{{ error }}</div>
        <div v-else class="heatmap-wrapper">
            <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="heatmap-svg" @mousemove="handleMouseMove"
                @mouseleave="hideTooltip">
                <!-- 月份标签 -->
                <g class="month-labels">
                    <text v-for="month in monthLabels" :key="month.index" :x="month.x" :y="month.y"
                        class="month-text">{{ month.name }}</text>
                </g>

                <!-- 星期标签（左侧） -->
                <g class="week-labels">
                    <text v-for="(label, idx) in weekLabels" :key="idx" x="20" :y="getWeekLabelY(idx)"
                        class="week-text">{{ label }}</text>
                </g>

                <!-- 热力图格子 -->
                <g>
                    <rect v-for="(cell, idx) in cells" :key="idx" :x="cell.x" :y="cell.y" :width="cellSize"
                        :height="cellSize" :rx="cellRadius" :fill="cell.color" :data-date="cell.date"
                        :data-count="cell.count" @mouseenter="showTooltip($event, cell)" />
                </g>
            </svg>

            <!-- 图例和统计 -->
            <div class="stats">
                <span class="total">📊 总计贡献：{{ totalContributions }}</span>
                <div class="legend">
                    <span>少</span>
                    <div v-for="(color, index) in colorPalette" :key="index" class="legend-color"
                        :style="{ backgroundColor: color }"></div>
                    <span>多</span>
                </div>
            </div>

            <!-- 悬浮提示框（相对于组件容器绝对定位） -->
            <div v-show="tooltipVisible" class="heatmap-tooltip"
                :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }">
                <span>{{ tooltipDate }}</span>
                <strong>有{{ tooltipCount }}次贡献</strong>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
    username: {
        type: String,
        required: true,
        default: 'JiuChiYl'
    }
})

// 布局常量（微调后）
const cellSize = 12
const cellGap = 3
const cellRadius = 2
const colCount = 53
const rowCount = 7
const leftMargin = 32        // 为星期标签留出更多空间（原来28）
const topMargin = 24         // 月份标签顶部边距增加
const monthLabelHeight = 16

// SVG 宽高
const svgWidth = computed(() => leftMargin + colCount * (cellSize + cellGap) + 10)
const svgHeight = computed(() => topMargin + monthLabelHeight + rowCount * (cellSize + cellGap) + 10)

// 颜色
const colorPalette = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']

// 星期标签
const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

// 数据状态
const loading = ref(true)
const error = ref(null)
const contributionsMap = ref(new Map())
const totalContributions = ref(0)

// Tooltip 状态
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipCount = ref(0)
const tooltipDate = ref('')
const heatmapContainer = ref(null)  // 组件容器 DOM

// 计算所有格子
const cells = computed(() => {
    const result = []
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

// 月份标签（紧凑显示）
const monthLabels = computed(() => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() - today.getDay())
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - (colCount - 1) * 7)

    const monthMap = new Map()
    for (let week = 0; week < colCount; week++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + week * 7)
        const yearMonth = `${date.getFullYear()}-${date.getMonth()}`
        const monthName = `${date.getMonth() + 1}月`  // 只显示月份，不显示年份（更简洁）
        if (!monthMap.has(yearMonth)) {
            monthMap.set(yearMonth, { firstWeekIndex: week, name: monthName })
        }
    }
    const labels = []
    for (const [_, { firstWeekIndex, name }] of monthMap) {
        const x = leftMargin + firstWeekIndex * (cellSize + cellGap) + cellSize / 2
        labels.push({ name, x, y: topMargin - 4 })  // 上移一点
    }
    return labels
})

// 星期标签 Y 坐标
const getWeekLabelY = (index) => {
    return topMargin + monthLabelHeight + index * (cellSize + cellGap) + cellSize / 2 + 2
}

// 颜色映射
const getColorByCount = (count) => {
    if (count === 0) return colorPalette[0]
    if (count <= 3) return colorPalette[1]
    if (count <= 6) return colorPalette[2]
    if (count <= 9) return colorPalette[3]
    return colorPalette[4]
}

// 日期格式化
const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 显示提示框（相对于组件容器）
const showTooltip = (event, cell) => {
    if (!heatmapContainer.value) return
    const rect = event.target.getBoundingClientRect()
    const containerRect = heatmapContainer.value.getBoundingClientRect()
    // 计算相对于容器的位置（鼠标在格子上方）
    let left = rect.left + rect.width / 2 - containerRect.left
    let top = rect.top - containerRect.top - 55  // 上移28px（格子高度12 + 间距3 + 提示框高度13 + 额外间距）
    // 边界检测，防止超出左右
    if (left < 10) left = 10
    if (left > containerRect.width - 100) left = containerRect.width - 100
    tooltipX.value = left
    tooltipY.value = top
    tooltipCount.value = cell.count
    tooltipDate.value = dayjs(cell.date).format('YYYY年MM月DD日')
    tooltipVisible.value = true
}

// 隐藏提示框
const hideTooltip = () => {
    tooltipVisible.value = false
}

// 鼠标移动时更新位置（可选，保持跟随）
const handleMouseMove = (event) => {
    if (!tooltipVisible.value) return
    const target = event.target
    if (target.tagName === 'rect' && target.hasAttribute('data-date')) {
        // 如果移动到了另一个格子上，重新触发显示（在 mousemove 中不做复杂处理，因为已经通过 mouseenter 更新）
        return
    }
    // 如果移出格子区域，隐藏
    if (target.tagName !== 'rect') {
        hideTooltip()
    }
}

// 获取数据
const fetchContributions = async () => {
    loading.value = true
    error.value = null
    try {
        const res = await fetch(`https://gh-calendar.rschristian.dev/user/${props.username}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const map = new Map()
        let total = 0
        data.contributions.forEach(week => {
            week.forEach(day => {
                const count = day.count || 0
                map.set(day.date, count)
                total += count
            })
        })
        contributionsMap.value = map
        totalContributions.value = total
    } catch (err) {
        console.error(err)
        error.value = err.message || '数据加载失败'
    } finally {
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

/* 提示框样式：绝对定位在组件内部 */
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