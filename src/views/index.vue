<template>
  <div class="app-container home">
    <header @click="refresh()">
      <div v-for="(item, index) in loadData.bread" :key="index">
        <span>{{ item.replace('/', '') }} ></span>
      </div>
    </header>

    <div id="content">
      <el-table
        :data="loadData.tableData"
        height="700"
        @row-click="parseList"
        style="width: 100%; cursor: pointer"
      >
        <el-table-column prop="server_filename" label="文件名">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <img
                style="with: 50px; height: 50px"
                v-if="scope.row.isdir == '1'"
                :src="img"
                alt=""
              />
              <img
                style="with: 50px; height: 50px"
                v-if="scope.row.isdir == '0'"
                :src="img1"
                alt=""
              />
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
      </el-table>
    </div>
    <!-- 下载文件弹窗 -->
    <el-dialog title="提示" v-model="loadData.dialogVisible" width="40%">
      <span>{{ loadData.fileName }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="loadData.dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirm()">下载</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 添加微信弹窗 -->
    <el-dialog title="提示" v-model="loadData.addWeCharVisible" width="40%">
      <span>下载次数已用完，请重新获取验证码</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="goToLogin()">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 限速提示弹窗 -->
    <el-dialog title="提示" v-model="loadData.limitSpeedVisible" width="40%">
      <span>下载解析限速中，管理员正在修复，请稍后再试</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="goToLogin()">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Index">
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import img1 from '@/assets/images/压缩包.png';
import img2 from '@/assets/images/文本.png';
import { ElMessage } from 'element-plus';
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const loadData = reactive({
  bread: ['所有文件'],
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
  },
  dialogVisible: false,
  fileName: '',
  realLink: '',
  addWeCharVisible: false,
  limitSpeedVisible: false,
});

onMounted(() => {
  if (
    !loadData.query.shorturl ||
    !loadData.query.pwd ||
    !loadData.query.dir ||
    !loadData.query.root
  ) {
    router.push({ path: '/login' });
    return;
  }
  userStore
    .parseCopyLink(route.query)
    .then((data) => {
      if (data.code == 200) {
        if (data.data.errno == 0) {
          const list = data.data.data.list;
          const title = data.data.data.title;
          loadData.bread.push(title);
          loadData.tableData = list;
          loadData.parseLinkParams.randsk = data.data.data.seckey;
          loadData.parseLinkParams.shareid = data.data.data.shareid;
          loadData.parseLinkParams.uk = data.data.data.uk;
        }
      }
    })
    .catch(() => {});
});

function parseList(item) {
  const { isdir, path } = item;
  if (isdir == 1) {
    const data = {
      dir: path,
      root: '0',
      shorturl: loadData.query.shorturl,
      pwd: loadData.query.pwd,
    };
    // 获取文件列表
    userStore
      .parseCopyLink(data)
      .then((data) => {
        if (data.code == 200) {
          if (data.data.errno == 0) {
            loadData.tableData = data.data.data.list;
            loadData.parseLinkParams.randsk = data.data.data.seckey;
            loadData.parseLinkParams.shareid = data.data.data.shareid;
            loadData.parseLinkParams.uk = data.data.data.uk;
            console.log(loadData);
          } else {
            loadData.limitSpeedVisible = true;
            return;
          }
        }
      })
      .catch(() => {});
  } else {
    console.log(loadData.parseLinkParams);
    loadData.parseLinkParams.fs_id = item.fs_id;
    const code = localStorage.getItem('code');
    if (code == null || code == '') {
      router.push({ path: '/login' });
      return;
    }
    loadData.parseLinkParams.code = code;
    // 获取真实下载地址
    userStore
      .parseLink(loadData.parseLinkParams)
      .then((data) => {
        if (data.code == 200) {
          if (data.data.errno == 0) {
            if (data.data.codeUseNum == '100') {
              //删除验证码
              localStorage.removeItem('code');
              loadData.addWeCharVisible = true;
              return;
            }
            if (data.data.realLink == null) {
              loadData.limitSpeedVisible = true;
              return;
            }
            loadData.dialogVisible = true;
            loadData.fileName = data.data.list[0].server_filename;
            loadData.realLink = data.data.realLink;
          } else {
            loadData.limitSpeedVisible = true;
            return;
          }
        }
      })
      .catch(() => {});
  }
}
function getSign() {
  const param = {
    shorturl: loadData.query.shorturl,
  };
  userStore
    .getSign(param)
    .then((data) => {
      if (data.code == 200) {
        if (data.data.errno == 0) {
          loadData.parseLinkParams.timestamp = data.data.data.timestamp;
          loadData.parseLinkParams.sign = data.data.data.sign;
          console.log(data);
        }
      }
    })
    .catch(() => {});
}

