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
          <!-- <img :src="logo" alt="" /> -->
          <!-- 品牌名与口号拆成两级：整串 21 字都用 26px 渐变字，
               窄屏会被 nowrap 截成省略号，层级也拉不开 -->
          <span class="logo-title__name">万能教程库</span>
          <span class="logo-title__sep">·</span>
          <span class="logo-title__slogan">学习办公生活，资料教程全都有</span>
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
          @keyup.enter="handleSearch()"
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
      <!-- 搜索结果：响应式卡片栅格（3 / 2 / 1 列） -->
      <div
        v-if="tableShow"
        class="wp-card-grid"
        v-loading="loading"
        element-loading-text="数据正在加载中..."
      >
        <div
          v-for="(item, index) in tableData"
          :key="item.url ?? index"
          class="wp-card"
          :class="[
            'wp-card--' + platformOf(item),
            { 'is-leaving': item.leaving },
          ]"
          :style="cardStyle(item)"
          @click="goParse(item)"
        >
          <div class="wp-card__head">
            <span class="wp-card__icon">
              <MySvg iconName="icon-wenjianjia" width="26px" height="26px" />
            </span>
            <el-tag
              v-if="platformOf(item) === 'quark'"
              class="wp-card__badge"
              type="danger"
              size="small"
              >下载很快</el-tag
            >
            <el-tag
              v-else-if="platformOf(item) === 'baidu'"
              class="wp-card__badge"
              type="success"
              size="small"
              >在线播放</el-tag
            >
            <el-tag v-else class="wp-card__badge" type="info" size="small"
              >其他资源</el-tag
            >
          </div>

          <div class="wp-card__title" :title="displayName(item)">
            {{ displayName(item) }}
          </div>

          <div class="wp-card__time">
            <el-icon class="wp-card__time-icon"><Clock /></el-icon>
            <span>{{ item.time }}</span>
          </div>
        </div>

        <div
          v-if="!loading && !(tableData && tableData.length)"
          class="wp-card-grid__empty"
        >
          暂无资源，换个关键词试试
        </div>
      </div>
      <!-- 列表底部：滚动到这里点一下加载下一页，替代原来的分页条 -->
      <div
        v-if="tableShow && tableData && tableData.length"
        class="load-more"
      >
        <el-button
          v-if="!noMore"
          class="load-more__btn"
          :loading="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? '加载中…' : '加载更多' }}
        </el-button>
        <span v-else class="load-more__end">已经到底啦</span>
      </div>
      <div v-if="tagShow" class="tag">
        <!-- 分类导航：7 个板块，点板块内任意标签直接发起搜索 -->
        <div class="tag-cats">
          <div
            v-for="(cat, ci) in categories"
            :key="cat.key"
            class="tag-cat"
            :class="'tag-cat--' + cat.key"
          >
            <div class="tag-cat__head">
              <span class="tag-cat__no">{{ pad2(ci) }}</span>
              <span class="tag-cat__title">{{ cat.title }}</span>
            </div>
            <div class="tag-cat__body">
              <el-tag
                v-for="t in cat.tags"
                :key="t"
                class="tag-cat__item"
                size="small"
                @click="handleSearch(t)"
              >
                {{ t }}
              </el-tag>
            </div>
          </div>
        </div>
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
<!--        <div class="tag-title">-->
<!--          <span>近期热搜：</span>-->
<!--        </div>-->
<!--        <el-tag-->
<!--          class="tag-inner"-->
<!--          size="large"-->
<!--          v-for="(item, index) in tv.concat(movie).concat(anime)"-->
<!--          :key="item.value"-->
<!--          effect="dark"-->
<!--          :type="getTagType(index)"-->
<!--          round-->
<!--          @click="handleSearch(item.title)"-->
<!--        >-->
<!--          {{ item.title }}-->
<!--        </el-tag>-->
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

import { Search, Clock } from '@element-plus/icons-vue';
/* 首页分类导航：7 个板块。
   板块里的标签文案会直接当作搜索关键词提交，所以都取"能搜到东西"的通用词，
   不要写成长句 */
