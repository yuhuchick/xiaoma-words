/**
 * 单词数据管理工具类
 * 负责单词数据的加载、更新、查询等功能
 */
class WordManager {
	constructor() {
		this.wordsData = null
		this.userStudyData = null
		this.currentSession = null
	}

	/**
	 * 初始化数据管理器
	 */
	async init() {
		try {
			// 加载单词数据
			const wordsResponse = await uni.request({
				url: '/static/data/words.json',
				method: 'GET'
			})
			this.wordsData = wordsResponse.data

			// 加载用户学习数据
			const userStudyResponse = await uni.request({
				url: '/static/data/user-study.json',
				method: 'GET'
			})
			this.userStudyData = userStudyResponse.data

			console.log('数据加载成功')
			return true
		} catch (error) {
			console.error('数据加载失败:', error)
			return false
		}
	}

	/**
	 * 获取所有单词分类
	 */
	getCategories() {
		return this.wordsData?.categories || []
	}

	/**
	 * 根据分类获取单词列表
	 */
	getWordsByCategory(categoryId) {
		if (!this.wordsData?.words) return []
		
		if (categoryId === 'all') {
			return this.wordsData.words
		}
		
		return this.wordsData.words.filter(word => word.category === categoryId)
	}

	/**
	 * 根据ID获取单词详情
	 */
	getWordById(wordId) {
		return this.wordsData?.words?.find(word => word.id === wordId) || null
	}

	/**
	 * 获取用户学习进度
	 */
	getUserProgress() {
		return this.userStudyData?.studyStats || {}
	}

	/**
	 * 获取单词学习进度
	 */
	getWordProgress(wordId) {
		return this.userStudyData?.wordProgress?.[wordId] || null
	}

	/**
	 * 获取今日需要复习的单词
	 */
	getTodayReviewWords() {
		const today = new Date().toISOString().split('T')[0]
		const reviewWords = []
		
		Object.values(this.userStudyData?.wordProgress || {}).forEach(progress => {
			if (progress.nextReviewDate === today) {
				const wordData = this.getWordById(progress.wordId)
				if (wordData) {
					reviewWords.push({
						...wordData,
						progress: progress
					})
				}
			}
		})
		
		return reviewWords
	}

	/**
	 * 获取新单词列表（未学习过的）
	 */
	getNewWords(categoryId = 'all', limit = 10) {
		const categoryWords = this.getWordsByCategory(categoryId)
		const newWords = []
		
		for (const word of categoryWords) {
			const progress = this.getWordProgress(word.id)
			if (!progress || progress.masteryLevel === 0) {
				newWords.push(word)
				if (newWords.length >= limit) break
			}
		}
		
		return newWords
	}

	/**
	 * 更新单词学习进度
	 */
	updateWordProgress(wordId, result, studyType = 'review') {
		if (!this.userStudyData?.wordProgress) {
			this.userStudyData.wordProgress = {}
		}

		const today = new Date().toISOString().split('T')[0]
		const progress = this.userStudyData.wordProgress[wordId] || {
			wordId: wordId,
			masteryLevel: 0,
			reviewCount: 0,
			accuracy: 0,
			studyHistory: []
		}

		// 更新学习历史
		progress.studyHistory.push({
			date: today,
			type: studyType,
			result: result,
			timeSpent: 30 // 默认30秒
		})

		// 更新掌握等级
		if (result === 'correct') {
			if (studyType === 'new') {
				progress.masteryLevel = Math.min(progress.masteryLevel + 1, 3)
			} else {
				progress.masteryLevel = Math.min(progress.masteryLevel + 0.5, 3)
			}
		} else {
			progress.masteryLevel = Math.max(progress.masteryLevel - 0.5, 0)
		}

		// 更新复习次数
		progress.reviewCount++
		progress.lastReviewDate = today

		// 计算下次复习日期（间隔复习算法）
		const intervals = [1, 3, 7, 14, 30, 90] // 复习间隔（天）
		const intervalIndex = Math.min(progress.reviewCount - 1, intervals.length - 1)
		const nextReviewDays = intervals[intervalIndex]
		
		const nextReviewDate = new Date()
		nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays)
		progress.nextReviewDate = nextReviewDate.toISOString().split('T')[0]

		// 计算准确率
		const recentHistory = progress.studyHistory.slice(-10) // 最近10次
		const correctCount = recentHistory.filter(h => h.result === 'correct').length
		progress.accuracy = recentHistory.length > 0 ? correctCount / recentHistory.length : 0

		this.userStudyData.wordProgress[wordId] = progress
		
		// 保存到本地存储
		this.saveUserStudyData()
		
