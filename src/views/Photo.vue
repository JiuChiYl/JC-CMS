<template>
  <div class="photo">
    <div class="search">
      <div>
        <el-input v-model="inputValue" class="search-input" placeholder="请输入" @keydown="inputKeyDown" />
        <el-button type="primary" class="btn-sty" @click="search">
          <el-icon class="el-icon--left">
            <Search />
          </el-icon>
          搜索
        </el-button>
        <el-button type="primary" class="btn-sty" @click="upload">
          上传
          <el-icon class="el-icon--right">
            <Upload />
          </el-icon>
        </el-button>
      </div>
      <div :style="{ opacity: filterFlag ? '1' : '0' }" class="filter-sty">
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
      <div @click="filter">
        <span>筛选器</span>
        <el-icon>
          <Filter />
        </el-icon>
      </div>
    </div>
    <div class="images">
      <div v-for="(item, index) in imgArr" :key="index">
        <div class="img-box">
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
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
const inputValue = ref('')
const filterFlag = ref(false)
const filterArr = reactive([])
const imgArr = reactive([])
// 输入框回车事件
const inputKeyDown = (e) => {
  if (e.code === "Enter") {
    getImageList()
  }
}
// 搜索
const search = () => {
  getImageList()
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
const initImages = () => {
  for (let index = 0; index < 20; index++) {
    imgArr.push({
      name: '达妮娅',
      keyWords: '背景,达妮娅',
      title: '精选背景图片',
      url: '../../public/img/bck1.png',
      uploadTime: '20260422'
    })
  }
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
  margin-left: 20px;
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
  margin-top: 20px;
  display: grid;
  grid-gap: 10px 10px;
  grid-template-columns: auto auto auto auto auto auto;

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
.img-box{
  position: relative;
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: 5px;
  width: max-content;
}
.img_btn_box{
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
.images>div:hover .img_btn_box{
  bottom: 0px;
}
</style>
