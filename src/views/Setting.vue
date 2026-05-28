<script setup>
import { ref, watch } from 'vue'
import eventBus from '@/lib/eventBus.js'
// 引入烟花效果js文件
import { handleMouseDown } from '@/lib/fireworks.js'

// ---------------------------------------------------------------------
const mouseDownEffect = ref(false);
// 使用cookie保存鼠标点击效果状态
// 使用cookie保存鼠标点击效果开关状态
const mouseDownEffectCookieName = 'mouseDownEffect';
// 从cookie中读取鼠标点击效果开关状态
const mouseDownEffectCookieValue = document.cookie.split('; ').find(row => row.startsWith(mouseDownEffectCookieName + '='))?.split('=')[1];
if (mouseDownEffectCookieValue !== undefined) {
    mouseDownEffect.value = mouseDownEffectCookieValue === 'true';
}
// 监听鼠标点击效果开关状态变化，并保存到cookie

watch(mouseDownEffect, (newVal, oldVal) => {
    document.cookie = `${mouseDownEffectCookieName}=${newVal}; path=/; max-age=31536000`;
    if (newVal == true) {
        window.addEventListener('mousedown', handleMouseDown);
    } else {
        window.removeEventListener('mousedown', handleMouseDown);
    }
});
// 根据开关状态添加或移除事件监听
if (mouseDownEffect.value) {
    window.addEventListener('mousedown', handleMouseDown);
} else {
    window.removeEventListener('mousedown', handleMouseDown);
}
// ---------------------------------------------------------------------

// --------------------------背景设置------------------------------------
// 启用背景
const backgroundEnable = ref(false);

const backgroundBlur = ref(false);
const backgroundBlur_val = ref(0);
// 监听背景模糊值变化，并触发事件
watch(backgroundBlur_val, (newVal, oldVal) => {
    eventBus.emit('backgroundBlurChange_val', newVal);
});
// 监听背景模糊开关状态变化，并触发事件
watch(backgroundBlur, (newVal, oldVal) => {
    eventBus.emit('backgroundBlurChange', newVal);
});

// ---------------------------------------------------------------------

// --------------------------播放器设置----------------------------------
// 管理器音乐播放器开关
const managerMusicPlayer = ref(false);
// 站点音乐播放器开关
const siteMusicPlayer = ref(false);

// 通过cookie保存管理器音乐播放器开关状态
const managerMusicPlayerCookieName = 'managerMusicPlayer';
// 从cookie中读取管理器音乐播放器开关状态
const managerMusicPlayerCookieValue = document.cookie.split('; ').find(row => row.startsWith(managerMusicPlayerCookieName + '='))?.split('=')[1];
if (managerMusicPlayerCookieValue !== undefined) {
    managerMusicPlayer.value = managerMusicPlayerCookieValue === 'true';
}
// 监听管理器音乐播放器开关状态变化，并保存到cookie
watch(managerMusicPlayer, (newVal, oldVal) => {
    document.cookie = `${managerMusicPlayerCookieName}=${newVal}; path=/; max-age=31536000`;
});
// 监听管理器音乐播放器开关状态变化，并触发事件
watch(managerMusicPlayer, (newVal, oldVal) => {
    eventBus.emit('managerMusicPlayerChange', newVal);
});
// 监听站点音乐播放器开关状态变化，并触发事件
watch(siteMusicPlayer, (newVal, oldVal) => {
    eventBus.emit('siteMusicPlayerChange', newVal);
});
// ---------------------------------------------------------------------
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