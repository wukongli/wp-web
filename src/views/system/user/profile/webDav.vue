<template>
  <div class="ai-page">
    <!-- 背景装饰 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <div class="page-content">
      <div class="top-bar">
        <div class="share-login">
          <el-button
              style="margin: 10px 20px"
              type="success"
              @click="$router.push('/source')"
          >网盘资源</el-button>
          <a href="/webDav/login">
            <el-button
                v-if="!loginData.login"
                style="margin: 10px 0"
                type="primary"
                icon="user"
            >登录</el-button
            ></a>
        </div>
        <div v-if="loginData.login" class="avatar-container">
          <el-dropdown class="right-menu-item hover-effect" trigger="click">
            <div class="avatar-wrapper">
              <img :src="userLogo" class="user-avatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
<!--              <router-link to="/user">-->
<!--                <el-dropdown-item>个人中心</el-dropdown-item>-->
<!--              </router-link>-->
                <el-dropdown-item @click="logout">
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!-- 顶部标题区 -->
      <div class="hero-header">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>AI-Powered</span>
        </div>
        <h1 class="hero-title">
          <el-icon class="hero-icon"><Link /></el-icon>
          网盘生成WebDAV挂载工具
        </h1>
        <p class="hero-desc">
          智能网盘挂载，一键生成WebDAV链接，轻松享受4K观影体验
        </p>
<!--        <div class="platform-tags">-->
<!--          <span class="tag tag-support">夸克网盘已支持</span>-->
<!--          <span class="tag tag-unsupport">百度网盘正在接入</span>-->
<!--        </div>-->
      </div>

      <!-- 主内容卡片 -->
      <el-row :gutter="20" justify="center">
        <el-col :span="20" :xs="24">
          <div class="ai-card">
            <el-tabs v-model="activeTab" class="ai-tabs">
              <el-tab-pane label="夸克网盘webDav" name="openDav">
                <openDav />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup name="Profile">
import userAvatar from './userAvatar';
import userInfo from './userInfo';
import resetPwd from './resetPwd';
import { ElMessageBox } from 'element-plus';
import openDav from './openDav.vue';
import { getUserProfile } from '@/api/system/user';
import moment from 'moment';
import useUserStore from '@/store/modules/user';
const userStore = useUserStore();
import userLogo from "@/assets/logo/img.png";
import {getToken} from "@/utils/auth";
const loginData = reactive({ login: false });
const activeTab = ref('openDav');
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {},
});

function logout() {
  ElMessageBox.confirm('确定退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        userStore.logOut().then(() => {
          localStorage.removeItem('role');
          location.href = '/webDav';
        });
      })
      .catch(() => {});
}

function getUser() {
  // getUserProfile().then(response => {
  //   state.user = response.data;
  //   state.roleGroup = response.roleGroup;
  //   state.postGroup = response.postGroup;
  // });
}

function getLogin() {
  if (getToken()) {
    loginData.login = true;
  } else {
    loginData.login = false;
  }
}
getLogin();
getUser();
</script>

<style scoped>
/* ===== 页面容器 ===== */
.ai-page {
  position: relative;
  min-height: 100vh;
  background: #f0f4f8;
  overflow-x: hidden;

    .top-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 10px;
    }

    .share-login {
      margin-bottom: 0;
    }

    .avatar-container {
      display: flex;
      align-items: center;

      .avatar-wrapper {
        position: relative;
        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
}

/* ===== 网格背景 ===== */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(56, 189, 248, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

/* ===== 光晕装饰 ===== */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}
.bg-glow-1 {
  width: 500px;
  height: 500px;
  top: -120px;
  right: -80px;
  background: radial-gradient(
    circle,
    rgba(56, 189, 248, 0.12),
    transparent 70%
  );
}
.bg-glow-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -60px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.08),
    transparent 70%
  );
}

/* ===== 登录按钮 ===== */
.share-login {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

/* ===== 内容区 ===== */
.page-content {
  position: relative;
  z-index: 1;
  padding: 40px 20px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== Hero 标题区 ===== */
.hero-header {
  text-align: center;
  margin-bottom: 40px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #0284c7;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}
.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px #38bdf8;
  }
  50% {
    opacity: 0.5;
    box-shadow: 0 0 16px #38bdf8;
  }
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 14px;
  background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-icon {
  font-size: 34px;
  color: #38bdf8;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5));
  -webkit-text-fill-color: #38bdf8;
}

.hero-desc {
  color: #64748b;
  font-size: 15px;
  margin: 0 0 14px;
  letter-spacing: 0.3px;
}

/* ===== 平台标签 ===== */
.platform-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.tag-support {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.08);
  border: 1px solid rgba(22, 163, 74, 0.25);
}
.tag-unsupport {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* ===== AI 卡片 ===== */
.ai-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 16px;
  padding: 28px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.06), 0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.ai-card:hover {
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.12), 0 4px 32px rgba(0, 0, 0, 0.1),
    0 0 30px rgba(56, 189, 248, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* ===== Tabs 深色适配 ===== */
:deep(.ai-tabs) {
  --el-tabs-header-height: 48px;
}
:deep(.ai-tabs .el-tabs__header) {
  margin-bottom: 20px;
}
:deep(.ai-tabs .el-tabs__nav-wrap::after) {
  background-color: rgba(56, 189, 248, 0.15) !important;
}
:deep(.ai-tabs .el-tabs__item) {
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s;
}
:deep(.ai-tabs .el-tabs__item:hover) {
  color: #38bdf8;
}
:deep(.ai-tabs .el-tabs__item.is-active) {
  color: #38bdf8;
}
:deep(.ai-tabs .el-tabs__active-bar) {
  background-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}
</style>
