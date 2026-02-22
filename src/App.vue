<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router'
import titleMaps from './titleMap.json'
import DraggableWidget from '@/components/more/DraggableWidget.vue'
// import { usePluginStore } from '@/store/pluginStore'

const route = useRoute();
// const router = useRouter()
// const pluginStore = usePluginStore()

const handleSelect = (index) => {
  console.log('菜单选中:', index)
}

const menuShow = ref(true);

const AppTiele = ref('');
function act() {
  const titleMap = { ...titleMaps.default, ...titleMaps.moreExpansion };
  AppTiele.value = titleMap[route.path.split('/')[1]];
}

console.log(titleMaps.moreExpansion);


watch(
  () => route.path,
  () => {
    act()
  }
)
</script>

<template>
  <div id="miBox">

    <el-container style="height: 100%;">
      <el-aside style="width: auto;">
        <el-menu :default-active="'/' + $route.path.split('/')[1]" router="true" class="menux" default-active="/home"
          :collapse="menuShow">

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
        <el-header class="top_title" style="line-height: 60px;">{{ AppTiele }}</el-header>
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


  </div>

  <!-- <DraggableWidget :threshold="30" style="width: 300px;">
    <el-card>
      <template #header>
        <span>可拖拽组件</span>
      </template>
    </el-card>
  </DraggableWidget> -->

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
}

.divider_line {
  margin: 0 !important;
}
</style>