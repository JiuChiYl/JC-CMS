<template>
  <el-config-provider :locale="zhCn">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card shadow="never" :body-style="{ maxHeight: '905px', overflow: 'hidden' }">
          <template #header>
            <div class="search">
              <div>
                <el-input v-model="inputValue" class="search-input" placeholder="图片检索" @keydown="inputKeyDown"
                  :prefix-icon="Search" />
                <el-button plain @click="filter" style="margin-left: 20px;" type="primary">
                  <span>筛选</span>
                  <el-icon class="el-icon--right">
                    <i class="bi bi-funnel"></i>
                  </el-icon>
                </el-button>
              </div>
              <div v-if="filterFlag" class="filter-sty">
                <el-dropdown v-for="item in filterArr" :key="item.type" class="dropdown-sty"
                  @command="(command) => handleCommand(command, item.type)">
                  <span class="el-dropdown-link">
                    {{ item.name }}
                    <el-icon class="el-icon--right">
                      <arrow-down />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-for="item2 in item.childer" :key="item2.key" :command="item2">{{ item2.value
                        }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>
          <div class="photo">
            <div class="images">
              <div v-for="(item, index) in imgArr" :key="index">
                <div class="img-box">
                  <div class="img_info_size_box">
                    <!-- 分类 -->
                    <div class="img_info_item"><!-- 大小-->
                      <el-icon class="el-icon--left">
                        <i class="bi bi-aspect-ratio"></i>
                      </el-icon>
                      <span>{{ item.size }}</span>
                    </div>
                    <div class="img_info_item"><!-- 类型-->
                      <el-icon class="el-icon--left">
                        <i class="bi bi-card-image"></i>
                      </el-icon>
                      <span>{{ item.category }}</span>
                    </div>
                    <div class="img_info_item"><!-- 上传时间-->
                      <el-icon class="el-icon--left">
                        <i class="bi bi-clock"></i>
                      </el-icon>
                      <span>{{ item.uploadTime }}</span>
                    </div>
                  </div>
                  <img :src="item.url" alt="item.keyWords">
                  <div class="img_btn_box">
                    <el-button-group>
                      <el-button plain color="#0099ff" class="btn_col" size="small">
                        <el-icon class="el-icon--left">
                          <Download />
                        </el-icon>
                        下载
                      </el-button>
                      <el-button plain color="#ff4949" class="btn_col" size="small">
                        删除
                        <el-icon class="el-icon--right">
                          <Delete />
                        </el-icon>
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
                <p>
                  {{ item.title }}
                </p>
              </div>
            </div>
          </div>
          <template #footer>
            <el-pagination layout="total, prev, pager, next, jumper" :total="100" :page-size="10" :pager-count="4" />
          </template>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <el-row :gutter="0">
              <el-col :span="12">
                <el-text type="success" size="large" style="padding: 4px 0px; display: block;">
                  批量上传
                  <el-icon class="el-icon--right">
                    <i class="bi bi-cloud-arrow-up"></i>
                  </el-icon>
                </el-text>
              </el-col>
              <el-col :span="12">
                <el-button plain type="success" class="btn-sty" @click="upload">
                  单独上传
                  <el-icon class="el-icon--right">
                    <i class="bi bi-cloud-arrow-up"></i>
                  </el-icon>
                </el-button>
              </el-col>
            </el-row>
          </template>
          <el-upload v-model:file-list="fileList" action="" list-type="picture-card"
            :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
          <template #footer>
            <el-text size="large" style="display: block;">
              批量上传配置
            </el-text>
            <br>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-select v-model="value" placeholder="图片尺寸" style="width: 100%;">
                  <!-- <el-option v-for="item in filterArr[0]" :key="item.key" :label="item.value" :value="item.value" /> -->
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select v-model="value" placeholder="图片类型" style="width: 100%;">
                  <!-- <el-option v-for="item in filterArr[1]" :key="item.key" :label="item.value" :value="item.value" /> -->
                </el-select>
              </el-col>
            </el-row>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </el-config-provider>


</template>
<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, onMounted } from 'vue'
import { Search, Upload, Download, Delete, ArrowDown } from '@element-plus/icons-vue'
import dayjs from 'dayjs';
// import { ajax } from '@/api/index';
const inputValue = ref('')
const filterFlag = ref(false)
const filterArr = reactive([])
const imgArr = reactive([])

