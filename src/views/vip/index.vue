<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>

      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <div>
      <span class = "code-down">免费下载次数：</span>
      <el-input v-model="downNum" style="width: 240px" placeholder="请输入下载次数" />
      <el-button style="margin-left: 20px;" @click="setDownLoad"  type="primary">保存</el-button>
    </div>
    <div style="margin-top:20px; ">
      <span class = "code-down">赞助下载次数：</span>
      <el-input v-model="vipDownNum" style="width: 240px" placeholder="请输入下载次数" />
      <el-button style="margin-left: 20px;" @click="setVipDownLoad"  type="primary">保存</el-button>
    </div>


<!--    <span>开启油猴插件稳定下载：</span-->
<!--    ><el-switch @change="startDown" v-model="value1" />-->
<!--    <span>开启PC网页版稳定下载：</span-->
<!--    ><el-switch @change="startPcDown" v-model="pcDown" />-->
    <el-table
      v-loading="loading"
      :data="postList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="vip名字" align="center" prop="name" />
      <!-- <el-table-column label="vipCookie" align="center" prop="cookie" /> -->
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_vip_type" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="解析次数" align="center" prop="count" />
      <el-table-column :show-overflow-tooltip="true" label="错误信息" align="center" prop="errMessage" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
          label="修改时间"
          align="center"
          prop="createTime"
          width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
        align="center"
        class-name="small-padding fixed-width"
      >
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

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
        <!--        <el-form-item label="账号类型" prop="type">-->
        <!--          <el-select v-model="form.type" placeholder="请选择">-->
        <!--            <el-option label="svip账号" value="1" />-->
        <!--            <el-option label="普通账号" value="0" />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item label="vip名字" prop="name">
          <el-input v-model="form.name" placeholder="请输vip名字" />
        </el-form-item>
        <el-form-item label="cookie" prop="cookie">
          <el-input v-model="form.cookie" placeholder="请输入cookie" />
        </el-form-item>
        <el-form-item label="status" prop="status">
          <el-input v-model="form.status" placeholder="0正常1停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Post">
import {
  listVip,
  addPost,
  deleteVip,
  getMessage,
  sendMessage, putPost, pcStableDown, getPcStableDown, getDownLoadNum, setDownLoadNum,
  geVipDownLoadNum,
  setVipDownLoadNum
} from '@/api/system/vip';
import { ElMessage } from 'element-plus';
import {getUser} from "@/api/system/user";
import {userKey} from "@/utils/wp";

const { proxy } = getCurrentInstance();
const { sys_vip_type } = proxy.useDict('sys_vip_type');

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const value1 = ref(false);
const pcDown = ref(false);
const downNum = ref('')
const vipDownNum = ref('')
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
  rules: {
    name: [{ required: true, message: 'name不能为空', trigger: 'blur' }],
    cookie: [{ required: true, message: 'cookie不能为空', trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

function startDown(value) {
  const param = { startDown: value};
  sendMessage(param).then(() => {});
}

function startPcDown(value){
  const param = { startDown: value};
  pcStableDown(param).then(() => {});
}

/** 查询vip列表 */
function getList() {
  loading.value = true;
  listVip(queryParams).then((response) => {
    postList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    cookie: undefined,
    name: undefined,
    status:undefined,
  };
  proxy.resetForm('postRef');
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.postId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '新增vip';
}

function handleUpdate(row) {
    open.value = true;
    title.value = "修改信息";
    form.value = {
      cookie: row.cookie,
      name: row.name,
      status:row.status,
      id:row.id
    };

}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {
    if (valid) {
      if(title.value === "修改信息"){
        putPost(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          reset();
          open.value = false;
          getList();
        });
      }else if(title.value === "新增vip"){
        addPost(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          reset();
          open.value = false;
          getList();
        });
      }

    }
  });
}

function handleDelete(item) {
  const data = {
    idList: item.id,
  };
  deleteVip(data).then((response) => {
    ElMessage.success('删除成功');
    getList();
  });
}

function getMessageStatus() {
  getMessage().then((response) => {
    if ((response.code = 200)) {
      value1.value = response.data;
    }
  });
  getPcStableDown().then((response) => {
    if ((response.code = 200)) {
      pcDown.value = response.data;
    }
  });
}
// getMessageStatus();

function getDownLoad(){
  getDownLoadNum({userKey:userKey}).then(res=>{
    if(res.code === 200){
      downNum.value = res.data;
    }
  })
}
function setDownLoad(){
  const data= {
    downLoadNum:downNum.value,
    userKey:userKey
  }
  setDownLoadNum(data).then(res=>{
    ElMessage.success("设置成功")
  })
}

function getVipDownLoad(){
  geVipDownLoadNum({userKey:userKey}).then(res=>{
    if(res.code === 200){
      vipDownNum.value = res.data;
    }
  })
}
function setVipDownLoad(){
  const data= {
    downLoadNum:vipDownNum.value,
    userKey:userKey
  }
  setVipDownLoadNum(data).then(res=>{
    ElMessage.success("设置成功")
  })
}
getDownLoad();
getVipDownLoad()
getList();
</script>
