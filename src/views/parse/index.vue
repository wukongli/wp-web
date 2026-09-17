<template>
  <div class="app1">
    <!--    <div class="logo">-->
    <!--      <a href="/source/index">-->
    <!--        <img :src="logo" alt="">-->
    <!--        <span>深度搜索</span>-->
    <!--      </a>-->
    <!--    </div>-->
    <!--    <header>-->
    <!--      <div @click="goBack()" class="back-icon">-->
    <!--        <MySvg-->
    <!--          iconName="icon-fanhui"-->
    <!--          width="30px"-->
    <!--          height="30px"-->
    <!--          size="30"-->
    <!--        ></MySvg>-->
    <!--        <span style="margin-left: 10px">{{ loadData.rootBackTitle }}</span>-->
    <!--      </div>-->
    <!--&lt;!&ndash;      <div :title="loadData.bread" class="back-title">&ndash;&gt;-->
    <!--&lt;!&ndash;        {{ loadData.bread }}&ndash;&gt;-->
    <!--&lt;!&ndash;      </div>&ndash;&gt;-->
    <!--    </header>-->
    <!--    <el-button-->
    <!--      style="margin: 10px 0"-->
    <!--      type="primary"-->
    <!--      plain-->
    <!--      icon="UploadFilled"-->
    <!--      :disabled="multiple"-->
    <!--      @click="handleParse"-->
    <!--      >批量下载</el-button-->
    <!--    >-->
    <!--    <el-button-->
    <!--        style="margin-left: 20px"-->
    <!--        type="primary"-->
    <!--        plain-->
    <!--        icon="Promotion"-->
    <!--    ><a href="https://vip.aifenxiang.net.cn" target="_blank">获取卡密</a></el-button>-->
    <!--    <el-tag v-show="!multiple" style="margin-left:30px;" type="danger">有想做网盘影视会员副业的可以联系我！</el-tag>-->
    <!--    <el-tag style="margin-left:30px;" type="danger">注意：下载器请设置端口：127.0.0.1:9999</el-tag>-->
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
              icon="menu"
              size="small"
              type="warning"
              v-if="!item.isDir"
              title="开通快速下载（不限大小/次数）"
              @click.stop="vipDownLoad(item.row)"
              >快速下载</el-button
            >
            <el-button
              size="small"
              type="success"
              icon="videoPlay"
              v-if="item.canPlay"
              :loading="item.row.playLoading"
              :disabled="item.row.playLoading"
              title="在线播放"
              @click.stop="playVideo(item.row)"
              >播放</el-button
            >
            <el-button
              icon="download"
              size="small"
              v-if="!item.isDir"
              :type="item.row.status == 2 ? 'danger' : 'primary'"
              :disabled="item.row.disable"
              :loading="item.row.loading"
              title="下载到本地下载器"
              @click.stop="downLoad(item.row)"
            >
              <span v-if="item.row.status === 0">{{
                getToken() ? '快速下载' : '下 载'
              }}</span>
              <span v-if="item.row.status === 1">下载中</span>
              <span v-if="item.row.status === 2">已下载</span>
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
      <!--      <div class="down-address">-->
      <!--        <span>下载地址：</span>-->
      <!--        <a href="https://pc-lec.pages.dev/400110.cn.html?link=U2FsdGVkX196rlE9IpdHLhd3f5kKwVsiL54wrDZMfTltqVfkzQOw0cSsQ4F3ExfjQVZi5z7nywQnB%2BEj2dcYCQ%3D%3D" target="_blank">-->
      <!--          点击下载</a-->
      <!--        >-->
      <!--      </div>-->
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
      <div v-if="loadData.shareUrl" style="text-align: center">
        <a
          :href="loadData.shareUrl"
          target="_blank"
          rel="noopener noreferrer"
          >{{ loadData.shareUrl }}</a
        >
      </div>

      <div class="file-name">文件名：{{ loadData.item.server_filename }}</div>
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
        {{ loadData.qrTitle }}
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="onSubmit">{{
            downOrPlay ? '播 放' : '下 载'
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 视频播放弹窗 -->
    <el-dialog
      class="dia-code"
      height="300px"
      title="提示"
      v-model="loadData.playVideo"
    >
      <img class="qr-code" :src="zhizhuxia" alt="" />
      <div class="qr-hint">请添加获取观看方式【备注"在线观看"】</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="loadData.playVideo = false"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- 无限制下载 -->
    <el-dialog title="提示" v-model="loadData.noLimit" width="40%">
      <div class="qr-title">{{ loadData.item.server_filename }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="noLimit"
            >下 载</el-button
          >
          <!--          <el-button v-else type="danger"-->
          <!--                     @click="trySend"-->
          <!--          >重 试</el-button>-->
        </span>
      </template>
    </el-dialog>

    <!--    赞助下载弹窗-->
    <el-dialog title="提示" v-model="loadData.vipDown" width="40%">
<!--      <img class="qr-code" :src="loadData.codeUrl" alt="" />-->
      <div class="file-name">文件名：{{ loadData.item.server_filename }}</div>
      <div class="qr-title">
        快速下载无需验证码、直接下载！
      </div>
      <!--      <div class="qr-title">想做网盘影视会员副业的可以联系我！</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
            ><a href="https://vip.ainsource.com" target="_blank"
              >点击开通</a
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
    <!-- 到达每天下载次数弹窗 -->
    <el-dialog
      :close-on-click-modal="false"
      class="play_dia"
      :before-close="handleBeforeClose"
      :title="loadData.title"
      v-model="loadData.maxNum"
    >
      <div class="play-body">
        <!-- 顶部警示 -->
        <div class="play-tip">
          <el-icon class="play-tip-icon"><WarningFilled /></el-icon>
          <span>{{ loadData.diaHit }}</span>
        </div>

        <!-- 选择播放器 -->
        <div class="play-mobile-title">点击发送到播放器内播放</div>
        <div class="mobile_player">
          <div
            v-if="loadData.isIos || loadData.isMac"
            class="player-item"
            @click="openUrl(loadData.infuseUrl)"
          >
            <el-tooltip
              class="box-item"
              effect="dark"
              content="苹果infuse播放器"
              placement="top"
            >
              <img :src="infuse" alt="infuse" />
            </el-tooltip>
            <span class="player-name">Infuse</span>
          </div>
          <div
            v-if="loadData.isWindows"
            class="player-item"
            @click="openUrl(loadData.potUrl)"
          >
            <el-tooltip
              class="box-item"
              effect="dark"
              content="potplayer播放器"
              placement="top"
            >
              <img :src="pot" alt="PotPlayer" />
            </el-tooltip>
            <span class="player-name">PotPlayer</span>
          </div>
          <div
            v-if="loadData.isAndroid"
            class="player-item"
            @click="openUrl(loadData.maxUrl)"
          >
            <el-tooltip
              class="box-item"
              effect="dark"
              content="安卓mx播放器"
              placement="top"
            >
              <img :src="mobilePlayer" alt="MX Player" />
            </el-tooltip>
            <span class="player-name">MX Player</span>
          </div>
          <a
            v-if="loadData.isAndroid || loadData.isIos"
            class="player-item"
            :href="loadData.vlcUrl"
            style="text-decoration: none; color: inherit"
          >
            <el-tooltip
              class="box-item"
              effect="dark"
              content="vlc播放器"
              placement="top"
            >
              <img :src="vlc" alt="VLC" />
            </el-tooltip>
            <span class="player-name">VLC</span>
          </a>
        </div>
        <!-- 视频播放链接：复制后手动添加到播放器 -->
        <div class="play-url-box">
          <span class="play-url-label">视频播放链接（复制后手动添加到播放器）</span>
          <div class="play-url-row">
            <el-input
              v-model="loadData.playUrl"
              readonly
              placeholder="点击播放后自动生成"
              class="play-url-input"
            />
            <el-tooltip content="复制链接" placement="top">
              <el-button
                type="primary"
                plain
                :icon="CopyDocument"
                @click="copyPlayUrl"
              />
            </el-tooltip>
          </div>
        </div>

        <!-- 使用帮助：挪到最底部，不再打断「警示 → 播放器 → 链接」这条主线 -->
        <div class="play-help">
          <el-link
            class="play-help-link"
            href="https://docs.qq.com/doc/DWlR0elZITll2VEZU?no_promotion=1"
            target="_blank"
            type="success"
          >
            <span>播放器使用说明</span>
            <el-icon class="play-help-arrow"><ArrowRight /></el-icon>
          </el-link>
          <!-- <el-link
            class="play-help-link"
            href="https://pan.quark.cn/s/c32f0125e825"
            target="_blank"
            type="success"
          >
            <span>PC客户端下载地址</span>
            <el-icon class="play-help-arrow"><ArrowRight /></el-icon>
          </el-link> -->
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Index">
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import { ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
import MySvg from '@/components/icon/Svg.vue';
const userStore = useUserStore();
import Hls from 'hls.js';
import {
  generateRandomLetters,
  getFilesize,
  getIconClass,
  timestampToTime,
  userKey,
  formatToYMD,
  showPlay,
  baiduShowPlay,
} from '@/utils/wp';
import { setDownLoadRecord, shareUrl } from '@/api/system/vip';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { onMounted, computed } from 'vue';
import iron from '@/assets/images/钢铁侠.png';
import zhizhuxia from '@/assets/images/zhizhuxia.png';
import front from '@/assets/images/前端.png';
import duli from '@/assets/images/独立开发者.png';
import duli2 from '@/assets/images/独立2.png';
import yao from '@/assets/images/yaoyao.png';
const qrCode = ref('');
import xiaochengxu from '@/assets/images/xiaochengxu.jpg';
import kuaituQrCode from '@/assets/qrCode/kuaitu.png';
import ucQrCode from '@/assets/qrCode/uc.png';
import xunleiQrCode from '@/assets/qrCode/xunlei.png';
import baiduQrCode from '@/assets/qrCode/baidu.png';
import quarkQrCode from '@/assets/qrCode/quark.png';
import { getToken } from '@/utils/auth';
import { generateDeviceFingerprint } from '@/utils/fingerprint';
import { decrypt } from '@/utils/jsencrypt';
import logo from '@/assets/img/deep.jpg';
import infuse from '@/assets/logo/infuse.png';
import mobilePlayer from '@/assets/logo/mxplayer.png';
import pot from '@/assets/logo/potplayer.png';
import vlc from '@/assets/logo/vlc.png';
const qrCodeList = ref([
  kuaituQrCode,
  ucQrCode,
  xunleiQrCode,
  baiduQrCode,
  quarkQrCode,
]);
import Artplayer from 'artplayer';
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const codeRef = ref();
const form = reactive({
  code: '',
  playName: '',
});
const isSending = ref(false);
const multiple = ref(true);
const fsIds = ref([]);
const selectItem = ref([]);
const pathList = ref([]);
const downOrPlay = ref(true); //true 播放，false 下载
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
  },
  dialogVisible: false,
  // fileName: '',
  realLink: '',
  WeCharVisible: false,
  playVideo: false,
  noLimit: false,
  errorDia: false,
  // codeNum: '',
  tableLoading: true,
  fileSize: getToken() ? 100698669056 : 10737418240,
  routeData: [],
  rootBackTitle: '返回',
  vipDown: false,
  item: null,
  url: '',
  codeUrl: qrCode,
  ckId: null,
  maxNum: false,
  infuseUrl: 'javascript:void(0)',
  maxUrl: 'javascript:void(0)',
  potUrl: 'javascript:void(0)',
  vlcUrl: 'javascript:void(0)',
  playUrl: '',
  isWindows: false,
  isMac: false,
  isIos: false,
  isAndroid: false,
  player: null,
  hlsPlayer: null,
  diaHit: '请安装播放器后在播放器内播放！',
  videoUrl: '',
  isMobild: false,
  downType: null,
  qrTitle: null,
  shareUrl: null,
});
// 路由离开时的操作
onBeforeRouteLeave((to, from) => {
  proxy.$tab.closeOpenPage();
});

// 卡片视图：一次性把每行预计算成卡片数据。
// 放在 computed 里而不是模板里，是为了给 getIconClass / baiduShowPlay / getFilesize /
// timestampToTime 这几处在字段缺失时会抛错或渲染垃圾串的调用集中加兜底。
const fileCards = computed(() =>
  (loadData.tableData || []).map((row, index) => {
    const dir = parseInt(row.isdir) === 1;
    // getIconClass / baiduShowPlay 内部都做 server_filename.lastIndexOf，缺失时会抛 TypeError
    const hasName = !!row.server_filename;
    const name = String(row.server_filename || '')
      .replace('百度', '')
      .replace('群', '')
      .replace('加', '')
      .replace('网盘', '')
      .replace('影视', '')
      .replace('更新', '');
    // server_mtime 是秒；timestampToTime 内部 *1000，缺失时产出
    // "NaN-NaN-NaN NaN:NaN:NaN"，为 0 时是 1970-01-01 —— 都不显示
    const sec = parseInt(row.server_mtime, 10);
    const time =
      sec && !Number.isNaN(sec) ? timestampToTime(row, null, sec) : '';
    // thumbs 可能是「只有 icon、url 为空串」的对象，判的是 URL 字符串而非对象本身
    const thumb = row.thumbs && row.thumbs.url3;
    return {
      row,
      key: row.fs_id ?? index,
      isDir: dir,
      name: name || '未命名文件',
      icon: hasName ? getIconClass(row) : 'icon-wenjian',
      // 文件夹一律不渲染缩略图：否则整卡点击与 el-image 灯箱互相打架
      thumbUrl: dir ? '' : thumb || '',
      // getFilesize 只用第三个参数，这里与表格 :formatter 的调用等价
      meta: [getFilesize(row, null, row.size), time].filter(Boolean).join(' · '),
      // baiduShowPlay 对文件夹返回的是真值字符串，所以必须先判 !dir 再调用
      canPlay: !dir && hasName && !!baiduShowPlay(row),
    };
  })
);

function onCardClick(row) {
  // 文件行保持原样：点击没有任何行为（parseList 对文件本就是空操作）
  if (row && parseInt(row.isdir) === 1) parseList(row);
}
onMounted(() => {
  // const randomItem = qrCodeList.value[Math.floor(Math.random() * qrCodeList.value.length)];
  // qrCode.value = xiaochengxu;
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUserAgent =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    // 兜底检测：UA 被伪装为 PC 时，通过触屏 + 屏幕尺寸判断
    const hasTouch =
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth <= 1024;
    return isMobileUserAgent || (hasTouch && isSmallScreen);
  };
  loadData.isMobile = isMobile();
  // 平台识别：决定播放弹窗展示哪个播放器（Infuse / PotPlayer / MX Player）
  const ua = navigator.userAgent.toLowerCase();
  loadData.isWindows = /windows|win32|win64|wow64/i.test(ua);
  loadData.isMac =
    /macintosh|mac os x|macintel|macppc/i.test(ua) &&
    !/iphone|ipad|ipod/i.test(ua);
  loadData.isIos = /iphone|ipad|ipod/i.test(ua);
  loadData.isAndroid = /android/i.test(ua);
});
function getList() {
  // const userCode = Cookies.get('code');
  const data = Object.assign({ index: 0 }, route.query);
  parseCopyLink(data);
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
  const { isdir, path } = item;
  if (parseInt(isdir) === 1) {
    loadData.tableLoading = true;
    const data = {
      dir: path,
      root: '0', // 1 文件夹，0 文件
      shorturl: loadData.query.shorturl,
      pwd: loadData.query.pwd,
      index: loadData.parseLinkParams.index,
      // code:Cookies.get("code")
    };
    parseCopyLink(data);
  }
}
function parseCopyLink(params) {
  loadData.routeData.push(params);
  if (loadData.routeData.length === 1) {
    // loadData.rootBackTitle = '全部文件';
    loadData.parseLinkParams.dir = '/';
  } else {
    loadData.parseLinkParams.dir = params.dir;
    // loadData.rootBackTitle = '返回上一级';
  }
  const { root } = params;
  // 获取文件列表
  userStore
    .parseCopyLink(params)
    .then((data) => {
      if (data.code === 200) {
        if (parseInt(data.data.errno) === 0) {
          const list = data.data.data.list;
          const title = data.data.data.title;
          loadData.bread = title;
          list.forEach((item) => {
            // 0 下载，1，下载中
            item.status = 0;
            // if (parseInt(item.size) > loadData.fileSize) {
            //   item.disable = true;
            // }
          });
          loadData.tableData = list;
          loadData.parseLinkParams.seckey = data.data.data.seckey;
          loadData.parseLinkParams.shareid = data.data.data.shareid;
          loadData.parseLinkParams.uk = data.data.data.uk;
          if (root === '1' && list.length === 1) {
            const data = {
              dir: list[0].path,
              root: '0', // 1 文件夹，0 文件
              shorturl: loadData.query.shorturl,
              pwd: loadData.query.pwd,
            };
            parseCopyLink(data);
            return;
          }
          loadData.tableLoading = false;
        } else {
          loadData.tableLoading = false;
          return;
        }
      }
    })
    .catch(() => {
      loadData.tableLoading = false;
      // loadData.errorDia = true;
    });
}

