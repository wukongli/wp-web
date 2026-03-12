<template>
  <div v-if="isVisible" class="site-announcement-overlay">
    <div class="site-announcement-popup">
      <div class="announcement-header">
        <h3>站内公告</h3>
        <button @click="closeAnnouncement" class="close-btn">&times;</button>
      </div>
      <div class="announcement-content">
        <p>{{ announcementText }}</p>
      </div>
      <div class="announcement-actions">
        <button @click="closeAnnouncement" class="confirm-btn">知道了</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiteAnnouncement',
  data() {
    return {
      isVisible: false,
      announcementText:
        '站内资源均支持安卓、Ios、Ipad、TV端播放、想体验的加Q:254750646',
    };
  },
  methods: {
    showAnnouncement() {
      this.isVisible = true;
    },
    closeAnnouncement() {
      this.isVisible = false;
      // 可选：记录用户已读此公告，避免重复弹出
      sessionStorage.setItem('announcement-read', new Date().toISOString());
    },
    checkAnnouncementVisibility() {
      // 可以根据需要添加更复杂的显示逻辑
      const lastRead = sessionStorage.getItem('announcement-read');
      if (!lastRead) {
        this.showAnnouncement();
      }
    },
  },
  mounted() {
    this.checkAnnouncementVisibility();
  },
};
</script>

<style scoped>
.site-announcement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.site-announcement-popup {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.announcement-content {
  margin: 15px 0;
  text-align: center;
}

.announcement-actions {
  display: flex;
  justify-content: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.confirm-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
