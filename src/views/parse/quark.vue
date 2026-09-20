<template>
  <div class="app1">
    <!-- 工具栏：面包屑靠左、返回按钮靠右 -->
    <div class="file-toolbar">
      <span
        v-if="loadData.bread"
        class="file-toolbar__bread"
        :title="loadData.bread"
      >
        {{ loadData.bread }}
      </span>
      <el-button
        class="file-toolbar__back"
        size="small"
        icon="back"
        @click="goBack()"
      >
        返回
      </el-button>
    </div>

    <!-- 文件卡片栅格：替代原 el-table -->
    <div
      v-loading="loadData.tableLoading"
      element-loading-text="数据正在加载中..."
      class="file-card-grid"
    >
      <div
        v-for="item in fileCards"
        :key="item.key"
        class="file-card"
        :class="{ 'is-dir': item.isDir }"
        @click="onCardClick(item.row)"
      >
        <div class="file-card__cover">
          <el-image
            v-if="item.thumbUrl"
            class="file-card__thumb"
            :src="item.thumbUrl"
            fit="cover"
            :preview-src-list="[item.thumbUrl]"
            hide-on-click-modal
            preview-teleported
            @click.stop
          >
            <!-- 空地址 / 403 / 混合内容时替换掉 EP 默认的「加载失败」灰块 -->
            <template #error>
              <div class="file-card__fallback">
                <span class="file-card__filetype">
                  <MySvg :iconName="item.icon" width="62%" height="62%" />
                </span>
              </div>
            </template>
          </el-image>
          <div v-else class="file-card__fallback">
            <span class="file-card__filetype">
              <MySvg :iconName="item.icon" width="62%" height="62%" />
            </span>
          </div>
        </div>

        <div class="file-card__body">
          <div class="file-card__title" :title="item.name">{{ item.name }}</div>
          <div v-if="item.meta" class="file-card__meta" :title="item.meta">
            {{ item.meta }}
          </div>

          <div class="file-card__actions">
            <el-button
              v-if="!item.isDir"
              type="primary"
              icon="videoPlay"
              size="small"
              title="转存到平台账号并生成公开分享链接"
              :loading="item.row.loading"
              @click.stop="copyLink(item.row)"
            >
              <span>复制链接</span>
            </el-button>
          </div>
        </div>
      </div>

      <div
        v-if="
          !loadData.tableLoading &&
          !(loadData.tableData && loadData.tableData.length)
        "
        class="file-card-grid__empty"
      >
        暂无数据
      </div>
    </div>
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

    <!-- 复制链接成功弹窗 -->
    <el-dialog
      class="copy-link-dialog"
      title="分享链接已生成"
      v-model="loadData.copyLinkVisible"
      width="520px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="cl">
        <div class="cl-file">
          <el-icon class="cl-file__icon"><Document /></el-icon>
          <span
            class="cl-file__name"
            :title="loadData.item ? loadData.item.file_name : ''"
            >{{ loadData.item ? loadData.item.file_name : '' }}</span
          >
        </div>

        <div class="cl-field">
          <div class="cl-field__label">分享链接</div>
          <el-input
            v-model="loadData.copyLinkUrl"
            readonly
            class="cl-field__input"
            placeholder="链接生成中..."
          >
            <template #append>
              <el-button
                type="primary"
                icon="CopyDocument"
                @click="copyDialogLink"
                >复制</el-button
              >
            </template>
          </el-input>
        </div>

        <div class="cl-tip cl-tip--ok">
          <el-icon class="cl-tip__icon"><CircleCheckFilled /></el-icon>
          <span class="cl-tip__desc">夸克公开分享链接，永久有效，无需提取码</span>
        </div>
      </div>
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
  copyLinkVisible: false,
  copyLinkUrl: '',
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