function openUrl(url) {
  // window.location.href = url;
  const a = document.createElement('a');
  a.href = url;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 复制视频播放链接，供手动添加到播放器
async function copyPlayUrl() {
  if (!loadData.playUrl) {
    ElMessage.warning('请先点击播放生成链接');
    return;
  }
  try {
    await navigator.clipboard.writeText(loadData.playUrl);
    ElMessage.success('链接已复制，可手动添加到播放器');
  } catch (e) {
    // 剪贴板 API 不可用时回退
    const ta = document.createElement('textarea');
    ta.value = loadData.playUrl;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      ElMessage.success('链接已复制，可手动添加到播放器');
    } catch (err) {
      ElMessage.error('复制失败，请手动选择链接复制');
    }
    document.body.removeChild(ta);
  }
}

async function downLoad(item) {
  loadData.item = item;
  isSending.value = false;
  downOrPlay.value = false;
  // showParse.value = true;
  if (getToken()) {
    loadData.noLimit = true;
  } else {
    //前端生成用户唯一下载token
    const token = await generateDeviceFingerprint();
    const res = await userStore.getDownType(token);
    if (res.code === 200) {
      // localStorage.setItem('token', res.data.token);
      loadData.downType = res.data.type;
      loadData.qrTitle = res.data.qrTitle;
      loadData.shareUrl = res.data.shareUrl;
      qrCode.value = res.data.qrCodeUrl;
      form.code = '';
      // if (loadData.downType === 0) {
      //   loadData.qrTitle = 'UC浏览器扫码保存后即可获取';
      // } else if (loadData.downType === 1) {
      //   loadData.qrTitle = '微信扫码保存后即可获取验证码';
      // } else if (loadData.downType === 2) {
      //   loadData.qrTitle = '微信扫码保存后即可获取';
      // } else if (loadData.downType === 3) {
      //   loadData.qrTitle = '微信扫码保存后即可获取';
      // }
      loadData.WeCharVisible = true;
    }
  }
}

