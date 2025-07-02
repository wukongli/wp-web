<template>
  <div class="app-container">
        <div class="video-header">
          <input v-model="input" placeholder="请输入视频播放链接" />
          <div @click="playVideo" class="play">刷新播放</div>
        </div>
        <div class="content">
          <div class="top">
            <el-link style="font-size: 20px;margin-top:10px;" href="https://docs.qq.com/doc/DWkNNSVNFVEhBU0NK?no_promotion=1" target="_blank" type="danger">4K、1080P、更多资源、点击前往观看</el-link>
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
  </div>
</template>

<script setup name="List">
import { ref,watch } from 'vue'
import moment from 'moment';
// import video from "@/assets/images/video.png";
import { ElMessage } from 'element-plus';
import { getToken, setToken, removeToken } from '@/utils/auth';

// import导入
import DisableDevtool from 'disable-devtool';
// DisableDevtool();
const input = ref('')
const selectValue = ref('https://play.okcdn100.top/analysis/player/?key=bekmvEHJMNORSVWZ17&url=')
const videoUrl = ref();
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
    value: 'https://play.okcdn100.top/analysis/player/?key=bekmvEHJMNORSVWZ17&url=',
    label: '默认线路',
  },
  {
    value: 'https://player.aifenxiang.net.cn/?url=',
    label: '备用线路',
  },
]
watch(() => selectValue.value, (newValue, oldValue) => {
  ElMessage.success("线路切换成功，视频开始播放！")
  videoUrl.value = `${newValue}${input.value}`
});

function playVideo(){
  // ElMessage.success("加载成功，视频开始播放！");
  // window.location.reload();
  if(input.value){
    ElMessage.success("加载成功，视频开始播放！");
    videoUrl.value = `${selectValue.value}${playUrl}`;
    // videoUrl.value = `https://jx.xmflv.com/?url=${input.value}`;
  }else{
    ElMessage.error("请输入视频播放地址！")
  }

}

onMounted(() => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const playUrl = params.get("url");
  input.value = playUrl;
  // videoUrl.value = `https://jx.xmflv.com/?url=${playUrl}`;
  videoUrl.value = `${selectValue.value}${playUrl}`;

});



</script>

<style scoped lang="scss">

.app-container{
  width: 95%;
  margin: auto;
  height:calc(100vh - 84px);
  .qr-hint {
    margin-top: 30px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e94242;
  }
  overflow: hidden;
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