// 卡片视图：一次性把每行预计算成卡片数据。
// 放在 computed 里而不是模板里，是为了给 transQuarkIcon / getFilesize / moment
// 这几处在字段缺失时会抛错或渲染垃圾串的调用集中加兜底。
const fileCards = computed(() =>
  (loadData.tableData || []).map((row, index) => {
    const dir = !!row.dir;
    // transQuarkIcon 内部会做 file_name.lastIndexOf，缺失时会抛 TypeError
    const hasName = !!row.file_name;
    // updated_at 是毫秒；缺失或为 0 时 moment 会给出 "Invalid date" / 1970-01-01
    const ms = parseInt(row.updated_at, 10);
    const time =
      ms && !Number.isNaN(ms) ? moment(ms).format('YYYY-MM-DD HH:mm:ss') : '';
    return {
      row,
      key: row.fid ?? index,
      isDir: dir,
      name: row.file_name || '未命名文件',
      icon: hasName ? transQuarkIcon(row) : 'icon-wenjian',
      // 文件夹一律不渲染缩略图：否则整卡点击与 el-image 灯箱互相打架
      thumbUrl: dir ? '' : row.big_thumbnail || '',
      // getFilesize 只用第三个参数，这里与表格 :formatter 的调用等价
      meta: [getFilesize(row, null, row.size), time].filter(Boolean).join(' · '),
    };
  })
);

function onCardClick(row) {
  // 文件行保持原样：点击没有任何行为（parseList 对文件本就是空操作）
  if (row && row.dir) parseList(row);
}

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
    // 进入子目录时把目录名写到工具栏面包屑上（原来一直没赋值，所以是空串）
    loadData.bread = item.file_name || '';
    parseQuark({
      pid: fid,
    });
  }
}

/**
 * 播放视频
 * @returns {Promise<void>}
 */

// 复制链接：转存到平台夸克账号后生成新的公开永久分享链接
function copyLink(item) {
  item.loading = true;
  const params = {
    pwd_id: route.query.shorturl,
    passcode: route.query.pwd || '',
    fid_list: [item.fid],
    fileName: item.file_name,
  };
  userStore
    .quarkSaveAndShare(params)
    .then((res) => {
      if (res.code === 200) {
        const { shareUrl } = res.data || {};
        if (!shareUrl) {
          ElMessage.error('未获取到分享链接，请稍后重试');
          return;
        }
        loadData.item = item;
        loadData.copyLinkUrl = shareUrl;
        loadData.copyLinkVisible = true;
      } else {
        ElMessage.error(res.msg || '复制链接失败，请稍后重试');
      }
    })
    .catch(() => {
      ElMessage.error('复制链接失败，请稍后重试');
    })
    .finally(() => {
      item.loading = false;
    });
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

// 复制文本到剪贴板（非 https 或剪贴板API不可用时降级为 execCommand）
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      // 继续走降级方案
    }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}

