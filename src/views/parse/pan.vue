<template>
  <div class="app-container home">
    <div class="logo">
      <a href="/source">
        <img :src="logo" alt="">
        <span>深度搜索</span>
      </a>
    </div>
    <div class="header-search">
      <el-select
          v-model="searchValue"
          filterable
          remote
          reserve-keyword
          allow-create
          placeholder="请输入关键词"
          :remote-method="remoteMethod"
          :loading="loading"
          @keydown="onkeydown"
          @blur="handleBlur"
         >
        <el-option
            style="font-size: 18px;font-weight: bold;"
            v-for="item in options"
            :key="item.value"
            :label="item.value"
            :value="item.value"
        />
      </el-select>
      <el-button
          type="primary"
          icon="Search"
          style="width: 80px;height: 50px;margin-left: 10px;"
          @click="handleSearch()"
      >搜索</el-button>
      <el-button  style="width: 80px;height: 50px;margin-left: 10px;" icon="Refresh" type="danger" @click="resetQuery">重置</el-button>
    </div>

    <div v-if="tagShow" class="tag">
      <div class="tag-title">
        <span>最近热搜：<span style="color: red;">{{tag.length}}</span> 条</span>
      </div>
      <el-tag
          class="tag-inner"
          size="large"
          v-for="(item, index) in tag"
          :key="item.value"
          effect="dark"
          :type="getTagType(index)"
          round
          @click="handleSearch(item.value)"
      >
        {{ item.value }}
      </el-tag>
    </div>
    <el-table class="wp-table" :row-style="{height: '50px'}" v-if="tableShow" element-loading-text="数据正在加载中..." v-loading="loading" :data="tableData">
      <el-table-column prop="name" label="名字">
        <template #default="{row}">
          <MySvg style="position: absolute;top:5px" :iconName="'icon-wenjianjia'" size="40"></MySvg>
          <span style="margin-left: 80px;" @click="goParse(row)">{{
              row.name
            }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="最后更新时间">
        <template #default="{row}">
          {{ row.time }}
        </template>
      </el-table-column>
    </el-table>
      <el-pagination
          v-if="tableShow"
          layout="prev, pager, next"
          :total="100"
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          background
          size="large"
          @size-change="getList"
          @current-change="getList"
          class="custom-pagination"
      />

  </div>
</template>
<script setup name="Source">
import logo from '@/assets/img/deep.jpg';
import {formatterTime, getIconClass, SubmitLink, timestampToTime} from "@/utils/wp";
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus';
import moment from 'moment';
const router = useRouter();
import { Search } from '@element-plus/icons-vue'
const list = ref([])
const options = ref([])
const searchValue = ref('');
const selectLoading = ref(false)
const total = ref(0);
const loading = ref(false);
const tableShow = ref(false);
const tagShow = ref(true);
import useUserStore from '@/store/modules/user';
import MySvg from "@/components/icon/Svg.vue";
const userStore = useUserStore();
const tableData =  ref([])
const tag =  ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10
  }
})

const { queryParams } = toRefs(data)

function handleSearch(value){
  loading.value = true;
  tableShow.value  = true;
  tagShow.value  = false;
  if(value){
    searchValue.value = value;
  }
  userStore.search({"keyword":value ? value : searchValue.value,...queryParams.value}).then((res)=>{
    if(res.code === 200){
      tableData.value = res.data.sort((a,b)=>
         b.time - a.time
      );
    }
    // total.value = res.data.Memory_get_usage;
    loading.value = false
  })
}
function getList() {
  loading.value = true
  userStore.search({"keyword":searchValue.value,...queryParams.value}).then(res => {
    tableData.value = res.data;
    loading.value = false
  })
}

