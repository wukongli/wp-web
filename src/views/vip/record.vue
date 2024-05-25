<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:post:add']"
        >新增</el-button
        >
      </el-col>

      <right-toolbar
          v-model:showSearch="showSearch"
          @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table
        style="margin-top: 20px;"
        v-loading="loading"
        :data="postList"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :show-overflow-tooltip="true" label="文件名称" align="center" prop="fileName" >
      </el-table-column>
       <el-table-column label="文件大小" align="center" prop="fileSize" />
       <el-table-column label="用户名" align="center" prop="userName" />
      <el-table-column label="下载时间" align="center" prop="createTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
        <el-form-item label="cookie" prop="cookie">
          <el-input v-model="form.cookie" placeholder="请输入普通cookie" />
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
import {getDownLoadRecord} from '@/api/system/vip';
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
  rules: {
    cookie: [{ required: true, message: 'cookie不能为空', trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询vip列表 */
function getList() {
  loading.value = true;
  getDownLoadRecord(data.queryParams).then((response) => {
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
  title.value = '新增普通cookie';
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {
    if (valid) {
      addCommonCookie(form.value).then((response) => {
        proxy.$modal.msgSuccess('新增成功');
        open.value = false;
        getList();
      });
    }
  });
}
getList();
</script>
<style scoped lang="scss">
.code-down{
  font-weight: bold;
}
</style>
