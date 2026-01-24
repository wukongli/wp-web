<template>
  <div class="app1">
<!--    <div class="logo">-->
<!--      <a href="/source/index">-->
<!--        <img :src="logo" alt="">-->
<!--        <span>深度搜索</span>-->
<!--      </a>-->
<!--    </div>-->
    <header>
      <div @click="goBack()" class="back-icon">
        <MySvg
          iconName="icon-fanhui"
          width="30px"
          height="30px"
          size="30"
        ></MySvg>
        <span style="margin-left: 10px">{{ loadData.rootBackTitle }}</span>
      </div>
<!--      <div :title="loadData.bread" class="back-title">-->
<!--        {{ loadData.bread }}-->
<!--      </div>-->
    </header>
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
      <el-table
        v-loading="loadData.tableLoading"
        element-loading-text="数据正在加载中..."
        :data="loadData.tableData"
        max-height="100%"
        style="width: 100%;cursor: pointer; font-size: 14px; font-weight: 600;overflow: auto;"
        class="wp-table"
        @selection-change="handleSelectionChange"
      >
<!--        <el-table-column type="selection" width="50" align="center" />-->
        <el-table-column
          show-overflow-tooltip
          prop="server_filename"
          label="文件名"
          min-width="40%"
        >
          <template #default="scope">
            <div
              @click="parseList(scope.row)"
              style="height:75px!important;"
            >
              <MySvg v-if="!scope.row.thumbs" :iconName="getIconClass(scope.row)"></MySvg>
              <el-image
                  style="width:110px;height: 50px;"
                  v-if="scope.row.thumbs"
                  :src="scope.row.thumbs.url3"
                  fit="cover"
                  :preview-src-list="[scope.row.thumbs.url3]"
                  hide-on-click-modal
                  preview-teleported
              >
              </el-image>
              <div style="font-size: 16px;font-weight: bold;overflow:hidden;text-overflow: ellipsis;">{{
                scope.row.server_filename
              }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!hasDirData"
          prop="server_mtime"
          :formatter="timestampToTime"
          min-width="20%"
          label="修改时间"
        />
<!--        <el-table-column prop="updated_at" label="修改时间">-->
<!--          <template #default="{row}">-->
<!--            {{ timestampToTime(row.server_mtime) }}-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column v-if="hasDirData" min-width="20%" prop="size" :formatter="getFilesize" label="大小" />
        <!--        <el-table-column label="剩余下载次数"-->
        <!--          >{{-->
        <!--            parseInt(loadData.codeNum) > 5 ? '无限' : loadData.codeNum-->
        <!--          }}-->
        <!--          次</el-table-column-->
        <!--        >-->
        <el-table-column v-if="hasDirData" min-width="35%" label="操作">
          <template #default="scope">
            <el-button
              @click="vipDownLoad(scope.row)"
              v-if="!parseInt(scope.row.isdir)"
              :type="'warning'"
              style="margin-left:12px;margin-top: 5px;"
              icon="menu"
              size="small"
              >&nbsp;VIP</el-button
            >
            <el-button
                @click="playVideo(scope.row)"
                v-if="!parseInt(scope.row.isdir)&& baiduShowPlay(scope.row)"
                :type="'success'"
                icon="videoPlay"
                size="small"
                style="margin-top:5px;"
            >播放</el-button
            >
            <el-button
              v-if="!parseInt(scope.row.isdir)"
              :type="scope.row.status == 2 ? 'danger' : 'primary'"
              @click="downLoad(scope.row)"
              :disabled="scope.row.disable"
              :loading="scope.row.loading"
              icon="download"
              size="small"
              style="margin-top:5px;"
            >
              <span v-if="scope.row.status === 0">下载</span>
              <span v-if="scope.row.status === 1">下载中</span>
              <span v-if="scope.row.status === 2">已下载</span>
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
        <a href="https://docs.qq.com/doc/DWmNnb3ZIekdnWHJi?no_promotion=1" target="_blank">
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
    <el-dialog class = "dia-code" height="300px" title="提示" v-model="loadData.WeCharVisible">
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="file-name">文件名：{{ loadData.item.server_filename }}</div>
      <el-form
          ref="codeRef"
          :model="form"
          :rules="codeRules"
      >
        <el-form-item style="width: 80%;margin: 10px auto 0;" prop="code" label="请输入验证码">
          <el-input v-model="form.code" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div class="qr-hint">微信扫一扫上方二维码获取验证码
        <el-link href="https://pan.quark.cn/s/c32f0125e825" target="_blank" type="success">PC客户端下载地址</el-link>
      </div>
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

   <!-- 视频播放弹窗 -->
    <el-dialog class = "dia-code" height="300px" title="提示" v-model="loadData.playVideo">
      <div class="file-name">原文件名：{{ loadData.item.server_filename }}</div>
      <el-form
          ref="codeRef"
          :model="form"
      >
        <el-form-item style="width: 80%;margin: 10px auto 0;" prop="code" label="播放文件名">
          <el-input v-model="form.playName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="videoAdd"
          >添加播放</el-button
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
      <img class="qr-code" :src="loadData.codeUrl" alt="" />
      <div class="file-name">文件名：{{ loadData.item.server_filename }}</div>
      <div class="qr-title">
        爱看资源VIP无需验证码,不限下载次数，支持在线播放！
      </div>
<!--      <div class="qr-title">想做网盘影视会员副业的可以联系我！</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"><a href="https://vip.gssource.com" target="_blank">点击开通VIP</a></el-button>
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
    <el-dialog :close-on-click-modal="false" class="play_dia" :style="{
    miHeight: '550px',
  }" :before-close="handleBeforeClose" :title="loadData.title" v-model="loadData.maxNum">
      <div class="loading-content" v-loading="loadData.loading" element-loading-text="视频加载中...">
        <div class="video_player" id="video-player"></div>
        <!--        <iframe-->