const categories = ref([
  {
    key: 'study',
    title: '学习考证',
    tags: [
      '考研',
      '考公',
      '教资',
      '会计',
      '经济师',
      '建造师',
      '四六级',
      '雅思托福',
      '专升本',
      '成人高考',
      '护士证',
      '职业资格题库',
      '学习笔记',
    ],
  },
  {
    key: 'office',
    title: '办公技能',
    tags: [
      'PPT模板',
      'Excel模板',
      'Word简历',
      '合同模板',
      'PS教程',
      'PR教程',
      'AI教程',
      'CAD教程',
      'Python教程',
      '自媒体运营',
      '视频剪辑',
      '直播话术',
      '文案素材',
    ],
  },
  {
    key: 'design',
    title: '设计素材',
    tags: [
      '海报',
      'Logo',
      '插画',
      '背景图',
      '视频素材',
      '音效',
      '转场',
      '片头片尾',
      '字体包',
      '笔刷',
      '预设',
      '滤镜',
    ],
  },
  {
    key: 'baby',
    title: '育儿早教',
    tags: [
      '幼小衔接',
      '拼音',
      '数学',
      '识字',
      '绘本电子版',
      '启蒙动画',
      '早教课程',
      '手抄报',
      '手工',
      '学习计划表',
    ],
  },
  {
    key: 'career',
    title: '职场文书',
    tags: [
      '工作总结',
      '述职报告',
      '工作计划',
      '合同模板',
      '制度范本',
      '活动方案',
      '竞聘演讲稿',
      '心得体会',
    ],
  },
  {
    key: 'life',
    title: '兴趣生活',
    tags: [
      '健身计划',
      '食谱',
      '减脂餐',
      '手账素材',
      '表情包',
      '壁纸',
      '塔罗',
      '占星',
      '心理测试',
      '情绪疗愈',
    ],
  },
  {
    key: 'novel',
    title: '小说漫画影视',
    tags: ['电子版小说', '漫画', '绘本', '短剧', '影视素材', '解说文案'],
  },
]);

/* 分类序号补零成 01~07，比 1~7 更整齐 */
const pad2 = (i) => String(i + 1).padStart(2, '0');
const options = ref([{ label: 123, value: 123 }]);
const searchValue = ref('');
const selectLoading = ref(false);
const total = ref(0);
const loading = ref(false);
/* 「加载更多」专用状态：和首屏 loading 分开，
   否则点加载更多会把整块结果栅格盖上遮罩 */
