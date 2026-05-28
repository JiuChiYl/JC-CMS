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

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  threshold?: number
  margin?: number
}>(), {
  threshold: 50,
  margin: 10,
})

const draggableRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const startOffset = ref({ x: 0, y: 0 })

const centerPosition = (): { x: number, y: number } => {
  if (!draggableRef.value) return { x: 0, y: 0 }

  const elWidth = draggableRef.value.offsetWidth
  const elHeight = draggableRef.value.offsetHeight

  return {
    x: (window.innerWidth - elWidth) / 2,
    y: (window.innerHeight - elHeight) / 2,
  }
}

onMounted(() => {
  setTimeout(() => {
    position.value = centerPosition()
  }, 0)
})

const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  dragging.value = true

  startPos.value = {
    x: e.clientX,
    y: e.clientY,
  }

  startOffset.value = {
    x: position.value.x,
    y: position.value.y,
  }

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!dragging.value) return

  const dx = e.clientX - startPos.value.x
  const dy = e.clientY - startPos.value.y

  const newX = startOffset.value.x + dx
  const newY = startOffset.value.y + dy

  position.value = {
    x: Math.max(0, Math.min(window.innerWidth - (draggableRef.value?.offsetWidth ?? 0), newX)),
    y: Math.max(0, Math.min(window.innerHeight - (draggableRef.value?.offsetHeight ?? 0), newY)),
  }
}

const stopDrag = () => {
  if (!dragging.value) return

  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)

  const elWidth = draggableRef.value?.offsetWidth ?? 0
  const elHeight = draggableRef.value?.offsetHeight ?? 0
  const currentX = position.value.x
  const currentY = position.value.y

  const distToLeft = currentX - props.margin
  const distToRight = (window.innerWidth - props.margin) - (currentX + elWidth)
  const distToTop = currentY - props.margin
  const distToBottom = (window.innerHeight - props.margin) - (currentY + elHeight)

  let targetX = currentX
  let targetY = currentY

  if (Math.abs(distToLeft) < props.threshold || Math.abs(distToRight) < props.threshold) {
    if (Math.abs(distToLeft) < Math.abs(distToRight)) {
      targetX = props.margin
    }
    else {
      targetX = window.innerWidth - elWidth - props.margin
    }
  }

  if (Math.abs(distToTop) < props.threshold || Math.abs(distToBottom) < props.threshold) {
    if (Math.abs(distToTop) < Math.abs(distToBottom)) {
      targetY = props.margin
    }
    else {
      targetY = window.innerHeight - elHeight - props.margin
    }
  }

  position.value = { x: targetX, y: targetY }
}

const handleResize = () => {
  if (!draggableRef.value) return

  const elWidth = draggableRef.value.offsetWidth
  const elHeight = draggableRef.value.offsetHeight

  position.value = {
    x: Math.min(position.value.x, window.innerWidth - elWidth),
    y: Math.min(position.value.y, window.innerHeight - elHeight),
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

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
}
</style>