async function noLimit() {
  //直接下载文件
  isSending.value = true;
  const result = loadData.isMobile ? await testGopeed() : await testMotrix();
  if (!result) {
    loadData.dialogVisible = true;
    isSending.value = false;
    return;
  }
  confirm(loadData.item);
}

const onSubmit = () => {
  proxy.$refs.codeRef.validate(async (valid) => {
    if (valid) {
      isSending.value = true;
      if (downOrPlay.value) {
        confirmVideo(loadData.item);
        return;
      }

      if (!downOrPlay.value) {
        const result = loadData.isMobile
          ? await testGopeed()
          : await testMotrix();
        if (!result) {
          loadData.dialogVisible = true;
          isSending.value = false;
          return;
        }
      }

      if (parseInt(loadData.item.size) > loadData.fileSize) {
        ElMessage.error('文件大于10G下载速度较慢，请登录卡密使用快速下载！');
        isSending.value = false;
        return false;
      }
      confirm(loadData.item);
    }
  });
};

async function confirm(item) {
  item.loading = true;
  item.status = 1;
  item.disable = true;
  const params = {
    shareid: loadData.parseLinkParams.shareid,
    uk: loadData.parseLinkParams.uk,
    randsk: loadData.parseLinkParams.seckey,
    sekey: loadData.parseLinkParams.seckey,
    fsId: item.fs_id,
    fs_ids: [item.fs_id],
    path: item.server_filename,
    userKey: userKey,
    size: item.size,
    pwd: loadData.query.pwd,
    surl: loadData.query.shorturl,
    url: `https://pan.baidu.com/s/${loadData.query.shorturl}`,
    dir: loadData.parseLinkParams.dir,
    fileName: loadData.item.server_filename,
    code: form.code,
    type: loadData.downType,
    token: await generateDeviceFingerprint(),
  };
  // const token = getToken();
  userStore
    .parseLink(params)
    .then((res) => {
      if (res.code === 200) {
        isSending.value = false;
        item.status = 0;
        item.loading = false;
        item.disable = false;
        loadData.WeCharVisible = false;
        loadData.noLimit = false;
        if (res.data.error_code === 31066) {
          item.status = 0;
          ElMessage.error('文件名含有特殊字符，请修改一下文件名重新下载！');
          return;
        }
        if (res.data.vip) {
          loadData.url = res.data.data.dlink;
          loadData.ua = res.data.data.ua;
        } else {
          loadData.url = res.data.data.urls[0].url;
          loadData.ua = res.data.data.ua;
        }
        loadData.isMobile ? sendToGopeed(item) : sendToMotrix(item);
      } else {
        item.status = 0;
        item.disable = false;
        item.loading = false;
        // loadData.limitSpeedVisible = true;
      }
    })
    .catch(() => {
      item.status = 0;
      item.disable = false;
      item.loading = false;
      isSending.value = false;
      // loadData.errorDia = true;
    });
}

