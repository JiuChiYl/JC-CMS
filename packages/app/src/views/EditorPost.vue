<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'

import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

const editorRef = shallowRef<IDomEditor>()

const valueHtml = ref('')

const isCollapsible = ref(true)

const editorPostName = ref('')
const editorPostTag = ref<string[]>([])

const EditorSpan = ref(18)

interface ArtworkOption {
  value: number
  label: string
}

const artworkOption = ref<ArtworkOption[]>([
  { value: 1, label: '原创' },
  { value: 2, label: '转载' },
  { value: 3, label: '二创' },
])
const artworkChecked = ref<number | null>(null)

const author = ref('')
const originalAuthor = ref('')
const originalAuthorShow = ref(false)

const onChangeArtworkChecked = () => {
  switch (artworkChecked.value) {
    case 2:
      originalAuthorShow.value = true
      break
    case 3:
      originalAuthorShow.value = true
      break
    default:
      originalAuthorShow.value = false
      break
  }
}

const codeShow = ref(true)
const codeEdit = ref(false)

const showHide_more_bar = () => {
  if (isCollapsible.value) {
    EditorSpan.value = 18
  }
  else {
    EditorSpan.value = 24
  }
}

const toolbarConfig: Partial<IToolbarConfig> = {}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  MENU_CONF: {},
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

editorConfig.MENU_CONF!['uploadImage'] = {
  server: 'http://localhost:8085/upload/img',
  fieldName: 'file',
  maxFileSize: 20 * 1024 * 1024,
  allowedFileTypes: [] as string[],
}
</script>
<template>
  <el-row :gutter="20" style="overflow: hidden;">
    <el-col :span="EditorSpan">
      <el-card>
        <template #header>
          <span>正文内容</span>
          <div style="float: right;">
            <el-text>创作信息</el-text>
            <el-switch style="margin: 0px 10px;" v-model="isCollapsible" @change="showHide_more_bar"
              inline-prompt />
          </div>
        </template>
        <div style="border: 1px solid #ccc; height: 800px; z-index: 999;background-color: #fff;">
          <Toolbar style=" border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
            :mode="'default'" />
          <Editor style=" max-height: 759px; background-color: #ccc; overflow-y: hidden;" v-model="valueHtml"
            :defaultConfig="editorConfig" :mode="'default'" @onCreated="handleCreated" />
        </div>
      </el-card>
    </el-col>
    <el-col v-if="isCollapsible" :span="6" class="editor_menu_bar">
      <el-affix target=".editor_menu_bar" :offset="20">
        <div id="ed-textare">
          <el-card footer-class="ui-bg_2" body-style="gap: 20px;display: grid;">
            <template #header>
              <span>创作信息</span>
            </template>
            <el-input v-model="editorPostName" style="width: 100%;">
              <template #prepend>文章标题</template>
            </el-input>
            <el-input-tag v-model="editorPostTag" tag-type="success" tag-effect="dark"
              placeholder="请输入文章标签">
              <template #tag="{ value }">
                <div style="display: flex; align-items: center;">
                  <el-icon>
                    <i class="bi bi-tag"></i>
                  </el-icon>
                  <span style="margin-left: 5px;">{{ value }}</span>
                </div>
              </template>
            </el-input-tag>

            <el-input v-model="author">
              <template #prepend>创作者：</template>
            </el-input>

            <div>
              <el-row :gutter="0">
                <el-col :span="5" style="display: flex;">
                  <el-text>作品来源：</el-text>
                </el-col>
                <el-col :span="19">
                  <el-select v-model="artworkChecked" @change="onChangeArtworkChecked" clearable
                    placeholder="选择作品来源">
                    <el-option v-for="item in artworkOption" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-col>
              </el-row>
            </div>

            <el-input v-model="originalAuthor" v-if="originalAuthorShow">
              <template #prepend>原作者：</template>
            </el-input>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-button style="width: 100%;" type="primary">保存草稿</el-button>
              </el-col>
              <el-col :span="12">
                <el-button style="width: 100%;" type="success">发布文章</el-button>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12" style="display: flex; justify-content: space-between;">
                <el-text>预览源代码</el-text>
              </el-col>
              <el-col :span="12" style="display: flex; justify-content: space-between;">
                <el-switch v-model="codeShow" class="ml-2"
                  style="--el-switch-on-color: #409EFF; --el-switch-off-color: #ff4949" />
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12" style="display: flex; justify-content: space-between;">
                <el-text>禁用编辑</el-text>
              </el-col>
              <el-col :span="12" style="display: flex; justify-content: space-between;">
                <el-switch v-model="codeEdit" class="ml-2"
                  style="--el-switch-on-color: #409EFF; --el-switch-off-color: #ff4949" />
              </el-col>
            </el-row>

            <template #footer v-if="codeShow">
              <el-text style="margin-bottom: 20px; display: block;">文章源代码预览</el-text>
              <el-input v-model="valueHtml" :disabled="codeEdit" style="width: 100%;"
                :autosize="{ minRows: 2, maxRows: 4 }" :rows="2" type="textarea" placeholder="Editor" />
            </template>
          </el-card>
        </div>
      </el-affix>
    </el-col>
  </el-row>
</template>
<style></style>
