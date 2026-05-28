<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { VersionItem } from '@jc-cms/shared'

const StartDay = ref(dayjs().format('YYYY-MM-DD'))
const EndDay = ref(dayjs().set('month', Number(dayjs().format('MM'))).set('date', 30).format('YYYY-MM-DD'))

const dateList = computed(() => {
  const start = dayjs(StartDay.value)
  const end = dayjs(EndDay.value)
  const daysDiff = end.diff(start, 'day')
  const list: string[] = []
  for (let i = 0; i <= daysDiff; i++) {
    list.push(start.add(i, 'day').format('YYYY-MM-DD'))
  }
  return list
})

const props = withDefaults(defineProps<{
  version?: VersionItem[]
  title?: string | null
}>(), {
  version: () => [],
  title: null,
})

interface VersionItemWithStyle extends VersionItem {
  style: {
    marginLeft: string
    width: string
    background: string
  }
}

const versionItems = computed((): VersionItemWithStyle[] => {
  const totalDays = dateList.value.length
  if (totalDays === 0) return []

  const startBoundary = dayjs(StartDay.value)
  const endBoundary = dayjs(EndDay.value)

  return props.version
    .map((item) => {
      const startDate = dayjs(item.start)
      const endDate = dayjs(item.end)

      let back: string
      if (item.background == undefined) {
        back = '#09f'
      }
      else {
        back = `url(${item.background})`
      }

      if (!startDate.isValid() || !endDate.isValid()) return null

      let startIndex = startDate.diff(startBoundary, 'day')
      let endIndex = endDate.diff(startBoundary, 'day')

      if (startIndex > totalDays - 1 || endIndex < 0) return null

      startIndex = Math.max(0, startIndex)
      endIndex = Math.min(totalDays - 1, endIndex)

      if (startIndex > endIndex) return null

      let leftPercent = 0
      let widthPercent = 0

      const isFullWidth = (startDate.isBefore(startBoundary) || startDate.isSame(startBoundary))
        && (endDate.isAfter(endBoundary) || endDate.isSame(endBoundary))

      if (isFullWidth) {
        leftPercent = 0
        widthPercent = 100
      }
      else {
        leftPercent = (startIndex / totalDays) * 100
        const spanDays = endIndex - startIndex + 1
        widthPercent = (spanDays / totalDays) * 100
      }

      return {
        ...item,
        style: {
          marginLeft: `${leftPercent}%`,
          width: `${widthPercent}%`,
          background: back,
        },
      }
    })
    .filter((item): item is VersionItemWithStyle => item !== null)
})
</script>

<template>
  <div class="version_calendar">
    <div v-if="title" class="version_calendar_title">{{ title }}</div>
    <div style="padding: 15px;">
      <div class="date_option_list">
        <span class="date_option_item" v-for="(date, index) in dateList" :key="index">
          <span class="date_option_item_month">{{ dayjs(date).format('MM') }}</span>
          {{ dayjs(date).format('DD') }}
        </span>
      </div>

      <div class="version_content">
        <div class="version_content_item" v-for="(item, index) in versionItems" :key="index"
          :style="item.style">
          <div class="version_content_item_start">
            {{ dayjs(item.start).format('MM.DD') }}
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="version_content_item_content">
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.version_calendar {
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}

.version_calendar_title {
  padding: 10px;
  font-size: 16px;
  border-bottom: 1px solid #dcdfe6;
  font-weight: 300;
}

.date_option_list {
  display: flex;
  justify-content: space-between;
}

.date_option_item {
  padding: 10px;
  position: relative;
  color: #0e5e93;
}

.date_option_item:nth-child(1) {
  color: #b01d1d;
}

.date_option_item_month {
  font-size: 12px;
  position: absolute;
  top: 0;
  left: 0;
}

.version_content {
  width: 100%;
}

.version_content_item_content {
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version_content_item {
  background-color: #00b3ff;
  color: #fff;
  padding: 25px 15px;
  border-radius: 5px;
  margin: 20px 0;
  position: relative;
  box-sizing: border-box;
  word-break: break-word;
  white-space: normal;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  background-position: center !important;
}

.version_content_item_start {
  display: flex;
  width: 50px;
  position: absolute;
  top: -10px;
  left: 10px;
  border-radius: 50px;
  padding: 2px 5px;
  background-color: #9b1717;
  background-image: linear-gradient(45deg, #9c9c9c2f 25%, transparent 25%, transparent 50%, #9c9c9c2f 50%, #9c9c9c2f 75%, transparent 75%, transparent);
  background-size: 4px 4px;
  background-position: 0 0;
  background-repeat: repeat;
  font-size: 12px;
  white-space: nowrap;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}
</style>