async function sendToMotrix(item) {
  // 发送到下载器
  fetch('http://127.0.0.1:16800/jsonrpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'test1',
      method: 'aria2.addUri',
      params: [
        [loadData.url],
        {
          'user-agent': loadData.ua,
          'max-connection-per-server': '256', // aria2 硬上限，写 255 无效！
          split: '256', // 分块数拉到 Motrix 上限
          'min-split-size': '1M', // 每块至少 1MB，减少碎片
          'disk-cache': '512M', // 务必加这条，避免磁盘卡顿
        },
      ],
    }),
  })
    .then((r) => r.json())
    .then(() => {
      item.status = 2;
      ElMessage({
        message: `${item.server_filename}开始下载！`,
        type: 'success',
      });
    });
}

async function sendToGopeed(item) {
  // 调用API创建任务
  fetch('http://127.0.0.1:16800/api/v1/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      req: {
        url: loadData.url,
        extra: {
          header: {
            'User-Agent': loadData.ua,
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
          },
        },
      },
      opt: {
        // HTTP协议专属配置
        http: {
          // 并发连接数，这就是你想要的"maxConnsPerHost"的API版本
          connections: 256,
          chunkSize: 8388608,
          keepAlive: true,
          compression: true,
        },
        // 如果需要设置超时时间
        timeout: 120,
        maxRetries: 5,
      },
    }),
  })
    .then((resp) => resp.json())
    .then((res) => {
      item.status = 2;
      ElMessage({
        message: `${item.server_filename}开始下载！`,
        type: 'success',
      });
    })
    .catch((e) => {});
}