const loadingMore = ref(false);
/* 已经没有下一页了（返回条数不足一页，或已是最后一页） */
const noMore = ref(false);
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
    /* 关键词存在 localStorage、列表存在 sessionStorage，两边要一起还原。
       不还原关键词的话，刷新后列表还在、输入框却空了，
       点「加载更多」会被"请输入关键词"挡下来（分页时代同样存在，只是不明显） */
    searchValue.value = localStorage.getItem('searchName') || '';
    setTimeout(() => {
      loading.value = false;
      tableData.value = JSON.parse(cache) || [];
      /* 列表和「已经翻到第几页」必须一起还原。
         只还原列表的话，重新进来点「加载更多」会从第 2 页重新拉，和缓存里的条目撞车 */
      restoreListState();
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
  { immediate: true },
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

  const keyword = value ? value : searchValue.value;

  // 检测是否为网盘链接，是则直接解析
  const isBaiduLink = /pan\.baidu\.com/i.test(keyword);
  const isQuarkLink = /pan\.quark\.cn/i.test(keyword);

  if (isBaiduLink || isQuarkLink) {
    loading.value = false;
    tableShow.value = false;
    const row = { url: keyword };
    goParse(row);
    return;
  }


  loading.value = true;
  tableShow.value = true;
  tagShow.value = false;
  showComponent.value = false;
  /* 每次新搜索都从第一页重新开始，并清掉上一轮「到底了」的标记 */
  noMore.value = false;
  queryParams.value.pageNum = 1;
  if (value) {
    searchValue.value = value;
  }
  localStorage.setItem('searchName', searchValue.value);
  userStore
    .search({
      keyword: value ? value : searchValue.value,
      ...queryParams.value,
      wechat:false,
    })
    .then((res) => {
      if (res.code === 200) {
        const raw = Array.isArray(res.data) ? res.data : [];
        // 先全部渲染（同一次响应里的重复项在这里去掉）
        const uniqueArray = uniqueByJson(raw, []);
        tableData.value = uniqueArray;
        /* 用「原始条数」判断还有没有下一页：去重会让条数变少，
           拿去重后的长度判断会把「还有下一页」误判成「到底了」 */
        if (raw.length < queryParams.value.pageSize) noMore.value = true;
        cacheListState();
        window.scrollTo({ top: 0, behavior: 'instant' });
        // 再过滤：异步移除无效或总大小小于 5M 的夸克链接
        filterQuarkLinks(uniqueArray);
      }
      // total.value = res.data.Memory_get_usage;
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      reportLoadError(err);
    });
}
/* 列表状态统一落盘。列表、页码、「到底了」三者必须一起存：
   少存任何一个，重新进页面后页码和列表就对不上，点「加载更多」会重复拉已有页 */
function cacheListState() {
  sessionStorage.setItem('tableData', JSON.stringify(tableData.value));
  sessionStorage.setItem('tableDataPageNum', String(queryParams.value.pageNum));
  sessionStorage.setItem('tableDataNoMore', noMore.value ? '1' : '0');
}

function restoreListState() {
  const page = Number(sessionStorage.getItem('tableDataPageNum'));
  queryParams.value.pageNum = page > 0 ? page : 1;
  noMore.value = sessionStorage.getItem('tableDataNoMore') === '1';
}

/* 按 JSON 串去重，保留首次出现的顺序和原始对象引用。
   保留引用很关键：filterQuarkLinks 靠 tableData.value.indexOf(item) 定位并移除条目，
   这里若做一次 JSON.parse 往返造出新对象，indexOf 会全部落空、过滤静默失效 */
function uniqueByJson(list, base) {
  const seen = new Set(base.map((item) => JSON.stringify(item)));
  const out = [];
  for (const item of list) {
    const key = JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/* 请求失败的兜底提示。
   业务错误码（500 / 601 / 其他）在 request.js 的响应拦截器里已经弹过提示，
   这里再弹一次会重复；而网络层异常（超时 / 断网 / HTTP 状态码）那句 ElMessage
   在拦截器里是被注释掉的、完全静默 —— 所以只补这一种，用 isAxiosError 区分 */
function reportLoadError(err) {
  if (err && err.isAxiosError) {
    ElMessage.error('网络异常，请稍后重试');
  }
}

/* 加载下一页并追加到列表尾部（替代原来的分页跳转） */
function loadMore() {
  // 双保险：el-button 的 loading 已经禁掉了点击，这里再挡一次防并发
  if (loadingMore.value || noMore.value) return;
  if (!searchValue.value) {
    ElMessage.error('请输入关键词搜索！');
    return;
  }
  loadingMore.value = true;
  const nextPage = queryParams.value.pageNum + 1;
  userStore
    .search({
      keyword: searchValue.value,
      ...queryParams.value,
      pageNum: nextPage,
    })
    .then((res) => {
      if (res.code !== 200) {
        reportLoadError(res);
        return;
      }
      const raw = Array.isArray(res.data) ? res.data : [];
      // 跨页去重：接口不同页之间会返回重复条目，base 传当前列表
      const fresh = uniqueByJson(raw, tableData.value);
      tableData.value = tableData.value.concat(fresh);
      queryParams.value.pageNum = nextPage;
      if (raw.length < queryParams.value.pageSize) noMore.value = true;
      cacheListState();
      /* 只校验这一页新增的条目。全量重跑的话，每条夸克链接都会再打一次
         /quark/getToken，翻到第三页就是几十个请求 */
      filterQuarkLinks(fresh);
    })
    .catch((err) => {
      reportLoadError(err);
    })
    .finally(() => {
      loadingMore.value = false;
    });
}

function goParse(row) {
  const platform = platformOf(row);

  // 校验前置：避免把结果列表清空之后才发现链接不可用
  if (platform === 'other') {
    ElMessage.error('暂不支持该链接类型');
    return;
  }
  if (platform === 'quark' && String(row.url).length <= 23) {
    ElMessage.error('文件已失效！');
    return;
  }

  tableShow.value = false;
  showComponent.value = true;

  if (platform === 'quark') {
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
  } else if (platform === 'baidu') {
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

// 平台判定：url 可能缺失，统一在这里兜底
function platformOf(row) {
  const url = row && row.url ? String(row.url) : '';
  if (url.includes('quark')) return 'quark';
  if (url.includes('baidu')) return 'baidu';
  return 'other';
}

// 卡片标题：沿用表格原有展示规则（replace 只去第一处，保持行为一致）
function displayName(row) {
  const name = String((row && row.name) || '')
    .replace('夸克', '')
    .replace('百度', '');
  return name || '未命名资源';
}

// 卡片样式：替代原 rowStyle，保留 leaving 淡出
function cardStyle(row) {
  const leaving = !!(row && row.leaving);
  return {
    opacity: leaving ? 0 : 1,
    transition: leaving ? 'opacity 0.4s ease, transform 0.25s ease' : '',
  };
}

// 渲染后再过滤：把页面里无效或过小的夸克链接移除（调用 /quark/getToken 校验）
async function filterQuarkLinks(list) {
  const MIN_SIZE = 5 * 1024 * 1024; // 5M
  // 遍历副本，避免边遍历边 splice 导致跳过元素
  for (const item of list.slice()) {
    // 非夸克链接直接跳过
    if (!item.url || !String(item.url).includes('quark')) continue;
    let invalid = false;
    try {
      const match = item.url.match(/\/s\/(\w+)/);
      const pwdId = match ? match[1] : null;
      if (!pwdId) continue;
      const info = extractQuarkInfo(item.url);
      const res = await userStore.getToken({
        pwd_id: pwdId,
        passcode: info.password,
      });
      if (res.code !== 200 || !res.data) {
        invalid = true; // 链接无效
      } else {
        const totalSize = res.data?.data?.share.size;
        if (totalSize < MIN_SIZE) invalid = true; // 总大小小于 5M
      }
    } catch (e) {
      // 校验异常时保留，避免误伤可用链接
      invalid = false;
    }
    if (invalid) {
      const idx = tableData.value.indexOf(item);
      if (idx > -1) {
        // 先标记 leaving 触发淡出动画，动画结束后再真正移除
        tableData.value[idx].leaving = true;
        setTimeout(() => {
          const i = tableData.value.indexOf(item);
          if (i > -1) {
            tableData.value.splice(i, 1);
            // 过滤掉条目后同步落盘（页码和「到底了」标记一并更新）
            cacheListState();
          }
        }, 400);
      }
    }
  }
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
      tv.value = res.data.searchTag.data.sort(() => Math.random() - 0.5);
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
  // 列表、页码、「到底了」标记要一起清，否则下次进来会带着上一轮的页码
  sessionStorage.removeItem('tableDataPageNum');
  sessionStorage.removeItem('tableDataNoMore');
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
  box-shadow:
    0 0 0 1px #409eff,
    0 2px 4px 0 rgba(0, 0, 0, 0.12) !important;
  transition: box-shadow 0.3s ease;
  border-radius: 4.5px;
}

//:deep(.el-select-dropdown__item.selected){
//  font-size: 18px!important;
//}

:deep(.header-input .el-select:hover) {
  box-shadow:
    0 0 0 2px #0773e2,
    0 2px 8px 0 rgba(0, 0, 0, 0.16) !important;
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
        gap: 10px;
        vertical-align: middle;
        img {
          width: 120px;
          height: 80px;
        }
        /* 品牌名：保留原来的五色渐变大字 */
        &__name {
          //width: auto;
          height: 80px !important;
          margin-top: 0;
          font-size: 26px;
          font-weight: bold !important;
          line-height: 80px;
          white-space: nowrap; /* 禁止换行 */
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
        /* 口号：跟品牌名用同一套五色渐变，整块标题统一成品牌色。
           必须写成带父级的 .logo-title__slogan ——
           原来那条 .logo-title span（0,1,1）会盖住单独的类选择器 */
        &__slogan {
          font-size: 14px;
          font-weight: normal !important;
          line-height: 1.4;
          white-space: nowrap;
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
        &__sep {
          font-size: 14px;
          line-height: 1;
          color: var(--el-text-color-placeholder);
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
    /* 375px 屏上内容宽约 335px，「品牌名 + 口号」放不下，只留品牌名。
       这里必须写成 .content .logo .logo-title 的完整层级 ——
       基类同样是 4 层（0,4,0），层级写少了会被基类压住 */
    .content .logo .logo-title {
      &__slogan,
      &__sep {
        display: none;
      }
    }
  }
  .tag {
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
  /* 两组标签（分类 + 热搜）共用一套 flex 换行 + gap 布局，
     替代原先散落各处的 margin-left / margin-top：
     行列间距均匀、换行后行尾不再参差 */
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /* 每行标签整体居中。flex 默认 flex-start，行尾短的那行会靠左留空，
     整块看着偏左；居中和页面「标题居中、搜索框居中」的语言一致 */
  justify-content: center;
  gap: 12px;
  /* 宽度对齐上方搜索组（600px 输入框 + 70 + 80 两个按钮 + 两处 10px 间距 = 770px），
     两块占用同样宽度、同样居中，视觉上是一根中轴 */
  max-width: 770px;
  margin: 50px auto 0;

  /* ---------------- 分类导航 ---------------- */
  /* 7 个板块铺两列。flex: 0 0 100% 让它独占一行，
     不参与父级 .tag 的标签流式换行 */
  .tag-cats {
    flex: 0 0 100%;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .tag-cat {
    /* 每个板块一个色相：底色是同色相的低透明度渐变，序号徽章取同色相深一档。
       7 个色相保持同样的饱和节奏和透明度，所以彼此有区分度但不显花 */
    --cat-tint: rgba(64, 158, 255, 0.13);
    --cat-ink: #2b7cd3;

    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 14px 16px 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    background-color: var(--el-bg-color);
    /* 左上角向内淡出，比整块纯色底更透气 */
    background-image: linear-gradient(
      135deg,
      var(--cat-tint) 0%,
      transparent 58%
    );
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    transition:
      box-shadow 0.25s ease,
      border-color 0.25s ease;

    &:hover {
      border-color: var(--el-border-color);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    }

    &__head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    &__no {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 20px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--cat-ink);
      background-color: var(--cat-tint);
    }
    &__title {
      min-width: 0;
      font-size: 15px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__body {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    &__item {
      margin: 0;
      cursor: pointer;
      height: 26px;
      padding: 0 10px;
      border-radius: 13px; /* 胶囊形，和下方 round 的热搜标签同一套语言 */
      font-size: 13px;
      color: var(--el-text-color-regular);
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      transition:
        color 0.2s ease,
        border-color 0.2s ease,
        background-color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        color: var(--cat-ink);
        border-color: var(--cat-ink);
        background-color: var(--cat-tint);
        transform: translateY(-1px);
      }
    }

    /* 7 个板块排两列会剩下一个半空的末行，让最后一个横跨整行正好补满 */
    &:last-child {
      grid-column: 1 / -1;
    }

    &--study {
      --cat-tint: rgba(64, 158, 255, 0.13);
      --cat-ink: #2b7cd3;
    }
    &--office {
      --cat-tint: rgba(103, 194, 58, 0.15);
      --cat-ink: #4f9429;
    }
    &--design {
      --cat-tint: rgba(140, 111, 255, 0.13);
      --cat-ink: #6a4dd6;
    }
    &--baby {
      --cat-tint: rgba(255, 169, 64, 0.16);
      --cat-ink: #bd7412;
    }
    &--career {
      --cat-tint: rgba(0, 184, 169, 0.13);
      --cat-ink: #0a8b80;
    }
    &--life {
      --cat-tint: rgba(255, 122, 180, 0.14);
      --cat-ink: #c34585;
    }
    &--novel {
      --cat-tint: rgba(245, 108, 108, 0.13);
      --cat-ink: #c05252;
    }
  }

  .tag-title {
    flex: 0 0 100%; /* 独占一行，把分类和热搜两组分开 */
    margin: 20px 0 20px;
    text-align: center; /* 标签行已居中，标题跟着居中才不会显得脱节 */
    span {
      margin-left: 0; /* 原先 28px，让它和标签左边缘错开 */
      font-size: 16px;
      font-weight: 600;
    }
  }

  .tag-inner {
    margin: 0;
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    padding: 0 14px; /* 与上方分类板块的标签保持同一套横向呼吸感 */
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    font-size: 14px;
  }
  .tag-inner:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  }
}

/* 移动端：标签整体收一档，一屏能多放几个。
   必须写在上面 .tag 基类之后 —— 同优先级下靠后的规则才生效 */
@media only screen and (max-width: 767px) {
  .tag {
    gap: 8px;
    margin-top: 22px;

    /* 窄屏两列会把标签挤成一列一个字，改单列铺满 */
    .tag-cats {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .tag-cat {
      padding: 12px 14px 14px;

      &__title {
        font-size: 14px;
      }
      &__item {
        height: 24px;
        padding: 0 9px;
        font-size: 12px;
      }
    }
    .tag-inner {
      padding: 0 12px;
      font-size: 13px;
    }
    .tag-title span {
      font-size: 15px;
    }
  }
}
/* ---------------- 搜索结果卡片栅格 ---------------- */
/* 基准 2 列；≤767px 1 列；≥992px 3 列 —— 全部复用文件既有断点，不新增 */
.wp-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  margin-top: 25px;
  /* v-loading 遮罩是 absolute inset:0，容器必须有真实高度，否则空数据/首屏
     加载时遮罩高度为 0，spinner 与文案不可见（el-table 原本提供了高度） */
  min-height: 240px;
  position: relative;
  box-sizing: border-box;

  &__empty {
    grid-column: 1 / -1;
    padding: 60px 0;
    text-align: center;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    /* 空态也给一层底，避免整块白底显得像页面没加载出来 */
    background-color: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color-lighter);
    border-radius: 10px;
  }
}

.wp-card {
  /* 卡片底色：默认中性灰，按平台在下方 --quark / --baidu / --other 覆盖。
     统一用半透明色叠加在 --el-bg-color 之上，不写死色值，深浅主题下都不糊字 */
  --wp-card-tint: rgba(144, 147, 153, 0.1);
  --wp-card-tint-hover: rgba(144, 147, 153, 0.16);

  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 关键：grid 子项默认 min-width:auto，超长标题会撑破轨道 */
  padding: 14px 16px;
  box-sizing: border-box;
  background-color: var(--el-bg-color);
  /* 左上角向内淡出的平台色，比整块纯色底更透气 */
  background-image: linear-gradient(
    135deg,
    var(--wp-card-tint) 0%,
    transparent 70%
  );
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  overflow: hidden;
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    opacity 0.4s ease;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    /* 悬停时底色加深一档，与上浮动效呼应 */
    background-image: linear-gradient(
      135deg,
      var(--wp-card-tint-hover) 0%,
      transparent 70%
    );
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }

  /* 淡出中的卡片不可再点击，避免点进即将消失的失效链接 */
  &.is-leaving {
    pointer-events: none;
  }

  /* 平台底色：用 Element Plus 语义色，不随主题色变，任何主题下都可读。
     原先左上角还压了一条 3px 的平台色条，现已去掉，平台区分只靠底色 + 右上角徽章 */
  &--quark {
    --wp-card-tint: rgba(245, 108, 108, 0.14);
    --wp-card-tint-hover: rgba(245, 108, 108, 0.2);
  }
  &--baidu {
    --wp-card-tint: rgba(103, 194, 58, 0.14);
    --wp-card-tint-hover: rgba(103, 194, 58, 0.2);
  }
  &--other {
    --wp-card-tint: rgba(64, 158, 255, 0.12);
    --wp-card-tint-hover: rgba(64, 158, 255, 0.18);
  }

  &__head {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  /* 用 margin 而非 flex gap，规避 Safari < 14.1 的 flex gap 兼容问题 */
  &__icon {
    flex: none;
    display: flex;
    align-items: center;
    margin-right: 8px;
  }
  &__badge {
    flex: none;
    margin-left: auto; /* 徽章靠右，头部形成「图标 —— 平台」两端对齐 */
  }

  &__title {
    /* flex:1 把多余空间吃掉，令同一行内各卡片的时间戳底部对齐；
       栅格行本身会拉伸子项等高，所以不需要再给标题设 min-height
       （移动端单列时没有同行卡片可拉伸，设了只会平白多出空白） */
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--el-text-color-primary);
    overflow-wrap: anywhere;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__time {
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed var(--el-border-color-lighter);
    font-size: 13px;
    color: var(--el-text-color-secondary);

    &-icon {
      flex: none;
      margin-right: 6px;
    }
    span {
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

@media only screen and (max-width: 767px) {
  .wp-card-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 18px;
  }
  .wp-card {
    padding: 12px 14px;
  }
}
@media (min-width: 992px) {
  .wp-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
/* ---------------- 列表底部：加载更多 ---------------- */
/* 替代原来的分页条。滚到列表底部后点一下继续加载下一页 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin: 28px auto 30px;

  /* 默认「浅底 + 主色描边」，hover 才填成实心主色：
     不和顶部搜索按钮抢视觉，点下去又有明确反馈 */
  &__btn {
    min-width: 168px;
    height: 40px;
    padding: 0 28px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover,
    &:focus {
      color: #fff;
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.35);
    }
    /* 上浮只给 hover：点完按钮会保持 :focus，跟着上浮会像卡住了一样 */
    &:hover {
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
    }
  }

  /* 「已经到底啦」：两侧各拉一条细线，避免一行孤零零的文字显得突兀 */
  &__end {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--el-text-color-placeholder);

    &::before,
    &::after {
      content: '';
      width: 48px;
      height: 1px;
      background-color: var(--el-border-color-lighter);
    }
  }
}

/* 移动端：按钮铺满一栏、加高触控区。
   必须写在 .load-more 基类之后 —— 同优先级下靠后的规则才生效 */
@media only screen and (max-width: 767px) {
  .load-more {
    margin: 22px auto 24px;

    &__btn {
      width: 100%;
      max-width: 340px;
      min-width: 0;
      height: 44px;
    }
  }
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
