<template>
  <div
    ref="draggableRef"
    class="draggable-widget"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px'
    }"
    @mousedown="startDrag"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 吸附阈值（距离边缘多少px时自动吸附）
  threshold: {
    type: Number,
    default: 50
  },
  // 吸附后与边缘的间距（默认10px）
  margin: {
    type: Number,
    default: 10
  }
})

const draggableRef = ref(null)
const position = ref({ x: 0, y: 0 })  // 初始值设为0，等组件挂载后再计算居中位置
const dragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const startOffset = ref({ x: 0, y: 0 })

// 计算居中位置
const centerPosition = () => {
  if (!draggableRef.value) return { x: 0, y: 0 }
  
  const elWidth = draggableRef.value.offsetWidth
  const elHeight = draggableRef.value.offsetHeight
  
  return {
    x: (window.innerWidth - elWidth) / 2,
    y: (window.innerHeight - elHeight) / 2
  }
}

// 组件挂载后设置居中位置
onMounted(() => {
  // 等待下一个 tick，确保组件已经渲染完成并获取到正确的宽高
  setTimeout(() => {
    position.value = centerPosition()
  }, 0)
})

// 开始拖拽
const startDrag = (e) => {
  e.preventDefault()
  dragging.value = true
  
  // 记录鼠标起始位置
  startPos.value = {
    x: e.clientX,
    y: e.clientY
  }
  
  // 记录元素当前位置
  startOffset.value = {
    x: position.value.x,
    y: position.value.y
  }
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

// 拖拽中
const onDrag = (e) => {
  if (!dragging.value) return
  
  // 计算移动距离
  const dx = e.clientX - startPos.value.x
  const dy = e.clientY - startPos.value.y
  
  // 更新位置（加上边界限制）
  const newX = startOffset.value.x + dx
  const newY = startOffset.value.y + dy
  
  position.value = {
    x: Math.max(0, Math.min(window.innerWidth - draggableRef.value.offsetWidth, newX)),
    y: Math.max(0, Math.min(window.innerHeight - draggableRef.value.offsetHeight, newY))
  }
}

// 结束拖拽（核心：自动吸附逻辑 - 带边距）
const stopDrag = () => {
  if (!dragging.value) return
  
  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  
  // --- 自动吸附边缘逻辑（带边距）---
  const elWidth = draggableRef.value.offsetWidth
  const elHeight = draggableRef.value.offsetHeight
  const currentX = position.value.x
  const currentY = position.value.y
  
  // 计算到各边缘的距离（考虑边距）
  const distToLeft = currentX - props.margin
  const distToRight = (window.innerWidth - props.margin) - (currentX + elWidth)
  const distToTop = currentY - props.margin
  const distToBottom = (window.innerHeight - props.margin) - (currentY + elHeight)
  
  let targetX = currentX
  let targetY = currentY
  
  // 水平方向吸附
  if (Math.abs(distToLeft) < props.threshold || Math.abs(distToRight) < props.threshold) {
    if (Math.abs(distToLeft) < Math.abs(distToRight)) {
      targetX = props.margin
    } else {
      targetX = window.innerWidth - elWidth - props.margin
    }
  }
  
  // 垂直方向吸附
  if (Math.abs(distToTop) < props.threshold || Math.abs(distToBottom) < props.threshold) {
    if (Math.abs(distToTop) < Math.abs(distToBottom)) {
      targetY = props.margin
    } else {
      targetY = window.innerHeight - elHeight - props.margin
    }
  }
  
  // 更新位置（加上平滑过渡）
  position.value = { x: targetX, y: targetY }
}

// 监听窗口大小变化，保持组件在可视区域内
const handleResize = () => {
  if (!draggableRef.value) return
  
  const elWidth = draggableRef.value.offsetWidth
  const elHeight = draggableRef.value.offsetHeight
  
  // 确保组件不会超出可视区域
  position.value = {
    x: Math.min(position.value.x, window.innerWidth - elWidth),
    y: Math.min(position.value.y, window.innerHeight - elHeight)
  }
}

// 添加窗口resize监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.draggable-widget {
  position: fixed;
  cursor: move;
  user-select: none;
  z-index: 999;
  /* 添加平滑过渡效果，让吸附更自然 */
  /* transition: left 0.2s ease, top 0.2s ease; */
}
</style>