// 复制弹窗中的完整链接
async function copyDialogLink() {
  if (!loadData.copyLinkUrl) {
    ElMessage.warning('链接为空，请重新生成');
    return;
  }
  await copyToClipboard(loadData.copyLinkUrl);
  ElMessage.success('复制成功，链接已复制到剪贴板');
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
  // 移动端弹窗统一留白：外留 24px、内留 16px。
  // 原先是 width:96% + body padding:0 —— 390px 屏上外留白只有 8px，
  // 内容还直接贴到弹窗左右边缘（分享链接弹窗有自己更高优先级的规则，
  // 所以只有其它弹窗暴露出来）。
  :deep(.el-dialog) {
    width: calc(100% - 48px) !important;
  }
  :deep(.el-dialog__body) {
    padding: 0 16px 20px;
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
/* ========== 分享链接弹窗 ========== */
.copy-link-dialog {
  // 桌面用 width="520px"；窄屏由 max-width 兜住并撑出左右 24px 留白。
  // 刻意不用 CSS min()：旧版 Android WebView / 微信内置浏览器（Chrome < 79）
  // 不支持 min()，会让 .el-dialog 的 width: var(--el-dialog-width) 整条失效、
  // 退化成 width:auto 满屏 —— 表现就是「两边一点留白都没有」。
  max-width: calc(100% - 48px);

  :deep(.el-dialog__header) {
    padding: 16px 20px 14px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }
  :deep(.el-dialog__body) {
    padding: 18px 20px 20px;
  }
}

.cl {
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

/* 文件名：浅底卡片 + 图标，跟弹窗标题拉开层级 */
.cl-file {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  &__icon {
    flex: none;
    margin-top: 3px;
    font-size: 15px;
    color: var(--el-color-primary);
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    color: var(--el-text-color-primary);
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* 链接：输入框与复制按钮拼成一体 */
.cl-field {
  margin-top: 16px;

  &__label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__input {
    :deep(.el-input__inner) {
      font-size: 13px;
    }

    :deep(.el-input-group__append) {
      padding: 0;
      background-color: var(--el-color-primary);
      border-radius: 0 var(--el-input-border-radius) var(--el-input-border-radius)
        0;
      box-shadow: none;

      .el-button {
        height: 100%;
        margin: 0;
        padding: 0 18px;
        border: 0;
        border-radius: 0 var(--el-input-border-radius)
          var(--el-input-border-radius) 0;
        font-size: 13px;
        color: #fff;

        &:hover,
        &:focus {
          background-color: var(--el-color-primary-light-3);
          color: #fff;
        }
      }
    }
  }
}

/* 提取码 / 说明 */
.cl-tip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;

  &__label {
    color: var(--el-text-color-secondary);
  }

  &__pwd {
    padding: 2px 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border: 1px dashed var(--el-color-primary-light-5);
    border-radius: 6px;
    user-select: all;
  }

  &__desc {
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }

  &__icon {
    flex: none;
    font-size: 15px;
    color: var(--el-color-success);
  }

  &--ok {
    .cl-tip__desc {
      color: var(--el-text-color-regular);
    }
  }
}

@media only screen and (max-width: 767px) {
  // 宽度/留白由 .copy-link-dialog 的 max-width 控制，这里只收紧内边距与字号
  .copy-link-dialog {
    :deep(.el-dialog__header) {
      padding: 14px 16px 12px;
    }
    :deep(.el-dialog__body) {
      padding: 16px 16px 18px;
    }
  }
  .cl-field__input :deep(.el-input-group__append) .el-button {
    padding: 0 12px;
  }
  .cl-tip {
    gap: 6px;
    &__desc {
      font-size: 12px;
    }
  }
  // 赞助下载等其它弹窗仍在用 .file-name，长文件名别撑破
  .file-name {
    word-break: break-all;
  }
}

.file-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 25px;
  min-height: 24px;

  &__bread {
    flex: 1; /* 吃掉剩余宽度，把返回按钮顶到最右 */
    min-width: 0; /* 允许被压缩，才能出省略号 */
    font-size: 15px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 返回按钮：默认 el-button 是白底灰边，放在工具栏里几乎看不出是操作入口。
     改成主题色渐变胶囊 + 同色投影，hover 上浮，让它成为工具栏唯一的视觉落点。
     选择器带 scoped 属性后是 (0,3,0)，压得住 .el-button:hover 这类 (0,2,0)，不需要 !important。
     面包屑为空（根目录）时靠 margin-left: auto 顶到最右 */
  &__back {
    flex: none;
    margin-left: auto;
    height: 32px;
    padding: 0 18px;
    border: none;
    border-radius: 16px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    background-color: var(--el-color-primary); /* 不支持渐变时的兜底 */
    background-image: linear-gradient(
      135deg,
      var(--el-color-primary-light-3) 0%,
      var(--el-color-primary) 100%
    );
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover,
    &:focus {
      color: #fff;
      background-image: linear-gradient(
        135deg,
        var(--el-color-primary) 0%,
        var(--el-color-primary-dark-2) 100%
      );
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
    }
    /* 上浮只给 hover：点击后按钮会保持 :focus，跟着上浮会像卡住了一样 */
    &:hover {
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
    }

    /* 箭头 hover 时向左轻移 2px，暗示"往回退一层" */
    :deep(.el-icon) {
      transition: transform 0.2s ease;
    }
    &:hover :deep(.el-icon) {
      transform: translateX(-2px);
    }
  }
}

.file-card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  margin-top: 12px;
  /* .wp-table 原本的 min-height:200px 是 v-loading 遮罩唯一的高度来源，
     换成栅格后必须自己提供，否则首屏/空数据时遮罩高度为 0，spinner 不可见
     （EP 会自动加 el-loading-parent--relative，这里显式写出便于阅读） */
  min-height: 240px;
  position: relative;
  box-sizing: border-box;

  &__empty {
    grid-column: 1 / -1;
    padding: 60px 0;
    text-align: center;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.file-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0; /* grid 子项默认 min-width:auto，超长文件名会撑破轨道 */
  box-sizing: border-box;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  /* 让封面被圆角裁切；el-image 必须 preview-teleported，否则灯箱一起被裁 */
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;

  /* 只有文件夹卡片可点：文件行的点击在今天就是空操作，给指针是误导 */
  &.is-dir {
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
    }
  }

  &__cover {
    position: relative;
    flex: none;
    width: 100%;
    /* 统一 16:9。原先固定 140px（移动端 170px）高度，卡片越宽封面越扁：
       视频缩略图被 fit=cover 越裁越多，非视频的图标占比也随宽度漂移 */
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light);
    overflow: hidden;
  }
  &__thumb {
    display: block; /* el-image 根元素默认 inline-block */
    width: 100%;
    height: 100%;
  }
  /* 缩略图加载失败（空地址 / 403 / 混合内容）时替换 EP 默认的灰色「加载失败」块；
     非视频文件也走这里，所以两者共用同一套底色 */
  &__fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 没有缩略图时铺一层淡蓝渐变，避免封面是一条空灰，
       视觉重量与视频缩略图对齐 */
    background-image: linear-gradient(
      135deg,
      rgba(64, 158, 255, 0.14) 0%,
      rgba(64, 158, 255, 0.03) 62%,
      transparent 100%
    );
  }
  /* 图标尺寸跟随封面宽度（约 24%），任何断点下图标与封面的比例都一致；
     原先固定 56px，宽卡片上显得又小又空 */
  &__filetype {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(52px, 24%, 92px);
    aspect-ratio: 1;
    border-radius: 18%;
    background-color: var(--el-bg-color);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    padding: 12px 14px 14px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--el-text-color-primary);
    overflow-wrap: anywhere;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__meta {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
    white-space: nowrap; /* getFilesize 的 1TB 分支会返回约 30 字符 */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap; /* 三个按钮最宽约 262px，窄档位必须折行而不是溢出 */
    align-items: center;
    gap: 8px;
    margin-top: auto; /* 操作行贴底，同一行卡片按钮纵向对齐 */
    padding-top: 12px;

    .el-button {
      margin: 0; /* 去掉原来的 margin-left:12px / margin-top:5px */
    }
    /* 抵消 EP 的 .el-button+.el-button{margin-left:12px}，避免与 gap 叠加成 20px */
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}

@media only screen and (max-width: 767px) {
  .file-toolbar {
    margin-top: 18px;
  }
  /* 窄屏按钮收一档，给左侧面包屑留出更多宽度 */
  .file-toolbar__back {
    height: 30px;
    padding: 0 14px;
    font-size: 13px;
  }
  .file-card-grid {
    gap: 10px;
  }

  /* 单列全宽时封面 16:9 会吃掉卡片近六成高度（375 屏上约 188px），
     一屏只放得下两张卡。这里把卡片转成横向列表：封面缩成左侧固定宽度，
     文字与按钮排到右边，卡高从约 330px 降到约 140px */
  .file-card {
    flex-direction: row;
    align-items: stretch;

    &__cover {
      width: 104px;
      align-self: stretch; /* 封面撑满卡高，右侧不留白 */
      aspect-ratio: auto; /* 高度交给拉伸决定，避免与 16:9 打架 */
    }
    &__filetype {
      width: 46px; /* 封面收窄后 24% 会低于可读下限，直接给固定值 */
    }
    &__body {
      padding: 10px 12px 12px;
    }
    &__title {
      font-size: 13px;
      line-height: 1.4;
    }
    &__meta {
      margin-top: 4px;
      font-size: 11px;
    }
    /* 登录后第三个按钮文案会变成「快速下载」，叠加播放按钮后三个按钮总宽超出
       卡片正文宽度，原来 flex-wrap: wrap 会折成两行。这里改成不折行 + 允许按钮
       收缩，并把左右内边距从 11px 收到 6px，390(iPhone12)/375/360 都能排成一行；
       只有 ≤340 的极端窄屏才让文字出省略号，不会折行也不会溢出卡片 */
    &__actions {
      flex-wrap: nowrap;
      gap: 6px;
      padding-top: 8px;

      .el-button {
        flex: 0 1 auto;
        min-width: 0;
        padding-left: 6px;
        padding-right: 6px;
        overflow: hidden;
      }
      /* 图标不许被压扁，只让文字收缩 */
      :deep(.el-button > .el-icon) {
        flex: none;
      }
      /* EP 把默认插槽包在 <span> 里，文字超长时出省略号而不是撑破按钮 */
      :deep(.el-button > span) {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
@media (min-width: 768px) {
  .file-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1200px) {
  .file-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 1600px) {
  .file-card-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
