<template>
  <div class="app-container">
<!--    <div class="video-header">-->
<!--      <input v-model="input" placeholder="请输入视频播放链接" />-->
<!--      <div @click="playVideo" class="play">播放</div>-->
<!--    </div>-->
<!--    <div class="content">-->
<!--      <div class="top">-->
<!--        <a class="hint" href="https://ni21qzcmy6.feishu.cn/docx/JhgkduQxbo3oNUxYthHcrvr4nwf" target="_blank">点击查看使用方式</a>-->
<!--        <div class="left">如果播放卡顿可以切换线路！</div>-->
<!--        <div class="right">-->
<!--          <el-select v-model="selectValue" class="m-2" placeholder="切换线路" size="large">-->
<!--            <el-option-->
<!--                v-for="item in options"-->
<!--                :key="item.value"-->
<!--                :label="item.label"-->
<!--                :value="item.value"-->
<!--            />-->
<!--          </el-select>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="video-play">-->
    <iframe  frameborder="no" onload="this.style.border='none';" ref="myElement" allowfullscreen width="100%" height="100%" src="https://mac.aifenxiang.net.cn"></iframe>
<!--      </div>-->
<!--    </div>-->

    <el-dialog width="500px;" :close-on-press-escape="false" title="提示" v-model="loadData.dialog">
            <img class="qr-code" :src="qrCode" alt="" />
      <div class="qr-hint">
<!--        <div>请勿相信视频内的任何广告，谨防上当受骗！！</div>-->
        <div>获得完整观看权限地址，以及移动端APP，扫一扫开通权限！</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
<!--          <el-button type="primary"-->
<!--          ><a href="https://vip.aifenxiang.net.cn" target="_blank">点击开通</a></el-button-->
<!--          >-->

        </span>
      </template>
    </el-dialog>

    <el-dialog
        :visible.sync="dialogVisible"
        :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
               title="提示" v-model="loadData.browseDia">
      <div>
        <div>移动端观看视频请联系管理员下载移动端app</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
          ><router-link :to="'/parse/login'">确定</router-link></el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="List">
import { ref,watch } from 'vue'
import moment from 'moment';
// import video from "@/assets/images/video.png";
import { ElMessage } from 'element-plus';
import { getToken, setToken, removeToken } from '@/utils/auth';
import qrCode from '@/assets/images/wechart.jpg';

// import导入
import DisableDevtool from 'disable-devtool';
DisableDevtool();
const input = ref('')
const selectValue = ref('https://jx.xmflv.com/?url=')
const videoUrl = ref('https://video.aifenxiang.net.cn/');
const myElement = ref(null);
import {getUserProfile} from "@/api/system/user";
const state = reactive({
  user: {},
});
const loadData = reactive({
  dialog:false,
  browseDia:false,
})
const options = [
  {
    value: 'https://jx.xmflv.com/?url=',
    label: '线路一',
  },
  {
    value: 'https://www.8090g.cn/jiexi/?url=',
    label: '线路二',
  },
  {
    value: 'https://jx.m3u8.tv/jiexi/?url=',
    label: '线路三',
  },
  {
    value: 'https://im1907.top/?jx=',
    label: '线路四',
  },
  {
    value: 'https://svip.bljiex.cc/?v=',
    label: '线路五',
  },
]
watch(() => selectValue.value, (newValue, oldValue) => {
  ElMessage.success("线路切换成功，视频开始播放！")
  videoUrl.value = `${newValue}${input.value}`
});

function playVideo(){
  console.log(input.value);

  if(input.value){
    ElMessage.success("加载成功，视频开始播放！")
    videoUrl.value = `https://jx.xmflv.com/?url=${input.value}`
  }else{
    ElMessage.error("请输入视频播放地址！")
  }

}

onMounted(() => {
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isMobileScreen = window.innerWidth <= 768;
    return isMobileUserAgent && isMobileScreen;
  };

  if (isMobile()) {
   loadData.browseDia = true;
  } else {

    const token = getToken();

    if(token){
      setInterval(() => {
        const date1 = moment(state.user.videoEndTime).format("YYYY-MM-DD HH:mm:ss");
        const date2 = moment().format("YYYY-MM-DD HH:mm:ss")
        if(date1 < date2){
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
          }
          loadData.dialog = true;
        }

      },180* 1000);
    }else{
      setInterval(() => {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
          document.msExitFullscreen();
        }
        loadData.dialog = true;
      },180* 1000);
    }


  }

});

function getUser() {
  const token = getToken();
  if(token){
    getUserProfile().then(response => {
      state.user = response.data;
    });
  }

};
getUser();


</script>

<style scoped lang="scss">

.app-container{
  width: 100%;
  height:calc(100vh - 84px);
  .qr-hint {
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  .qr-code {
    width: 200px;
    height: 180px;
    margin: auto;
    display: block;
  }
}

.video-header{
  width: 95%;
  margin: 5px auto 0;
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
  width: 95%;
  margin:10px auto 0;
  box-shadow: 0 0 5px #1c93d8;
  //border-radius: 50px;
  .top{
    height: 40px;
    //border-radius: 50px;
    font-weight: bold;
    .left{
      float: left;
      margin-left: 10px;
      line-height: 40px;


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
    background-image: url(../../assets/images/video.png);
    background-size: cover;
    background-position: 50%;
  }

}

</style>