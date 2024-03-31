<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});
</script>
<style>
/* 全局设置 element ui dialog水平垂直居中 */
.el-dialog {
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  margin: 0px !important;
}
</style>
