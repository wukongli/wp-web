<template>
  <div class="app-container home">
<!--    <div class="floewr left">-->
<!--      <img :src="isLightTheme ? LightFlowerImg : DarkFlowerImg" alt="" />-->
<!--    </div>-->
<!--    <div class="floewr right">-->
<!--      <img :src="isLightTheme ? LightFlowerImg : DarkFlowerImg" alt="" />-->
<!--    </div>-->
    <div class="logo">
      <a class="logo-title" href="/source">
        <img :src="logo" alt="">
        <span>深度搜索(全网资源搜索)</span>
      </a>
      <div class="user">
          <div v-if="loginData.login" class="avatar-container">
            <el-dropdown
                class="right-menu-item hover-effect"
                trigger="click"
            >
              <div class="avatar-wrapper">
                <img :src="userLogo" class="user-avatar" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <router-link to="/user">
                    <el-dropdown-item>个人中心</el-dropdown-item>
                  </router-link>
                  <el-dropdown-item @click="logout">
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        <a v-if="!loginData.login" href="/vip/login">登录</a>
      </div>
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
          @blur="handleBlur"
         >
        <el-option
            style="font-size: 15px;font-weight: bold"
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
      <el-tag
      class="tag-header"
      size="large"
      v-for="(item, index) in tagHeader"
      :key="item"
      effect="dark"
      @click="handleSearch(item)"
      >
      {{ item }}
      </el-tag>
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
      <el-table-column prop="name" show-overflow-tooltip label="名字">
        <template #default="{row}">
          <MySvg style="position: absolute;top:5px" :iconName="'icon-wenjianjia'" size="40"></MySvg>
          <span style="margin-left: 80px;" @click="goParse(row)">{{
              row.name.replace("夸克","").replace("百度","")
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
    <!-- 子组件将在此处渲染 -->
      <router-view></router-view>
  </div>

</template>
<script setup name="Source">
import { onActivated, onDeactivated,watch } from 'vue';
import logo from '@/assets/img/deep.jpg';
import userLogo from '@/assets/logo/img.png';
import {formatterTime, getIconClass, SubmitLink, timestampToTime} from "@/utils/wp";
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus';
import moment from 'moment';
const router = useRouter();
const loginData = reactive({login:false});
import { ElMessageBox } from 'element-plus';

import { Search } from '@element-plus/icons-vue'
const tagHeader = ref(["少儿","小学","初中","高中","大学","四六级","考研","考公","教资","英语","电影","动漫","美剧","软件","电子书","编程","剪辑","设计"])
const options = ref([])
const searchValue = ref('');
const selectLoading = ref(false)
const total = ref(0);
const loading = ref(false);
const tableShow = ref(false);
const tagShow = ref(true);
import useUserStore from '@/store/modules/user';
import MySvg from "@/components/icon/Svg.vue";
import useTagsViewStore from "@/store/modules/tagsView";
import { useRoute } from 'vue-router';
const route = useRoute();
const userStore = useUserStore();
const tableData =  ref([])
const tag =  ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10
  }
})

// 静态资源导入
import DarkFlowerImg from './img/flower-dark.png'
import LightFlowerImg from './img/flower-light.png'

// 组合式函数导入
import { useTheme } from './hooks/useTheme'
import {getToken} from "../../utils/auth";
// 使用主题管理
const { isLightTheme } = useTheme();
const { queryParams } = toRefs(data)
// 在pan.vue中添加所有生命周期日志
onMounted(() => {
  const cache = sessionStorage.getItem("tableData")
  if(route.path === "/source/parse/quark" || route.path === "/source/parse/index"){
    tableData.value = JSON.parse(cache);
    return;
  }
  if(cache){
    tableShow.value = true;
    loading.value = true;
    tagShow.value  = false;
    setTimeout(()=>{
      loading.value = false;
      tableData.value = JSON.parse(cache);
    },1000)
  }else{
    tagShow.value  = true;
    getTag();
  }
})
watch(() => route.path, (newPath, oldPath) => {
  if(oldPath === "/source/parse/quark" || oldPath === "/source/parse/index"){
    tableShow.value = true;
  }else {
    tableShow.value = false;
    tagShow.value  = false;
  }
  // if(newPath === "/source/parse/quark" || newPath === "/source/parse/index"){
  //
  // }
}, { immediate: true });

function getLogin(){
  if (getToken()) {
    loginData.login = true;
  }else{
    loginData.login= false;
  }
}
function logout() {
  ElMessageBox.confirm('确定退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        userStore.logOut().then(() => {
          location.href = '/source';
        });
      })
      .catch(() => {});
}
getLogin();
function handleSearch(value){
  loading.value = true;
  tableShow.value  = true;
  tagShow.value  = false;
  console.log(searchValue.value);
  if(value){
    searchValue.value = value;
  }
  userStore.search({"keyword":value ? value : searchValue.value,...queryParams.value}).then((res)=>{
    if(res.code === 200){
      const result = res.data.sort((a,b)=>
          new Date(b.time) - new Date(a.time)
      );
      tableData.value = result;
      sessionStorage.setItem('tableData', JSON.stringify(result));
    }
    // total.value = res.data.Memory_get_usage;
    loading.value = false
  })
}
function getList() {
  if(!searchValue.value){
    ElMessage.error("请输入关键词搜索！")
    return;
  }
  loading.value = true
  userStore.search({"keyword":searchValue.value,...queryParams.value}).then(res => {
    tableData.value = res.data;
    loading.value = false
  })
}

