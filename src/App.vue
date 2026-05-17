<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router'
import titleMaps from './titleMap.json'
import DraggableWidget from '@/components/more/DraggableWidget.vue'
import MusicTool from '@/components/more/MusicTool.vue'

import eventBus from '@/js/eventBus.js'



// import { usePluginStore } from '@/store/pluginStore'

const route = useRoute();
// const router = useRouter()
// const pluginStore = usePluginStore()

const handleSelect = (index) => {
  console.log('菜单选中:', index)
}

const userBox_it = ref('');

const menuShow = ref(true);
watch(menuShow, (newVal, oldVal) => {
  if (newVal) {
    userBox_it.value = '';
  } else {
    userBox_it.value = 'userBox_it_show';
  }
})
const userBox_so = ref(false);

const AppTiele = ref('');
function act() {
  const titleMap = { ...titleMaps.default, ...titleMaps.moreExpansion };
  AppTiele.value = titleMap[route.path.split('/')[1]];
}

const size = ref(40);
const circleUrl = ref('./img/731ac3e8e6dd38c397bbab65b0197a171862641106.png');
const userName = ref('里子');

console.log(titleMaps.moreExpansion);

watch(
  () => route.path,
  () => {
    act()
  }
)

const managerMusicPlayer = ref(false);
// 读取cookie中管理器音乐播放器开关状态
const managerMusicPlayerCookieName = 'managerMusicPlayer';
const managerMusicPlayerCookieValue = document.cookie.split('; ').find(row => row.startsWith(managerMusicPlayerCookieName + '='))?.split('=')[1];
if (managerMusicPlayerCookieValue !== undefined) {
  managerMusicPlayer.value = managerMusicPlayerCookieValue === 'true';
}
// 监听管理器音乐播放器开关状态变化，并触发事件
eventBus.on('managerMusicPlayerChange', (newVal) => {
  managerMusicPlayer.value = newVal;
});

// --------------------------背景模糊------------------------------------
const backgroundBlur = ref(false);
const backgroundBlur_val = ref(0);


eventBus.on('backgroundBlurChange_val', newVal => {
  backgroundBlur_val.value = newVal;
});
// 监听背景模糊开关状态变化，并触发事件
eventBus.on('backgroundBlurChange', newVal => {
  backgroundBlur.value = newVal;
});

// css
watch(backgroundBlur_val, (newVal, oldVal) => {
  document.querySelector('.appBck').style.filter = `blur(${newVal}px)`;
});
watch(backgroundBlur, (newVal, oldVal) => {
  if (!newVal) {
    document.querySelector('.appBck').style.filter = `blur(0px)`;
  }
});


// ---------------------------------------------------------------------
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

          <el-sub-menu v-if="Object.keys(titleMaps.moreExpansion).length > 0" index="2">
            <template #title>
              <el-icon><i class="bi bi-diagram-2"></i></el-icon>
              <span>更多组件</span>
            </template>
            <el-menu-item v-for="(value, key) in titleMaps.moreExpansion" :index="'/' + key">
              <el-icon><i class="bi bi-diagram-2-fill"></i></el-icon>
              {{ value }}
            </el-menu-item>
          </el-sub-menu>

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
          <RouterView v-slot="{ Component, route }">
            <Transition name="fade" mode="out-in">
              <div class="rv-box" v-if="Component" :key="route.matched[0]?.path"> <!--Key是是否能分开动画的关键-->
                <component :is="Component" />
              </div>
            </Transition>
          </RouterView>
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
  /* background-image: url(img/bck1.png); */
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
#userBox:hover::after{
  filter: blur(5px);
}
#userBox::after{
  position: absolute;
  content: '';
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;

  background: linear-gradient(90deg,
  red 0%,red 20%
  ,yellow 10%,yellow 40%,#09f 10%);
  filter: blur(10px);

  transition: all 0.3s ease-in-out;
}

.userBox_it_show {
  margin: 10px;
  border-radius: 5px;
}
</style>