function goParse(row){
  if(row.url.includes("quark")){
    if(row.url.length <= 23){
      ElMessage.error("文件已失效！");
      return;
    }
    const pwdId =  row.url.match(/(?<=\/s\/)(\w+)(?=#)?/g)[0];
    const info = extractQuarkInfo(row.url);
    router.push({
      path: '/source/q',
      query: {
        shorturl: pwdId,
        pwd: info.password,
      },
    })
  }else if(row.url.includes("baidu")){
    const { url, pwd } = SubmitLink(row.url);
    router.push({
      path: '/source/b',
      query: {
        shorturl: url,
        pwd: pwd,
        dir: '1',
        root: '1'
      },
    })
  }
}

function extractQuarkInfo(text) {
  const urlRegex = /https?:\/\/pan\.quark\.cn\/s\/[a-z0-9]+/i;
  const passwordRegex = /提取码[：:]\s*([a-zA-Z0-9]{4})/;

  const urlMatch = text.match(urlRegex);
  const passwordMatch = text.match(passwordRegex);

  return {
    url: urlMatch ? urlMatch[0] : null,
    password: passwordMatch ? passwordMatch[1] : null
  };
}

function getTag(){
  userStore.getTag().then(res=>{
    console.log(res);
    if(res.code === 200){
      tag.value = res.data.data;
    }
  })
}

function onkeydown(e){
  if( e.target.value.length <=1){
    tagShow.value = true;
    tableShow.value = false;
  }
}
function handleBlur(e){
  console.log();
  searchValue.value = e.target.value;
}


const remoteMethod = (query) => {
  if (query) {
    selectLoading.value = true;
    setTimeout(() => {
      selectLoading.value = false
      userStore.searchName({"keyword":query}).then(res=>{
        const fixedStr = fixJsonString(res.data);
        const jsonData = extractJsonFromString(fixedStr);
       const values = jsonData.s.filter((item) => {
          return item.toLowerCase().includes(query.toLowerCase())
        })


        options.value =  values.map((item)=>{
          return {
            value:item
          }
        })
      })


    }, 200)
  } else {
    options.value = []
  }
}
// 提取 JSON 部分的方法
function extractJsonFromString(str) {
  // 找到第一个 { 和最后一个 } 的位置
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}');

  // 提取 JSON 部分
  const jsonStr = str.slice(start, end + 1);

  // 将字符串转换为 JSON 对象
  return JSON.parse(jsonStr);
}

// 自动为属性名添加双引号
function fixJsonString(str) {
  return str.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
}

function resetQuery(){
  searchValue.value = "";
  tagShow.value  = true;
  tableShow.value = false;
}
// 根据索引返回Element预设类型
const getTagType = (index) => {
  const types = ['', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};
getTag();


</script>

<style scoped lang="scss">
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
/* Vue 3 使用 :deep() */
:deep(.el-select) {
  font-size: 20px;
  font-weight: bold;
}
:deep(.el-input__inner) {
  font-size: 20px;
  font-weight: bold;

}
:deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #409EFF,
  0 2px 4px 0 rgba(0, 0, 0, 0.12) !important;
  transition: box-shadow 0.3s ease;
}

:deep(.el-select:hover .el-input__wrapper) {
  box-shadow: 0 0 0 2px #0773e2,
  0 2px 8px 0 rgba(0, 0, 0, 0.16) !important;
}

:deep(.el-select.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px #0773e2,
  0 2px 8px 0 rgba(64, 158, 255, 0.2) !important;
}


/* 修改选择框宽度 */
.header-search .el-select {
  width: 40%!important;
}

/* 修改输入框高度 */
.header-search ::v-deep .el-input__inner {
  height: 50px!important;
  line-height: 50px!important;
}

/* 修改下拉选项样式 */
.header-search .el-select-dropdown__item {
  padding: 10px 20px;
  height: 50px!important;
  line-height: 50px!important;
}
.home {
  width: 70%;
  height: calc(100vh - 100px);
  margin: auto;
  font-size: 18px;

  .logo{

   a{
     width: 100%;
     height: 80px;
     display: flex;
     align-items: center; /* 垂直居中 */
     justify-content: center; /* 水平居中 */
     vertical-align: middle;
     img{
       width: 120px;
       height: 80px;
     }
     span{
       width: 100px!important;
       height: 80px!important;
       margin-top: 0;
       font-size: 20px;
       font-weight: bold;
       line-height: 80px;
     }
   }


  }


  .header-search{
    width: 100%;
    height: 50px;
    margin: 40px auto 0;
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    vertical-align: middle;
  }


  .tag{
    width: 70%;
    height: 100px;
    margin:50px auto 0;
    .tag-title{
      display: flex;
      align-items: center; /* 垂直居中 */
      justify-content: center; /* 水平居中 */
      span{
        font-size: 30px;
        font-weight: bold;
      }
    }
    .tag-inner{
      margin-left: 20px;
      margin-top: 20px;
      cursor: pointer;
      /* 基础样式 */
      border: 1px solid var(--el-border-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      /* 过渡效果 */
      transition: all 0.3s ease;
      font-size: 15px;
    }
    /* 鼠标悬停效果 */
    .tag-inner:hover {
      transform: scale(1.55);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;

      /* 晃动动画 */
      animation: shake 0.5s ease infinite;
    }

  }
  .wp-table ::v-deep .el-table__body tr:hover > td {
    //background-color: #c0ffe7 !important;
    width: 100%;
    cursor: pointer;
    font-size: 15px;
    font-weight: bold;
    color: #409eff;
  }
  .wp-table{
    font-size: 15px;
    font-weight: bold;
    height: 70%;
    width: 100%;
    margin-top:25px
  }
  .el-pagination {
    margin-top:50px;
    margin-left: 100px;
  }
}
</style>
