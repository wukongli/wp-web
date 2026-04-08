<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="ip地址" prop="ip">
      <el-input v-model="user.ip"/>
    </el-form-item>
    <el-form-item label="账号" prop="name">
      <el-input v-model="user.name" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="user.password" />
    </el-form-item>
    <el-form-item label="端口" prop="port">
      <el-input v-model="user.port" />
    </el-form-item>
    <el-form-item label="路径" prop="path">
      <el-input v-model="user.path"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="generateCode()">扫码生成</el-button>
    </el-form-item>
  </el-form>
  <el-dialog title="提示" v-model="quarkShow" width="40%"  @close="handleDialogClose">
    <div class="qr-container">
      <img style="width: 300px;height: 300px;margin: auto;display: block;" :src=qrCode alt="">
    </div>
    <div class="qr-title">
      打开夸克APP扫码确认登录
    </div>
    <template #footer>
        <span class="dialog-footer">
          <el-button type="primary"
                     @click="handleDialogClose"
                     :loading="loading"
          >生成webDav</el-button
          >
        </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { updateUserPwd,addWebDav,getWebDav,delWebDav } from "@/api/system/user";
import axios from 'axios'
import { onMounted } from 'vue';
import {getToken} from "@/utils/auth";
import {blobValidate} from "@/utils/ruoyi";
import { ElMessage,ElMessageBox } from 'element-plus';
const { proxy } = getCurrentInstance();
const quarkShow = ref(false);
const loading = ref(false);
const qrCode = ref("data:image/jpeg;base64,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");

const user = reactive({
  ip: "154.201.66.14",
  name: undefined,
  password: undefined,
  port: 3456,
  path:"/dav",
  mountPath:"",
  storageId:undefined,
  davUserId:undefined,
  id:undefined,
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};
const rules = ref({
  // oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  // newPassword: [{ required: true, message: "新密码不能为空", trigger: "blur" }, { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }],
  // confirmPassword: [{ required: true, message: "确认密码不能为空", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});


/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess("修改成功");
      });
    }
  });
};
/** 关闭按钮 */
function close() {

};
onMounted(() => {
  const params = {
    type:1
  }
  getWebDav(params).then(res=>{
    console.log(res);
    if(res.code === 200){
      user.name = res.data.name;
      user.password = res.data.password;
      user.storageId = res.data.storageId;
      user.davUserId = res.data.davUserId;
      user.id =  res.data.id;
    }
  })
});

function generateCode(){
  const header = {
    'Content-Type': 'application/json',
    'Authorization': 'openlist-e31325bb-cc55-4f8c-8c68-b71aa4498929CJSA1uya8ikmtUAP7FBuVi1kcDxd6Kx9zzEqj9yrUqrGCgpQTXt10AMg9MCu3wWK'
  };
  ElMessageBox.alert('生成新的webDav账号、以前的webDav账号将会被删除', '提示', {
    confirmButtonText: '确定',
    callback: (action) => {
      if(action === "confirm"){
        if(user.storageId){
          axios.post(
              'https://play.gssource.com/api/admin/storage/delete?id=' + user.storageId,
              {},
              { headers: header }
          );
        }
        if(user.davUserId){
          axios.post(
              'https://play.gssource.com/api/admin/user/delete?id=' + user.davUserId,
              {},
              { headers: header }
          );
        }
        if(user.id){
          delWebDav(user.id);
        }
        quarkShow.value = true;
        user.mountPath = generatePath();
        axios.post('https://play.gssource.com/api/admin/storage/create',
            {
              "mount_path": user.mountPath,
              "order": 0,
              "remark": "",
              "cache_expiration": 0,
              "custom_cache_policies": "",
              "web_proxy": false,
              "webdav_policy": "302_redirect",
              "down_proxy_url": "",
              "disable_proxy_sign": false,
              "extract_folder": "",
              "disable_index": false,
              "enable_sign": false,
              "driver": "QuarkTV",
              "addition": "{\"root_folder_id\":\"0\",\"order_by\":\"updated_at\",\"order_direction\":\"desc\",\"refresh_token\":\"\",\"device_id\":\"\",\"query_token\":\"\",\"link_method\":\"streaming\"}"
            },
            {
              headers: header
            })
            .then(response => {
              console.log('响应数据:', response.data);
              if(response.data.code === 500){
                const srcRegex = /src\s*=\s*["']([^"']+)["']/;
                const match = response.data.message.match(srcRegex);
                if (match) {
                  qrCode.value = match[1];
                  user.storageId = response.data.data.id;
                }
              }
            })
            .catch(error => {
              console.error('请求失败:', error);
            });
      }
    },
  })


}

async function handleDialogClose() {
  const header = {
    'Content-Type': 'application/json',
    'Authorization': 'openlist-e31325bb-cc55-4f8c-8c68-b71aa4498929CJSA1uya8ikmtUAP7FBuVi1kcDxd6Kx9zzEqj9yrUqrGCgpQTXt10AMg9MCu3wWK'
  };
  loading.value = true;
  try {
    // 第一个请求：disable
    const disableRes = await axios.post(
        'https://play.gssource.com/api/admin/storage/disable?id=' + user.storageId,
        {},
        { headers: header }
    );
    console.log('响应数据:', disableRes.data);
    if (disableRes.data.code !== 200) {
      quarkShow.value = false;
      loading.value = false;

      return false;
      // 处理错误（可自定义）
    }
  } catch (error) {
    return false;
    console.error('请求失败:', error);
  }

  try {
    // 第二个请求：enable
    const enableRes = await axios.post(
        'https://play.gssource.com/api/admin/storage/enable?id=' + user.storageId,
        {},
        { headers: header }
    );
    console.log('响应数据:', enableRes.data);
    if (enableRes.data.code !== 200) {
      await axios.post(
          'https://play.gssource.com/api/admin/storage/delete?id=' + user.storageId,
          {},
          { headers: header }
      );
      user.storageId = null;
      ElMessage.error(enableRes.data.message);
      quarkShow.value = false;
      loading.value = false;
      return false;
      // 处理错误
    }
  } catch (error) {
    return false;
    console.error('请求失败:', error);
  }

  try {
    // 第三个请求：create
    const createRes = await axios.post(
        'https://play.gssource.com/api/admin/user/create',
        {
          "id": parseInt(user.mountPath.slice(-4)),
          "username": "admin" + user.mountPath,
          "password": "123456",
          "base_path": "/" + user.mountPath,
          "role": 0,
          "permission": 256,
          "disabled": false,
          "sso_id": "",
          "allow_ldap": false
        },
        { headers: header }
    );
    console.log('响应数据:', createRes.data);
    if (createRes.data.code === 200) {
        user.name = "admin" + user.mountPath;
        user.password = "123456";
        user.davUserId = parseInt(user.mountPath.slice(-4));
        const params = {
          name:"admin" + user.mountPath,
          password:"123456",
          type:1,
          storageId:user.storageId,
          davUserId:parseInt(user.mountPath.slice(-4))
        };
        addWebDav(params).then(res=>{
          if(res.code === 200){
            ElMessage.success("生成账号成功");
            loading.value = false;
            quarkShow.value = false;
          }
        })
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}
function generatePath(){
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = month + day; // "0407"

// 生成4位随机数（包含前导零，如 0123）
  const randomPart = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  const path = datePart + randomPart; // 例如 "04071234"
  return path;
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
