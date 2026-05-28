<script setup lang="ts">
import { dayjs } from 'element-plus'
import { MoreFilled, Warning, InfoFilled, Check, Refresh, Search } from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref } from 'vue'
import type { ScheduleItem } from '@jc-cms/shared'

const value = ref(new Date())

const calendarRef = ref<InstanceType<typeof import('element-plus')['ElCalendar']>>()

const ne = (cellData: { day: string }) => {
  console.log(cellData.day)
}

interface ImportantType {
  name: string
  type: string
  icon: unknown
}

const importantType = ref<ImportantType[]>([
  {
    name: '次要',
    type: 'primary',
    icon: MoreFilled,
  },
  {
    name: '重要',
    type: 'warning',
    icon: InfoFilled,
  },
  {
    name: '关键',
    type: 'danger',
    icon: Warning,
  },
  {
    name: 'SUCCESS',
    type: 'success',
    icon: Check,
  },
])

const schedule = ref<ScheduleItem[]>([
  { date: '2026-02-05', title: 'ace测试', time: '08:00', important: 0 },
  { date: '2026-02-05', title: '游戏开服', time: '08:00', important: 2 },
  { date: '2026-02-05', title: '赛季更新', time: '08:00', important: 1 },
  { date: '2026-11-15', title: '我的生日！', time: '08:00', important: 2 },
  { date: '2026-02-03', title: '开发ing', time: '08:00', important: 0 },
  { date: '2026-02-11', title: '朋友生日？', time: '08:00', important: 0 },
])

const uniqueDate = (): string[] => {
  const psg: string[] = []
  schedule.value.forEach(item => psg.push(item.date))

  const dateLst = [...new Set(psg)].sort((a, b) => {
    return dayjs(a, 'YYYY-MM-DD').diff(dayjs(b, 'YYYY-MM-DD'))
  })
  return dateLst
}

console.log(uniqueDate())

const getScheduleItem = (date: string): ScheduleItem | undefined => {
  return schedule.value.find(item => item.date === date)
}

const timeLineNow = (date: string): number => {
  if (date == dayjs(new Date()).format('YYYY-MM-DD')) {
    return 3
  }
  else if (date > dayjs(new Date()).format('YYYY-MM-DD')) {
    return 0
  }
  else {
    return 3
  }
}

const createDateTimeLineName = ref('')
const createDateTimeLine = ref('')
const createDateTimeLineList = ref('')

const createDateTimeLineRefresh = () => {
  createDateTimeLine.value = ''
  createDateTimeLineList.value = ''
  createDateTimeLineName.value = ''
}

const DateTimeLineSearch = ref('')
const DateTimeLineSearchRange = ref('')

const DateTimeLineListPage = ref(1)

const filterTag = (value: string, row: ScheduleItem) => {
  return row.important == Number(value)
}
</script>
<template>
  <el-config-provider :locale="zhCn">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <h3>创建日程</h3>
          <br>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input v-model="createDateTimeLineName" style="width: 100%;">
                <template #prepend>日程标题</template>
              </el-input>
            </el-col>
            <el-col :span="12">
              <el-date-picker style="width: 100%;" v-model="createDateTimeLine" type="datetime"
                placeholder="选择日程时间">
              </el-date-picker>
            </el-col>
          </el-row>
          <br>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-select v-model="createDateTimeLineList" placeholder="重点程度">
                <el-option v-for="(item, index) in importantType" :key="index" :label="item.name"
                  :value="item.type" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button style="width: 100%;" @click="createDateTimeLineRefresh" :icon="Refresh"
                type="primary">
                重置
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button style="width: 100%;" type="success">
                <el-icon style="margin-right: 6px;"><i class="bi bi-floppy"></i></el-icon>
                提交
              </el-button>
            </el-col>
          </el-row>
          <el-divider />
          <h3>日程时间线</h3>
          <br>
          <el-timeline>
            <el-scrollbar max-height="300px">
              <el-timeline-item v-for="(activity, index) in uniqueDate()" :key="index" placement="top"
                :type="importantType[timeLineNow(activity)].type"
                :icon="importantType[timeLineNow(activity)].icon" :timestamp="activity">
                <div v-for="acv in schedule">
                  <div v-if="acv.date == activity">
                    {{ acv.title }}
                    <el-divider direction="vertical" />
                    {{ acv.time }}
                  </div>
                </div>
              </el-timeline-item>
            </el-scrollbar>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card style="height: 100%;">
          <h3>日历</h3>
          <el-calendar v-model="value" ref="calendarRef" controller-type="select">
            <template #date-cell="{ data }">
              <el-scrollbar>
                <div @click="ne(data)" style="height: 100%;">
                  {{ data.day.split('-')[2] }}
                  <div v-if="getScheduleItem(data.day)">
                    <div style="margin: 5px 0px;" v-for="(title, index) in schedule">
                      <el-badge v-if="data.day == title.date"
                        :value="importantType[title.important].name"
                        :type="importantType[title.important].type"
                        badge-style="font-size:10px">
                        <el-text>
                          {{ title.title }}
                        </el-text>
                      </el-badge>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </template>
          </el-calendar>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top: 20px;">
      <h3>日程操作</h3>
      <el-text>标题检索</el-text>
      <br>
      <el-row :gutter="10" style="width: 380px;">
        <el-col :span="18">
          <el-input v-model="DateTimeLineSearch" placeholder="输入日程标题以检索" :prefix-icon="Search"
            style="width: 100%;" />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" style="width: 100%;">
            检索
          </el-button>
        </el-col>
      </el-row>

      <el-text>范围检索</el-text>
      <br>
      <el-date-picker v-model="DateTimeLineSearchRange" type="daterange" range-separator="-"
        start-placeholder="开始日期" end-placeholder="结束日期" style="margin-bottom: 10px;" />

      <el-table :data="schedule" :default-sort="{ prop: 'date', order: 'descending' }" style="width: 100%">
        <el-table-column prop="date" label="日期" sortable />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="none" label="内容">
          <template #default>-</template>
        </el-table-column>
        <el-table-column prop="tag" label="重点程度" width="100" :filters="[
          { text: '次要', value: '0' },
          { text: '重要', value: '1' },
          { text: '关键', value: '2' },
        ]" :filter-method="filterTag" filter-placement="bottom-end">
          <template #default="scope">
            <el-tag :type="importantType[scope.row.important].type" disable-transitions>{{
              importantType[scope.row.important].name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="right" label="操作">
          <template #default>
            <el-button type="danger">删除</el-button>
            <el-button type="primary">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-pagination v-model:current-page="DateTimeLineListPage" :page-size="10" :background="true"
          layout="total, prev, pager, next" :total="schedule.length" />
      </template>
    </el-card>
  </el-config-provider>
</template>
<style></style>
