<template>
  <div class="app-container home">
    <div class="content">
      <div class="logo">
        <a class="share-login" href="/vip/login">
          <el-button
            v-if="!loginData.login"
            style="margin: 10px 0"
            type="primary"
            icon="user"
            >登录</el-button
          ></a
        >
        <a class="logo-title">
          <img :src="logo" alt="" />
          <span>爱看资源 - 云端资源搜索专家</span>
        </a>
        <div class="user">
          <div v-if="loginData.login" class="avatar-container">
            <el-dropdown class="right-menu-item hover-effect" trigger="click">
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
        </div>
      </div>

      <div class="header-search">
        <el-input
          class="header-input"
          v-model="searchValue"
          placeholder="请输入关键词或者磁力链接"
        />
        <el-button
          type="primary"
          icon="Search"
          style="width: 70px; height: 50px; margin-left: 10px"
          @click="handleSearch()"
          >搜索</el-button
        >
        <el-button
          style="width: 80px; height: 50px; margin-left: 10px"
          icon="Refresh"
          type="danger"
          @click="resetQuery"
          >重置</el-button
        >
      </div>
      <el-table
        class="wp-table"
        :row-style="{ height: '50px' }"
        v-if="tableShow"
        element-loading-text="数据正在加载中..."
        v-loading="loading"
        :data="tableData"
      >
        <el-table-column prop="name" show-overflow-tooltip label="名字">
          <template #default="scope">
            <div @click="goParse(scope.row)">
              <MySvg
                style="float: left; margin-top: 10px"
                :iconName="'icon-wenjianjia'"
                size="40"
              ></MySvg>
              <!--              <el-tag v-if="scope.row.url.includes('quark')" style="float:left;margin-left: 1%;margin-top: 22px;"  type="success">下载极快</el-tag>-->
              <!--              <el-tag v-if="scope.row.url.includes('baidu')" style="float:left;margin-left: 1%;margin-top: 22px;"  type="danger">下载很快</el-tag>-->
              <!--              <el-tag v-if="!scope.row.url.includes('quark') && !scope.row.url.includes('baidu')" else style="margin-left: 50px;margin-top: 10px;"  type="danger">下载速度一般</el-tag>-->
              <!--              <el-tag style="float:left;margin-left: 2%;margin-top: 10px;">在线播放</el-tag>-->

              <div
                style="
                  min-height: 70px;
                  display: flex;
                  align-items: center;
                  flex-wrap: wrap;
                  line-height: normal;
                "
              >
                <el-tag
                  style="margin-left: 10px"
                  v-if="scope.row.url.includes('quark')"
                  type="success"
                  >下载极快</el-tag
                >
                <el-tag
                  style="margin-left: 10px"
                  v-if="scope.row.url.includes('baidu')"
                  type="danger"
                  >下载很快</el-tag
                >
                <span style="margin-left: 10px">
                  {{ scope.row.name.replace('夸克', '').replace('百度', '') }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="110px" prop="time" label="更新时间">
          <template #default="scope">
            {{ scope.row.time }}
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
      <div v-if="tagShow" class="tag">
        <el-tag
          class="tag-header"
          size="small"
          v-for="(item, index) in tagHeader"
          :key="item"
          effect="dark"
          @click="handleSearch(item)"
        >
          {{ item }}
        </el-tag>
<!--        <div class="block">-->
<!--          <div class="nav">电视剧</div>-->
<!--          <div class="content">-->
<!--            <div class="list">-->
<!--              <div v-for="(item, index) in tv" class="item">-->
<!--                <div @click="handleSearch(item.title)" :key="index" class="img">-->
<!--                  <img :src="item.src.replace('http://', 'https://')" alt="" />-->
<!--                </div>-->
<!--                <p>{{ item.title }}</p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="block">-->
<!--          <div class="nav">电影</div>-->
<!--          <div class="content">-->
<!--            <div class="list">-->
<!--              <div v-for="(item, index) in movie" class="item">-->
<!--                <div @click="handleSearch(item.title)" :key="index" class="img">-->
<!--                  <img :src="item.src.replace('http://', 'https://')" alt="" />-->
<!--                </div>-->
<!--                <p>{{ item.title }}</p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="block">-->
<!--          <div class="nav">动漫</div>-->
<!--          <div class="content">-->
<!--            <div class="list">-->
<!--              <div v-for="(item, index) in anime" class="item">-->
<!--                <div @click="handleSearch(item.title)" :key="index" class="img">-->
<!--                  <img :src="item.src.replace('http://', 'https://')" alt="" />-->
<!--                </div>-->
<!--                <p>{{ item.title }}</p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="block">-->
<!--          <div class="nav">综艺</div>-->
<!--          <div class="content">-->
<!--            <div class="list">-->
<!--              <div v-for="(item, index) in variety" class="item">-->
<!--                <div @click="handleSearch(item.title)" :key="index" class="img">-->
<!--                  <img :src="item.src.replace('http://', 'https://')" alt="" />-->
<!--                </div>-->
<!--                <p>{{ item.title }}</p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="block">-->
<!--          <div class="nav">短剧</div>-->
<!--          <div class="content">-->
<!--            <div class="list">-->
<!--              <div v-for="(item, index) in shortVideo" class="item">-->
<!--                <div @click="handleSearch(item.title)" :key="index" class="img">-->
<!--                  <img :src="item.src.replace('http://', 'https://')" alt="" />-->
<!--                </div>-->
<!--                <p>{{ item.title }}</p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
                <div class="tag-title">
                  <span>近期热搜：</span>
                </div>
                <el-tag
                    class="tag-inner"
                    size="large"
                    v-for="(item, index) in tv.concat(movie).concat(anime)"
                    :key="item.value"
                    effect="dark"
                    :type="getTagType(index)"
                    round
                    @click="handleSearch(item.title)"
                >
                  {{ item.title }}
                </el-tag>

      </div>
      <!-- 子组件将在此处渲染 -->
      <router-view v-if="showComponent"> </router-view>
    </div>
    <div v-if="tagShow" class="foot">
      声明：本站磁力链接、bt种子内容由网络搜索获取、本站不储存、复制任何文件、仅作个人使用学习、如有侵权，请及时告知删除。
    </div>
  </div>
</template>
<script setup name="Source">
import { onActivated, onDeactivated, watch } from 'vue';
import logo from '@/assets/img/deep.jpg';
import userLogo from '@/assets/logo/img.png';
import {
  formatterTime,
  getIconClass,
  SubmitLink,
  timestampToTime,
} from '@/utils/wp';
import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import { nextTick } from 'vue';
const router = useRouter();
const loginData = reactive({ login: false });
import { ElMessageBox } from 'element-plus';

import { Search } from '@element-plus/icons-vue';
const tagHeader = ref([
  '少儿',
  '小学',
  '初中',
  '高中',
  '大学',
  '四六级',
  '考研',
  '考公',
  '教资',
  '英语',
  '电影',
  '动漫',
  '美剧',
  '软件',
  '电子书',
  '编程',
  '剪辑',
  '设计',
]);
const options = ref([{ label: 123, value: 123 }]);
const searchValue = ref('');
const selectLoading = ref(false);
const total = ref(0);
const loading = ref(false);
const tableShow = ref(false);
const tagShow = ref(true);
const showComponent = ref(true);
import useUserStore from '@/store/modules/user';
import MySvg from '@/components/icon/Svg.vue';
import useTagsViewStore from '@/store/modules/tagsView';
const selectRef = ref(null);
import { useRoute } from 'vue-router';
const route = useRoute();
const userStore = useUserStore();
const tableData = ref([]);
const movie = ref([]);
const tv = ref([]);
const anime = ref([]);
const variety = ref([]);
const shortVideo = ref([]);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
});