function goBack() {
  // if (loadData.routeData.length === 1) {
  //   ElMessage.error('当前已是全部文件');
  //   return;
  // }
  // if (loadData.routeData.length > 1) {
  //   loadData.tableLoading = true;
  //   loadData.routeData.pop();
  //   const route = loadData.routeData.pop();
  //   parseCopyLink(route);
  // }
  router.push({ path: '/source' });
  // router.go(-1); // 使用history模式返回
}

// function goIndex(){
//   router.push({ path: '/login' });
// }
function init() {
  if (
    !route.query.shorturl ||
    !route.query.pwd ||
    !route.query.dir ||
    !route.query.root
  ) {
    router.push({ path: '/parse/login' });
    return;
  }
  loadData.tableLoading = true;
  // getUserByUserKey();
  getList();
  // getDownNum();
}
init();

async function testMotrix() {
  return fetch('http://127.0.0.1:16800/jsonrpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'test',
      method: 'aria2.getVersion',
      params: [],
    }),
  })
    .then((resp) => resp.json())
    .then((res) => {
      // 检查是否返回成功（没有error字段）
      if (res && !res.error) {
        return true;
      }
      return false;
    })
    .catch((e) => {
      return false;
    });
}
async function testGopeed() {
  return fetch('http://127.0.0.1:16800/api/v1/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((resp) => resp.json())
    .then((res) => {
      return true;
    })
    .catch((e) => {
      return false;
    });
}
function vipDownLoad(item) {
  loadData.item = item;
  loadData.vipDown = true;
}

function playShow() {
  loadData.playVideo = true;
}

async function playVideo(item) {
  // console.log(item);
  // loadData.item = item;
  // form.playName = localStorage.getItem("searchName") + item.server_filename;
  // loadData.playVideo = true;

  loadData.item = item;
  form.code = '';
  loadData.loading = false;
  isSending.value = false;
  if (getToken()) {
    downOrPlay.value = true;
    // 生成播放直链期间按钮显示 loading 过渡状态
    item.playLoading = true;
    confirmVideo(loadData.item);
  } else {
    loadData.playVideo = true;
  }
}
function handleBeforeClose() {
  isSending.value = false;
  loadData.videoUrl = '';
  loadData.maxNum = false;
  loadData.loading = false;
  loadData.infuseUrl = 'javascript:void(0)';
  loadData.maxUrl = 'javascript:void(0)';
  loadData.potUrl = 'javascript:void(0)';
  loadData.vlcUrl = 'javascript:void(0)';
  loadData.playUrl = '';
  if (loadData.player && loadData.player.video) loadData.player.video.src = '';
  loadData.player?.destroy();
}

async function confirmVideo(item) {
  const { fid, server_filename, duration, size } = item;
  loadData.title = server_filename;
  loadData.WeCharVisible = false;
  const params = {
    shareid: loadData.parseLinkParams.shareid,
    uk: loadData.parseLinkParams.uk,
    randsk: loadData.parseLinkParams.seckey,
    sekey: loadData.parseLinkParams.seckey,
    fsId: loadData.item.fs_id,
    fs_ids: [loadData.item.fs_id],
    path: loadData.item.server_filename,
    userKey: userKey,
    size: loadData.item.size,
    pwd: loadData.query.pwd,
    surl: loadData.query.shorturl,
    url: `https://pan.baidu.com/s/${loadData.query.shorturl}`,
    dir: loadData.parseLinkParams.dir,
    fileNewName: form.playName,
    fileName: loadData.item.server_filename,
  };
  userStore
    .videoAdd(params)
    .then((res) => {
      loadData.item.playLoading = false;
      if (res.code === 200) {
        loadData.maxNum = true;
        if (!res.data.fileName) {
          ElMessage.error('视频播放失败,请更换资源或者下载后观看');
          loadData.loading = false;
          loadData.maxNum = false;
          return;
        }
        let playPath =
          'https://play.gssource.com/d/' +
          encodeURI('百度网盘/我的资源/' + res.data.fileName);
        loadData.infuseUrl = 'infuse://x-callback-url/play?url=' + playPath;
        loadData.maxUrl =
          'intent:' +
          playPath +
          '#Intent;package=com.mxtech.videoplayer.ad;S.title=' +
          res.data.fileName +
          ';end';
        loadData.potUrl = 'potplayer://' + playPath;
        if (loadData.isAndroid) {
          // 安卓 VLC：Chrome 官方 intent:// 格式（intent: 全 URL 形式 Chrome 不认）
          loadData.vlcUrl =
            'intent://' +
            playPath.replace(/^https?:\/\//, '') +
            '#Intent;scheme=https;type=video/*;package=org.videolan.vlc;S.title=' +
            encodeURIComponent(res.data.fileName) +
            ';end';
        } else {
          // iOS 已验证 vlc:// 可正常唤起
          loadData.vlcUrl = 'vlc://' + playPath;
        }
        loadData.playUrl = playPath;
      }
    })
    .catch(() => {
      loadData.maxNum = false;
      loadData.item.playLoading = false;
    });
}

function vipDownClick() {
  ElMessage.error('请扫码联系管理员开通权限！');
}
function ext(path) {
  return path.split('.').pop() ?? '';
}

function handleSelectionChange(selection) {
  if (selection.length === 1 && parseInt(selection[0].isdir) === 1) {
    return false;
  }
  selectItem.value = selection;
  fsIds.value = selection.map((item) => item.fs_id);
  pathList.value = selection.map((item) => item.server_filename);
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
  for (let i = 0; i < selectItem.value.length; i++) {
    const params = {
      shareid: loadData.parseLinkParams.shareid,
      uk: loadData.parseLinkParams.uk,
      randsk: loadData.parseLinkParams.seckey,
      sekey: loadData.parseLinkParams.seckey,
      userKey: 'main',
      fsId: fsIds.value[i],
      fs_ids: [fsIds.value[i]],
      path: pathList.value[i],
      size: selectItem.value[i].size,
      pwd: loadData.query.pwd,
      surl: loadData.query.shorturl,
      url: `https://pan.baidu.com/s/${loadData.query.shorturl}`,
      dir: loadData.parseLinkParams.dir,
    };
    userStore
      .parseLink(params)
      .then((res) => {
        if (res.code === 200) {
          if (i + 1 === selectItem.value.length) {
            loadData.tableLoading = false;
          }
          loadData.tableData.forEach((e) => {
            if (fsIds.value.includes(e.fs_id)) {
              e.status = 2;
              e.disable = true;
            }
          });
          if (res.data.vip) {
            loadData.url = res.data.data.dlink;
            loadData.ua = res.data.data.ua;
          } else {
            loadData.url = res.data.data.urls[0].url;
            loadData.ua = res.data.data.ua;
          }
          fetch('http://127.0.0.1:6066/api/v1/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              req: {
                url: loadData.url,
                extra: {
                  header: {
                    'User-Agent': loadData.ua,
                  },
                },
              },
              opt: {
                extra: {
                  connections: 256,
                },
              },
            }),
          })
            .then((resp) => resp.json())
            .then((res) => {
              ElMessage({
                message: `${selectItem.value[i].server_filename}开始下载！`,
                type: 'success',
              });
            })
            .catch((e) => {});
        }
      })
      .catch((res) => {
        if (i + 1 === selectItem.value.length) {
          loadData.tableLoading = false;
        }
      });
  }
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
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    .player-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      img {
        width: 46px;
        height: 46px;
      }
      .player-name {
        margin-top: 6px;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
@media only screen and (min-width: 767px) {
  /* 使用深度选择器修改局部 loading 样式 */
  .loading-content :deep(.el-loading-mask) {
    height: 400px;
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
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 32px;
    .player-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;
      img {
        width: 56px;
        height: 56px;
      }
      &:hover img {
        transform: translateY(-4px) scale(1.06);
      }
      .player-name {
        margin-top: 8px;
        font-size: 13px;
        color: #606266;
      }
    }
  }
}
/* ===== 播放器选择弹窗 ===== */
/* 布局约定：警示条 → 播放器 → 播放链接 → 帮助链接，自上而下一条主线。
   区块之间 20px、标题与内容之间 12px，除图标组自身居中外全部左对齐 */
