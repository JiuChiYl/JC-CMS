<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import titleMaps from './titleMap.json'
import type { TitleMapData, ChatMessage } from '@jc-cms/shared'
import DraggableWidget from '@/components/more/DraggableWidget.vue'
import MusicTool from '@/components/more/MusicTool.vue'
import axios from 'axios'
import eventBus from '@/lib/eventBus'

const titleMap = titleMaps as TitleMapData

const agent_say = ref('')
const agent_think = ref(false)

const agent_content = ref<ChatMessage[]>([])
const scrollbarRef = ref<InstanceType<typeof import('element-plus')['ElScrollbar']>>()

const scrollTopFn = () => {
  nextTick(() => {
    const scrollTop = scrollbarRef.value?.wrapRef
    if (scrollTop) {
      scrollbarRef.value?.setScrollTop(scrollTop.scrollHeight - scrollTop.clientHeight)
    }
  })
}

onMounted(async () => {
  const gs = await axios.get('http://localhost:3553/api/context', {
    params: {
      context: 'cU7zCB_aRBa2.json',
    },
  })
  agent_content.value = gs.data
  scrollTopFn()
})

const sendQuestion = async () => {
  const userQuestion = agent_say.value.trim()
  if (!userQuestion) return

  agent_content.value.push({
    role: 'user',
    content: userQuestion,
  })
  scrollTopFn()

  const aiMessage: ChatMessage = {
    role: 'assistant',
    content: '',
  }
  agent_content.value.push(aiMessage)
  agent_say.value = ''
  scrollTopFn()

  try {
    const response = await fetch('http://localhost:3553/api/ai?' + new URLSearchParams({
      context: 'cU7zCB_aRBa2.json',
      say: userQuestion,
    }))

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim()

          if (dataStr === '[DONE]') {
            continue
          }

          try {
            const parsed = JSON.parse(dataStr)
            const chunkContent = parsed.choices?.[0]?.delta?.content || ''
            if (chunkContent) {
              aiMessage.content += chunkContent
              agent_content.value = [...agent_content.value]
              scrollTopFn()
            }
          }
          catch (e) {
            console.error('解析 JSON 失败:', e, dataStr)
          }
        }
      }
    }

    if (buffer.startsWith('data:')) {
      const dataStr = buffer.substring(5).trim()
      if (dataStr !== '[DONE]') {
        try {
          const parsed = JSON.parse(dataStr)
          const chunkContent = parsed.choices?.[0]?.delta?.content || ''
          if (chunkContent) {
            aiMessage.content += chunkContent
            agent_content.value = [...agent_content.value]
            scrollTopFn()
          }
        }
        catch (e) {
          console.error('解析剩余内容失败:', e)
        }
      }
    }
  }
  catch (e) {
    console.error('请求失败:', e)
    aiMessage.content = '抱歉，请求失败：' + (e as Error).message
    agent_content.value = [...agent_content.value]
    scrollTopFn()
  }
}

const route = useRoute()

const handleSelect = (index: string) => {
  console.log('菜单选中:', index)
}

const userBox_it = ref('')

const menuShow = ref(true)
watch(menuShow, (newVal) => {
  if (newVal) {
    userBox_it.value = ''
  }
  else {
    userBox_it.value = 'userBox_it_show'
  }
})
const userBox_so = ref(false)

const AppTiele = ref('')
function act() {
  const allTitles = { ...titleMap.default, ...titleMap.moreExpansion }
  AppTiele.value = allTitles[route.path.split('/')[1]] || ''
}

const size = ref(40)
const circleUrl = ref(new URL('@/assets/img/731ac3e8e6dd38c397bbab65b0197a171862641106.png', import.meta.url).href)
const userName = ref('里子')

watch(
  () => route.path,
  () => {
    act()
  },
)

const managerMusicPlayer = ref(false)
const managerMusicPlayerCookieName = 'managerMusicPlayer'
const managerMusicPlayerCookieValue = document.cookie.split('; ').find(row => row.startsWith(managerMusicPlayerCookieName + '='))?.split('=')[1]
if (managerMusicPlayerCookieValue !== undefined) {
  managerMusicPlayer.value = managerMusicPlayerCookieValue === 'true'
}
eventBus.on('managerMusicPlayerChange', (newVal) => {
  managerMusicPlayer.value = newVal
})

const backgroundBlur = ref(false)
const backgroundBlur_val = ref(0)

