<template>
  <div class="app1">
    <el-table
      v-loading="loadData.tableLoading"
      element-loading-text="数据正在加载中..."
      :data="loadData.tableData"
      max-height="100%"
      style="width: 100%; cursor: pointer; font-size: 14px; font-weight: 600"
      class="wp-table"
      @selection-change="handleSelectionChange"
    >
      <!--        <el-table-column type="selection" width="50" align="center" />-->
      <el-table-column
        show-overflow-tooltip
        prop="file_name"
        label="文件名"
        min-width="40%"
      >
        <template #default="scope">
          <div
            @click="parseList(scope.row)"
            style="
              min-height: 70px;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              line-height: normal;
            "
          >
            <MySvg
              v-if="!scope.row.big_thumbnail"
              :iconName="transQuarkIcon(scope.row)"
              size="50"
            ></MySvg>
            <el-image
              style="width: 110px; height: 50px"
              v-if="scope.row.big_thumbnail"
              :src="scope.row.big_thumbnail"
              fit="cover"
              :preview-src-list="[scope.row.big_thumbnail]"
              hide-on-click-modal
              preview-teleported
            >
            </el-image>
            <div>{{ scope.row.file_name }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!hasDirData"
        min-width="20%"
        prop="updated_at"
        label="时间"
      >
        <template #default="scope">
          {{
            moment(parseInt(scope.row.updated_at)).format('YYYY-MM-DD HH:mm:ss')
          }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasDirData"
        min-width="20%"
        prop="size"
        :formatter="getFilesize"
        label="大小"
      />
      <el-table-column min-width="35%" align="right" label="操作">
        <template #header>
          <div class="back" @click="goBack()">返回上一级</div>
        </template>
        <template #default="scope">
          <el-button
            size="small"
            @click="addToDisk(scope.row)"
            v-if="!scope.row.dir"
            :type="scope.row.status == 2 ? 'danger' : 'primary'"
            icon="videoPlay"
            style="margin-top: 5px"
            :loading="scope.row.loading"
          >
            <span v-if="scope.row.status === 0">添加到网盘</span>
            <span v-if="scope.row.status === 1">添加中</span>
            <span v-if="scope.row.status === 2">已添加</span>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 提示安装下载器弹窗 -->
    <el-dialog title="提示" v-model="loadData.dialogVisible" width="40%">
      <div class="down-title">
        您还没有安装下载器，请安装下载器并配置好端口！！
      </div>
      <div class="down-address">
        <span>配置说明：</span>
        <a
          href="https://docs.qq.com/doc/DWmNnb3ZIekdnWHJi?no_promotion=1"
          target="_blank"
        >
          https://docs.qq.com/doc/DWmNnb3ZIekdnWHJi?no_promotion=1</a
        >
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="loadData.dialogVisible = false"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- 扫描获取验证码弹窗 -->
    <el-dialog
      class="dia-code"
      height="300px"
      title="提示"
      v-model="loadData.WeCharVisible"
    >
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="file-name">文件名：{{ loadData.item.file_name }}</div>
      <el-form ref="codeRef" :model="form" :rules="codeRules">
        <el-form-item
          style="width: 80%; margin: 10px auto 0"
          prop="code"
          label="请输入验证码"
        >
          <el-input v-model="form.code" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div class="qr-hint">
        微信扫一扫上方二维码获取验证码
        <el-link
          href="https://pan.quark.cn/s/c32f0125e825"
          target="_blank"
          type="success"
          >PC客户端下载地址</el-link
        >
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="onSubmit">{{
            downOrPlay ? '播 放' : '下 载'
          }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 无限制下载 -->
    <el-dialog title="提示" v-model="loadData.noLimit" width="40%">
      <div class="qr-title">{{ loadData.item.file_name }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="noLimit"
            >下 载</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!--    赞助下载弹窗-->
    <el-dialog title="提示" v-model="loadData.vipDown" min-width="40%">
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="file-name">文件名：{{ loadData.item.file_name }}</div>
      <div class="qr-title">
        爱看资源VIP无需验证码,不限下载次数，支持在线播放！
      </div>
      <!--      <div class="qr-title">想做网盘影视会员副业的可以联系我！</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
            ><a href="https://vip.gssource.com" target="_blank"
              >点击开通快速下载</a
            ></el-button
          >
          <!--          <el-button type="primary">开通快速下载联系管理员</el-button>-->
        </span>
      </template>
    </el-dialog>

    <!-- 下载出错弹窗 -->
    <el-dialog title="提示" v-model="loadData.errorDia" width="40%">
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="qr-hint">下载出错了，请联系管理员</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="loadData.errorDia = false"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Quark">
import { Refresh } from '@element-plus/icons-vue';
import deviceDetector from '@/utils/platform';
import moment from 'moment';
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import mobilePlayer from '@/assets/logo/mxplayer.png';
import infuse from '@/assets/logo/infuse.png';
import vlc from '@/assets/logo/vlc.png';
import pot from '@/assets/logo/potplayer.png';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import MySvg from '@/components/icon/Svg.vue';
import { onMounted, computed } from 'vue';
const userStore = useUserStore();
import Artplayer from 'artplayer';
import {
  generateRandomLetters,
  getFilesize,
  getIconClass,
  showPlay,
  timestampToTime,
  transQuarkIcon,
  userKey,
} from '@/utils/wp';
import { setDownLoadRecord, shareUrl } from '@/api/system/vip';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import iron from '@/assets/images/钢铁侠.png';
import front from '@/assets/images/前端.png';
import duli from '@/assets/images/独立开发者.png';
import yao from '@/assets/images/yaoyao.png';
import duli2 from '@/assets/images/独立2.png';
import loading from '@/assets/img/loading.gif';
import xiaochengxu from '@/assets/images/xiaochengxu.jpg';
import { getToken } from '@/utils/auth';
import { decrypt } from '@/utils/jsencrypt';
import logo from '@/assets/img/deep.jpg';
const qrCodeList = ref([front, duli, yao, iron, duli2]);
const qrCode = ref('');
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const codeRef = ref();
const form = reactive({
  code: '',
});
const isSending = ref(false);
const downOrPlay = ref(true); //true 播放，false 下载
const multiple = ref(true);
const fsIds = ref([]);
const fTokenId = ref([]);
const selectItem = ref([]);
const pathList = ref([]);
const loadData = reactive({
  bread: '',
  tableData: [],
  query: route.query,
  parseLinkParams: {
    timestamp: '',
    sign: '',
    fs_id: '',
    randsk: '',
    shareid: '',
    uk: '',
    code: '',
    link: '',
    index: 0,
    stoken: '',
  },
  dialogVisible: false,
  // fileName: '',
  realLink: '',
  WeCharVisible: false,
  noLimit: false,
  errorDia: false,
  maxNum: false,
  // codeNum: '',
  tableLoading: true,
  fileSize: 100698669056,
  routeData: [],
  rootBackTitle: '返回',
  vipDown: false,
  item: null,
  url: '',
  codeUrl: qrCode,
  ckId: null,
  videoUrl: '',
  mobileUrl: '',
  infuseUrl: 'javascript:void(0)',
  maxUrl: 'javascript:void(0)',
  vlcUrl: 'javascript:void(0)',
  // potUrl:'javascript:void(0)',
  loading: true,
  title: '',
  player: null,
  hlsPlayer: null,
  isAdmin: false,
});
// 路由离开时的操作
onBeforeRouteLeave((to, from) => {
  proxy.$tab.closeOpenPage();
});
const iframeRef = ref(null);

const hasDirData = computed(() => {
  return loadData.tableData && loadData.tableData.some((item) => !item.dir);
});
onMounted(() => {
  qrCode.value = xiaochengxu;
  loadData.isAdmin = localStorage.getItem('role') === 'admin';
});
function openUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
async function parseQuark(params) {
  loadData.tableLoading = true;
  let req;
  if (params.pid) {
    req = {
      pwd_id: route.query.shorturl,
      pdir_fid: params.pid,
      stoken: loadData.stoken,
    };
  } else {
    req = {
      pwd_id: route.query.shorturl,
      stoken: loadData.stoken,
    };
  }

  await userStore
    .getQuarkList(req)
    .then((data) => {
      loadData.tableLoading = false;
      if (data.code === 200) {
        data.data.list.forEach((item) => {
          // 0 下载，1，下载中
          item.status = 0;
        });
        loadData.tableData = data.data.list
          .sort((a, b) => b.l_updated_at - a.l_updated_at)
          .filter((item) => {
            // if (!item.dir && item.size < 1048576) {
            //   return false; // 删除
            // }
            return true; // 保留
          });
      }
    })
    .catch(() => {
      loadData.tableLoading = false;
    });
}

const codeRules = {
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }],
};

function goToIndex() {
  router.push({
    path: '/parse/login',
  });
}

function parseList(item) {
  const { fid, dir } = item;
  if (dir) {
    parseQuark({
      pid: fid,
    });
  }
}

/**
 * 播放视频
 * @returns {Promise<void>}
 */

function addToDisk(item) {
  loadData.item = item;
  form.code = '';
  downOrPlay.value = true;
  loadData.loading = false;
  isSending.value = false;
  if (getToken()) {
    addToDiskNext(loadData.item);
  } else {
    ElMessage.error('请登录后再添加');
  }
}

async function noLimit() {
  //直接下载文件
  isSending.value = true;
  const result = await testDownLoad();
  if (!result) {
    loadData.dialogVisible = true;
    isSending.value = false;
    return;
  }
  confirm(loadData.item);
}

async function addToDiskNext(item) {
  const { fid, file_name, duration, size } = item;
  item.loading = true;
  item.status = 1;
  const params = {
    pwd_id: route.query.shorturl,
    fid_list: [fid],
    stoken: loadData.stoken,
    fileName: localStorage.getItem('searchName') + file_name,
    duration: duration,
    size: size,
  };
  loadData.loading = true;
  userStore
    .quarkAdd(params)
    .then((res) => {
      console.log(res);
      item.loading = false;
      if (res.code === 200) {
        item.status = 2;
        ElMessage.success('添加成功');
      } else {
        item.status = 0;
      }
    })
    .catch(() => {
      item.status = 0;
    });
}
function ext(path) {
  return path.split('.').pop() ?? '';
}

function goBack() {
  router.push({ path: '/source' });
}
async function init() {
  if (!route.query.shorturl) {
    router.push({ path: '/parse/login' });
    return;
  }
  await initToken();
}
init();

async function initToken() {
  const req = {
    pwd_id: route.query.shorturl,
    passcode: route.query.pwd,
  };
  await userStore
    .getToken(req)
    .then((data) => {
      if (data.code === 200) {
        loadData.tableData = data.data.data.list;
        loadData.stoken = data.data.sToken;
        // loadData.tableLoading = false;
        if (data.data.data.list.length === 1 && data.data.data.list[0].dir) {
          const params = {
            dir: true,
            fid: data.data.data.list[0].fid,
          };
          parseList(params);
        } else {
          loadData.tableLoading = false;
        }
      } else {
        ElMessage.error('文件资源已失效');
        loadData.tableLoading = false;
      }
    })
    .catch(() => {
      loadData.tableLoading = false;
    });
}

function handleSelectionChange(selection) {
  if (selection.length === 1 && parseInt(selection[0].isdir) === 1) {
    return false;
  }
  selectItem.value = selection;
  fsIds.value = selection.map((item) => item.fid);
  fTokenId.value = selection.map((item) => item.share_fid_token);
  multiple.value = !selection.length;
}

async function handleParse() {
  const token = getToken();
  if (!token) {
    ElMessage.error('批量下载请联系管理员开通权限！');
    return false;
  }
  const result = await testDownLoad();
  if (!result) {
    loadData.dialogVisible = true;
    return;
  }
  if (fsIds.value.length > 10) {
    ElMessage.error('因网络原因，批量下载最大支持同时下载10个文件！');
    return false;
  }
  loadData.tableLoading = true;
  const params = {
    pwd_id: route.query.shorturl,
    fid_list: fsIds.value,
    fid_token_list: fTokenId.value,
    stoken: loadData.stoken,
  };
  userStore
    .quarkTransfer(params)
    .then((res) => {
      if (res.code === 200) {
        res.data.data.data.forEach((data, index) => {
          sendToMotrix(data, res.data.id);
          if (index + 1 === fsIds.value.length) {
            loadData.tableLoading = false;
          }
        });
      }
    })
    .catch(() => {
      loadData.tableLoading = false;
    });
}
</script>

<style scoped lang="scss">
@media only screen and (max-width: 767px) {
  :deep(.dia-code) {
    width: 80%;
  }
  :deep(.el-dialog) {
    width: 96% !important;
  }
  :deep(.el-dialog__body) {
    padding: 0;
    padding-bottom: 20px;
  }

  /* 使用深度选择器修改局部 loading 样式 */
  .loading-content :deep(.el-loading-mask) {
    height: 350px;
    background-color: black !important;
  }
  .loading-content {
    width: 100%;
    height: 350px;
    background-color: black !important;
    .video_player {
      width: 100%;
      height: 350px;
      background-color: black !important;
    }
    iframe {
      width: 100%;
      height: 350px;
      background-color: black !important;
    }
  }
  .mobile_player {
    cursor: pointer;
    width: 530px;
    height: 50px;
    margin: auto;
    display: flex;
    align-items: center;
    img {
      margin-left: 8px;
      width: 40px;
      height: 40px;
      margin-top: 20px;
    }
    span {
      margin-left: 5px;
    }
  }
}
@media only screen and (min-width: 767px) {
  /* 使用深度选择器修改局部 loading 样式 */
  .loading-content :deep(.el-loading-mask) {
    background-color: black !important;
  }
  .loading-content {
    width: 100%;
    height: 400px;
    background-color: black !important;
    padding-top: 45px;
    .video_player {
      width: 100%;
      height: 350px;
      background-color: black !important;
    }
  }
  .mobile_player {
    cursor: pointer;
    width: 530px;
    height: 50px;
    margin: auto;
    margin-top: 20px;
    display: flex;
    align-items: center;
    img {
      margin-left: 10px;
      width: 50px;
      height: 50px;
    }
    span {
      margin-left: 5px;
    }
  }
}
::v-deep .el-table .cell {
  overflow: inherit !important;
}

.app1 {
  width: 100%;
  //height: calc(100vh - 100px);
  margin: auto;
  font-size: 18px;
  overflow: auto;
  .logo {
    a {
      width: 100%;
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
        width: 100px !important;
        height: 80px !important;
        margin-top: 0;
        font-size: 20px;
        font-weight: bold;
        line-height: 80px;
      }
    }
  }
  header {
    width: 100%;
    height: 40px;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid #ccc;
    margin-top: 25px;
    display: flex;
    .back-icon {
      height: 30px;
      svg {
        float: left;
        margin-top: 5px;
        margin-left: 15px;
      }
      span {
        float: left;
        line-height: 40px;
      }
      span:hover {
        color: #409eff;
      }
    }

    .back-title {
      margin-left: 20px;
      line-height: 40px;
      max-width: 80%;
      white-space: nowrap; /* 防止文本换行 */
      overflow: hidden; /* 隐藏超出容器的部分 */
      text-overflow: ellipsis; /* 用省略号表示被裁剪的文本 */
    }
  }
  .wp-table {
    min-height: 200px;
    margin-top: 25px;
    .back {
      font-size: 15px;
      font-weight: bold;
      color: #000; /* 默认颜色 */
      transition: color 0.3s ease; /* 可选：平滑过渡 */
    }
    .back:hover {
      color: #67c23a; /* 滑过时变为红色，可换成任意颜色 */
    }
  }
  .wp-table ::v-deep .el-table__body tr:hover > td {
    //background-color: #c0ffe7 !important;
    color: #409eff;
  }
  .qr-title {
    margin-top: 20px;
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    color: #923333;
  }
  .file-name {
    margin-top: 20px;
    text-align: center;
    font-size: 15px;
    font-weight: bold;
  }
  .qr-code {
    height: 180px;
    margin: auto;
    display: block;
  }
  .qr-hint {
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  .down-title {
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  .down-address {
    display: block;
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .we-chart {
    width: 150px;
    height: 150px;
    position: fixed;
    bottom: 50px;
    right: 10px;
    cursor: pointer;
    //background: #53a7ff;
    color: black;
    font-weight: bold;
    z-index: 100;
    text-align: center;
    img {
      width: 100px;
      height: 100px;
      margin: 0;
    }
    .con {
      width: 100%;
      height: 20px;
      line-height: 20px;
      margin: 0;
      color: red;
    }
  }
}
</style>
