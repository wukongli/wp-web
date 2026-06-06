<template>
  <div class="app-container home">
    <header>
      <div @click="goBack()" class="back-icon">
        <MySvg
            iconName="icon-fanhui"
            width="30px"
            height="30px"
            size="30"
        ></MySvg>
        <span style="margin-left: 15px">{{ loadData.rootBackTitle }}</span>
      </div>
      <div :title="loadData.bread" class="back-title">
        {{ loadData.bread }}
      </div>
    </header>
<!--    <el-button-->
<!--        style="margin: 10px 0"-->
<!--        type="primary"-->
<!--        plain-->
<!--        icon="UploadFilled"-->
<!--        :disabled="multiple"-->
<!--        @click="handleParse"-->
<!--    >批量解析</el-button-->
<!--    >-->
<!--    <el-button-->
<!--        style="margin-left: 20px"-->
<!--        type="primary"-->
<!--        plain-->
<!--        icon="Promotion"-->
<!--    ><a href="https://vip.gssource.com" target="_blank">快速下载</a></el-button>-->
<!--    <el-tag v-show="!multiple" style="margin-left:30px;" type="danger">有想做网盘影视会员副业的可以联系我！</el-tag>-->
<!--    <el-tag style="margin-left:30px;" type="danger">注意：下载器请设置端口：127.0.0.1:9999</el-tag>-->
      <el-table
          v-loading="loadData.tableLoading"
          element-loading-text="数据正在加载中..."
          :data="loadData.tableData"
          height="calc(100vh - 200px)"
          style="width: 100%; cursor: pointer; font-size: 14px; font-weight: 600"
          class="wp-table"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
            min-width="280px"
            prop="file_name"
            label="文件名"
            show-overflow-tooltip
        >
          <template #default="scope">
            <div
                @click="parseList(scope.row)"
                style="display: flex; align-items: center"
            >
              <MySvg v-if="!scope.row.big_thumbnail" :iconName="transQuarkIcon(scope.row)" size="50"></MySvg>
              <el-image
                  style="width:110px;height: 50px;"
                  v-if="scope.row.big_thumbnail"
                  :src="scope.row.big_thumbnail"
                  fit="cover"
                  :preview-src-list="[scope.row.big_thumbnail]"
                  hide-on-click-modal
                  preview-teleported
              >
              </el-image>
              <span style="margin-left: 10px">{{
                  scope.row.file_name
                }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="修改时间">
          <template #default="{row}">
            {{ moment(parseInt(row.updated_at)).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="size" :formatter="getFilesize" label="大小" />
        <!--        <el-table-column label="剩余下载次数"-->
        <!--          >{{-->
        <!--            parseInt(loadData.codeNum) > 5 ? '无限' : loadData.codeNum-->
        <!--          }}-->
        <!--          次</el-table-column-->
        <!--        >-->
        <el-table-column min-width="200px" label="操作">
          <template #default="scope">
            <el-button
                icon="menu"
                size="small"
                @click="vipDownLoad(scope.row)"
                v-if="!scope.row.dir && !getToken()"
                :type="'warning'"
            >快速下载</el-button
            >
<!--            <el-button-->
<!--                size="small"-->
<!--                @click="playVideo(scope.row)"-->
<!--                v-if="!scope.row.dir && showPlay(scope.row)"-->
<!--                :type="'success'"-->
<!--                icon="videoPlay"-->
<!--            >播放</el-button-->
<!--            >-->
            <el-button
                icon="download"
                v-if="!scope.row.dir"
                size="small"
                :type="scope.row.status == 2 ? 'danger' : 'primary'"
                @click="downLoad(scope.row)"
                :disabled="scope.row.disable"
                :loading="scope.row.loading"
            >
              <span v-if="scope.row.status === 0">{{getToken() ? "快速下载" : "下 载"}}</span>
              <span v-if="scope.row.status === 1">下载中</span>
              <span v-if="scope.row.status === 2">已下载</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    <!-- 提示安装下载器弹窗 -->
    <el-dialog title="提示" v-model="loadData.dialogVisible" width="40%">
      <div class="down-title">
        下载器已更新，请安装下载器并配置好端口！！
      </div>
      <div class="down-address">
        <span>配置说明：</span>
        <a href="https://docs.qq.com/doc/DWmNnb3ZIekdnWHJi?no_promotion=1" target="_blank">
          https://docs.qq.com/doc/DWmNnb3ZIekdnWHJi?no_promotion=1</a
        >
      </div>
<!--      <div class="down-address">-->
<!--        <span>下载地址：</span>-->
<!--        <a href="https://docs.qq.com/doc/DWmNnb3ZIekdnWHJi?no_promotion=1" target="_blank">-->
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
    <el-dialog class="dia-code" height="300px" title="提示" v-model="loadData.WeCharVisible">
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="file-name">文件名：{{ loadData.item.file_name }}</div>
      <el-form
          ref="codeRef"
          :model="form"
          :rules="codeRules"
      >
        <el-form-item style="width: 80%;margin: 10px auto 0;" prop="code" label="请输入验证码">
          <el-input v-model="form.code" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div class="qr-hint">微信扫一扫上方二维码获取验证码</div>
      <!--      <div class="qr-title">高峰期有时下载速度会变慢，建议上午或者晚上12点后批量下载，或者使用快速下载！</div>-->
      <!--      <div class="qr-title">想做网盘影视会员副业的可以联系我！</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="onSubmit"
          >{{downOrPlay ? "播 放": "下 载"}}</el-button
          >
          <!--          <el-button v-else type="danger"-->
          <!--                     @click="trySend"-->
          <!--          >重 试</el-button>-->
        </span>
      </template>
    </el-dialog>
    <!-- 无限制下载 -->
    <el-dialog title="提示" v-model="loadData.noLimit" width="40%">
      <div class="qr-title">{{ loadData.item.file_name }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="noLimit"
          >解 析</el-button
          >
          <!--          <el-button v-else type="danger"-->
          <!--                     @click="trySend"-->
          <!--          >重 试</el-button>-->
        </span>
      </template>
    </el-dialog>

    <!--    赞助下载弹窗-->
    <el-dialog title="提示" v-model="loadData.vipDown" width="40%">
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="file-name">文件名：{{ loadData.item.file_name }}</div>
      <div class="qr-title">
        快速下载无需验证码，不限文件大小，不限次数，自由下载！
      </div>
<!--      <div class="qr-title">想做网盘影视会员副业的可以联系我！</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"><a href="https://vip.ainsource.com" target="_blank">点击开通快速下载</a></el-button>
<!--                    <el-button type="primary">开通快速下载联系管理员</el-button>-->
        </span>
      </template>
    </el-dialog>

    <!-- 解析出错弹窗 -->
    <el-dialog title="提示" v-model="loadData.errorDia" width="40%">
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="qr-hint">解析出错了，请联系管理员</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="loadData.errorDia = false"
          >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- 到达每天下载次数弹窗 -->
    <el-dialog class="play_dia" :close-on-click-modal ="false" :style="{
    miHeight: '500px',
  }" :before-close="handleBeforeClose" :title="loadData.title" v-model="loadData.maxNum">
      <div class="loading-content" v-loading="loadData.loading" element-loading-text="视频加载中...">
        <div class="video_player" id="video-player"></div>
        <!--        <iframe-->
        <!--                ref="iframeRef"-->
        <!--                allowfullscreen-->
        <!--                webkitallowfullscreen-->
        <!--                mozallowfullscreen-->
        <!--                frameborder="0"-->
        <!--                :src="loadData.videoUrl">-->
        <!--        </iframe>-->
      </div>
      <el-button type="danger" size="small" style="margin-top: 5px;" icon="Warning">视频卡顿或者大文件视频播放器内观看更流畅</el-button>
      <div class="mobile_player" >
        <div @click="openUrl(loadData.infuseUrl)">
          <el-tooltip
              class="box-item"
              effect="dark"
              content="苹果infuse播放器"
              placement="top-start"
          >
            <img :src="infuse" alt="">
          </el-tooltip>
        </div>
        <!--        <div @click="openUrl(loadData.potUrl)">-->
        <!--          <el-tooltip-->
        <!--              class="box-item"-->
        <!--              effect="dark"-->
        <!--              content="potplayer播放器"-->
        <!--              placement="top-start"-->
        <!--          >-->
        <!--            <img :src="pot" alt="">-->
        <!--          </el-tooltip>-->
        <!--        </div>-->
        <div @click="openUrl(loadData.vlcUrl)">
          <el-tooltip
              class="box-item"
              effect="dark"
              content="vlc播放器"
              placement="top-start"
          >
            <img :src="vlc" alt="">
          </el-tooltip>
        </div>
        <div @click="openUrl(loadData.maxUrl)">
          <el-tooltip
              class="box-item"
              effect="dark"
              content="安卓mx播放器"
              placement="top-start"
          >
            <img :src="mobilePlayer" alt="">
          </el-tooltip>
        </div>
        <span>
          <el-link href="https://docs.qq.com/doc/DWlR0elZITll2VEZU?no_promotion=1" target="_blank" type="success">播放器使用说明</el-link>
        </span>

      </div>
    </el-dialog>
    <!--    <div class="we-chart">-->
    <!--      <img :src="wechar" alt="" />-->
    <!--      <p class="con">有问题联系管理员</p>-->
    <!--    </div>-->
  </div>
</template>

<script setup name="Quark">
import moment from 'moment';
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import MySvg from '@/components/icon/Svg.vue';
const userStore = useUserStore();
import Artplayer from "artplayer"
import {
  generateRandomLetters,
  getFilesize,
  getIconClass,
  timestampToTime, transQuarkIcon,
  userKey,showPlay
} from '@/utils/wp';
import { setDownLoadRecord, shareUrl } from '@/api/system/vip';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import iron from '@/assets/images/钢铁侠.png';
import front from '@/assets/images/前端.png';
import duli from '@/assets/images/独立开发者.png';
import duli2 from '@/assets/images/独立2.png';
import yao from '@/assets/images/yaoyao.png';
import mobilePlayer from '@/assets/logo/mxplayer.png';
import infuse from '@/assets/logo/infuse.png';
import vlc from '@/assets/logo/vlc.png';
import pot from "@/assets/logo/potplayer.png";
import xiaochengxu from '@/assets/images/xiaochengxu.jpg';
import { getToken } from '@/utils/auth';
import { decrypt } from '@/utils/jsencrypt';
import {onMounted} from 'vue';
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const codeRef = ref();
const form = reactive({
  code: '',
});
const isSending = ref(false);
const multiple = ref(true);
const fsIds = ref([]);
const fTokenId = ref([]);
const selectItem = ref([]);
const pathList = ref([]);
const qrCodeList = ref([iron,front,duli,duli2,yao]);
const qrCode = ref('');
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
    stoken:'',
  },
  dialogVisible: false,
  // fileName: '',
  realLink: '',
  WeCharVisible: false,
  noLimit: false,
  errorDia: false,
  // codeNum: '',
  tableLoading: true,
  fileSize: getToken() ? 100698669056 : 2147483648,
  routeData: [],
  rootBackTitle: '全部文件',
  vipDown: false,
  item: null,
  url: '',
  player: null,
  ckId: null,
  isMobile:false,
});
const downOrPlay = ref(true);//true 播放，false 下载

