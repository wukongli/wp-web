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
                type="primary"
                @click="downLoad(scope.row)"
                :disabled="scope.row.disable"
                :loading="scope.loading"
            >{{scope.row.status === 0 ? "下载" : "已下载"}}</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <!-- 下载文件弹窗 -->
<!--    <el-dialog title="提示" v-model="loadData.dialogVisible" width="40%">-->
<!--      <div>{{ loadData.fileName }}</div>-->
<!--      <div>下载次数还剩{{loadData.codeNum}}次</div>-->
<!--      <template #footer>-->
<!--        <span class="dialog-footer">-->
<!--          <el-button @click="loadData.dialogVisible = false">取 消</el-button>-->
<!--          <el-button type="primary" :loading="loadData.buttonLoading"  @click="confirm()">下载</el-button>-->
<!--        </span>-->
<!--      </template>-->
<!--    </el-dialog>-->
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
  // dialogVisible: false,
  fileName: '',
  realLink: '',
  addWeCharVisible: false,
  limitSpeedVisible: false,
  codeNum:"",
  tableLoading:false,
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
  loadData.tableLoading = true;
  const { isdir, path } = item;
  if ( parseInt(isdir) === 1) {
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

function downLoad(item){
  item.loading = true;
  item.disable = true;
  loadData.parseLinkParams.code = localStorage.getItem('code');
  loadData.parseLinkParams.fs_id = item.fs_id;
  loadData.fileName = item.server_filename;

  //真正开始下载
  confirm(item);
}
function getDownNum(){
  const code = localStorage.getItem('code');
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

function confirm(item) {
  // 获取真实下载地址
  userStore
      .parseLink(loadData.parseLinkParams)
      .then((data) => {
        if (data.code === 200) {
          if (data.data.errno === '0') {
            if (data.data.codeUseNum === '0') {
              //下载次数为0，弹窗，请重新获取验证码
              //删除验证码
              localStorage.removeItem('code');
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
                  break;

                case 'aria2.onDownloadError':
                  ElMessage.error('下载失败，请检查是否安装Motrix');
                  break;

                case 'aria2.onDownloadComplete':
                  ElMessage({
                    message: `${item.server_filename}下载完成！`,
                    type: 'success',
                  })
                  ws.close();
                  item.loading = false;
                  item.status = 1;
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
      .catch(() => {});
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

getList();
getSign();
getDownNum();


// const link = "http://xafj-ct11.baidupcs.com/file/91b0f91ebn12c6f18f03e0f262c4b1a6?bkt=en-4d166c0718877615493400034ec3d900af7c125b1524e0685ba0100481ea704be1b95f2977571d5a&fid=2403359472-250528-1038485029030194&time=1711949196&sign=FDTAXUbGERQlBHSKfWqiu-DCb740ccc5511e5e8fedcff06b081203-NsgI7qt9n6ozVKf8EXJVnwqgp2s%3D&to=217&size=49658533&sta_dx=49658533&sta_cs=0&sta_ft=mp4&sta_ct=7&sta_mt=5&fm2=MH%2CXian%2CAnywhere%2C%2C%E6%B2%B3%E5%8D%97%2Cct&ctime=1594690721&mtime=1709278736&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=49658533&vuk=1100859470093&iv=2&vl=1&htype=&randtype=&tkbind_id=0&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-48163f4e68ab91cb4ef300953ac870d9cf1c8f2888c23f2243d8b5f2bb5ad9f78696dd8f90018cb6&expires=8h&rt=sh&r=704560051&vbdid=-&fin=9-1+%E5%85%A8%E5%B1%80%E6%A8%A1%E5%BC%8F%E6%8D%95%E8%8E%B7%EF%BC%9AString.prototype.matchAll%28%29.mp4&rtype=1&dp-logid=9041067139289593965&dp-callid=0.1&tsl=0&csl=0&fsl=-1&csign=7tnHtSnPlEiYF84GMXmoq%2FjTvEY%3D&so=1&ut=1&uter=0&serv=1&uc=3200815480&ti=5e666840c78f19733612e84fe6f744ba34e84709dcb0ffc4305a5e1275657320&hflag=30&from_type=3&adg=c_45adf9f16f3874cd83629e8e89c4de62&reqlabel=250528_f_15f41cd129b1c162120101f462001069_-1_7e19e999909e44902f90b2b2cd022ba2&fpath=%E5%89%8D%E7%AB%AF%E4%B8%8B%E8%BD%BD%E8%A7%86%E9%A2%91%2Fmksz444+-+%E4%BC%98%E5%BA%93it%E8%B5%84%E6%BA%90%E7%BD%91844+-+%E5%86%8D%E5%AD%A6JavaScript+ES%286-11%29%E5%85%A8%E7%89%88%E6%9C%AC%E8%AF%AD%E6%B3%95%E5%A4%A7%E5%85%A8&by=themis&resvsflag=1-12-0-1-1-1"
// let options = {
//   'max-connection-per-server': '16',
//   'user-agent': 'LogStatistic',
//   'out':"9-1 全局模式捕获：String.prototype.matchAll().mp4"
// };
// let json = {
//   id: 'wp',
//   jsonrpc: '2.0',
//   method: 'aria2.addUri',
//   params: [[link], options],
// };
//
// json.params.unshift('token:undefined'); // 坑死了，必须要加在第一个
// let ws1 = new WebSocket('ws://localhost:16800/jsonrpc');
// ws1.onerror = (event) => {
//   console.log(event);
//   ElMessage.error('链接失败，请检查是否安装Motrix');
// };
// ws1.onopen = () => {
//   ElMessage.error('开始建立链接');
//   ws1.send(JSON.stringify(json));
// };
//
// ws1.onmessage = (event) => {
//   console.log("触犯了message回调-==========");
//   console.log(event);
// }
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
