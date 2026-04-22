<template>
  <div class="photo">
    <div class="search">
      <div>
        <el-input v-model="inputValue" class="search-input" placeholder="请输入" @keydown="inputKeyDown"/>
        <el-button type="primary" class="btn-sty" @click="search">搜索</el-button>
        <el-button type="primary" class="btn-sty" @click="upload">上传</el-button>
      </div>
      <div :style="{ opacity: filterFlag ? '1' : '0' }" class="filter-sty">
        <el-dropdown v-for="item in filterArr" :key="item.type" class="dropdown-sty">
          <span class="el-dropdown-link">
            {{ item.name }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item2 in item.childer" :key="item2.key">{{ item2.value }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div @click="filter">
        <span>筛选器</span>
        <el-icon><Filter /></el-icon>
      </div>
    </div>
    <div class="images">
      <div v-for="(item,index) in imgArr" :key="index">
        <img :src="item.url" alt="item.keyWords" >
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
const inputKeyDown = (e)=>{
  if(e.code==="Enter"){
    console.log(inputValue.value);
  }
}
// 搜索
const search = ()=>{
  console.log(inputValue.value);
}
// 上传
const upload = ()=>{
  console.log(11);
  
}
// 筛选
const filter = ()=>{
  filterFlag.value = !filterFlag.value
}
// 初始化-获取筛选条件列表
const initFilterList = ()=>{
  filterArr.push(
    {
      name:'图片尺寸',
      type:'imgSize',
      childer:[
        {
          key:'1',
          value:'全部'
        },
        {
          key:'2',
          value:'小'
        },
        {
          key:'3',
          value:'中'
        },
        {
          key:'4',
          value:'大'
        },
        {
          key:'5',
          value:'特大'
        }
      ]
    },
    {
      name:'类型',
      type:'category',
      childer:[
        {
          key:'1',
          value:'全部'
        },
        {
          key:'2',
          value:'风景'
        },
        {
          key:'3',
          value:'人像'
        }
      ]
    },
    {
      name:'上传时间',
      type:'time',
      childer:[
        {
          key:'1',
          value:'全部'
        },
        {
          key:'2',
          value:'过去24小时'
        },
        {
          key:'3',
          value:'过去一周'
        },
        {
          key:'4',
          value:'过去一个月'
        },
        {
          key:'5',
          value:'去年'
        }
      ]
    }
  )
}
// 初始化-获取第一页图片数据
const initImages =()=>{
  for (let index = 0; index < 20; index++) {
    imgArr.push({
      name: '达妮娅',
      keyWords: '背景,达妮娅',
      title:'精选背景图片',
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
.search{
  display: flex;
  justify-content: space-between;
  align-items: center;
  & div:last-child{
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}
.search-input{
  width: 240px;
}
.btn-sty{
  margin-left: 20px;
}
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.dropdown-sty:focus-visible,.el-dropdown-link:focus-visible{
  outline: none!important;
}
.dropdown-sty{
  margin-right: 20px;
}
.dropdown-sty:last-child{
  margin-right: 0;
}
.photo{
  position: relative;
}
.filter-sty{
  position: absolute;
  left: 50%;
  transform: translate(-50%,0);
  display: flex;
  transition: opacity 1s ease-in-out;
}
.images{
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  >div{
    margin-right: 20px;
    width: 12%;
    img{
      width: 100%;
      border-radius: 10px;
    }
  }
  >div:last-child{
    margin-right: 0;
  }
}
</style>