<!--            ref="iframeRef"-->
<!--            allowfullscreen-->
<!--            webkitallowfullscreen-->
<!--            mozallowfullscreen-->
<!--            frameborder="0"-->
<!--            :src="loadData.videoUrl">-->
<!--        </iframe>-->
      </div>
      <el-button  type="danger" size="small" icon="Warning" style="margin-top: 5px;">{{loadData.diaHit}}</el-button>
<!--      <el-button type="danger" style="position: relative;left:3px;bottom: 40px;">此资源只能在播放器内播放,请点击下方按钮播放</el-button>-->
      <div class="mobile_player" :close-on-click-modal ="false" >
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
           <br />
          <el-link href="https://pan.quark.cn/s/c32f0125e825" target="_blank" type="success">PC客户端下载地址</el-link>
        </span>

      </div>
    </el-dialog>
    <!--    <div class="we-chart">-->
    <!--      <img :src="wechar" alt="" />-->
    <!--      <p class="con">有问题联系管理员</p>-->
    <!--    </div>-->
  </div>
</template>

<script setup name="Index">
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import { ElMessage } from 'element-plus';
import MySvg from '@/components/icon/Svg.vue';
const userStore = useUserStore();
import Hls from 'hls.js';
import {
  generateRandomLetters,
  getFilesize,
  getIconClass,
  timestampToTime,
  userKey,
  formatToYMD, showPlay, baiduShowPlay
} from '@/utils/wp';
import { setDownLoadRecord, shareUrl } from '@/api/system/vip';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { onMounted,computed } from 'vue';
import iron from '@/assets/images/钢铁侠.png';
import front from '@/assets/images/前端.png';
import duli from '@/assets/images/独立开发者.png';
import duli2 from '@/assets/images/独立2.png';
import yao from '@/assets/images/yaoyao.png';
const qrCodeList = ref([front,duli,yao,duli2,iron]);
const qrCode = ref('');
import xiaochengxu from '@/assets/images/xiaochengxu.jpg';
import { getToken } from '@/utils/auth';
import { decrypt } from '@/utils/jsencrypt';
import logo from "@/assets/img/deep.jpg";
import infuse from "@/assets/logo/infuse.png";
import mobilePlayer from "@/assets/logo/mxplayer.png";
import vlc from "@/assets/logo/vlc.png";
import pot from "@/assets/logo/potplayer.png";
import Artplayer from "artplayer"
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const codeRef = ref();
const form = reactive({
  code: '',
  playName:'',
});
const isSending = ref(false);
const multiple = ref(true);
const fsIds = ref([]);
const selectItem = ref([]);
const pathList = ref([]);
const downOrPlay = ref(true);//true 播放，false 下载
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
  fileSize: 100698669056 ,
  routeData: [],
  rootBackTitle: '返回',
  vipDown: false,
  item: null,
  url: '',
  codeUrl: qrCode,
  ckId: null,
  maxNum:false,
  infuseUrl:"javascript:void(0)",
  maxUrl:"javascript:void(0)",
  vlcUrl:'javascript:void(0)',
  // potUrl:'javascript:void(0)',
  player:null,
  hlsPlayer:null,
  diaHit:"视频卡顿或者无法播放,建议使用下面播放器内观看"
});
// 路由离开时的操作
onBeforeRouteLeave((to, from) => {
  proxy.$tab.closeOpenPage();
});