		return progress
	}

	/**
	 * 开始学习会话
	 */
	startStudySession(category = 'all') {
		this.currentSession = {
			id: 'session_' + Date.now(),
			date: new Date().toISOString().split('T')[0],
			startTime: new Date().toLocaleTimeString(),
			category: category,
			wordsStudied: 0,
			newWords: 0,
			reviewWords: 0,
			correctAnswers: 0,
			totalAnswers: 0
		}
	}

	/**
	 * 结束学习会话
	 */
	endStudySession() {
		if (!this.currentSession) return null

		this.currentSession.endTime = new Date().toLocaleTimeString()
		this.currentSession.duration = this.calculateSessionDuration()
		this.currentSession.accuracy = this.currentSession.totalAnswers > 0 
			? this.currentSession.correctAnswers / this.currentSession.totalAnswers 
			: 0

		// 保存会话记录
		if (!this.userStudyData.studySessions) {
			this.userStudyData.studySessions = []
		}
		this.userStudyData.studySessions.unshift(this.currentSession)

		// 更新用户统计
		this.updateUserStats()

		const session = this.currentSession
		this.currentSession = null
		
		// 保存数据
		this.saveUserStudyData()
		
		return session
	}

	/**
	 * 记录学习结果
	 */
	recordStudyResult(wordId, result, studyType = 'review') {
		// 更新单词进度
		this.updateWordProgress(wordId, result, studyType)

		// 更新会话统计
		if (this.currentSession) {
			this.currentSession.wordsStudied++
			this.currentSession.totalAnswers++
			
			if (result === 'correct') {
				this.currentSession.correctAnswers++
			}
			
			if (studyType === 'new') {
				this.currentSession.newWords++
			} else {
				this.currentSession.reviewWords++
			}
		}
	}

	/**
	 * 计算会话时长
	 */
	calculateSessionDuration() {
		if (!this.currentSession?.startTime) return 0
		
		const start = new Date(`2000-01-01 ${this.currentSession.startTime}`)
		const end = new Date(`2000-01-01 ${this.currentSession.endTime}`)
		return Math.round((end - start) / 1000 / 60) // 返回分钟数
	}

	/**
	 * 更新用户统计
	 */
	updateUserStats() {
		if (!this.userStudyData.studyStats) {
			this.userStudyData.studyStats = {}
		}

		const stats = this.userStudyData.studyStats
		stats.totalStudyTime += this.currentSession.duration || 0
		stats.lastStudyDate = new Date().toISOString().split('T')[0]

		// 更新连续学习天数
		const today = new Date().toISOString().split('T')[0]
		const lastStudyDate = stats.lastStudyDate
		
		if (lastStudyDate) {
			const lastDate = new Date(lastStudyDate)
			const todayDate = new Date(today)
			const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))
			
			if (diffDays === 1) {
				stats.currentStreak = (stats.currentStreak || 0) + 1
			} else if (diffDays > 1) {
				stats.currentStreak = 1
			}
			
			if (stats.currentStreak > (stats.longestStreak || 0)) {
				stats.longestStreak = stats.currentStreak
			}
		}
	}

	/**
	 * 获取学习建议
	 */
	getStudyRecommendations() {
		const recommendations = []
		
		// 检查今日目标完成情况
		const dailyGoals = this.userStudyData.dailyGoals
		const currentDay = dailyGoals.currentDay
		
		if (currentDay.newWords < dailyGoals.newWords) {
			recommendations.push({
				type: 'new_words',
				message: `今日还需学习${dailyGoals.newWords - currentDay.newWords}个新单词`,
				priority: 'high'
			})
		}
		
		if (currentDay.reviewWords < dailyGoals.reviewWords) {
			recommendations.push({
				type: 'review_words',
				message: `今日还需复习${dailyGoals.reviewWords - currentDay.reviewWords}个单词`,
				priority: 'medium'
			})
		}
		
		// 检查需要复习的单词
		const reviewWords = this.getTodayReviewWords()
		if (reviewWords.length > 0) {
			recommendations.push({
				type: 'scheduled_review',
				message: `有${reviewWords.length}个单词需要复习`,
				priority: 'high',
				data: reviewWords
			})
		}
		
		return recommendations
	}

	/**
	 * 保存用户学习数据到本地存储
	 */
	saveUserStudyData() {
		try {
			uni.setStorageSync('userStudyData', JSON.stringify(this.userStudyData))
		} catch (error) {
			console.error('保存用户数据失败:', error)
		}
	}

	/**
	 * 从本地存储加载用户学习数据
	 */
	loadUserStudyDataFromStorage() {
		try {
			const data = uni.getStorageSync('userStudyData')
			if (data) {
				this.userStudyData = JSON.parse(data)
			}
		} catch (error) {
			console.error('加载用户数据失败:', error)
		}
	}

	/**
	 * 搜索单词
	 */
	searchWords(keyword) {
		if (!this.wordsData?.words) return []
		
		const results = []
		const lowerKeyword = keyword.toLowerCase()
		
		this.wordsData.words.forEach(word => {
			if (word.word.toLowerCase().includes(lowerKeyword) ||
				word.translations.some(t => t.meaning.includes(keyword)) ||
				word.tags.some(tag => tag.includes(keyword))) {
				results.push(word)
			}
		})
		
		return results
	}

	/**
	 * 获取难度分布统计
	 */
	getDifficultyStats() {
		const stats = { 1: 0, 2: 0, 3: 0 }
		
		this.wordsData?.words?.forEach(word => {
			stats[word.difficulty] = (stats[word.difficulty] || 0) + 1
		})
		
		return stats
	}

	/**
	 * 获取分类统计
	 */
	getCategoryStats() {
		const stats = {}
		
		this.wordsData?.words?.forEach(word => {
			stats[word.category] = (stats[word.category] || 0) + 1
		})
		
		return stats
	}
}

// 创建单例实例
const wordManager = new WordManager()

export default wordManager
