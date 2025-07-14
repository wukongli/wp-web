<template>
  <div class="app-container app">
    <el-button
        style="margin: 10px 0"
        type="primary"
        plain
        icon="UploadFilled"
        @click="handleAdd"
    >新增</el-button
    >
    <!--    <el-button-->
    <!--        style="margin-left: 20px"-->
    <!--        type="primary"-->
    <!--        plain-->
    <!--        icon="Promotion"-->
    <!--    ><a href="https://vip.aifenxiang.net.cn" target="_blank">获取卡密</a></el-button>-->
    <!--    <el-tag v-show="!multiple" style="margin-left:30px;" type="danger">有想做网盘影视会员副业的可以联系我！</el-tag>-->
    <el-tag style="margin-left:30px;" type="danger">禁止虚假标题党、引流行为，生成多个链接反复提交，禁止违法违规等内容。</el-tag>
    <el-table
        v-loading="loading"
        element-loading-text="数据正在加载中..."
        :data="tableList"
        max-height="100%"
        style="width: 100%;cursor: pointer; font-size: 14px; font-weight: 600;overflow: auto;"
        class="wp-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column
          show-overflow-tooltip
          prop="server_filename"
          label="文件名"
      >
        <template #default="scope">
          <div
              @click="parseList(scope.row)"
              style="display: flex; align-items: center"
          >
<!--            <MySvg :iconName="getIconClass(scope.row)" size="40"></MySvg>-->
            <span style="margin-left: 10px">{{
                scope.row.name
              }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
          prop="url"
          label="链接地址"
      />
      <el-table-column
          prop="time"
          label="资源更新时间"
      />
      <el-table-column min-width="100px" label="操作">
        <template #default="scope">
          <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
          >修改</el-button
          >
          <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
          >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

  </div>

  <!-- 添加或修改岗位对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <el-form ref="postRef" :model="form" :rules="rules" label-width="120px">
      <!--        <el-form-item label="账号类型" prop="type">-->
      <!--          <el-select v-model="form.type" placeholder="请选择">-->
      <!--            <el-option label="svip账号" value="1" />-->
      <!--            <el-option label="普通账号" value="0" />-->
      <!--          </el-select>-->
      <!--        </el-form-item>-->
      <el-form-item label="链接标题描述" prop="name">
        <el-input v-model="form.name" placeholder="请输分享链接标题描述" />
      </el-form-item>
      <el-form-item label="链接地址" prop="url">
        <el-input v-model="form.url" placeholder="请输入链接地址" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="addLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="Index">
const router = useRouter();
import useUserStore from '@/store/modules/user';
import { ElMessage } from 'element-plus';
import MySvg from '@/components/icon/Svg.vue';
const total = ref(0);
import {
  addSource, deleteSource, listSource, putSource
} from '@/api/system/vip';
const userStore = useUserStore();
import {
  getFilesize,
  getIconClass, SubmitLink,
  timestampToTime,
} from '@/utils/wp';
import {getToken} from "@/utils/auth";
const loading = ref(false);
const addLoading = ref(false);
const tableList = ref([]);

const { proxy } = getCurrentInstance();
const open = ref(false);

const title = ref('');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
  rules: {
    name: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
    url: [{ required: true, message: '链接不能为空', trigger: 'blur' }],
  },
});
const { queryParams, form, rules } = toRefs(data);

function handleAdd(){
  reset();
  open.value = true;
  title.value = '新增资源';
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {

    if(!getToken()){
      router.push({
        path: '/vip/login',
      })
      return;
    }
    if (valid) {
      if(form.value.url.includes("quark")){
        const pwdId =  form.value.url.match(/(?<=\/s\/)(\w+)(?=#)?/g)[0];
        const info = extractQuarkInfo(form.value.url);
        form.value.shorturl = pwdId;
        if(info.password){
          form.value.pwd = info.password;
        }
      }else if(form.value.url.includes("baidu")){
        const { url, pwd } = SubmitLink(form.value.url);
        form.value.shorturl = url;
        if(pwd){
          form.value.pwd = pwd;
        }
        form.value.dir = "1";
        form.value.root = "1";
      }else{
        ElMessage.error("链接错误，目前只支持分享百度和夸克网盘资源");
        return;
      }
      addLoading.value = true;
      addSource(form.value).then((response) => {
        proxy.$modal.msgSuccess('操作成功');
        reset();
        addLoading.value = false;
        open.value = false;
        getList();
      });

    }
  });
}

function handleUpdate(row) {
  open.value = true;
  title.value = "修改信息";
  form.value = {
    name: row.name,
    time:row.time,
    url:row.url,
    id:row.id,
  };

}

function handleDelete(item) {
  const data = {
    idList: item.id,
  };
  deleteSource(data).then((response) => {
    ElMessage.success('删除成功');
    getList();
  });
}


function getList() {
  loading.value = true;
  listSource(queryParams).then((response) => {
    tableList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
getList();

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    url: undefined,
    name: undefined,
  };
  addLoading.value = false;
  proxy.resetForm('postRef');
}

function extractQuarkInfo(text) {
  const urlRegex = /https?:\/\/pan\.quark\.cn\/s\/[a-z0-9]+/i;
  const passwordRegex = /提取码[：:]\s*([a-zA-Z0-9]{4})/;

  const urlMatch = text.match(urlRegex);
  const passwordMatch = text.match(passwordRegex);

  return {
    url: urlMatch ? urlMatch[0] : null,
    password: passwordMatch ? passwordMatch[1] : null
  };
}
</script>

<style scoped lang="scss">
 .app{
   width: 80%;
   margin:auto;
 }
</style>
