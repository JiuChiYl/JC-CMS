import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 拖拽吸附组件
import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

import ECharts from 'vue-echarts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart,GaugeChart,PieChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent
} from 'echarts/components';

echarts.use([
  CanvasRenderer,
  LineChart,
  GaugeChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent
]);

import { createPinia } from 'pinia'
// import { PluginManager } from '../src/manager/PluginManager'


const app = createApp(App)
// const pinia = createPinia()

app.component('v-chart', ECharts);
app.use(createPinia())

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(Vue3DraggableResizable)
// app.use(pinia)

// 初始化插件管理器
// const pluginManager = PluginManager.getInstance()
// pluginManager.initialize(app, router)

// 提供插件管理器给所有组件
// app.provide('pluginManager', pluginManager)

app.mount('#app')
