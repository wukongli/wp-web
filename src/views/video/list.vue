<template>
  <div class="app-container">
    <div class="video-header">
      <input v-model="input" placeholder="请输入视频播放链接" />
      <div @click="playVideo" class="play">播放</div>
    </div>
    <div class="content">
      <div class="top">
        <a class="hint" href="https://ni21qzcmy6.feishu.cn/docx/JhgkduQxbo3oNUxYthHcrvr4nwf" target="_blank">点击查看使用方式</a>
        <div class="left">如果播放卡顿可以切换线路！</div>
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
        <iframe allowfullscreen width="100%" height="100%" :src="videoUrl"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup name="List">
import { ref,watch } from 'vue'
// import video from "@/assets/images/video.png";
import { ElMessage } from 'element-plus';
const input = ref('')
const selectValue = ref('https://jx.xmflv.com/?url=')
const videoUrl = ref('');

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
  ElMessage.success("加载成功，视频开始播放！")
  videoUrl.value = `${selectValue.value}${input.value}`
}
</script>

<style scoped lang="scss">

.video-header{
  width: 95%;
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
    text-decoration: none;
    background-image: linear-gradient(90deg, #7cbeff, #1e90ff);
    height: 100%;
    font-size: 1.5rem;
    justify-content: center;
    text-align: center;
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