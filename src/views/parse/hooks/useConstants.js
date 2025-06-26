/**
 * 设备类型常量
 */
export const DEVICE_TYPES = {
    AC: 2,        // 空调
    LIGHT: 1,     // 照明
    DOOR: 51,     // 门禁
    AIR_FLOW: 4   // 新风
  }
  
  /**
   * 应用类型常量
   */
  export const GROUP_APPLICATION = {
    PAD: 2  // Pad端
  }
  
  /**
   * 设备状态常量
   */
  export const DEVICE_STATUS = {
    RUNNING: 1,   // 运行中
    STOPPED: 2    // 停止
  }
  
  /**
   * 门禁状态常量
   */
  export const GATE_STATUS = {
    NORMAL: 3,    // 正常
    ALWAYS_OPEN: 1 // 常开
  }
  
  /**
   * 主题模式常量
   */
  export const THEME_MODES = {
    LIGHT: 'light',
    DARK: 'dark'
  }
  
  /**
   * 定时器配置(毫秒)
   */
  export const TIMER_CONFIG = {
    REFRESH_INTERVAL: 3000  // 刷新间隔
  } 
  
  /**
   * 设备模式常量
   */
  export const DEVICE_MODES = {
    VIP: 'vip',
    WORK: 'work',
    REST: 'rest'
  }
  
  /**
   * 模式图标配置
   */
  export const MODE_ICONS = {
    [DEVICE_MODES.VIP]: {
      icon: 'guibin',
      color: '#faad14'
    },
    [DEVICE_MODES.WORK]: {
      icon: 'bangong',
      color: '#1890ff'
    },
    [DEVICE_MODES.REST]: {
      icon: 'wuxiu',
      color: '#66c934'
    }
  }
  
  /**
   * 模式名称配置
   */
  export const MODE_LABELS = {
    [DEVICE_MODES.VIP]: '贵宾模式',
    [DEVICE_MODES.WORK]: '办公模式',
    [DEVICE_MODES.REST]: '午休模式'
  }
  
  /**
   * 工具栏颜色配置
   */
  export const TOOLBAR_COLORS = {
    LIGHT: {
      FULLSCREEN: '#1890ff',
      OLD_VIEW: '#262626',
      THEME_ICON: '#faad14'
    },
    DARK: {
      FULLSCREEN: '#faad14',
      OLD_VIEW: '#66c934',
      THEME_ICON: '#1890ff'
    }
  }