// 静态资源导入
import DarkFlowerImg from './img/flower-dark.png';
import LightFlowerImg from './img/flower-light.png';

// 组合式函数导入
import { useTheme } from './hooks/useTheme';
import { getToken } from '../../utils/auth';
// 使用主题管理
const { isLightTheme } = useTheme();
const { queryParams } = toRefs(data);
// 在pan.vue中添加所有生命周期日志
onMounted(() => {
  const cache = sessionStorage.getItem('tableData');
  if (
    route.path === '/source/parse/bt' ||
    route.path === '/source/parse/index'
  ) {
    tableData.value = JSON.parse(cache);
    return;
  }
  if (cache) {
    tableShow.value = true;
    loading.value = true;
    tagShow.value = false;
    setTimeout(() => {
      loading.value = false;
      tableData.value = JSON.parse(cache);
    }, 1000);
  } else {
    tagShow.value = true;
    getTag();
  }
});
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath === '/source/parse/bt' || oldPath === '/source/parse/index') {
      tableShow.value = true;
    } else {
      tableShow.value = false;
      tagShow.value = false;
    }
    // if(newPath === "/source/parse/quark" || newPath === "/source/parse/index"){
    //
    // }
  },
  { immediate: true }
);

function getLogin() {
  if (getToken()) {
    loginData.login = true;
  } else {
    loginData.login = false;
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
        localStorage.removeItem('role');
        location.href = '/source';
      });
    })
    .catch(() => {});
}
getLogin();
function handleSearch(value) {
  loading.value = true;
  tableShow.value = true;
  tagShow.value = false;
  showComponent.value = false;
  if (value) {
    searchValue.value = value;
  }
  localStorage.setItem('searchName', searchValue.value);
  userStore
    .search({
      keyword: value ? value : searchValue.value,
      ...queryParams.value,
    })
    .then((res) => {
      if (res.code === 200) {
        const uniqueArray = Array.from(
          new Set(res.data.map((item) => JSON.stringify(item)))
        ).map((item) => JSON.parse(item));
        tableData.value = uniqueArray;
        sessionStorage.setItem('tableData', JSON.stringify(tableData.value));
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      // total.value = res.data.Memory_get_usage;
      loading.value = false;
    });
}
function getList() {
  if (!searchValue.value) {
    ElMessage.error('请输入关键词搜索！');
    return;
  }
  loading.value = true;
  userStore
    .search({ keyword: searchValue.value, ...queryParams.value })
    .then((res) => {
      tableData.value = res.data;
      loading.value = false;
    });
}

function goParse(row) {
  tableShow.value = false;
  showComponent.value = true;
  if (row.url.includes('quark')) {
    if (row.url.length <= 23) {
      ElMessage.error('文件已失效！');
      return;
    }
    const match = row.url.match(/\/s\/(\w+)/);
    const pwdId = match ? match[1] : null;
    const info = extractQuarkInfo(row.url);
    router.push({
      path: '/source/parse/bt',
      query: {
        shorturl: pwdId,
        pwd: info.password,
      },
    });
  } else if (row.url.includes('baidu')) {
    const { url, pwd } = SubmitLink(row.url);
    router.push({
      path: '/source/parse/index',
      query: {
        shorturl: url,
        pwd: pwd,
        dir: '1',
        root: '1',
      },
    });
  }
  // else if(row.url.includes("/s/")){
  //   userStore.getXdUrl({"link":row.url}).then(res => {
  //     if(res.code === 200){
  //       const { url, pwd } = SubmitLink(res.data);
  //       router.push({
  //         path: '/source/parse/index',
  //         query: {
  //           shorturl: url,
  //           pwd: pwd,
  //           dir: '1',
  //           root: '1'
  //         },
  //       })
  //     }
  //   })
  // }
}

function extractQuarkInfo(text) {
  const urlRegex = /https?:\/\/pan\.quark\.cn\/s\/[a-z0-9]+/i;
  const passwordRegex = /提取码[：:]\s*([a-zA-Z0-9]{4})/;

  const urlMatch = text.match(urlRegex);
  const passwordMatch = text.match(passwordRegex);

  return {
    url: urlMatch ? urlMatch[0] : null,
    password: passwordMatch ? passwordMatch[1] : null,
  };
}

function getTag() {
  userStore.getTag().then((res) => {
    if (res.code === 200) {
      // const isPC =
      //   !/Android|iPhone|iPad|iPod|WAP|BlackBerry|IEMobile|Opera Mini/i.test(
      //     navigator.userAgent
      //   );
      // let count = 5;
      // if (!isPC) {
      //   count = 3;
      // }
      movie.value = res.data.movie.data
        .slice(0, 20)
        .sort(() => Math.random() - 0.5)
      tv.value = res.data.tv.data
        .slice(0, 20)
        .sort(() => Math.random() - 0.5)
      anime.value = res.data.anime.data
        .slice(0, 20)
        .sort(() => Math.random() - 0.5)
      variety.value = res.data.variety.data
        .slice(0, 20)
        .sort(() => Math.random() - 0.5)
      shortVideo.value = res.data.shortVideo.data
        .slice(0, 20)
        .sort(() => Math.random() - 0.5)
    }
  });
}
// function onkeydown(e){
//   if( e.target.value.length <=1){
//     tagShow.value = true;
//     tableShow.value = false;
//   }
// }
// function handleBlur(e){
//   searchValue.value = e.target.value;
// }

async function handleFocus() {
  // 确保输入框保持可输入状态
  await nextTick();
  const input = document.querySelector('.el-select .el-input__inner');
  if (input) {
    input.focus();
  }
}

// const handleVisibleChange = async (visible) => {
//   if (!visible) {
//     await nextTick()
//     const input = selectRef.value?.$el?.querySelector('.el-input__inner')
//     input?.focus();
//     input.removeAttribute('readonly');
//   }
// }

const remoteMethod = (query) => {
  if (query) {
    selectLoading.value = true;
    setTimeout(() => {
      selectLoading.value = false;
      userStore.searchName({ keyword: query }).then((res) => {
        const fixedStr = fixJsonString(res.data);
        const jsonData = extractJsonFromString(fixedStr);
        const values = jsonData.s.filter((item) => {
          return item.toLowerCase().includes(query.toLowerCase());
        });
        options.value = values.map((item, index) => {
          return {
            value: item,
            label: item,
          };
        });
      });
    }, 200);
  } else {
    options.value = [];
  }
};
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

function resetQuery() {
  // searchValue.value = "";
  // tagShow.value  = true;
  // tableShow.value = false;
  // sessionStorage.removeItem("tableData");
  // getTag();
  // router.push({ path: '/source' });
  localStorage.removeItem('searchName');
  sessionStorage.removeItem('tableData');
  window.location.href = '/source';
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
:deep(.header-input) {
  font-size: 20px !important;
  font-weight: bold;
  //width: 40%!important;
}
:deep(.header-input) {
  font-size: 20px;
  font-weight: bold;
  height: 50px !important;
  line-height: 50px !important;
}
:deep(.header-input) {
  box-shadow: 0 0 0 1px #409eff, 0 2px 4px 0 rgba(0, 0, 0, 0.12) !important;
  transition: box-shadow 0.3s ease;
  border-radius: 4.5px;
}

//:deep(.el-select-dropdown__item.selected){
//  font-size: 18px!important;
//}

:deep(.header-input .el-select:hover) {
  box-shadow: 0 0 0 2px #0773e2, 0 2px 8px 0 rgba(0, 0, 0, 0.16) !important;
}
:deep(.wp-table .el-table__body tr:hover > td) {
  width: auto !important;
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
  //height: calc(100vh - 100px);
  //height:auto;
  margin: auto;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 至少占满整个视口高度 */
  overflow-x: hidden;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* iOS Safari 滚动优化 */
  .content {
    flex: 1;
    .logo {
      position: relative;
      .logo-title {
        //width: auto;
        height: 80px;
        display: flex;
        align-items: center; /* 垂直居中 */
        justify-content: center; /* 水平居中 */
        vertical-align: middle;
        img {
          width: 120px;
          height: 80px;
        }
        span {
          //width: auto;
          height: 80px !important;
          margin-top: 0;
          font-size: 26px;
          font-weight: bold !important;
          line-height: 80px;
          white-space: nowrap; /* 禁止换行 */
          overflow: hidden; /* 隐藏溢出内容 */
          text-overflow: ellipsis; /* 溢出显示省略号... */
          background: linear-gradient(
            90deg,
            #33cc33,
            #ff9900,
            #ff0000,
            #3399ff,
            #cc33ff
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
      .user {
        position: absolute;
        right: 0;
        top: -10px;
        font-size: 18px;
        font-weight: bold;
        color: #337ecc;
        .avatar-container {
          //margin-right: 40px;

          .avatar-wrapper {
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
      .share-login {
        position: absolute;
        right: 0;
        top: -20px;
        font-size: 18px;
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .home {
    width: 100%;
  }
  :deep(.el-table .cell.el-tooltip) {
    white-space: wrap;
  }
  .tag {
    .tag-header {
      margin-left: 8%;
      margin-top: 20px;
      cursor: pointer;
      width: 80px !important;
      height: 30px !important;
    }
    .block {
      border-radius: 12px;
      background-color: var(--theme-other_background);
      box-shadow: 0 4px 10px rgba(225, 225, 225, 0.3);
      //margin-bottom: 20px;
      padding-top: 20px;
      .nav {
        position: relative;
        font-size: 18px;
        font-weight: bold;
        color: var(--theme-color);
        padding: 0 20px 4px;
        display: flex;
        align-items: center;
      }
      .content {
        min-height: 200px;
        .list {
          display: flex;
          //flex-wrap: wrap;
          padding: 0 0 10px 15px;
          .item {
            position: relative;
            display: block;
            width: 27%;
            margin: 0 8px;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            text-align: center;
            transition: all 0.5s;
            .img {
              position: relative;
              width: 100%;
              height: 150px;
              border-radius: 8px;
              overflow: hidden;
              background: #f5f5f5;
              img {
                position: relative;
                z-index: 9;
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
            p {
              margin: 8px 0 !important;
              font-weight: bold;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
}
@media (min-width: 992px) {
  .home {
    width: 72%;
  }
}
@media only screen and (min-width: 767px) {
  .home {
    width: 72%;
  }
  .header-search .header-input {
    width: 600px !important;
  }
  .tag {
    width: 70%;
    .tag-header {
      width: 100px !important;
      height: 40px !important;
      margin-left: 20px;
      margin-top: 20px;
    }
    /* 鼠标悬停效果 */
    .tag-inner:hover {
      transform: scale(1.55);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;

      /* 晃动动画 */
      animation: shake 0.5s ease infinite;
    }
    .block {
      border-radius: 12px;
      background-color: var(--theme-other_background);
      box-shadow: 0 4px 10px rgba(225, 225, 225, 0.3);
      //margin-bottom: 20px;
      padding-top: 20px;
      .nav {
        position: relative;
        font-size: 18px;
        font-weight: bold;
        color: var(--theme-color);
        padding: 0 20px 4px;
        display: flex;
        align-items: center;
      }
      .content {
        min-height: 200px;
        .list {
          display: flex;
          //flex-wrap: wrap;
          padding: 0 0 10px 15px;
          .item {
            position: relative;
            display: block;
            width: 130px;
            margin: 0 8px;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            text-align: center;
            transition: all 0.5s;
            cursor: pointer;
            .img {
              position: relative;
              width: 100%;
              height: 192px;
              border-radius: 8px;
              overflow: hidden;
              background: #f5f5f5;
              img {
                position: relative;
                z-index: 9;
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
            p {
              margin: 10px 0 !important;
              font-weight: bold;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
}
.header-search {
  width: 100%;
  height: 50px;
  margin: 15px auto 0;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  vertical-align: middle;
}

.tag {
  margin: 30px auto 0;
  .tag-header {
    cursor: pointer;
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

  .tag-title {
    margin-top: 35px;
    span {
      margin-left:28px;
      font-size: 25px;
      font-weight: bold;
    }
  }
  .tag-inner {
    margin-left: 20px;
    margin-top: 25px;
    cursor: pointer;
    /* 基础样式 */
    border: 1px solid var(--el-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* 过渡效果 */
    transition: all 0.3s ease;
    font-size: 15px;
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
.wp-table {
  font-size: 15px;
  font-weight: bold;
  height: 70%;
  width: 100%;
  margin-top: 25px;
}
.el-pagination {
  margin: 35px auto 30px;
}
.foot {
  margin-top: 10px;
  width: 100%;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
}
</style>
