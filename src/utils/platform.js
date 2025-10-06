// utils/deviceDetector.js

/**
 * 设备检测工具类
 */
class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
        this.platform = navigator.platform.toLowerCase();
        this.vendor = navigator.vendor.toLowerCase();
    }

    /**
     * 检测 Windows 系统
     */
    isWindows() {
        return this.userAgent.includes('windows') ||
            this.platform.includes('win') ||
            /win\d{2}/i.test(this.platform);
    }

    /**
     * 检测 macOS 系统
     */
    isMac() {
        return this.userAgent.includes('mac') ||
            this.platform.includes('mac') ||
            this.userAgent.includes('os x');
    }

    /**
     * 检测 iOS 系统 (iPhone, iPad, iPod)
     */
    isIOS() {
        return /iphone|ipad|ipod/.test(this.userAgent) ||
            (this.userAgent.includes('mac') && 'ontouchend' in document);
    }

    /**
     * 检测 Android 系统
     */
    isAndroid() {
        return this.userAgent.includes('android');
    }

    /**
     * 检测 Linux 系统
     */
    isLinux() {
        return this.userAgent.includes('linux') &&
            !this.isAndroid() &&
            !this.userAgent.includes('android');
    }

    /**
     * 检测 Chrome 浏览器
     */
    isChrome() {
        return /chrome|chromium/.test(this.userAgent) &&
            !/edge|edg/.test(this.userAgent);
    }

    /**
     * 检测 Firefox 浏览器
     */
    isFirefox() {
        return this.userAgent.includes('firefox');
    }

    /**
     * 检测 Safari 浏览器
     */
    isSafari() {
        return /safari/.test(this.userAgent) &&
            !/chrome|chromium/.test(this.userAgent);
    }

    /**
     * 检测 Edge 浏览器
     */
    isEdge() {
        return /edge|edg/.test(this.userAgent);
    }

    /**
     * 获取操作系统详细信息
     */
    getOS() {
        if (this.isWindows()) {
            return this.getWindowsVersion();
        } else if (this.isMac()) {
            return this.getMacVersion();
        } else if (this.isIOS()) {
            return this.getIOSVersion();
        } else if (this.isAndroid()) {
            return this.getAndroidVersion();
        } else if (this.isLinux()) {
            return 'linux';
        } else {
            return 'unknown';
        }
    }

    /**
     * 获取 Windows 版本
     */
    getWindowsVersion() {
        const ua = this.userAgent;

        if (ua.includes('windows nt 10.0')) return 'windows_10';
        if (ua.includes('windows nt 6.3')) return 'windows_8.1';
        if (ua.includes('windows nt 6.2')) return 'windows_8';
        if (ua.includes('windows nt 6.1')) return 'windows_7';
        if (ua.includes('windows nt 6.0')) return 'windows_vista';
        if (ua.includes('windows nt 5.1')) return 'windows_xp';
        if (ua.includes('windows nt 5.0')) return 'windows_2000';

        return 'windows';
    }

    /**
     * 获取 macOS 版本
     */
    getMacVersion() {
        const ua = this.userAgent;
        const match = ua.match(/mac os x (\d+[._]\d+([._]\d+)?)/);

        if (match && match[1]) {
            const version = match[1].replace(/_/g, '.');
            return `macos_${version}`;
        }

        return 'macos';
    }

    /**
     * 获取 iOS 版本
     */
    getIOSVersion() {
        const ua = this.userAgent;
        const match = ua.match(/os (\d+[._]\d+([._]\d+)?) like mac os x/);

        if (match && match[1]) {
            const version = match[1].replace(/_/g, '.');
            return `ios_${version}`;
        }

        return 'ios';
    }

    /**
     * 获取 Android 版本
     */
    getAndroidVersion() {
        const ua = this.userAgent;
        const match = ua.match(/android (\d+[._]\d+([._]\d+)?)/);

        if (match && match[1]) {
            const version = match[1].replace(/_/g, '.');
            return `android_${version}`;
        }

        return 'android';
    }

    /**
     * 获取设备类型
     */
    getDeviceType() {
        if (this.isMobile()) {
            return 'mobile';
        } else if (this.isTablet()) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * 检测移动设备
     */
    isMobile() {
        return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent) &&
            !this.isTablet();
    }

    /**
     * 检测平板设备
     */
    isTablet() {
        return /ipad|tablet|playbook|silk/i.test(this.userAgent) ||
            (this.userAgent.includes('android') && !this.userAgent.includes('mobile')) ||
            (this.userAgent.includes('mac') && 'ontouchend' in document);
    }

    /**
     * 检测桌面设备
     */
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    }

    /**
     * 获取浏览器信息
     */
    getBrowser() {
        if (this.isChrome()) return 'chrome';
        if (this.isFirefox()) return 'firefox';
        if (this.isSafari()) return 'safari';
        if (this.isEdge()) return 'edge';
        return 'unknown';
    }

    /**
     * 获取完整设备信息
     */
    getDeviceInfo() {
        return {
            os: this.getOS(),
            browser: this.getBrowser(),
            deviceType: this.getDeviceType(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor,
            language: navigator.language,
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }
}

// 创建单例实例
const deviceDetector = new DeviceDetector();

export default deviceDetector;