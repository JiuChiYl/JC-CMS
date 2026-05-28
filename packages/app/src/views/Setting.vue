<script setup lang="ts">
import { ref, watch } from 'vue'
import eventBus from '@/lib/eventBus'
import { handleMouseDown } from '@/lib/fireworks'

const mouseDownEffect = ref(false)
const mouseDownEffectCookieName = 'mouseDownEffect'
const mouseDownEffectCookieValue = document.cookie.split('; ').find(row => row.startsWith(mouseDownEffectCookieName + '='))?.split('=')[1]
if (mouseDownEffectCookieValue !== undefined) {
  mouseDownEffect.value = mouseDownEffectCookieValue === 'true'
}

watch(mouseDownEffect, (newVal) => {
  document.cookie = `${mouseDownEffectCookieName}=${newVal}; path=/; max-age=31536000`
  if (newVal) {
    window.addEventListener('mousedown', handleMouseDown)
  }
  else {
    window.removeEventListener('mousedown', handleMouseDown)
  }
})
if (mouseDownEffect.value) {
  window.addEventListener('mousedown', handleMouseDown)
}
else {
  window.removeEventListener('mousedown', handleMouseDown)
}

const backgroundEnable = ref(false)
const backgroundBlur = ref(false)
const backgroundBlur_val = ref(0)

watch(backgroundBlur_val, (newVal) => {
  eventBus.emit('backgroundBlurChange_val', newVal)
})
watch(backgroundBlur, (newVal) => {
  eventBus.emit('backgroundBlurChange', newVal)
})

const managerMusicPlayer = ref(false)
const siteMusicPlayer = ref(false)

const managerMusicPlayerCookieName = 'managerMusicPlayer'
const managerMusicPlayerCookieValue = document.cookie.split('; ').find(row => row.startsWith(managerMusicPlayerCookieName + '='))?.split('=')[1]
if (managerMusicPlayerCookieValue !== undefined) {
  managerMusicPlayer.value = managerMusicPlayerCookieValue === 'true'
}
watch(managerMusicPlayer, (newVal) => {
  document.cookie = `${managerMusicPlayerCookieName}=${newVal}; path=/; max-age=31536000`
})
watch(managerMusicPlayer, (newVal) => {
  eventBus.emit('managerMusicPlayerChange', newVal)
})
watch(siteMusicPlayer, (newVal) => {
  eventBus.emit('siteMusicPlayerChange', newVal)
})
</script>
<template>
  <el-card shadow="never">
    <el-divider content-position="left">管理器主题设置</el-divider>
    <el-row :gutter="10">
      <el-col :span="5"><el-text>点击效果</el-text></el-col>
      <el-col :span="5"><el-switch v-model="mouseDownEffect" /></el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="5"><el-text>启用背景</el-text></el-col>
      <el-col :span="5"><el-switch v-model="backgroundEnable" /></el-col>
    </el-row>
    <el-row :gutter="10" v-if="backgroundEnable">
      <el-col :span="5"><el-text>背景模糊</el-text></el-col>
      <el-col :span="2"><el-switch v-model="backgroundBlur" /></el-col>
      <el-col :span="5"><el-slider :disabled="!backgroundBlur" :min="0" :max="10" :step="1" v-model="backgroundBlur_val" /></el-col>
    </el-row>
    <el-divider content-position="left">小组件设置</el-divider>
    <el-row :gutter="10">
      <el-col :span="5"><el-text>管理器音乐播放器</el-text></el-col>
      <el-col :span="5"><el-switch v-model="managerMusicPlayer" /></el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="5"><el-text>站点音乐播放器</el-text></el-col>
      <el-col :span="5"><el-switch v-model="siteMusicPlayer" /></el-col>
    </el-row>
  </el-card>
</template>
<style></style>