const hasDirData = computed(() => {
  return loadData.tableData &&
      loadData.tableData.some(item => !item.dir);
});
onMounted(() => {
  // const randomItem = qrCodeList.value[Math.floor(Math.random() * qrCodeList.value.length)];
  qrCode.value = xiaochengxu;
})
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

function openUrl(url){
  // window.location.href = url;
  const a = document.createElement('a');
  a.href = url;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
  const result = await testDownLoad();
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
        fsId: loadData.item.fs_id,
        version: '1.0.9',
      };
      if(!downOrPlay.value){
        const result = await testDownLoad();
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
                  }, 2000);
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
      userStore
        .getCodeNum(params)
        .then((res) => {
          if (res.code === 200) {
            if (res.data.data == 100) {
              confirm(loadData.item);
            }  else if (res.data.data == 60) {
              setTimeout(() => {
                isSending.value = false;
                ElMessage.error('今日下载次数已达上限，请明天再来！');
              }, 1000);
            } else if (res.data.data == 50) {
              setTimeout(() => {
                isSending.value = false;
                ElMessage.error(
                  '验证码错误,一个验证码只能下载一个文件,请重新获取!'
                );
              }, 1000);
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
            if (res.data.error_code === 31066) {
              item.status = 0;
              ElMessage.error('文件名含有特殊字符，请修改一下文件名重新下载！');
              return;
            }
            if(res.data.vip){
              loadData.url = res.data.data.dlink;
              loadData.ua = res.data.data.ua;
            }else{
              loadData.url = res.data.data.urls[0].url;
              loadData.ua = res.data.data.ua;
            }
            sendToMotrix(item);
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
  //发送到下载器



  // 调用API创建任务

  fetch('http://127.0.0.1:6066/api/v1/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({req:
          {
            url:loadData.url,
            extra:{
              header:{
                "User-Agent":loadData.ua,
              }
            }
          },
          opt:{
            extra:{
              connections:256,
            }
          }
    }),
  }).then((resp) => resp.json())
      .then((res) => {
        item.status = 2;
        ElMessage({
          message: `${item.server_filename}开始下载！`,
          type: 'success',
        });
      }).catch(e=>{
      })
  //
  //
  // let splitMax = true;
  // if (!loadData.url.includes('qdall01')) {
  //   splitMax = false;
  // }
  //
  // const o = {
  //   id: 'wp',
  //   method: 'aria2.addUri',
  //   params: [
  //     [loadData.url + '&origin=dlna'],
  //     {
  //       //'user-agent': 'netdisk;P2SP;3.0.10.22;netdisk;7.44.0.4;PC;PC-Windows;10.0.22631;BaiduYunGuanJia',
  //       'user-agent': loadData.ua,
  //       split: splitMax ? '100' : '2',
  //     },
  //   ],
  // };
  //
  // fetch('http://localhost:16800/jsonrpc', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(o),
  // })
  //   .then((resp) => resp.json())
  //   .then((res) => {
  //     item.status = 2;
  //     ElMessage({
  //       message: `${item.server_filename}开始下载！`,
  //       type: 'success',
  //     });
  //   });
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
  // setInterval(()=>{
  //   fetch("http://127.0.0.1:6066/api/v1/tasks?status=running")
  //       .then((resp) => resp.json()).then((res)=>{
  //     if(res.code === 0){
  //       const result = res.data.filter(e=>
  //           e.status === "running"
  //       ).filter((e)=>e.progress.speed < 1048576).map(e=>e.id);
  //       const ids = result.map((e)=>{
  //         return `id=${e}`
  //       }).join('&')
  //       if(ids && ids.length){
  //         fetch( `http://127.0.0.1:6066/api/v1/tasks/pause?${ids}`,{method:"put"})
  //             .then((resp) => resp.json()).then((res)=>{
  //           fetch( `http://127.0.0.1:6066/api/v1/tasks/continue?${ids}`,{method:"put"})
  //               .then((resp) => resp.json()).then((res)=>{
  //           })
  //         })
  //       }
  //     }
  //   })
  // },15000)
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

// function getUserByUserKey(){
//   userStore.getUserInfo({userKey:userKey}).then((res)=>{
//     if(res.code === 200){
//       loadData.codeUrl = res.data.codeUrl;
//     }
//   })
// }

async function testDownLoad() {
  return fetch('http://127.0.0.1:6066/api/v1/tasks', {
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

function playVideo(item){
  // console.log(item);
  // loadData.item = item;
  // form.playName = localStorage.getItem("searchName") + item.server_filename;
  // loadData.playVideo = true;

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
function handleBeforeClose(){
  isSending.value = false;
  loadData.videoUrl = "";
  loadData.maxNum = false;
  loadData.loading = false;
  loadData.infuseUrl = "javascript:void(0)";
  loadData.maxUrl = "javascript:void(0)";
  loadData.vlcUrl = "javascript:void(0)";
  // loadData.potUrl = "javascript:void(0)";
  if (loadData.player && loadData.player.video) loadData.player.video.src = "";
  loadData.player?.destroy();
}

async function confirmVideo(item) {
  const{fid,server_filename,duration,size} = item;
  loadData.title = server_filename;
  loadData.WeCharVisible = false;
  loadData.maxNum = true;
  loadData.loading = true;
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
        if (res.code === 200) {
          if(!res.data.fileName){
            ElMessage.error("视频播放失败,请更换资源或者下载后观看");
            loadData.loading = false;
            loadData.maxNum = false;
            return;
          }
          let path = "http://154.201.66.44:5244/d/videob/"+encodeURI("我的资源/" + res.data.fileName);
          const signUrl = path;
          loadData.infuseUrl = "infuse://x-callback-url/play?url="+signUrl;
          loadData.maxUrl = "intent:"+signUrl+"#Intent;package=com.mxtech.videoplayer.ad;S.title="+res.data.fileName+";end";
          loadData.vlcUrl = "vlc://"+signUrl;
          // loadData.potUrl = "potplayer://"+signUrl;
          const isPC = !/Android|iPhone|iPad|iPod|WAP|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if(isPC){
            userStore.getPlayUrl({"signUrl":signUrl}).then((result)=>{
              if(result.code === 200){
                loadData.loading = false;
                loadData.videoUrl = result.data;
                loadData.loading = false;
                const option = {
                  id: "/baidu/我的资源/"+res.data.fileName,
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
                  // pip: true,
                  mutex: true,
                  // fullscreen: true,
                  fullscreenWeb: true,
                  subtitleOffset: true,
                  miniProgressBar: false,
                  type: ext(res.data.fileName).toLowerCase().replace('.', ''),
                  playsInline: true,
                  theme: "#1890ff",
                  quality: [],
                  whitelist: [],
                  settings: [],
                  moreVideoAttr: {
                    "webkit-playsinline": true,
                    playsInline: true,
                    crossOrigin: "anonymous",
                  },
                  customType: {
                    // 如果返回的视频是 HLS (m3u8) 格式，需要这个配置
                    m3u8: function (video, url) {
                      if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                      }
                    },
                  },
                  lang: "zh-cn",
                  lock: true,
                  fastForward: true,
                  autoPlayback: true,
                  autoOrientation: true,
                  airplay: true
                }

                const player = new Artplayer(option);
                loadData.player = player;
                player.on('fullscreenWeb', (state) => {
                  // 关键点：使用 art.template.container 获取底层的 DOM 元素
                  const playerNode = player.template.$player;
                  if (state) {
                    // 进入网页全屏
                    if (playerNode instanceof Node) {
                      document.body.appendChild(playerNode);
                      playerNode.style.zIndex = '3000';
                    }
                  } else {
                    // 退出网页全屏：将播放器归还到 dialog 中的容器
                    if (playerNode instanceof Node && artRef.value) {
                      artRef.value.appendChild(playerNode);
                    }
                  }
                });
                loadData.player.on("ready", () => {
                  loadData.player.video.src = res.data.url;
                })
                loadData.player.on("video:ended", () => {

                })
                loadData.player.on("error", () => {
                  if (player.video.crossOrigin) {
                    console.log(
                        "Error detected. Trying to remove Cross-Origin attribute. Screenshot may not be available.",
                    )
                    player.video.crossOrigin = null;
                  }
                })
              }
            })
          }else{
            loadData.diaHit = "此资源只能在播放器内播放,请点击下方按钮播放";
            loadData.loading = false;
          }


        }
      })
      .catch(() => {
        loadData.loading = false;
        loadData.maxNum = false;
      });
}


function vipDownClick() {
  ElMessage.error('请扫码联系管理员开通权限！');
}
function ext(path){
  return path.split(".").pop() ?? ""

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
      userKey:"main",
      fsId: fsIds.value[i],
      fs_ids: [fsIds.value[i]],
      path: pathList.value[i],
      size:selectItem.value[i].size,
      pwd: loadData.query.pwd,
      surl: loadData.query.shorturl,
      url: `https://pan.baidu.com/s/${loadData.query.shorturl}`,
      dir: loadData.parseLinkParams.dir,
    };
    userStore
        .parseLink(params)
        .then((res) => {
          if (res.code === 200) {
            if(i+1 === selectItem.value.length){
              loadData.tableLoading = false;
            }
            loadData.tableData.forEach((e) => {
              if (fsIds.value.includes(e.fs_id)) {
                e.status = 2;
                e.disable = true;
              }
            });
            if(res.data.vip){
              loadData.url = res.data.data.dlink;
              loadData.ua = res.data.data.ua;
            }else{
              loadData.url = res.data.data.urls[0].url;
              loadData.ua = res.data.data.ua;
            }
            fetch('http://127.0.0.1:6066/api/v1/tasks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                    req:
                        {
                          url:loadData.url,
                          extra:{
                            header:{
                              "User-Agent":loadData.ua,
                            }
                          }
                        },
                    opt:{
                      extra:{
                        connections:256,
                      }
                    }
                  },
              ),
            }).then((resp) => resp.json())
                .then((res) => {
                  ElMessage({
                    message: `${selectItem.value[i].server_filename}开始下载！`,
                    type: 'success',
                  });
                }).catch(e=>{
            })
          }
        }).catch((res)=>{
          if(i+1 === selectItem.value.length){
            loadData.tableLoading = false;
          }
        })
  }

}
</script>

<style scoped lang="scss">
@media only screen and (max-width: 767px) {
  :deep(.dia-code) {
    width: 80%;
  }
  :deep(.el-dialog){
    width: 96%!important;
  }
  :deep(.el-dialog__body){
    padding:0;
    padding-bottom: 20px;
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
      margin-left:5px;
      width: 40px;
      height: 40px;
    }
    span{
      margin-left:5px;
    }
  }
}
@media only screen and (min-width: 767px) {
  /* 使用深度选择器修改局部 loading 样式 */
  .loading-content :deep(.el-loading-mask) {
    height: 400px;
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
.app1 {
  width: 100%;
  //height: calc(100vh - 100px);
  margin: auto;
  font-size: 18px;
  overflow: auto;
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
  header {
    width: 100%;
    height: 40px;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid #ccc;
    display: flex;
    margin-top:25px;
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
  .wp-table{
    min-height: 200px;
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
    width: 180px;
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