.play-body {
  padding: 4px 6px 2px;
}

// 顶部警示：图标与文字左对齐，和下方小节标题共享同一条左边缘
.play-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 20px;
  border-radius: 8px;
  color: #f56c6c;
  font-size: 13px;
  line-height: 1.5;
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.3);
  .play-tip-icon {
    flex-shrink: 0;
    margin-top: 2px; /* 与首行文字视觉对齐，文案换行时图标不会跟着飘 */
    font-size: 16px;
  }
}

// 小节标题（播放器 / 播放链接共用同一套字号与左对齐）
.play-mobile-title,
.play-url-label {
  display: block;
  margin-bottom: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// 播放器图标组与下一块之间留出区块间距
.mobile_player {
  margin-bottom: 20px;
}

// 播放链接 + 复制按钮
.play-url-box {
  .play-url-row {
    display: flex;
    align-items: center;
    gap: 8px;
    .play-url-input {
      flex: 1;
      :deep(.el-input__inner) {
        font-size: 12px;
      }
    }
  }
}

// 底部帮助链接：去掉整块灰底大卡片，改成一条分隔线 + 紧凑链接
.play-help {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid var(--el-border-color-lighter);
  .play-help-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    .play-help-arrow {
      font-size: 13px;
      transition: transform 0.2s;
    }
    &:hover .play-help-arrow {
      transform: translateX(3px);
    }
  }
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
    display: flex;
    margin-top: 25px;
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
    width: 200px;
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

/* ---------------- 文件卡片栅格（替代 el-table） ---------------- */
/* 可用宽度 = 0.72W − 40（本页渲染在 pan.vue 的 .home 里，不是全宽）。
   基准 1 列 → ≥768px 2 列 → ≥1200px 3 列 → ≥1600px 4 列，
   四档下单卡宽度落在 248–450px，节奏一致 */
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
    &__actions {
      gap: 6px;
      padding-top: 8px;
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
