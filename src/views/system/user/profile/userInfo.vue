<template>
   <el-form ref="userRef" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="用户昵称" prop="nickName">
         <el-input v-model="user.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="百度CK" prop="phonenumber">
         <el-input v-model="user.phonenumber" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="generateBaiduCode()">百度扫码登录</el-button>
      </el-form-item>
      <el-form-item label="夸克CK" prop="email">
         <el-input v-model="user.email" />
      </el-form-item>
     <el-form-item>
       <el-button type="primary" @click="generateQuarkCode()">夸克扫码登录</el-button>
     </el-form-item>
     <el-form-item label="性别">
         <el-radio-group v-model="user.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
      </el-form-item>
   </el-form>
  <el-dialog title="提示" v-model="quarkShow" :key="quarkKey" class="qr-dialog" @close="handleQuarkDialogClose">
    <div class="qr-container">
      <vue-qrcode style="max-width: 100%; height: auto;" v-if="qrValue"  :value="qrValue" :options="{ width: 200 }">
      </vue-qrcode>
    </div>
    <div class="qr-title">
      打开夸克APP扫码获取Cookie
    </div>
    <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
                     @click="handleQuarkDialogClose"
          >确定</el-button
          >
        </span>
    </template>
  </el-dialog>
  <el-dialog title="提示" v-model="baiduShow" :key="baiduKey" class="qr-dialog" @close="handleBaiduDialogClose">
    <div class="qr-container">
      <img v-if="baiduQrValue" :src="baiduQrValue" class="qr-image" />
    </div>
    <div class="qr-title">
      打开百度网盘APP扫码获取Cookie
    </div>
    <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
                     @click="handleBaiduDialogClose"
          >确定</el-button
          >
        </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

import { getUserProfile, updateUserProfile } from "@/api/system/user";
import useUserStore from "@/store/modules/user";
import {getBaiduQRImage} from "@/api/baidu";
const quarkIntervalId = ref(null)
const baiduIntervalId = ref(null)
const userStore = useUserStore();
const quarkKey = ref(0);
const baiduKey = ref(0);
const props = defineProps({
  user: {
    type: Object
  }
});
const qrValue = ref("");
const quarkShow = ref(false);
const baiduQrValue = ref("");
const baiduShow = ref(false);
watch(quarkShow, (val) => { if (val) quarkKey.value++; });
watch(baiduShow, (val) => { if (val) baiduKey.value++; });
const { proxy } = getCurrentInstance();

const rules = ref({
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: false, message: "cookie地址不能为空", trigger: "blur" }, {  message: "请输入正确的cookie", trigger: ["blur", "change"] }],
  phonenumber: [{ required: false, message: "cookie地址不能为空", trigger: "blur" }, {  message: "请输入正确的cookie", trigger: "blur" }],
});
/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(props.user).then(response => {
        proxy.$modal.msgSuccess("修改成功");
      });
    }
  });
};
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
}
function generateQuarkCode(){
  userStore.generateQuark()
      .then(res=>{
        if(res.code === 200){
          const qrUrl = `https://su.quark.cn/4_eMHBJ?token=${encodeURIComponent(res.data)}&client_id=532&ssb=weblogin&uc_param_str=&uc_biz_str=${encodeURIComponent('S:custom|OPT:SAREA@0|OPT:IMMERSIVE@1|OPT:BACK_BTN_STYLE@0')}`;
          qrValue.value = qrUrl;
          quarkShow.value = true;
          if (quarkIntervalId.value) {
            clearInterval(quarkIntervalId.value)
          }
          quarkIntervalId.value = setInterval(()=>{
            const params = {
              loginToken: res.data,
            };
            userStore.checkQuarkStatus(params).then(result=>{
              if(result.code === 200 && result.data != null){
                props.user.email = result.data;
                updateUserProfile(props.user).then(() => {
                  quarkShow.value = false;
                  proxy.$modal.msgSuccess("扫码成功");
                });
                clearInterval(quarkIntervalId.value)
                quarkIntervalId.value = null;
              }
             }
            )
          },2000)
        }
      })
}

function generateBaiduCode(){
  userStore.generateBaidu(props.user.userId)
      .then(async res=>{
        if(res.code === 200 && res.data){
          const sessionId = res.data.id;
          baiduQrValue.value = await getBaiduQRImage(sessionId);
          baiduShow.value = true;
          if (baiduIntervalId.value) {
            clearInterval(baiduIntervalId.value)
          }
          baiduIntervalId.value = setInterval(()=>{
            userStore.checkBaiduStatus(sessionId).then(result=>{
              if(result.code === 200 && result.data){
                if(result.data.logged_in){
                  baiduShow.value = false;
                  clearInterval(baiduIntervalId.value)
                  baiduIntervalId.value = null;
                  getUserProfile().then(response => {
                    props.user.phonenumber = response.data.phonenumber;
                    proxy.$modal.msgSuccess("扫码成功");
                  });
                } else if(result.data.status === 'expired'){
                  proxy.$modal.msgError("二维码已过期，请重新获取");
                  clearInterval(baiduIntervalId.value)
                  baiduIntervalId.value = null;
                  baiduShow.value = false;
                } else if(result.data.status === 'error'){
                  proxy.$modal.msgError("扫码失败：" + result.data.message);
                  clearInterval(baiduIntervalId.value)
                  baiduIntervalId.value = null;
                  baiduShow.value = false;
                }
              }
             }
            )
          },2000)
        }
      })
}

function handleQuarkDialogClose(){
  clearInterval(quarkIntervalId.value);
  quarkIntervalId.value = null;
  quarkShow.value = false;
}

function handleBaiduDialogClose(){
  clearInterval(baiduIntervalId.value);
  baiduIntervalId.value = null;
  if (baiduQrValue.value) {
    URL.revokeObjectURL(baiduQrValue.value);
    baiduQrValue.value = "";
  }
  baiduShow.value = false;
}
</script>
<style scoped lang="scss">
.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.qr-image {
  max-width: 100%;
  height: auto;
}
.qr-title {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}
</style>
<style lang="scss">
.qr-dialog {
  --el-dialog-width: 400px;
}
@media (max-width: 767px) {
  .qr-dialog {
    --el-dialog-width: 90%;
  }
}
</style>
