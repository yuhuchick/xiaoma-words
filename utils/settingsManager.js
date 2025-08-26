class SettingsManager {
	constructor() {
		this.storageKey = 'appSettings'
		this.settings = {
			// 每日目标新学习单词数
			dailyNewWordsTarget: 20,
			// 超额时是否允许继续学习（可用于家长或严格模式）
			allowExceed: true
		}
	}
	
	init() {
		try {
			const raw = uni.getStorageSync(this.storageKey)
			if (raw) {
				const parsed = JSON.parse(raw)
				this.settings = { ...this.settings, ...parsed }
			}
		} catch (e) {
			// ignore and keep defaults
		}
	}
	
	save() {
		try {
			uni.setStorageSync(this.storageKey, JSON.stringify(this.settings))
		} catch (e) {}
	}
	
	getSettings() {
		return { ...this.settings }
	}
	
	setDailyNewWordsTarget(value) {
		const num = parseInt(value)
		if (!Number.isFinite(num) || num <= 0) {
			throw new Error('目标必须是正整数')
		}
		this.settings.dailyNewWordsTarget = num
		this.save()
	}
	
	setAllowExceed(flag) {
		this.settings.allowExceed = !!flag
		this.save()
	}
}

export default new SettingsManager()
