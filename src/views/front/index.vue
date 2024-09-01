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

    <div id="content">
      <el-table
          v-loading="loadData.tableLoading"
          element-loading-text="数据正在加载中..."
          :data="loadData.tableData"
          height="calc(100vh - 200px)"
          style="width: 100%; cursor: pointer; font-size: 14px; font-weight: 600"
          class="wp-table"
      >
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
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
                v-if="parseInt(scope.row.isdir) === 0"
                :type="'primary'"
                @click="downLoad(scope.row)"
            >
              下 载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--    <div class="we-chart">-->
    <!--      <img :src="wechar" alt="">-->
    <!--      <p class="con">扫码学习课程</p>-->
    <!--    </div>-->
    <!-- 添加微信弹窗 -->
    <el-dialog
        title="提示"
        v-model="loadData.addWeCharVisible"
    >
      <img class="qr-code" :src="qrCode" alt="" />
      <!--      <el-form ref="codeRef" :model="form"  label-width="auto" :rules="codeRules" style="max-width: 600px;margin: 20px auto 0px">-->
      <!--        <el-form-item prop="code" label="请输入验证码">-->
      <!--          <el-input v-model="form.code" auto-complete="off" />-->
      <!--        </el-form-item>-->
      <!--      </el-form>-->
      <div class="qr-hint">扫码联系管理员获取课程</div>
      <!--      <div class="qr-title">{{loadData.downLoadUrl}}</div>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="onSubmit"
          >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import useUserStore from '@/store/modules/user';
import img from '@/assets/images/文件夹.png';
import { ElMessage } from 'element-plus';
import MySvg from '@/components/icon/Svg.vue';
const userStore = useUserStore();
import {generateRandomLetters, getFilesize, getIconClass, timestampToTime} from '@/utils/wp';
const { proxy } = getCurrentInstance();
const { sys_course_type } = proxy.useDict('sys_course_type');
import qrCode from '@/assets/images/qrcode.jpg';
import { shareUrl } from '@/api/system/vip';
const route = useRoute();
const router = useRouter();
const loadData = reactive({
  bread: '',
  tableData: [],
  query: {
    shorturl: '',
    pwd: '',
    dir: '1',
    root: '1',
  },
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
  // fileName: '',
  realLink: '',
  addWeCharVisible: false,
  tableLoading: false,
  fileSize: 3247483648,
  routeData: [],
  rootBackTitle: '全部文件',
  itemData:{},
  downLoadUrl:""
});
const codeRef = ref();

const form = reactive({
  code: '',
})

const codeRules = {
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }],
};

const onSubmit = () => {
  loadData.addWeCharVisible = false;
  // proxy.$refs.codeRef.validate(async (valid) => {
  //   if (valid) {
  //     const params = {
  //       code:form.code
  //     }
  //     userStore
  //         .getCodeNum(params)
  //         .then((res) => {
  //           if(res.code === 200 && res.data === "1"){
  //
  //             const data = {
  //               fileId: loadData.itemData.fs_id,
  //               pwd:generateRandomLetters(4)
  //             };
  //             shareUrl(data).then((res) => {
  //               if(res.code ===200){
  //                 loadData.downLoadUrl = `${res.data.shorturl}?pwd=${data.pwd}`
  //               }
  //
  //             });
  //           }else{
  //             ElMessage.error("您输入的验证码不正确，请重新获取！！")
  //           }
  //         })
  //   }
  // })
}

function getList() {
  // const userCode = Cookies.get('code');
  const data = Object.assign(
      { index: loadData.parseLinkParams.index },
      loadData.query
  );
  parseCopyLink(data);
}

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
    loadData.rootBackTitle = '全部文件';
  } else {
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
            list.forEach((item) => {
              // 0 下载，1，下载中
              item.status = 0;
              if (parseInt(item.size) > loadData.fileSize) {
                item.disable = true;
              }
            });
            loadData.tableData = list;
            loadData.parseLinkParams.randsk = data.data.data.seckey;
            loadData.parseLinkParams.shareid = data.data.data.shareid;
            loadData.parseLinkParams.uk = data.data.data.uk;
          } else {
            return;
          }
        }
      })
      .catch(() => {
        // loadData.errorDia = true;
      });
}

async function getSign(params) {
  const { shorturl, shareId, uk } = params;
  const param = {
    shorturl: shorturl,
    shareId: shareId,
    uk: uk,
  };
  await userStore
      .getSignData(param)
      .then((response) => {
        if (response.code === 200) {
          if (parseInt(response.data.result.errno) === 0) {
            if (shorturl) {
              loadData.parseLinkParams.index = response.data.index;
            }
            loadData.parseLinkParams.timestamp =
                response.data.result.data.timestamp;
            loadData.parseLinkParams.sign = response.data.result.data.sign;
            return response;
          }
        }
      })
      .catch(() => {
        loadData.tableLoading = false;
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
  loadData.tableLoading = true;
  userStore.getCourse(0).then((res) => {
    if (res.code === 200) {
      loadData.query.shorturl = res.data.url;
      loadData.query.pwd = res.data.pwd;
      const params = {
        shorturl: res.data.url,
      };
      // getSign(params).then(() => {
      //
      // });
      getList();
    }
  });
}
init();
function downLoad(item) {
  loadData.addWeCharVisible = true;
  // loadData.itemData = item;
  // loadData.downLoadUrl = "";
  // proxy.$refs.codeRef.resetFields();
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
      //width: 80px;
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
    font-size: 20px;
    font-weight: bold;
    color: #923333;
  }
  .qr-code {
    width: 170px;
    height: 180px;
    margin: auto;
    display: block;
  }
  .qr-hint {
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    //color: #e94242;
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
