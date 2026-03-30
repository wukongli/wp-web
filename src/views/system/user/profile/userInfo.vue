<template>
   <el-form ref="userRef" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="用户昵称" prop="nickName">
         <el-input v-model="user.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="百度CK" prop="phonenumber">
         <el-input v-model="user.phonenumber" />
      </el-form-item>
      <el-form-item label="夸克CK" prop="email">
         <el-input v-model="user.email" />
      </el-form-item>
     <el-form-item>
       <el-button type="primary" @click="generateQuarkCode()">扫码登录</el-button>
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
  <el-dialog title="提示" v-model="quarkShow" width="40%"  @close="handleDialogClose">
    <div class="qr-container">
      <vue-qrcode style="margin: auto;" v-if="qrValue"  :value="qrValue" :options="{ width: 200 }">
      </vue-qrcode>
    </div>
    <div class="qr-title">
      打开夸克APP扫码获取Cookie
    </div>
    <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
                     @click="handleDialogClose"
          >确定</el-button
          >
        </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

import { updateUserProfile } from "@/api/system/user";
import useUserStore from "@/store/modules/user";
import {checkQuarkLoginStatus} from "@/api/quark";
import {userKey} from "@/utils/wp";
const intervalId = ref(null)
const userStore = useUserStore();
const props = defineProps({
  user: {
    type: Object
  }
});
const qrValue = ref("");
const quarkShow = ref(false);
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
          if (intervalId.value) {
            clearInterval(intervalId.value)
          }
          intervalId.value = setInterval(()=>{
            const params = {
              loginToken: res.data,
            };
            userStore.checkQuarkStatus(params).then(result=>{
              if(result.code === 200 && result.data != null){
                props.user.email = result.data;
                updateUserProfile(props.user).then(response => {
                  quarkShow.value = false;
                  proxy.$modal.msgSuccess("扫码成功");
                });
                clearInterval(intervalId.value)
                intervalId.value = null;
              }
             }
            )
          },2000)
        }
      })
}


function handleDialogClose(){
  clearInterval(intervalId.value);
  intervalId.value = null;
  quarkShow.value = false;
}
</script>
<style scoped lang="scss">
.qr-container {
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中（可选） */
  width: 100%;
}
.qr-title {
  margin-top: 20px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
</style>