onMounted(() => {
  const randomItem = qrCodeList.value[Math.floor(Math.random() * qrCodeList.value.length)];
  qrCode.value = randomItem;
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    // const isMobileScreen = window.innerWidth <= 768;
    return isMobileUserAgent;
  };
  loadData.isMobile = isMobile();
})
// 路由离开时的操作
onBeforeRouteLeave((to, from) => {
  proxy.$tab.closeOpenPage();
});
// function getList() {
//   const data = Object.assign({ index: 0 }, route.query);
//   parseQuark();
// }
async function parseQuark(params){
  loadData.tableLoading = true;
  let req;
  if(params.pid){
      req = {
      pwd_id:route.query.shorturl,
      pdir_fid:params.pid,
        stoken:loadData.stoken,
    }
  }else{
    req = {
      pwd_id:route.query.shorturl,
      stoken:loadData.stoken,
    }
  }

  await userStore
      .getQuarkList(req)
      .then((data) => {
        loadData.tableLoading = false;
        if(data.code === 200){
          data.data.list.forEach((item) => {
            // 0 下载，1，下载中
            item.status = 0;
          });
          loadData.tableData = data.data.list;
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
  const {fid,dir} = item;
  if(dir){
    parseQuark({
      pid:fid
    });
  }
}
function parseCopyLink(params) {
  loadData.routeData.push(params);
  if (loadData.routeData.length === 1) {
    loadData.rootBackTitle = '全部文件';
    loadData.parseLinkParams.dir = '/';
  } else {
    loadData.parseLinkParams.dir = params.dir;
    loadData.rootBackTitle = '返回上一级';
  }
  // 获取文件列表
  userStore
      .parseCopyLink(params)
      .then((data) => {
        loadData.tableLoading = false;
        if (data.code === 200) {
          if (parseInt(data.data.errno) === 0) {
            const list = data.data.data.list;
            const title = data.data.data.title;
            loadData.bread = title;
            // const code = Cookies.get('code');
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
          } else {
            loadData.limitSpeedVisible = true;
            return;
          }
        }
      })
      .catch(() => {
        loadData.tableLoading = false;
        // loadData.errorDia = true;
      });
}

function downLoad(item) {
  loadData.item = item;
  isSending.value = false;
  downOrPlay.value = false;
  // showParse.value = true;
  if (getToken()) {
    loadData.noLimit = true;
  } else {
    loadData.WeCharVisible = true;
    form.code = '';
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
      const params = {
        code: form.code,
        userKey: userKey,
        fsId: loadData.item.fid,
        version: '1.0.9',
      };
      if(!downOrPlay.value){
        const result = loadData.isMobile ? await testGopeed() : await testMotrix();
        if (!result) {
          loadData.dialogVisible = true;
          isSending.value = false;
          return;
        }
      }

      if(downOrPlay.value){
        userStore
            .getCodeNum(params)
            .then((res) => {
              if (res.code === 200) {
                if (res.data.data == 100) {
                  confirmVideo(loadData.item);
                }  else if (res.data.data == 60) {
                  setTimeout(() => {
                    isSending.value = false;
                    ElMessage.error('今日播放次数已达上限，请明天再来！');
                  }, 1000);
                } else if (res.data.data == 50) {
                  setTimeout(() => {
                    isSending.value = false;
                    ElMessage.error(
                        '验证码错误,一个验证码只能播放一个文件,请重新获取!'
                    );
                  }, 1000);
                }
              }
            })
            .catch(() => {
              isSending.value = false;
            });
        return;
      }
      if (parseInt(loadData.item.size) > loadData.fileSize) {
        ElMessage.error('文件大于2G下载速度较慢，请需登录卡密使用快速下载！');
        isSending.value = false;
        return false;
      }
      userStore
          .getCodeNum(params)
          .then((res) => {
            if (res.code === 200) {
              if (res.data.data == 100) {
                confirm(loadData.item);
              }  else if (res.data.data == 60) {
                setTimeout(() => {
                  isSending.value = false;
                  ElMessage.error('今日解析次数已达上限，请明天再来！');
                }, 2000);
              } else if (res.data.data == 50) {
                setTimeout(() => {
                  isSending.value = false;
                  ElMessage.error(
                      '验证码错误,一个验证码只能下载一个文件,请重新获取!'
                  );
                }, 2000);
              }
            }
          })
          .catch(() => {
            isSending.value = false;
          });
    }
  });
};
async function confirm(item) {
  const{fid,share_fid_token} = item;
  item.loading = true;
  item.status = 1;
  item.disable = true;
  const params = {
    pwd_id: route.query.shorturl,
    fid_list:[fid],
    stoken:loadData.stoken,
    // fid_token_list:[share_fid_token]
  };
  userStore
      .quarkTransfer(params)
      .then((res) => {
        if (res.code === 200) {
          isSending.value = false;
          item.loading = false;
          item.disable = false;
          res.data.data.data.forEach((data)=>{
          loadData.isMobile ? sendToGopeed(data,res.data.id) : sendToMotrix(data,res.data.id);
            item.status = 2;
          })
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
function playVideo(item){
  loadData.item = item;
  form.code = '';
  downOrPlay.value = true;
  loadData.loading = false;
  isSending.value = false;
  if (getToken()) {
    confirmVideo(loadData.item);
  } else {
    loadData.WeCharVisible = true;
  }
}
async function confirmVideo(item) {
  const{fid,file_name,duration,size} = item;
  loadData.title = file_name;
  loadData.WeCharVisible = false;
  loadData.maxNum = true;
  const params = {
    pwd_id: route.query.shorturl,
    fid_list:[fid],
    stoken:loadData.stoken,
    fileName:file_name,
    duration:duration,
    size:size,
  };
  loadData.loading = true;
  userStore
      .addVideo(params)
      .then((res) => {
        if (res.code === 200) {
          // if(res.data.url.includes("&mt=")){
          //   ElMessage.error("视频播放失败,请更换资源或者下载后观看");
          //   loadData.maxNum = false;
          //   return;
          // }
          if(!res.data.fileName){
            ElMessage.error("视频播放失败,请更换资源或者下载后观看");
            loadData.loading = false;
            loadData.maxNum = false;
            return;
          }
          let path = "http://154.201.66.14:5244/d/video/"+encodeURI("来自：分享/" + res.data.fileName);
          loadData.mobileUrl = path;
          // loadData.videoUrl = path;
          loadData.videoUrl = "https://play.gssource.com/d/video/"+encodeURI("来自：分享/" + res.data.fileName);
          //  loadData.videoUrl = testUrl;
          loadData.infuseUrl = "infuse://x-callback-url/play?url="+loadData.mobileUrl;
          loadData.maxUrl = "intent:"+loadData.mobileUrl+"#Intent;package=com.mxtech.videoplayer.ad;S.title="+res.data.fileName+";end";
          loadData.vlcUrl = "vlc://"+loadData.mobileUrl;
          // loadData.potUrl = "potplayer://"+loadData.mobileUrl;
          loadData.loading = false;
          const option = {
            id: "/video/来自：分享/"+res.data.fileName,
            container: "#video-player",
            url: loadData.videoUrl,
            title: res.data.fileName,
            volume: 1.0,
            autoplay: true,
            autoSize: false,
            autoMini: true,
            loop: false,
            flip: true,
            playbackRate: true,
            aspectRatio: true,
            // "screenshot": true,
            setting: true,
            hotkey: true,
            pip: true,
            mutex: true,
            fullscreen: true,
            // fullscreenWeb: true,
            subtitleOffset: true,
            miniProgressBar: false,
            type: ext(res.data.fileName),
            playsInline: true,
            theme: "#1890ff",
            quality: [],
            whitelist: [],
            settings: [
              {
                width: 200,
                html: '视频旋转',
                tooltip: '0°',
                selector: [
                  { html: '0°', rotate: 0, default: true },
                  { html: '90°', rotate: 90 },
                  { html: '180°', rotate: 180 },
                  { html: '270°', rotate: 270 },
                ],
                onSelect: function (item, $dom, art) {
                  const deg = item.rotate;
                  const $video = art.video;
                  const $container = art.container;

                  if ($video) {
                    // 1. 设置平滑过渡效果
                    $video.style.transition = 'transform 0.3s ease';

                    if (deg === 90 || deg === 270) {
                      // 2. 计算缩放比例：容器高度 / 视频宽度 (或反之) 以适应屏幕
                      // 防止 90 度旋转后视频超出边界
                      const rect = $container.getBoundingClientRect();
                      const scale = rect.height / rect.width;

                      // 只有当高度确实小于宽度时才缩放，否则可能会变太小
                      // 如果你希望强行铺满，可以根据实际场景调整这个 scale
                      $video.style.transform = `rotate(${deg}deg) scale(${scale})`;
                    } else {
                      // 3. 恢复 0 或 180 度，取消缩放
                      $video.style.transform = `rotate(${deg}deg) scale(1)`;
                    }
                  }

                  return item.html;
                },
              },
            ],
            moreVideoAttr: {
              "webkit-playsinline": true,
              playsInline: true,
              crossOrigin: "anonymous",
            },
            customType: {
            },
            lang: "zh-cn",
            lock: true,
            fastForward: true,
            autoPlayback: true,
            autoOrientation: true,
            airplay: true
          }
          const player = new Artplayer(option)
          loadData.player = player;
          loadData.player.on("ready", () => {
          })
          loadData.player.on("video:ended", () => {

          })
          loadData.player.on("error", () => {
            if (player.video.crossOrigin) {
              console.log(
                  "Error detected. Trying to remove Cross-Origin attribute. Screenshot may not be available.",
              )
              loadData.player.video.crossOrigin = null;
            }
          })
        }
      })
      .catch(() => {
        loadData.loading = false;
        loadData.maxNum = false;
      });
}
function ext(path){
  return path.split(".").pop() ?? ""

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

function handleBeforeClose(){
  isSending.value = false;
  loadData.videoUrl = "";
  loadData.mobileUrl = "";
  loadData.maxNum = false;
  loadData.loading = false;
  loadData.infuseUrl = "javascript:void(0)";
  loadData.maxUrl = "javascript:void(0)";
  loadData.vlcUrl = "javascript:void(0)";
  // loadData.potUrl = "javascript:void(0)";
  if (loadData.player && loadData.player.video) loadData.player.video.src = "";
  loadData.player?.destroy();
}

async function sendToMotrix(data,id) {
  //发送到下载器
  fetch('http://127.0.0.1:16800/jsonrpc', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'test1',
      method: 'aria2.addUri',
      params: [
        [data.download_url],
        {
          'header': [
            `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.0.2 Chrome/100.0.4896.160 Electron/18.3.5.12-a038f7b798 Safari/537.36 Channel/pckk_clouddrive_share_ch`,
            `Cookie: ${id}` // Cookie 必须包含在 header 里
          ],
          'max-connection-per-server': '256',
          'split': '256',
        }
      ]
    })
  })
      .then(r => r.json())
      .then(()=>{
        data.satus = 2;
        ElMessage({
          message: `文件开始下载！`,
          type: 'success',
        });
      });

}


async function sendToGopeed(data,id) {
  // 调用API创建任务
  fetch('http://127.0.0.1:16800/api/v1/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({req:
          {
            url:data.download_url,
            extra:{
              header:{
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/3.0.2 Chrome/100.0.4896.160 Electron/18.3.5.12-a038f7b798 Safari/537.36 Channel/pckk_clouddrive_share_ch",
                "Cookie":id
              }
            }
          },
      opt:{
        // HTTP协议专属配置
        http: {
          // 并发连接数，这就是你想要的"maxConnsPerHost"的API版本
          connections: 256,
          chunkSize: 8388608,
          keepAlive: true,
          compression: true
        },
        // 如果需要设置超时时间
        timeout: 120,
        maxRetries: 5
      }
    }),
  }).then((resp) => resp.json())
      .then((res) => {
        data.satus = 2;
        ElMessage({
          message: `文件开始下载！`,
          type: 'success',
        });
      }).catch(e=>{
  })
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
  parseQuark({pid:false});
}