const uploads = reactive({
  size: '',
  category: ''
})
// 输入框回车事件
// 搜索
const inputKeyDown = (e) => {
  if (e.code === "Enter") {
    getImageList()
  }
}
// 上传
const upload = () => {
  console.log(11);

}
// 筛选
const filter = () => {
  filterFlag.value = !filterFlag.value
}
// 获取图片查询结果
const getImageList = () => {
  //请求参数组合
  const obj = {}
  filterArr.forEach(item => {
    obj[item.type] = item.key
  })
  obj.searchName = inputValue.value;
  console.log(obj);
}
// 筛选下拉框点击
const handleCommand = (command, type) => {
  filterArr.forEach(item => {
    if (item.type === type) {
      item.name = command.value
      item.key = command.key
    }
  })
  // 调取图片查询接口
  getImageList()
}
// 初始化-获取筛选条件列表
const initFilterList = () => {
  // ajax.getFilterData()
  filterArr.push(
    {
      name: '图片尺寸',
      type: 'imgSize',
      key: '1',
      childer: [
        {
          key: '1',
          value: '全部'
        },
        {
          key: '2',
          value: '小'
        },
        {
          key: '3',
          value: '中'
        },
        {
          key: '4',
          value: '大'
        },
        {
          key: '5',
          value: '特大'
        }
      ]
    },
    {
      name: '类型',
      type: 'category',
      key: '1',
      childer: [
        {
          key: '1',
          value: '全部'
        },
        {
          key: '2',
          value: '风景'
        },
        {
          key: '3',
          value: '人像'
        },
        {
          key: '4',
          value: '绘画'
        },
        {
          key: '5',
          value: '其他'
        }
      ]
    },
    {
      name: '上传时间',
      type: 'time',
      key: '1',
      childer: [
        {
          key: '1',
          value: '全部'
        },
        {
          key: '2',
          value: '过去24小时'
        },
        {
          key: '3',
          value: '过去一周'
        },
        {
          key: '4',
          value: '过去一个月'
        },
        {
          key: '5',
          value: '去年'
        }
      ]
    }
  )
}
// 初始化-获取第一页图片数据
// 模拟数据
const initImages = () => {
  for (let index = 0; index < 24; index++) {
    imgArr.push({
      name: '达妮娅',
      keyWords: '背景,达妮娅',
      title: '精选背景图片',
      url: './img/bck1.png',
      uploadTime: dayjs().format('YYYY-MM-DD'),
      size: '中',
      category: '绘画',
    })
  }
  console.log(imgArr);

}
onMounted(() => {
  initFilterList();
  initImages();
})
</script>
<style scoped>
.search {
  display: flex;
  justify-content: space-between;
  align-items: center;

  & div:last-child {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}

.search-input {
  width: 240px;
}

.btn-sty {
  /* margin-right: 20px; */
  float: right;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.dropdown-sty:focus-visible,
.el-dropdown-link:focus-visible {
  outline: none !important;
}

.dropdown-sty {
  margin-right: 20px;
}

.dropdown-sty:last-child {
  margin-right: 0;
}

.photo {
  position: relative;
}

.filter-sty {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  transition: opacity .3s ease-in-out;
}

.images {
  /* margin-top: 20px; */
  display: grid;
  grid-gap: 0px 10px;
  grid-template-columns: auto auto auto auto auto auto;
  justify-content: center;

  >div {
    text-align: center;
    margin-bottom: 20px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      max-width: 230px;
      min-width: 180px;
      border-radius: 5px;
    }

    p {
      margin: 0;
    }
  }
}

.img-box {
  position: relative;
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: 5px;
  width: max-content;
}

.img_btn_box {
  width: 100%;
  padding: 5px;
  position: absolute;
  bottom: -40px;
  transition: all 0.3s ease-in-out;
  backdrop-filter: blur(10px);
  background-image: linear-gradient(45deg,
      #9c9c9c2f 25%, transparent 25%, transparent 50%,
      #9c9c9c2f 50%, #9c9c9c2f 75%, transparent 75%, transparent);
  background-size: 4px 4px;
  background-position: 0 0;
  background-repeat: repeat;
  border-top: 1px solid #ffffff49;
}

.images>div:hover .img_btn_box {
  bottom: 0px;
}

.img_info_size_box {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #ffffffbb;
  padding: 0px 5px;
  font-size: 11px;
  border-radius: 3px;
  backdrop-filter: blur(10px);
  border: 1px solid #ffffff71;
  display: flex;
  align-items: center;

  background-image: linear-gradient(45deg,
      #9c9c9c17 25%, transparent 25%, transparent 50%,
      #9c9c9c17 50%, #9c9c9c17 75%, transparent 75%, transparent);
  background-size: 4px 4px;
  background-position: 0 0;
  background-repeat: repeat;
}

.img_info_item {
  display: flex;
  align-items: center;
  margin-left: 10px;

  &:first-child {
    margin-left: 0;
  }
}
</style>
