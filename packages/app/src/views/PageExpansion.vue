<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const up_button_flash = ref(false)
function uploadChange() {
  up_button_flash.value = true
}

const uploadf = ref<InstanceType<typeof import('element-plus')['ElUpload']>>()

function submitUpload() {
  ElMessageBox.confirm(
    '确认安装拓展组件吗?',
    '注意',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    },
  )
    .then(() => {
      uploadf.value?.submit()
    })
    .catch(() => {
    })
}

const centerDialogVisible = ref(false)
const upPageCount = ref(5)
function uploadSuccess() {
  const timer = setInterval(() => {
    centerDialogVisible.value = true
    upPageCount.value--
    if (upPageCount.value <= 0) {
      clearInterval(timer)
      location.reload()
    }
  }, 1000)
}
</script>
<template>
  <el-card>
    <h3>组件拓展</h3>
    <el-upload class="upload-demo" :on-success="uploadSuccess" :on-change="uploadChange" ref="uploadf"
      :auto-upload="false" drag action="http://localhost:8085/uploadFile" method="post" name="file" accept=".zip">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        请把文件拖拽到此处 <em>或点击以上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          请选择.zip格式文件
        </div>
      </template>
    </el-upload>
    <el-button v-if="up_button_flash" type="primary" @click="submitUpload">上传</el-button>
  </el-card>

  <el-card style="margin-top: 20px;">
    <h3>已安装的组件</h3>
  </el-card>

  <el-dialog v-model="centerDialogVisible" title="注意" width="500" align-center>
    <span>{{ upPageCount }}秒后刷新页面</span>
  </el-dialog>
</template>