// function goIndex(){
//   router.push({ path: '/login' });
// }
async function init() {
  if (
      !route.query.shorturl
  ) {
    router.push({ path: '/parse/login' });
    return;
  }
  await initToken();
  // parseQuark({pid:false});
}
init();

async function initToken(){
  const req = {
    pwd_id:route.query.shorturl,
    passcode:route.query.pwd,
  }
   await userStore
      .getToken(req)
      .then((data) => {
        if(data.code === 200){
          loadData.tableData = data.data.data.list;
          loadData.stoken = data.data.sToken;
          loadData.tableLoading = false;
        }
      })
      .catch(() => {
        loadData.tableLoading = false;
      });
}

// function getUserByUserKey(){
//   userStore.getUserInfo({userKey:userKey}).then((res)=>{
//     if(res.code === 200){
//       loadData.codeUrl = res.data.codeUrl;
//     }
//   })
// }

async function testMotrix() {
  return fetch('http://127.0.0.1:16800/jsonrpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'test',
      method: 'aria2.getVersion',
      params: []
    })
  })
      .then((resp) => resp.json())
      .then((res) => {
        // 检查是否返回成功（没有error字段）
        if (res && !res.error) {
          return true;
        }
        return false;
      }).catch(e => {
        return false;
      });

}
async function testGopeed() {
  return fetch('http://127.0.0.1:16800/api/v1/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  })
      .then((resp) => resp.json())
      .then((res) => {
        return true;
      }).catch(e=>{
        return false;
      })
}
function vipDownLoad(item) {
  loadData.item = item;
  loadData.vipDown = true;
}

function vipDownClick() {
  ElMessage.error('请扫码联系管理员开通权限！');
}


function handleSelectionChange(selection) {
  if (selection.length === 1 && parseInt(selection[0].isdir) === 1) {
    return false;
  }
  selectItem.value = selection;
  fsIds.value = selection.map((item) => item.fid);
  fTokenId.value = selection.map((item) => item.share_fid_token);
  // pathList.value = selection.map((item) => item.server_filename);
  multiple.value = !selection.length;
}

async function handleParse() {
  const token = getToken();
  if (!token) {
    ElMessage.error('批量解析请开通快速下载！');
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
    fid_list:fsIds.value,
    fid_token_list:fTokenId.value
  };
  userStore
      .quarkTransfer(params)
      .then((res) => {
        if (res.code === 200) {
          res.data.data.data.forEach((data,index)=>{
            sendToMotrix(data,res.data.id);
            if(index + 1 === fsIds.value.length){
              loadData.tableLoading = false;
            }
          })
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
  /* 使用深度选择器修改局部 loading 样式 */
  .loading-content :deep(.el-loading-mask) {
    height: 350px;
    background-color: black !important;
  }
  .loading-content{
    width: 100%;
    height: 350px;
    background-color: black !important;
    .video_player{
      width: 100%;
      height: 350px;
      background-color: black !important;
    }
    iframe{
      width: 100%;
      height: 350px;
      background-color: black !important;
    }
  }
  .mobile_player{
    cursor: pointer;
    width: 530px;
    height: 50px;
    margin:auto;
    display: flex;
    align-items: center;
    img{
      margin-left:8px;
      width: 40px;
      height: 40px;
      margin-top: 20px;
    }
    span{
      margin-left:5px;
    }
  }
}
@media only screen and (min-width: 767px) {
  /* 使用深度选择器修改局部 loading 样式 */
  .loading-content :deep(.el-loading-mask) {
    background-color: black !important;
  }
  .loading-content{
    width: 100%;
    height: 400px;
    background-color: black !important;
    padding-top:45px;
    .video_player{
      width: 100%;
      height: 350px;
      background-color: black !important;
    }
  }
  .mobile_player{
    cursor: pointer;
    width: 530px;
    height: 50px;
    margin:auto;
    margin-top: 20px;
    display: flex;
    align-items: center;
    img{
      margin-left:10px;
      width: 50px;
      height: 50px;
    }
    span{
      margin-left:5px;
    }
  }
}

.home {
  width: 98%;
  height: calc(100vh - 100px);
  margin: auto;
  font-size: 18px;
  header {
    width: 100%;
    height: 40px;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid #ccc;
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
</style>
