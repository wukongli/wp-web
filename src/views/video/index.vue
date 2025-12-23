<template>
  <div class="app-container">
        <div class="video-header">
          <input v-model="input" placeholder="请输入视频播放链接" />
          <div @click="playVideo" class="play">播放</div>
        </div>
        <div class="content">
          <div class="top">
            <el-link :icon="Link" style="font-size: 20px;margin-top:10px;" href="https://gssource.com" target="_blank" type="danger">真4K超清、流畅不卡顿</el-link>
            <el-link :icon="Link" style="font-size: 20px;margin-top:10px;margin-left:20px;" href="https://docs.qq.com/doc/DWkNNSVNFVEhBU0NK?no_promotion=1" target="_blank" type="danger">免费领取vip</el-link>
<!--            <el-link :icon="Download" style="font-size: 20px;margin-top:10px;margin-left:20px;" href="https://gssource.com" target="_blank" type="danger">资源搜索</el-link>-->

            <!--            <el-link style="font-size: 20px; margin-left:10px;margin-top:10px;" href="https://aifenxiang.net.cn" target="_blank" type="primary">夸克网盘不限速下载教程</el-link>-->
<!--            <el-link style="font-size: 20px;margin-left:10px;margin-top:10px;" href="https://aifenxiang.net.cn" type="success">百度网盘不限速下载教程</el-link>-->
            <div class="right">
              <el-select v-model="selectValue" class="m-2" placeholder="切换线路" size="large">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="video-play">
            <iframe  frameborder="no" onload="this.style.border='none';" ref="myElement" allowfullscreen width="100%" height="100%" :src="videoUrl"></iframe>
          </div>
        </div>
    <!-- 扫描获取验证码弹窗 -->
    <el-dialog class="dia-code" height="300px" title="提示" v-model="loadData.weCharVisible">
      <img class="qr-code" :src="xiaochengxu" alt="" />
<!--      <div class="file-name">文件名：{{ loadData.item.file_name }}</div>-->
      <el-form
          ref="codeRef"
          :model="form"
          :rules="codeRules"
      >
        <el-form-item style="width: 80%;margin: 10px auto 0;" prop="code" label="请输入验证码">
          <el-input v-model="form.code" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div class="qr-hint">为防止恶意盗刷,微信扫一扫上方二维码获取验证码</div>
      <!--      <div class="qr-title">高峰期有时下载速度会变慢，建议上午或者晚上12点后批量下载，或者使用快速下载！</div>-->
      <!--      <div class="qr-title">想做网盘影视会员副业的可以联系我！</div>-->
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
  </div>
</template>

<script setup name="List">
import { ref,watch } from 'vue'
import { Edit,Link, Download,View as IconView } from '@element-plus/icons-vue'
import moment from 'moment';
// import video from "@/assets/images/video.png";
import { ElMessage } from 'element-plus';
import { getToken, setToken, removeToken } from '@/utils/auth';
import xiaochengxu from '@/assets/images/xiaochengxu.jpg';
const { proxy } = getCurrentInstance();
import useUserStore from '@/store/modules/user';
const userStore = useUserStore();
// import导入
import DisableDevtool from 'disable-devtool';
// DisableDevtool();
const input = ref('')
// const selectValue = ref('https://play.okcdn100.top/analysis/player/?key=bekmvEHJMNORSVWZ17&url=')
const selectValue = ref('https://jx.zgjx.org/?key=06nzlBow93Dv&4k=true&url=')
const videoUrl = ref();
const myElement = ref(null);
import {getUserProfile} from "@/api/system/user";
import {userKey} from "@/utils/wp";
const state = reactive({
  user: {},
});
const isSending = ref(false);
const loadData = reactive({
  dialog:false,
  browseDia:false,
  weCharVisible: true,
})
const form = reactive({
  code: '',
});
const codeRules = {
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }],
};
const options = [
  {
    value: 'https://jx.zgjx.org/?key=06nzlBow93Dv&4k=true&url=',
    // value: 'https://play.okcdn100.top/analysis/player/?key=bekmvEHJMNORSVWZ17&url=',
    label: '默认线路',
  },
  {
    value: 'https://jx.xmflv.com/?url=',
    label: '备用线路一',
  }
]
watch(() => selectValue.value, (newValue, oldValue) => {
  if(videoUrl.value){
    ElMessage.success("线路切换成功，视频开始播放！")
    videoUrl.value = `${newValue}${input.value}`
  }else{
    loadData.weCharVisible = true;
  }
});

function playVideo(){
  // ElMessage.success("加载成功，视频开始播放！");
  // window.location.reload();
  // if(input.value){
  //   ElMessage.success("加载成功，视频开始播放！");
  //   videoUrl.value = `${selectValue.value}${playUrl}`;
  //   // videoUrl.value = `https://jx.xmflv.com/?url=${input.value}`;
  // }else{
  //   ElMessage.error("请输入视频播放地址！")
  // }
  // window.location.reload();
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const playUrl = params.get("url");
  input.value = playUrl;
  if(videoUrl.value){
    videoUrl.value = `${selectValue.value}${playUrl}`;

  }else{
    loadData.weCharVisible = true;
  }

}

onMounted(() => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const playUrl = params.get("url");
  input.value = playUrl;
  // videoUrl.value = `https://jx.xmflv.com/?url=${playUrl}`;
  // videoUrl.value = `${selectValue.value}${playUrl}`;
});
const onSubmit = () => {
  proxy.$refs.codeRef.validate(async (valid) => {
    if (valid) {
      isSending.value = true;
      const params = {
        code: form.code,
      };
      userStore
          .catCode(params)
          .then((res) => {
            if (res.code === 200) {
              isSending.value = false;
              loadData.weCharVisible = false;
              videoUrl.value = `${selectValue.value}${input.value}`;
              ElMessage.success("解析成功,视频加载中！")
            }
          })
          .catch(() => {
            isSending.value = false;
          });
    }
  })
}


</script>

<style scoped lang="scss">

.app-container{
  width: 95%;
  margin: auto;
  height:calc(100vh - 84px);
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
    height: 200px;
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
}

.video-header{
  width: 70%;
  margin: 10px auto 0;
  height: 40px;
  border-radius: 50px;
  padding-left: 20px;
  border: 1px solid #5e5e5e;
  background-color: #fff;
  display: flex;
  align-items: center;
  input{
    border: 0;
    height: 100%;
    outline: none;
    flex: 5;
  }
  .play{
    border-radius: 0 50px 50px 0;
    border-left: 1px solid #5e5e5e;
    color: #fff;
    font-weight: bold;
    text-decoration: none;
    background-image: linear-gradient(90deg, #7cbeff, #1e90ff);
    height: 100%;
    font-size: 1.3rem;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center; /* 垂直居中 */
    flex: 1;
    cursor: pointer;
  }
}

.content{
  width: 70%;
  margin:20px auto 0;
  box-shadow: 0 0 5px #1c93d8;
  //border-radius: 50px;
  .top{
    height: 50px;
    //border-radius: 50px;
    font-weight: bold;
    font-size: 20px;
    .left{
      float: left;
      margin-left: 10px;
      line-height: 50px;

    }
    .hint{
      float: left;
      margin-left: 10px;
      line-height: 40px;
      color: red;
      cursor: pointer;
    }
    .right{float: right;}

  }
  .video-play{
    width: 100%;
    height: 600px;
    margin: auto;
    background-image: url(../../assets/images/video.png);
    background-size: cover;
    background-position: 50%;
  }

}

</style>