function confirm() {
  loadData.dialogVisible = false;
  let options = {
    'max-connection-per-server': '16',
    'user-agent': 'LogStatistic',
  };
  console.log(loadData.fileName);
  if (loadData.filename !== '') {
    options.out = loadData.filename;
  }
  console.log(options);

  let json = {
    id: 'wp',
    jsonrpc: '2.0',
    method: 'aria2.addUri',
    params: [[loadData.realLink], options],
  };

  json.params.unshift('token:undefined'); // 坑死了，必须要加在第一个
  console.log(json);
  let ws = new WebSocket('ws://localhost:16800/jsonrpc');
  ws.onerror = (event) => {
    console.log(event);
    ElMessage.error('链接失败，请检查是否安装Motrix');
  };
  ws.onopen = () => {
    ws.send(JSON.stringify(json));
  };

  ws.onmessage = (event) => {
    console.log(event);
    let received_msg = JSON.parse(event.data);
    if (received_msg.error !== undefined) {
      if (received_msg.error.code === 1)
        ElMessage.error('链接失败，请检查是否安装Motrix');
    }

    switch (received_msg.method) {
      case 'aria2.onDownloadStart':
        ElMessage.success('下载开始，请打开Motrix查看下载进度');

        break;

      case 'aria2.onDownloadError':
        ElMessage.error('下载失败，请检查是否安装Motrix');
        break;

      case 'aria2.onDownloadComplete':
        ElMessage.success('下载完成');
        break;

      default:
        break;
    }
  };
}
function refresh() {
  location.reload();
}
getSign();
function getFilesize(row, column, size) {
  if (!size) return '';

  var num = 1024.0; //byte

  if (size < num) return size + 'B';
  if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + 'K'; //kb
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + 'M'; //M
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + 'G'; //G
  return (size / Math.pow(num, 4)).toFixed(2) + 'T'; //T
}
function timestampToTime(row, column, timestamp) {
  // 时间戳为10位需*1000，时间戳为13位不需乘1000
  var date = new Date(timestamp * 1000);
  var Y = date.getFullYear() + '-';
  var M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return Y + M + D + h + m + s;
}

function goToLogin() {
  router.push({ path: '/login' });
}
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: calc(100vh - 100px);
  margin: auto;
  font-size: 18px;
  header {
    width: 100%;
    height: 50px;
    line-height: 50px;

    font-weight: bold;
    cursor: pointer;
    border: 1px solid #ccc;
    div {
      margin-left: 10px;
      float: left;
      div:hover {
        color: #1e80ff;
      }
    }
  }
  padding-bottom: 2px;
  header:hover {
    background-color: #accbb1;
  }
  #content {
    // margin-top: 30px;
    // width: 100%;
    // height: 90%;
    // overflow: auto;
    // :hover {
    //   background-color: #accbb1;
    // }
    // .content_box {
    //   width: 100%;
    //   height: 66px;
    //   font-weight: bold;
    //   cursor: pointer;
    //   border: 1px solid #ccc;

    //   img {
    //     width: 40px;
    //     height: 40px;
    //     margin-left: 10px;
    //     margin-top: 10px;
    //     float: left;
    //   }
    //   span {
    //     margin-left: 10px;
    //     margin-top: 15px;
    //     float: left;
    //   }
    //   span:hover {
    //     color: #1e80ff;
    //   }
    // }
  }
}
</style>
