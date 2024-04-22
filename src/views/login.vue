<template>
  <div class="login">
    <el-form
      ref="loginRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <h3 class="title">网盘高速下载在线解析</h3>
      <div v-if="hint.show" class="hint-box">
        <el-tag class="hint" type="danger" effect="dark" round>
          下载解析限速中管理员正在修复请稍后再试...
        </el-tag>
      </div>

      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          @blur="handleBlur"
          placeholder="请输入分享链接(可输入带提取码链接)"
        >
          <template #prefix
            ><svg-icon icon-class="user" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
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
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix
            ><svg-icon icon-class="validCode" class="el-input__icon input-icon"
          /></template>
        </el-input>
        <div class="login-code">
          <a target="_blank" href="https://ni21qzcmy6.feishu.cn/docx/B7UgdH6FHoM6ZIxrbGmcpaixnRb?from=from_copylink">点击查看使用说明</a>
<!--          <img :src="codeUrl" @click="getCode" class="login-code-img" />-->
        </div>
      </el-form-item>
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
        <div style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'"
            >立即注册</router-link
          >
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright 2024 All Rights Reserved.</span>
    </div>
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
import { getCodeImg, querySecretKey } from '@/api/login';
import Cookies from 'js-cookie';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import { ElMessage } from 'element-plus';
const router = useRouter();
const { proxy } = getCurrentInstance();
import useUserStore from '@/store/modules/user';
const userStore = useUserStore();
import qrCode from '@/assets/images/qrcode.jpg';

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
  username: [{ required: true, trigger: 'blur', message: '请输入分享链接' }],
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

function getVipNums(){
  userStore.getVipNum().then((data) => {
    if (data.code === 200) {
      if (data.data === 0) {
        hint.show = true;
      }
    }
  });
}
function handleBlur() {
  const { url, pwd } = SubmitLink(loginForm.value.username);
  loginForm.value.shorturl = url;
  loginForm.value.pwd = pwd;
  loginForm.value.password = pwd;
}

async function handleLogin() {
  hint.message = "";
  proxy.$refs.loginRef.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      if (loginForm.value.code === '' || loginForm.value.code == null) {
        hint.getCodeVisible = true;
        hint.message = "请扫码关注获取验证码!"
        return;
      }
      //获取下载次数
      const result = await userStore.getCodeNum({code: loginForm.value.code}).then((res) => {
        return res;
      })
      if (result.code === 200) {
        if (result.data === "验证码不正确") {
          loading.value = false;
          hint.getCodeVisible = true;
          hint.message = "您输入的验证码不正确,请检查或者扫码重新获取！"
          return;
        }
      }
      //过期时间十分钟
      Cookies.set('code', loginForm.value.code, { expires: 1 });
      router.push({
        name: 'Index',
        path: '/',
        query: {
          shorturl: loginForm.value.shorturl,
          pwd: loginForm.value.pwd,
          dir: loginForm.value.dir,
          root: loginForm.value.root,
        },
      });
      // 调用action的登录方法
    }
  });
}

function SubmitLink(url) {
  let surl = null;
  let uk = url.match(/uk=(\d+)/),
    shareid = url.match(/shareid=(\d+)/);
  if (uk != null && shareid != null) {
    let tmp = uk[1] + '&' + shareid[1];
    surl = '2' + window.btoa(tmp); // base64 encode
  } else {
    surl = url.match(/surl=([A-Za-z0-9-_]+)/);
    if (surl == null) {
      surl = url.match(/1[A-Za-z0-9-_]+/);
      if (surl != null) {
        surl = surl[0];
      }
    } else {
      surl = '1' + surl[1];
    }

    if (surl == null || surl === '') {
      ElMessage.error('百度网盘分享链接有错误，请检查输入的链接 ！');
      return false;
    }
  }

  let pwd = url.match(
    /(提取码|pwd=|pwd:|密码|%E6%8F%90%E5%8F%96%E7%A0%81|%E5%AF%86%E7%A0%81)( |:|：|%EF%BC%9A|%20)*([a-zA-Z0-9]{4})/i
  );
  let pw;
  if (pwd != null && pwd.length === 4) {
    pw = pwd[3];
  }
  if (pw.length !== 0 && pw.length !== 4) {
    ElMessage.error('验证码错误，请检查！');
    return false;
  }
  return {
    url: surl,
    pwd: pw,
  };
}

function confirm() {
  hint.getCodeVisible = false;
  loading.value = false;
}

function handleClose() {
  hint.getCodeVisible = false;
  loading.value = false;
}

getVipNums();
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/images/bac.jpg');
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
  width: 500px;
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
  width: 33%;
  height: 40px;
  line-height: 40px;
  float: right;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  color: red;
  text-decoration: none; /* 默认情况下不显示下划线 */
  transition: text-decoration 0.3s; /* 添加过渡效果使下划线出现更平滑 */
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
