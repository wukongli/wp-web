<template>
  <div class="login app-container">
    <el-form
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
    >
<!--      <h3 v-if="getToken()" class="title">网盘文件加速下载<span style="color: red;">(赞助版)</span></h3>-->
      <h3 class="title">网盘文件加速下载</h3>
<!--      <div v-if="hint.show" class="hint-box">-->
<!--        <el-tag class="hint" type="danger" effect="dark" round>-->
<!--          下载解析限速中管理员正在修复请稍后再试...-->
<!--        </el-tag>-->
<!--      </div>-->

      <el-form-item prop="username">
        <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            @blur="handleBlur"
            placeholder="请输入分享的网盘链接(可输入带提取码链接)"
        >
          <template #prefix
          ><svg-icon icon-class="user" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
            v-model="loginForm.pwd"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="提取码"
            @keyup.enter="handleLogin"
        >
          <template #prefix
          ><svg-icon icon-class="password" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
<!--      <el-form-item prop="code" v-if="captchaEnabled">-->
<!--        <el-input-->
<!--            v-model="loginForm.code"-->
<!--            size="large"-->
<!--            auto-complete="off"-->
<!--            placeholder="验证码"-->
<!--            style="width: 63%"-->
<!--            @keyup.enter="handleLogin"-->
<!--        >-->
<!--          <template #prefix-->
<!--          ><svg-icon icon-class="validCode" class="el-input__icon input-icon"-->
<!--          /></template>-->
<!--        </el-input>-->
        <div class="login-code">
          <a target="_blank" href="https://ni21qzcmy6.feishu.cn/docx/B7UgdH6FHoM6ZIxrbGmcpaixnRb?from=from_copylink">点击查看使用说明(注意：下载前一定要配置UA)</a>
          <!--          <img :src="codeUrl" @click="getCode" class="login-code-img" />-->
        </div>
<!--      </el-form-item>-->
      <!-- <el-checkbox -->
      <!-- v-model="loginForm.rememberMe"
        style="margin: 0px 0px 25px 0px"
        >记住密码</el-checkbox
      > -->
      <el-form-item style="width: 100%">
        <el-button
            :loading="loading"
            size="large"
            type="primary"
            style="width: 100%"
            @click.prevent="handleLogin"
        >
          <span v-if="!loading">提 取</span>
          <span v-else>提 取 中...</span>
        </el-button>
<!--        <div style="float: right" v-if="register">-->
<!--          <router-link class="link-type" :to="'/register'"-->
<!--          >立即注册</router-link-->
<!--          >-->
<!--        </div>-->
      </el-form-item>
    </el-form>
    <!--  底部  -->
<!--    <div class="el-login-footer">-->
<!--      <span>Copyright 2024 All Rights Reserved.</span>-->
<!--    </div>-->
    <!-- 获取验证码弹窗 -->
    <el-dialog
        @close="handleClose()"
        title="提示"
        v-model="hint.getCodeVisible"
        width="30%"
    >
      <img class="qr-code" :src="qrCode" alt="" />
      <div class="qr-hint">{{hint.message}}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirm()" type="primary">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import Cookies from 'js-cookie';
import { encrypt } from '@/utils/jsencrypt';
const router = useRouter();
const { proxy } = getCurrentInstance();
import useUserStore from '@/store/modules/user';
const userStore = useUserStore();
import qrCode from '@/assets/images/qrcode.jpg';
import {SubmitLink} from "@/utils/wp";
import {getToken} from "@/utils/auth";
const route = useRoute();
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: '',
  shorturl: '',
  pwd: '',
  dir: '1',
  root: '1',
});
const hint = reactive({
  show: false,
  getCodeVisible: false,
  message:''
});
const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入分享的网盘链接' }],
  // password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  // code: [{ required: true, trigger: 'change', message: '请输入验证码' }],
};

const codeUrl = ref('');
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

// function getVipNums(){
//   userStore.getVipNum().then((data) => {
//     if (data.code === 200) {
//       if (data.data === 0) {
//         hint.show = true;
//       }
//     }
//   });
// }
function handleBlur() {
  const { url, pwd } = SubmitLink(loginForm.value.username);
  loginForm.value.shorturl = url;
  if(pwd){
    loginForm.value.pwd = pwd;
  }
  //loginForm.value.password = pwd;
}

async function handleLogin() {
  hint.message = "";
  proxy.$refs.loginRef.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      // if (loginForm.value.code === '' || loginForm.value.code == null) {
      //   hint.getCodeVisible = true;
      //   hint.message = "请扫码关注公众号获取验证码!"
      //   return;
      // }
      // //获取下载次数
      // const result = await userStore.getCodeNum({code: loginForm.value.code}).then((res) => {
      //   return res;
      // })
      // if (result.code === 200) {
      //   if (result.data === "0") {
      //     loading.value = false;
      //     hint.getCodeVisible = true;
      //     hint.message = "您输入的验证码不正确,请检查或者扫码重新获取！"
      //     return;
      //   }
      // }
      // //过期时间十分钟
      // Cookies.set('code', loginForm.value.code, { expires: 1 });
      // showLogin.value = false;
      router.push({
        path: '/parse/index',
        query: {
          shorturl: loginForm.value.shorturl,
          pwd: encrypt(loginForm.value.pwd),
          dir: loginForm.value.dir,
          root: loginForm.value.root
        },
      })
    }
  });
}



function confirm() {
  hint.getCodeVisible = false;
  loading.value = false;
}

function handleClose() {
  hint.getCodeVisible = false;
  loading.value = false;
}
// function init(){
//   if(!route.query.userKey){
//     const userKey = sessionStorage.getItem("userKey")
//     if(userKey){
//       router.push({
//         path: '/parse/login',
//         query: {
//           userKey:userKey
//         },
//       })
//     }
//
//   }else{
//     sessionStorage.setItem("userKey",route.query.userKey)
//     router.push({
//       path: '/parse/login',
//       query: {
//         userKey:route.query.userKey
//       },
//     })
//   }
// }
// init();

// getVipNums();
</script>

<style lang="scss" scoped>
.login {
  width: 98%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 84px);
  background-image: url('../../assets/images/bac.png');
  background-size: cover;
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
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}
.hint-box {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 50px; /* 父元素高度 */
  margin-bottom: 30px;

  .hint {
    // display: block;
    // margin: 0px auto 30px auto;
    margin: auto;
  }
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 600px;
  padding: 30px 25px 20px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  //width: 33%;
  height: 20px;
  line-height: 20px;
  margin-bottom: 18px;
  float: left;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none; /* 默认情况下不显示下划线 */
  transition: text-decoration 0.3s; /* 添加过渡效果使下划线出现更平滑 */
  a{
    color: red;

  }
  //img {
  //  cursor: pointer;
  //  vertical-align: middle;
  //}
}
.login-code:hover{
  text-decoration: underline; /* 鼠标滑过时显示下划线 */
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