eventBus.on('backgroundBlurChange_val', (newVal) => {
  backgroundBlur_val.value = newVal
})
eventBus.on('backgroundBlurChange', (newVal) => {
  backgroundBlur.value = newVal
})

watch(backgroundBlur_val, (newVal) => {
  const el = document.querySelector('.appBck') as HTMLElement | null
  if (el)
    el.style.filter = `blur(${newVal}px)`
})
watch(backgroundBlur, (newVal) => {
  if (!newVal) {
    const el = document.querySelector('.appBck') as HTMLElement | null
    if (el)
      el.style.filter = 'blur(0px)'
  }
})
</script>

<template>
  <div id="miBox">
    <el-container style="height: 100%;">
      <el-aside style="width: auto;" class="menux-i">
        <el-menu :default-active="'/' + $route.path.split('/')[1]" router="true" class="menux --el-transition-all"
          default-active="/home" :collapse="menuShow">

          <el-popover title="用户信息" effect="light" placement="right" popper-style="width:auto;" :visible="userBox_so">
            <template #reference>
              <el-menu-item id="userBox" :class="userBox_it" @click="userBox_so = !userBox_so">
                <el-icon>
                  <el-avatar size="small" :src="circleUrl" />
                </el-icon>
                <template #title>{{ userName }}</template>
              </el-menu-item>
            </template>
            <el-card shadow="never" style="margin-bottom: 10px;" body-style="padding: 10px !important;">
              <el-text size="small">用户名: {{ userName }}</el-text>
              <br>
              <el-text size="small">角色: 管理员</el-text>
              <br>
              <el-text size="small">邮箱: <span style="color: #007bff;">admin@example.com</span></el-text>
              <br>
            </el-card>
            <el-divider style="margin:0;" />
            <el-button style="width: 100%; margin-top: 10px;" type="danger" size="mini">退出登录</el-button>
          </el-popover>

          <el-menu-item index="/home">
            <el-icon>
              <House />
            </el-icon>
            <template #title>主页</template>
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title>
              <el-icon><i class="bi bi-tools"></i></el-icon>
              <span>工具</span>
            </template>
            <el-menu-item index="/eventLog">
              <el-icon>
                <i class="bi bi-calendar2-week"></i>
              </el-icon>
              周期事件记录器
            </el-menu-item>
            <el-menu-item index="/calendaryDate">
              <el-icon>
                <i class="bi bi-calendar-date"></i>
              </el-icon>
              日程
            </el-menu-item>
            <el-menu-item index="/pageExpansion">
              <el-icon>
                <i class="bi bi-node-plus"></i>
              </el-icon>
              组件拓展
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/setting">
            <el-icon>
              <i class="bi bi-gear"></i>
            </el-icon>
            <template #title>设置</template>
          </el-menu-item>

          <el-menu-item index="/user">
            <el-icon>
              <i class="bi bi-people"></i>
            </el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <el-menu-item index="/editorPost">
            <el-icon>
              <i class="bi bi-pencil"></i>
            </el-icon>
            <template #title>撰写文章</template>
          </el-menu-item>

          <el-menu-item index="/postManage">
            <el-icon>
              <i class="bi bi-file-earmark-text"></i>
            </el-icon>
            <template #title>文章管理</template>
          </el-menu-item>

          <el-menu-item index="/photo">
            <el-icon>
              <i class="bi bi-image"></i>
            </el-icon>
            <template #title>图库管理</template>
          </el-menu-item>

          <el-menu-item index="/dashboard">
            <el-icon>
              <i class="bi bi-speedometer"></i>
            </el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-sub-menu v-if="Object.keys(titleMap.moreExpansion).length > 0" index="2">
            <template #title>
              <el-icon><i class="bi bi-diagram-2"></i></el-icon>
              <span>更多组件</span>
            </template>
            <el-menu-item v-for="(value, key) in titleMap.moreExpansion" :index="'/' + key">
              <el-icon><i class="bi bi-diagram-2-fill"></i></el-icon>
              {{ value }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item @click="">
            <el-icon>
              <i class="bi bi-stars"></i>
            </el-icon>
            <template #title>智能体</template>
          </el-menu-item>

          <el-menu-item @click="menuShow = !menuShow">
            <el-icon v-if="menuShow">
              <Expand />
            </el-icon>
            <el-icon v-else>
              <Fold />
            </el-icon>
            <template #title>{{ menuShow ? '展开菜单' : '收起菜单' }}</template>
          </el-menu-item>

        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="top_title bd_ui_lin" style="line-height: 60px;">{{ AppTiele }}</el-header>
        <el-divider class="divider_line"></el-divider>

        <el-main>
          <el-row :gutter="15">
            <el-col :span="18">
              <RouterView v-slot="{ Component, route }">
                <Transition name="fade" mode="out-in">
                  <div class="rv-box" v-if="Component" :key="route.matched[0]?.path">
                    <component :is="Component" />
                  </div>
                </Transition>
              </RouterView>
            </el-col>
            <el-col :span="6">
              <el-card class="agent_box">
                <template #header>
                  <el-text>询问智能体</el-text>
                </template>

                <el-scrollbar ref="scrollbarRef">
                  <div v-for="(msg, index) in agent_content" :key="index">
                    <div class="agent_msg_item"
                      :class="msg.role === 'assistant' ? 'agent_assistant_msg' : 'agent_user_msg'"
                      v-if="msg.role !== 'system'">

                      <el-icon class="el-icon el-icon--left" v-if="msg.role === 'assistant'">
                        <i class="bi bi-stars"></i>
                      </el-icon>
                      <div class="agent_msg_content">
                        {{ msg.content }}
                      </div>

                    </div>
                  </div>
                </el-scrollbar>

                <template #footer>
                  <div class="think_bt" @click="agent_think = !agent_think" :class="{ 'think_bt_active': agent_think }">
                    <el-icon class="el-icon el-icon--left">
                      <i class="bi bi-boxes"></i>
                    </el-icon>
                    <span>深度思考</span>
                  </div>
                  <el-input placeholder="请输入问题" clearable v-model="agent_say">
                    <template #prefix>
                      <el-icon>
                        <span :class="['icon__inner_bck', agent_think ? 'icon__inner_bck_think' : 'icon__inner_bck_f']">
                          <i class="bi bi-stars"></i>
                        </span>
                      </el-icon>
                    </template>
                    <template #append>
                      <el-button type="primary" size="mini" @click="sendQuestion">
                        <el-icon color="#0099ff"><i class="bi bi-send"></i></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </template>
              </el-card>
            </el-col>
          </el-row>
        </el-main>



      </el-container>
    </el-container>
    <div class="appBck"></div>
  </div>

  <DraggableWidget v-if="managerMusicPlayer" :threshold="30" class="musicToolBox" style="width: 350px;">
    <MusicTool />
  </DraggableWidget>

</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

#miBox {
  width: 100%;
  height: 100vh;
  position: relative;
}

