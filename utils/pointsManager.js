/**
 * 积分管理工具类
 * 负责用户积分、签到、抽奖等功能
 */
class PointsManager {
	constructor() {
		this.userPointsData = null
		this.checkInData = null
	}

	/**
	 * 初始化积分管理器
	 */
	async init() {
		try {
			// 从本地存储加载数据
			this.loadFromStorage()
			
			// 如果没有数据，初始化默认数据
			if (!this.userPointsData) {
				this.userPointsData = {
					totalPoints: 0,
					earnedPoints: 0,
					usedPoints: 0,
					checkInStreak: 0,
					longestStreak: 0,
					lastCheckInDate: null,
					checkInHistory: [],
					pointsHistory: []
				}
			}
			
			if (!this.checkInData) {
				this.checkInData = {
					monthlyCheckIns: {},
					yearlyStats: {}
				}
			}
			
			console.log('积分管理器初始化成功')
			return true
		} catch (error) {
			console.error('积分管理器初始化失败:', error)
			return false
		}
	}

	/**
	 * 获取用户积分信息
	 */
	getUserPoints() {
		return this.userPointsData || {
			totalPoints: 0,
			earnedPoints: 0,
			usedPoints: 0,
			checkInStreak: 0,
			longestStreak: 0
		}
	}

	/**
	 * 获取今日是否已签到
	 */
	isTodayCheckedIn() {
		if (!this.userPointsData?.lastCheckInDate) return false
		
		const today = new Date().toISOString().split('T')[0]
		return this.userPointsData.lastCheckInDate === today
	}

	/**
	 * 执行签到
	 */
	checkIn() {
		const today = new Date().toISOString().split('T')[0]
		
		// 检查是否已经签到
		if (this.isTodayCheckedIn()) {
			return {
				success: false,
				message: '今日已签到',
				points: 0
			}
		}

		// 生成随机积分 (10-50分)
		const points = Math.floor(Math.random() * 41) + 100
		
		// 计算连续签到天数
		let streak = 1
		if (this.userPointsData.lastCheckInDate) {
			const lastDate = new Date(this.userPointsData.lastCheckInDate)
			const todayDate = new Date(today)
			const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))
			
			if (diffDays === 1) {
				streak = this.userPointsData.checkInStreak + 1
			}
		}

		// 更新积分数据
		this.userPointsData.totalPoints += points
		this.userPointsData.earnedPoints += points
		this.userPointsData.checkInStreak = streak
		this.userPointsData.lastCheckInDate = today
		
		// 更新最长连续签到记录
		if (streak > this.userPointsData.longestStreak) {
			this.userPointsData.longestStreak = streak
		}

		// 记录签到历史
		this.userPointsData.checkInHistory.push({
			date: today,
			points: points,
			streak: streak
		})

		// 记录积分历史
		this.userPointsData.pointsHistory.push({
			date: today,
			type: 'checkin',
			points: points,
			description: '每日签到'
		})

		// 更新月度签到数据
		const month = today.substring(0, 7) // YYYY-MM
		if (!this.checkInData.monthlyCheckIns[month]) {
			this.checkInData.monthlyCheckIns[month] = []
		}
		this.checkInData.monthlyCheckIns[month].push(today)

		// 保存数据
		this.saveToStorage()

		return {
			success: true,
			message: `签到成功！获得${points}积分`,
			points: points,
			streak: streak,
			totalPoints: this.userPointsData.totalPoints
		}
	}

	/**
	 * 获取月度签到数据
	 */
	getMonthlyCheckIns(year, month) {
		const monthKey = `${year}-${month.toString().padStart(2, '0')}`
		return this.checkInData.monthlyCheckIns[monthKey] || []
	}

	/**
	 * 获取签到统计
	 */
	getCheckInStats() {
		return {
			currentStreak: this.userPointsData.checkInStreak,
			longestStreak: this.userPointsData.longestStreak,
			totalCheckIns: this.userPointsData.checkInHistory.length,
			totalPoints: this.userPointsData.totalPoints
		}
	}

	/**
	 * 使用积分
	 */
	usePoints(points, reason) {
		if (this.userPointsData.totalPoints < points) {
			return {
				success: false,
				message: '积分不足'
			}
		}

		this.userPointsData.totalPoints -= points
		this.userPointsData.usedPoints += points

		// 记录积分使用历史
		this.userPointsData.pointsHistory.push({
			date: new Date().toISOString().split('T')[0],
			type: 'use',
			points: -points,
			description: reason
		})

		this.saveToStorage()

		return {
			success: true,
			message: `成功使用${points}积分`,
			remainingPoints: this.userPointsData.totalPoints
		}
	}

	/**
	 * 获取积分历史
	 */
	getPointsHistory(limit = 20) {
		return this.userPointsData.pointsHistory.slice(-limit).reverse()
	}

	/**
	 * 保存数据到本地存储
	 */
	saveToStorage() {
		try {
			uni.setStorageSync('userPointsData', JSON.stringify(this.userPointsData))
			uni.setStorageSync('checkInData', JSON.stringify(this.checkInData))
		} catch (error) {
			console.error('保存积分数据失败:', error)
		}
	}

	/**
	 * 从本地存储加载数据
	 */
	loadFromStorage() {
		try {
			const pointsData = uni.getStorageSync('userPointsData')
			if (pointsData) {
				this.userPointsData = JSON.parse(pointsData)
			}

			const checkInData = uni.getStorageSync('checkInData')
			if (checkInData) {
				this.checkInData = JSON.parse(checkInData)
			}
		} catch (error) {
			console.error('加载积分数据失败:', error)
		}
	}

	/**
	 * 重置积分数据（用于测试）
	 */
	resetData() {
		this.userPointsData = {
			totalPoints: 0,
			earnedPoints: 0,
			usedPoints: 0,
			checkInStreak: 0,
			longestStreak: 0,
			lastCheckInDate: null,
			checkInHistory: [],
			pointsHistory: []
		}
		this.checkInData = {
			monthlyCheckIns: {},
			yearlyStats: {}
		}
		this.saveToStorage()
	}
}

// 创建单例实例
const pointsManager = new PointsManager()

export default pointsManager
