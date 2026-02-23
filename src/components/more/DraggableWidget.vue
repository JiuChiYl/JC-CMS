<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({
    // 吸附阈值（距离边缘多少px时自动吸附）
    threshold: {
        type: Number,
        default: 50
    }
})

const draggableRef = ref(null)
const position = ref({ x: 10, y: 900 })
const dragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const startOffset = ref({ x: 0, y: 0 })

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

// 结束拖拽（核心：自动吸附逻辑）
const stopDrag = () => {
    if (!dragging.value) return

    dragging.value = false
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)

    // --- 自动吸附边缘逻辑（带10px边距）---
    const elWidth = draggableRef.value.offsetWidth
    const elHeight = draggableRef.value.offsetHeight
    const currentX = position.value.x
    const currentY = position.value.y

    // 计算到各边缘的距离
    const distToLeft = currentX - 10  // 距离左边10px边距的距离
    const distToRight = (window.innerWidth - 10) - (currentX + elWidth)  // 距离右边10px边距的距离
    const distToTop = currentY - 10   // 距离上边10px边距的距离
    const distToBottom = (window.innerHeight - 10) - (currentY + elHeight)  // 距离下边10px边距的距离

    let targetX = currentX
    let targetY = currentY

    // 水平方向吸附
    if (Math.abs(distToLeft) < props.threshold || Math.abs(distToRight) < props.threshold) {
        // 选择更近的边缘吸附
        if (Math.abs(distToLeft) < Math.abs(distToRight)) {
            targetX = 10  // 吸附到左边，留10px边距
        } else {
            targetX = window.innerWidth - elWidth - 10  // 吸附到右边，留10px边距
        }
    }

    // 垂直方向吸附
    if (Math.abs(distToTop) < props.threshold || Math.abs(distToBottom) < props.threshold) {
        if (Math.abs(distToTop) < Math.abs(distToBottom)) {
            targetY = 10  // 吸附到上边，留10px边距
        } else {
            targetY = window.innerHeight - elHeight - 10  // 吸附到下边，留10px边距
        }
    }

    // 更新位置（加上平滑过渡）
    position.value = { x: targetX, y: targetY }
}

// 清理事件监听
onUnmounted(() => {
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)
});
</script>
<template>
    <div ref="draggableRef" class="draggable-widget" :style="{
        left: position.x + 'px',
        top: position.y + 'px'
    }" @mousedown="startDrag">
        <slot></slot>
    </div>
</template>
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