.appBck {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
}

#contentBox {
  width: 100%;
  height: 100%;
  display: flex;
}

.menux {
  height: 100%;
  position: fixed;
  width: 200px;
  overflow: hidden;
}

.divider_line {
  margin: 0 !important;
}

#userBox {
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
}

#userBox:hover::after {
  filter: blur(5px);
}

#userBox::after {
  position: absolute;
  content: '';
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;

  background: linear-gradient(90deg,
      red 0%, red 20%, yellow 10%, yellow 40%, #09f 10%);
  filter: blur(10px);

  transition: all 0.3s ease-in-out;
}

.userBox_it_show {
  margin: 10px;
  border-radius: 5px;
}

.agent_box {
  height: calc(100vh - 115px);
  width: calc(100% - 77%);
  box-sizing: border-box;
  position: fixed;
}

.icon__inner_bck {
  transition: all .3s ease-in-out;
  background-clip: text;
  color: transparent;
}

.icon__inner_bck_f {
  background-color: #09f;
}

.icon__inner_bck_think {
  background-color: red;
}

.think_bt {
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #c9c9c9;
  width: max-content;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all .3s ease-in-out;
  color: #828282;
}

.think_bt_active {
  background-color: #0099ff2b;
  border-color: #0099ff;
  color: #09f;
}

.think_bt span {
  font-size: 14px;
}

.agent_msg_item {
  padding: 8px 12px;
  border-radius: 5px;
  margin-bottom: 8px;
  max-width: 100%;
  word-wrap: break-word;
  border: 1px solid #c9c9c9;
}

.agent_assistant_msg {
  background-color: #0099ff2b;
}

.agent_user_msg {
  background-color: #f5f5f5;
}

.agent_msg_content {
  white-space: pre-line;
}
</style>