function goParse(row){
   tableShow.value = false;
  if(row.url.includes("quark")){
    if(row.url.length <= 23){
      ElMessage.error("文件已失效！");
      return;
    }
    const pwdId =  row.url.match(/(?<=\/s\/)(\w+)(?=#)?/g)[0];
    const info = extractQuarkInfo(row.url);
    router.push({
      path: '/source/parse/quark',
      query: {
        shorturl: pwdId,
        pwd: info.password,
      },
    })
  }else if(row.url.includes("baidu")){
    const { url, pwd } = SubmitLink(row.url);
    router.push({
      path: '/source/parse/index',
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
    if(res.code === 200){
      tag.value = res.data.data;
    }
  })
}

// function onkeydown(e){
//   if( e.target.value.length <=1){
//     tagShow.value = true;
//     tableShow.value = false;
//   }
// }
function handleBlur(e){
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

        console.log(values);
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
  // searchValue.value = "";
  // tagShow.value  = true;
  // tableShow.value = false;
  // sessionStorage.removeItem("tableData");
  // getTag();
  // router.push({ path: '/source' });
  sessionStorage.removeItem("tableData");
  window.location.href = "/source";
}
// 根据索引返回Element预设类型
const getTagType = (index) => {
  const types = ['', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};


</script>

<style scoped lang="scss">
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
/* Vue 3 使用 :deep() */
:deep(.el-select) {
  font-size: 20px!important;
  font-weight: bold;
  width: 40%!important;
}
:deep(.el-input__inner) {
  font-size: 20px;
  font-weight: bold;
  height: 50px!important;
  line-height: 50px!important;

}
:deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #409EFF,
  0 2px 4px 0 rgba(0, 0, 0, 0.12) !important;
  transition: box-shadow 0.3s ease;
}

//:deep(.el-select-dropdown__item.selected){
//  font-size: 18px!important;
//}

:deep(.el-select:hover .el-input__wrapper) {
  box-shadow: 0 0 0 2px #0773e2,
  0 2px 8px 0 rgba(0, 0, 0, 0.16) !important;
}

:deep(.el-select.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px #0773e2,
  0 2px 8px 0 rgba(64, 158, 255, 0.2) !important;
}


//.app-container{
//  width: 100%;
//  height: 100%;
//  background-color: var(--pad-background-color);
//  color: var(--pad-text-color);
//  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
//
//}
.home {
  width: 75%;
  height: calc(100vh - 100px);
  //height:auto;
  margin: auto;
  font-size: 18px;


  //.floewr {
  //  position: absolute;
  //  top: 0;
  //  height: 100%;
  //  z-index: 0;
  //  opacity: 0.8;
  //  img {
  //    height: 100%;
  //    filter: blur(200px) brightness(150%);
  //  }
  //  &.left {
  //    left: 0;
  //    transform: rotate(180deg);
  //  }
  //  &.right {
  //    right: 0;
  //  }
  //}
  .logo{
     position: relative;
    .logo-title{
      //width: auto;
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
        //width: auto;
        height: 80px!important;
        margin-top: 0;
        font-size: 26px;
        font-weight: bold!important;
        line-height: 80px;
        white-space: nowrap;  /* 禁止换行 */
        overflow: hidden;     /* 隐藏溢出内容 */
        text-overflow: ellipsis; /* 溢出显示省略号... */
      }
    }
    .user{
      position: absolute;
      right: 0;
      top: 20px;
      font-size: 18px;
      font-weight: bold;
      color:#337ecc;
      .avatar-container {
        //margin-right: 40px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          i {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
        }
      }
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
    margin:30px auto 0;
    .tag-header{
      margin-left: 20px;
      margin-top: 20px;
      cursor: pointer;
      width: 100px!important;
      height: 40px!important;
      font-size: 15px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      /* 过渡效果 */
      transition: all 0.3s ease;
    }
    .tag-header:hover {
      transform: scale(1.55);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;

      /* 晃动动画 */
      animation: shake 0.5s ease infinite;
    }
    .tag-title{
      margin-top: 15px;
      display: flex;
      align-items: center; /* 垂直居中 */
      justify-content: center; /* 水平居中 */
      span{
        font-size: 25px;
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
    margin-top:25px;
  }
  .el-pagination {
    margin-top:3%;
    margin-left: 5%;
  }
</style>
