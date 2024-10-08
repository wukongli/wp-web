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
    <!-- <el-button
      style="margin: 10px 0"
      type="primary"
      plain
      icon="UploadFilled"
      :disabled="multiple"
      @click="handleParse"
      >批量解析</el-button
    > -->
    <div id="content">
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
          prop="server_filename"
          label="文件名"
        >
          <template #default="scope">
            <div
              @click="parseList(scope.row)"
              style="display: flex; align-items: center"
            >
              <MySvg :iconName="getIconClass(scope.row)" size="40"></MySvg>
              <span style="margin-left: 10px">{{
                scope.row.server_filename
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="server_mtime"
          :formatter="timestampToTime"
          label="修改时间"
        />
        <el-table-column prop="size" :formatter="getFilesize" label="大小" />
        <!--        <el-table-column label="剩余下载次数"-->
        <!--          >{{-->
        <!--            parseInt(loadData.codeNum) > 5 ? '无限' : loadData.codeNum-->
        <!--          }}-->
        <!--          次</el-table-column-->
        <!--        >-->
        <el-table-column min-width="100px" label="操作">
          <template #default="scope">
            <el-button
              @click="vipDownLoad(scope.row)"
              v-if="!parseInt(scope.row.isdir) && !getToken()"
              :type="'primary'"
              >快速下载</el-button
            >
            <el-button
              v-if="!parseInt(scope.row.isdir)"
              :type="scope.row.status == 2 ? 'danger' : 'primary'"
              @click="downLoad(scope.row)"
              :disabled="scope.row.disable"
              :loading="scope.row.loading"
            >
              <span v-if="scope.row.status === 0">下 载</span>
              <span v-if="scope.row.status === 1">下载中</span>
              <span v-if="scope.row.status === 2">已下载</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 提示安装下载器弹窗 -->
    <el-dialog title="提示" v-model="loadData.dialogVisible" width="40%">
      <div class="down-title">
        系统检测到你没有安装Motrix,请安装下载器并运行！！
      </div>
      <div class="down-address">
        <span>下载地址：</span>
        <a href="https://pan.quark.cn/s/b878b162bb5b" target="_blank">
          https://pan.quark.cn/s/b878b162bb5b</a
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
    <el-dialog title="提示" v-model="loadData.WeCharVisible">
      <img class="qr-code" :src="loadData.codeUrl" alt="" />
      <div class="file-name">文件名：{{ loadData.item.server_filename }}</div>
      <el-form
        ref="codeRef"
        :model="form"
        label-width="auto"
        :rules="codeRules"
        style="max-width: 600px; margin: 20px auto 0px"
      >
        <el-form-item prop="code" label="请输入验证码">
          <el-input v-model="form.code" auto-complete="off" />
        </el-form-item> </el-form
      >；
      <div class="qr-hint">扫一扫上方二维码获取验证码</div>
      <!--      <div class="qr-title">只为帮助真正有需求的朋友，随缘每天解析5-10次</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="isSending" @click="onSubmit"
            >解 析</el-button
          >
          <!--          <el-button v-else type="danger"-->
          <!--                     @click="trySend"-->
          <!--          >重 试</el-button>-->
        </span>
      </template>
    </el-dialog>
    <!-- 无限制下载 -->
    <el-dialog title="提示" v-model="loadData.noLimit" width="40%">
      <div class="qr-title">{{ loadData.item.server_filename }}</div>
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
      <img class="qr-code" :src="loadData.codeUrl" alt="" />
      <div class="file-name">文件名：{{ loadData.item.server_filename }}</div>
      <div class="qr-title">
        快速下载无需验证码，不限文件大小，不限下载次数，支持批量下载！
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="vipDownClick">解 析</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 解析出错弹窗 -->
    <el-dialog title="提示" v-model="loadData.errorDia" width="40%">
      <img class="qr-code" :src="wechar" alt="" />
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
    <el-dialog title="提示" v-model="loadData.maxNum" width="40%">
      <!--      <img class="qr-code" :src="wechar" alt="" />-->
      <div class="qr-hint">今天下载次数已达20次，请休息一下明天再来下载吧!</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="loadData.maxNum = false"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!--    <div class="we-chart">-->
    <!--      <img :src="wechar" alt="" />-->
    <!--      <p class="con">有问题联系管理员</p>-->
    <!--    </div>-->
  </div>
</template>

<script setup name="Index">
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import wechar from '@/assets/images/wechar.png';
import MySvg from '@/components/icon/Svg.vue';
const userStore = useUserStore();
import {
  generateRandomLetters,
  getFilesize,
  getIconClass,
  timestampToTime,
  userKey,
} from '@/utils/wp';
import { setDownLoadRecord, shareUrl } from '@/api/system/vip';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import qrCode from '@/assets/images/WX20240914-235652@2x.png';
import xiaochengxu from '@/assets/images/xiaochengxu.jpg';
import { getToken } from '@/utils/auth';
import { decrypt } from '@/utils/jsencrypt';
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const codeRef = ref();
const form = reactive({
  code: '',
});
const fsIds = ref([]);
const multiple = ref(true);
const isSending = ref(false);
// const showParse = ref(true);
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
  noLimit: false,
  errorDia: false,
  // codeNum: '',
  tableLoading: false,
  fileSize: getToken() ? 100698669056 : 5242880000,
  routeData: [],
  rootBackTitle: '全部文件',
  vipDown: false,
  item: null,
  url: '',
  codeUrl: qrCode,
  ckId: null,
});
// 路由离开时的操作
onBeforeRouteLeave((to, from) => {
  proxy.$tab.closeOpenPage();
});
function getList() {
  // const userCode = Cookies.get('code');
  const data = Object.assign({ index: 0 }, route.query);
  parseCopyLink(data);
}
const codeRules = {
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }],
};
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
            if (parseInt(item.size) > loadData.fileSize) {
              item.disable = true;
            }
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
      const result = await testDownLoad();
      if (!result) {
        loadData.dialogVisible = true;
        // userStore.delCodeNum(params);
        isSending.value = false;
        return;
      }
      userStore
        .getCodeNum(params)
        .then((res) => {
          if (res.code === 200) {
            if (res.data == 100) {
              confirm(loadData.item);
            } else if (res.data == 80) {
              setTimeout(() => {
                isSending.value = false;
                // loadData.WeCharVisible = false;
                ElMessage.error('解析通道比较拥堵，请重试！');
              }, 2000);
            } else if (res.data == 60) {
              setTimeout(() => {
                isSending.value = false;
                ElMessage.error('今日解析次数已达上限，请明天再来！');
              }, 2000);
            } else if (res.data == 50) {
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

// function getDownNum() {
//   //获取下载次数
//   userStore.getCodeNum({ code: Cookies.get('code') }).then((res) => {
//     if (res.code === 200) {
//       loadData.codeNum = res.data;
//     }
//   });
// }
// async function getSign(params) {
//   const { shorturl, shareId, uk } = params;
//   const param = {
//     shorturl: shorturl,
//     shareId: shareId,
//     uk: uk,
//   };
//   await userStore
//     .getSignData(param)
//     .then((response) => {
//       if (response.code === 200) {
//         if (parseInt(response.data.result.errno) === 0) {
//           if (shorturl) {
//             loadData.parseLinkParams.index = response.data.index;
//           }
//           loadData.parseLinkParams.timestamp =
//             response.data.result.data.timestamp;
//           loadData.parseLinkParams.sign = response.data.result.data.sign;
//           return response;
//         }
//       }
//     })
//     .catch(() => {
//       loadData.tableLoading = false;
//     });
// }

async function confirm(item) {
  item.loading = true;
  item.status = 1;
  item.disable = true;

  const params = {
    shareid: loadData.parseLinkParams.shareid,
    uk: loadData.parseLinkParams.uk,
    randsk: loadData.parseLinkParams.seckey,
    dir: loadData.parseLinkParams.dir,
    fs_ids: [item.fs_id],
    pwd: loadData.query.pwd,
    surl: loadData.query.shorturl,
    url: `https://pan.baidu.com/s/${loadData.query.shorturl}`,
    userKey: userKey,
    // path:item.server_filename,
    // code:form.code,
  };
  // 获取真实下载地址
  userStore
    .parseLink(params)
    .then((res) => {
      if (res.code === 200) {
        isSending.value = false;
        item.status = 0;
        item.loading = false;
        item.disable = false;
        // if(res.data.error_code === 31066){
        //   item.status = 0;
        //   ElMessage.error("文件名含有特殊字符，请修改一下文件名重新下载！");
        //   return;
        // }
        loadData.url = res.data[0].url;
        loadData.ua = res.data[0].ua;
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

function sendToMotrix(item) {
  //发送到下载器

  const o = {
    id: 'wp',
    method: 'aria2.addUri',
    params: [
      [loadData.url],
      {
        // 'user-agent': 'netdisk;7.44.0.4',
        'user-agent': loadData.ua,
      },
    ],
  };

  fetch('http://localhost:16800/jsonrpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(o),
  })
    .then((resp) => resp.json())
    .then((res) => {
      item.status = 2;
      ElMessage({
        message: `${item.server_filename}开始下载！`,
        type: 'success',
      });
    });
}

function goBack() {
  if (loadData.routeData.length === 1) {
    ElMessage.error('当前已是全部文件');
    return;
  }
  if (loadData.routeData.length > 1) {
    loadData.tableLoading = true;
    loadData.routeData.pop();
    const route = loadData.routeData.pop();
    parseCopyLink(route);
  }
}

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

// function getUserByUserKey(){
//   userStore.getUserInfo({userKey:userKey}).then((res)=>{
//     if(res.code === 200){
//       loadData.codeUrl = res.data.codeUrl;
//     }
//   })
// }

function testDownLoad() {
  return new Promise((resolve) => {
    let ws = new WebSocket('ws://localhost:16800/jsonrpc');
    ws.onopen = (event) => {
      if (event.type === 'open') {
        // console.log(event);
        ws.close();
        resolve(true);
      }
    };
    ws.onerror = (event) => {
      if (event.type === 'error') {
        // console.log(event);
        ws.close();
        resolve(false);
      }
    };
  });
}

function vipDownLoad(item) {
  loadData.item = item;
  loadData.vipDown = true;
}

function vipDownClick() {
  ElMessage.error('扫码联系管理员开通权限！');
  // ElMessage.error("请扫码点击公众号菜单【快速下载】联系管理员开通权限！")
}

function handleSelectionChange(selection) {
  if (selection.length === 1 && parseInt(selection[0].isdir) === 1) {
    return false;
  }
  fsIds.value = selection.map((item) => item.fs_id);
  multiple.value = !selection.length;
}

function handleParse() {
  const token = getToken();
  if (!token) {
    ElMessage.error('批量下载需要开通快速下载权限！');
  }
  if (fsIds.value.length > 5) {
    ElMessage.error('因网络原因，批量下载最大支持同时下载五个文件！');
    return false;
  }
  loadData.tableLoading = true;
  const params = {
    shareid: loadData.parseLinkParams.shareid,
    uk: loadData.parseLinkParams.uk,
    randsk: loadData.parseLinkParams.seckey,
    dir: loadData.parseLinkParams.dir,
    fs_ids: fsIds.value,
    pwd: loadData.query.pwd,
    surl: loadData.query.shorturl,
    url: `https://pan.baidu.com/s/${loadData.query.shorturl}`,
    userKey: userKey,
  };
  userStore
    .parseLink(params)
    .then((res) => {
      if (res.code === 200) {
        loadData.tableLoading = false;
        loadData.tableData.forEach((e) => {
          if (fsIds.value.includes(e.fs_id)) {
            e.status = 2;
            e.disable = true;
          }
        });
        res.data.forEach((item) => {
          const o = {
            id: 'wp',
            method: 'aria2.addUri',
            params: [
              [item.url],
              {
                'user-agent': item.ua,
              },
            ],
          };

          fetch('http://localhost:16800/jsonrpc', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(o),
          })
            .then((resp) => resp.json())
            .then((res) => {
              ElMessage({
                message: `${item.filename}开始下载！`,
                type: 'success',
              });
            });
        });
      }
    })
    .catch(() => {
      ElMessage.error('解析失败,请重试！');
    });
}
</script>

<style scoped lang="scss">
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
