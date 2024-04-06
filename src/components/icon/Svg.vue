<template>
  <svg :class="svgClass" :style="{ width: width, height: height }" aria-hidden="true">
    <use :xlink:href="iconClassName" :fill="color" />
  </svg>
</template>


<script setup>
import { computed } from 'vue'
const props = defineProps({
  iconName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#409eff'
  },
  width: {
    type: String,
    default: '40px'
  },
  height: {
    type: String,
    default: '40px'
  }
})
// 图标在 iconfont 中的名字
const iconClassName = computed(() => {
  return `#${props.iconName}`
})
// 给图标添加上类名
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return 'svg-icon'
});
</script>

<style scoped>
    .svg-icon {
      /* v-bind 是 Vue3 才支持的功能，可以将 CSS 的值与 js 的值绑定 */
      //position: relative;
      fill: currentColor;
      //vertical-align: -2px;
    }
</style>

