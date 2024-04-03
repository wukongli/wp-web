<template>
  <div class="app-container home">
    <header @click="refresh()">
      <div v-for="(item, index) in loadData.bread" :key="index">
        <span>{{ item.replace('/', '') }}</span>
      </div>
    </header>

    <div id="content">
      <el-table
          v-loading="loadData.tableLoading"
          element-loading-text="数据正在加载中..."
        :data="loadData.tableData"
        height="calc(100vh - 200px)"
        style="width: 100%; cursor: pointer"
      >
        <el-table-column prop="server_filename" label="文件名">
          <template #default="scope">
            <div @click="parseList(scope.row)" style="display: flex; align-items: center">
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
        <el-table-column label="剩余下载次数" >{{loadData.codeNum}} 次</el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
                v-if="!scope.row.isdir"
                :type="scope.row.status == 2 ? 'danger' : 'primary'"
                @click="downLoad(scope.row)"
                :disabled="scope.row.disable"
                :loading="scope.row.loading"
            >
              <span v-if="scope.row.status ===0">下 载</span>
              <span v-if="scope.row.status ===1">下载中</span>
              <span v-if="scope.row.status ===2">已下载</span>
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <!-- 提示安装下载器弹窗 -->
    <el-dialog title="提示" v-model="loadData.dialogVisible" width="40%">
      <div class="down-title">如果您还未安装下载器，请先安装并打开！</div>
      <div class="down-title">如果您已安装下载器，请打开下载器！</div>
      <div class=" down-address" ><span>下载地址：</span >
        <a href="https://wwf.lanzouq.com/b05f548wf密码:hb1i" target="_blank">
          https://wwf.lanzouq.com/b05f548wf
        密码:hb1i</a></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"  @click="loadData.dialogVisible = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 添加微信弹窗 -->
    <el-dialog title="提示" v-model="loadData.addWeCharVisible" width="30%">
      <div class="qr-title">下载次数已用完，请重新获取验证码!</div>
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="qr-hint">体验无限下载次数，扫一扫开通权限！</div>
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
import Cookies from 'js-cookie';
import qrCode from "@/assets/images/qrcode.jpg";
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const loadData = reactive({
  bread: ['< 返回'],
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
  codeNum:"",
  tableLoading:false,
  canDownLoad:false,
  buttonType:'下 载'
});

