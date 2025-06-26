import { ref, onMounted, onUnmounted } from 'vue'
import { THEME_MODES, TOOLBAR_COLORS } from './useConstants'

/**
 * 主题管理组合式函数
 * @returns {Object} 主题相关状态和方法
 */
export function useTheme() {
	// 主题状态
	const isLightTheme = ref(false)

	// 主题变化事件处理函数
	const handleThemeChange = e => {
		isLightTheme.value = e.detail.theme === THEME_MODES.LIGHT
	}

	// 初始化主题
	const initTheme = () => {
		const savedTheme = localStorage.getItem('pad-theme-mode')
		isLightTheme.value = savedTheme === THEME_MODES.LIGHT
		if (isLightTheme.value) {
			setTheme(THEME_MODES.LIGHT)
		} else {
			setTheme(THEME_MODES.DARK)
		}
		// 监听自定义主题变化事件
		window.addEventListener('pad-theme-change', handleThemeChange)
	}

	// 设置主题
	const setTheme = theme => {
		const isLight = theme === THEME_MODES.LIGHT
		isLightTheme.value = isLight
		localStorage.setItem('pad-theme-mode', isLight ? THEME_MODES.LIGHT : THEME_MODES.DARK)

		// 应用主题到DOM
		const root = document.documentElement
		if (isLight) {
			root.setAttribute('data-theme', THEME_MODES.LIGHT)
		} else {
			root.removeAttribute('data-theme')
		}

		// 发送自定义事件
		window.dispatchEvent(
			new CustomEvent('pad-theme-change', {
				detail: { theme: isLight ? THEME_MODES.LIGHT : THEME_MODES.DARK }
			})
		)
	}

	// 切换主题
	const toggleTheme = () => {
		const newTheme = isLightTheme.value ? THEME_MODES.DARK : THEME_MODES.LIGHT
		setTheme(newTheme)
		return newTheme
	}

	// 获取图标颜色
	const getThemeColor = (lightColor, darkColor) => {
		return isLightTheme.value ? lightColor : darkColor
	}

	// 获取工具栏图标颜色
	const getToolbarColor = colorKey => {
		const themeColors = isLightTheme.value ? TOOLBAR_COLORS.LIGHT : TOOLBAR_COLORS.DARK
		return themeColors[colorKey]
	}

	// 生命周期钩子
	onMounted(() => {
		initTheme()
	})

	// 组件卸载时移除事件监听
	onUnmounted(() => {
		window.removeEventListener('pad-theme-change', handleThemeChange)
	})

	return {
		isLightTheme,
		initTheme,
		setTheme,
		toggleTheme,
		getThemeColor,
		getToolbarColor
	}
}
