<script setup lang="ts">
import { ref } from 'vue'

const sendAUC_flag = ref(false)

const textarea_AUC = ref('')
const textarea_AUC_title = ref('')
const select_AUC = ref<string>('')

function sendAUC() {
  sendAUC_flag.value = true
}
</script>

<template>
  <el-card class="elc" header-class="ui-bg clc gre">
    <template #header>
      发布公告
    </template>
    <el-input
      v-model="textarea_AUC_title"
      placeholder="请输入公告标题"
      style="width: 550px; margin-bottom: 20px;"
    >
      <template #prepend>
        <el-select v-model="select_AUC" placeholder="提及程度" style="width: 115px">
          <el-option label="必看" value="1" />
          <el-option label="重要" value="2" />
          <el-option label="次要" value="3" />
        </el-select>
      </template>
    </el-input>

    <br>

    <el-input v-model="textarea_AUC" maxlength="200" show-word-limit style="width: 550px" :rows="3" type="textarea" placeholder="请输入公告内容" />

    <br>
    <el-button type="primary" :disabled="sendAUC_flag" plain style="margin-top: 20px; float: right;" @click="sendAUC">
      <el-icon style="margin-right: 5px;">
        <Promotion v-if="sendAUC_flag == false" />
        <Select v-else />
      </el-icon>
      发布
    </el-button>
  </el-card>
</template>
<style>
.elc {
  width: max-content;
}

.clc {
  color: #FFF;
}

.red {
  background-color: #b01d1d;
}

.gre {
  background-color: #98df29;
}

.ble {
  background-color: #2a74c6;
}
</style>