function getList(){
  if (
      !loadData.query.shorturl ||
      !loadData.query.pwd ||
      !loadData.query.dir ||
      !loadData.query.root
  ) {
    router.push({ path: '/login' });
    return;
  }
  loadData.tableLoading = true;
  userStore
      .parseCopyLink(route.query)
      .then((data) => {
        loadData.tableLoading = false;
        if (data.code === 200) {
          if (data.data.errno === 0) {
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
}


function parseList(item) {
  const { isdir, path } = item;
  if ( parseInt(isdir) === 1) {
    loadData.tableLoading = true;
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
        loadData.tableLoading = false;
        if (data.code === 200) {
          if (data.data.errno === 0) {
           const list =  data.data.data.list;
            list.forEach((item)=>{
              // 0 下载，1，下载中
              item.status = 0;
            })
            loadData.tableData = list;
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
  }
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downLoad(item){
  //检查是否安装下载器

  const result = await testDownLoad();
  if(!result){
    loadData.dialogVisible = true;
    return;
  }
  item.loading = true;
  item.status = 1;
  item.disable = true;
  const code = Cookies.get('code');
  if (code == null || code === '') {
    router.push({ path: '/login' });
    return;
  }
  loadData.parseLinkParams.code = code;
  loadData.parseLinkParams.fs_id = item.fs_id;
  loadData.fileName = item.server_filename;

  //真正开始下载
  confirm(item);
}
function getDownNum(){
  const code = Cookies.get('code');
  if (code == null || code === '') {
    router.push({ path: '/login' });
    return;
  }
  //获取下载次数
  userStore.getCodeNum({code:code}).then((res) => {
    if (res.code === 200) {
      loadData.codeNum = res.data;
    }
  })
}
async function getSign() {
  const param = {
    shorturl: loadData.query.shorturl,
  };
  await userStore
    .getSign(param).then((data) => {
        if (data.code === 200) {
          if (parseInt(data.data.errno) === 0) {
            loadData.parseLinkParams.timestamp = data.data.data.timestamp;
            loadData.parseLinkParams.sign = data.data.data.sign;
            console.log(data);
          }
        }
      })
      .catch(() => {});
}

async function confirm(item) {

  //重新获取时间戳
  const date = (new Date().getTime() / 1000);
  if(date - loadData.parseLinkParams.timestamp > 300){
     await getSign();
  }
  // 获取真实下载地址
  userStore
      .parseLink(loadData.parseLinkParams)
      .then((data) => {
        if (data.code === 200) {
          if (data.data.errno === '0') {
            if (data.data.codeUseNum === '0') {
              //下载次数为0，弹窗，请重新获取验证码
              //删除验证码
              Cookies.remove('code');
              loadData.addWeCharVisible = true;
              return;
            }
            if (data.data.realLink == null) {
              //真实链接为null 限速了
              loadData.limitSpeedVisible = true;
              return;
            }
            loadData.codeNum = parseInt(data.data.codeUseNum) - 1 ;
            loadData.realLink = data.data.realLink;

            //发送到下载器
            let options = {
              'max-connection-per-server': '16',
              'user-agent': 'LogStatistic',
              'opt':loadData.filename
            };

            let json = {
              id: 'wp',
              jsonrpc: '2.0',
              method: 'aria2.addUri',
              params: [[loadData.realLink], options],
            };

            json.params.unshift('token:undefined'); // 坑死了，必须要加在第一个
            const  ws = new WebSocket('ws://localhost:16800/jsonrpc');
            ws.onerror = (event) => {
              item.loading = false;
              item.disable = false;
              ElMessage.error('链接失败，请检查是否安装Motrix');
            };
            ws.onopen = () => {
              ws.send(JSON.stringify(json));
            };

            ws.onmessage = (event) => {
              console.log(event);
              let received_msg = JSON.parse(event.data);
              if (received_msg.error !== undefined) {
                if (received_msg.error.code === 1) {
                  item.loading = false;
                  item.disable = false;
                  ElMessage.error('链接失败，请检查是否安装Motrix');
                  return;
                };
              }

              switch (received_msg.method) {
                case 'aria2.onDownloadStart':
                  ElMessage({
                    message: `${item.server_filename}开始下载！`,
                    type: 'warning',
                  })
                  item.status = 1;
                  break;

                case 'aria2.onDownloadError':
                  item.loading = false;
                  item.disable = false;
                  ElMessage.error('下载失败，请检查是否安装Motrix');
                  break;

                case 'aria2.onDownloadComplete':
                  ElMessage({
                    message: `${item.server_filename}下载完成！`,
                    type: 'success',
                  })
                  ws.close();
                  item.loading = false;
                  item.status = 2;
                  break;
                default:
                  break;
              }
            };

          } else {
            loadData.limitSpeedVisible = true;
          }
        }
      })
      .catch(() => {
        item.status = 0;
        item.disable = false;
        item.loading = false;
      });
}
function refresh() {
  location.reload();
}
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
getSign();
getList();
getDownNum();

function testDownLoad(){
  return new Promise(resolve =>{
    let ws = new WebSocket('ws://localhost:16800/jsonrpc');
    ws.onopen = (event) => {
      if(event.type === 'open'){
        ws.close();
        resolve(true);
      }
    };
    ws.onerror = (event) => {
      if(event.type === 'error'){
        ws.close();
        resolve(false);
      }
    };
  });



}


function getIconClass(filename) {
  const filetype = {
    file_video: ["wmv", "rmvb", "mpeg4", "mpeg2", "flv", "avi", "3gp", "mpga", "qt", "rm", "wmz", "wmd", "wvx", "wmx", "wm", "mpg", "mp4", "mkv", "mpeg", "mov", "asf", "m4v", "m3u8", "swf"],
    file_audio: ["wma", "wav", "mp3", "aac", "ra", "ram", "mp2", "ogg", "aif", "mpega", "amr", "mid", "midi", "m4a", "flac"],
    file_image: ["jpg", "jpeg", "gif", "bmp", "png", "jpe", "cur", "svg", "svgz", "ico", "webp", "tif", "tiff"],
    file_archive: ["rar", "zip", "7z", "iso"],
    windows: ["exe"],
    apple: ["ipa"],
    android: ["apk"],
    file_alt: ["txt", "rtf"],
    file_excel: ["xls", "xlsx", "xlsm", "xlsb", "csv", "xltx", "xlt", "xltm", "xlam"],
    file_word: ["doc", "docx", "docm", "dotx"],
    file_powerpoint: ["ppt", "pptx", "potx", "pot", "potm", "ppsx", "pps", "ppam", "ppa"],
    file_pdf: ["pdf"],
  };
  let point = filename.lastIndexOf(".");
  let t = filename.substring(point + 1);
  if (t === "") return "";
  t = t.toLowerCase();
  for (let icon in filetype) for (let type in filetype[icon]) if (t === filetype[icon][type]) return "fa-" + icon.replace('_', '-');
  return "";
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

  }
  .qr-title{
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  .qr-code {
    width: 180px;
    height: 180px;
    margin: 20px auto 0;
    display: block;
  }
  .qr-hint {
    margin-top: 10px;
    text-align: center;
    font-size: 20px;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  .down-title{
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  .down-address{
    display: block;
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
