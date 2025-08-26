<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部导航 -->
		<view class="header">
			<view class="header-content">
				<view class="back-button" @click="goBack">
					<text class="back-icon">←</text>
				</view>
				<text class="title">{{ pageTitle }}</text>
				<view class="progress-info">
					<text class="progress-text">进度</text>
					<text class="progress-number">{{ currentIndex }}/{{ totalWords }}</text>
				</view>
			</view>
		</view>
		
		<!-- 学习模式选择 -->
		<view class="study-mode" v-if="!currentWord && !autoStart">
			<view class="mode-title">
				<text>选择学习模式</text>
			</view>
			<view class="mode-options">
				<view class="mode-card" @click="startNewWordsStudy">
					<view class="mode-icon">📚</view>
					<text class="mode-name">新单词学习</text>
					<text class="mode-desc">学习新单词</text>
					<text class="mode-count">{{ newWordsCount }}个待学习</text>
				</view>
				<view class="mode-card" @click="startReviewStudy">
					<view class="mode-icon">🔄</view>
					<text class="mode-name">单词复习</text>
					<text class="mode-desc">复习已学单词</text>
					<text class="mode-count">{{ reviewWordsCount }}个待复习</text>
				</view>
			</view>
		</view>
		
		<!-- 单词卡片 -->
		<view class="word-card" v-if="currentWord">
			<view class="word-content">
				<text class="word">{{ currentWord.word }}</text>
				<text class="phonetic">{{ currentWord.phonetic }}</text>
				<view class="speaker-button" @click="playPronunciation">
					<text class="speaker-icon">🔊</text>
				</view>
			</view>
			
			<!-- 中文意思（点击认识后显示） -->
			<view class="meaning-section" v-if="showMeaning">
				<view class="meaning-card">
					<text class="meaning-title">📖 中文意思</text>
					<view class="meaning-content">
						<text class="meaning-text" v-for="(translation, index) in currentWord.translation" :key="index">
							{{ translation }}
						</text>
					</view>
					<view class="example-section" v-if="currentWord.detail && currentWord.detail.examples">
						<text class="example-title">💡 例句</text>
						<text class="example-text" v-for="(example, index) in currentWord.detail.examples" :key="index">
							{{ example }}
						</text>
					</view>
				</view>
			</view>
			
			<!-- 难度指示器 -->
			<view class="difficulty-indicator">
				<view 
					v-for="i in 5" 
					:key="i"
					:class="['difficulty-dot', { active: i <= currentWord.collins }]"
				></view>
			</view>
		</view>
		
		<!-- 操作按钮 -->
		<view class="action-buttons" v-if="currentWord">
			<view class="button unknown" @click="markAsUnknown" v-if="!showMeaning">
				<text>不认识</text>
			</view>
			<view class="button known" @click="markAsKnown" v-if="!showMeaning">
				<text>认识</text>
			</view>
			<view class="button next" @click="nextWord" v-if="showMeaning">
				<text>下一个单词</text>
			</view>
			<view class="button details" @click="viewDetails">
				<text>查看详情</text>
			</view>
		</view>
		
		<!-- 学习统计 -->
		<view class="study-stats" v-if="currentSession">
			<view class="stat-item">
				<text class="stat-label">新单词</text>
				<text class="stat-value">{{ currentSession.newWords }}</text>
			</view>
			<view class="stat-item">
				<text class="stat-label">复习</text>
				<text class="stat-value">{{ currentSession.reviewWords }}</text>
			</view>
			<view class="stat-item">
				<text class="stat-label">正确率</text>
				<text class="stat-value">{{ accuracyPercentage }}%</text>
			</view>
		</view>
	</view>
</template>

<script>
import wordManager from '@/utils/wordManager.js'
import settingsManager from '@/utils/settingsManager.js'

export default {
	data() {
		return {
			currentWord: null,
			currentIndex: 0,
			totalWords: 0,
			wordList: [],
			currentSession: null,
			studyType: 'new', // 'new' 或 'review'
			newWordsCount: 0,
			reviewWordsCount: 0,
			showMeaning: false, // 控制是否显示中文意思
			autoStart: false, // 控制是否自动开始学习
			currentCategory: 'all', // 当前学习的分类
			currentTags: [] // 当前学习的标签
		}
	},
	computed: {
		accuracyPercentage() {
			if (!this.currentSession || this.currentSession.totalAnswers === 0) {
				return 0
			}
			return Math.round((this.currentSession.correctAnswers / this.currentSession.totalAnswers) * 100)
		},
		
		pageTitle() {
			if (this.studyType === 'review') {
				return '单词复习'
			}
			
			if (this.currentTags.length > 0) {
				const categoryNames = this.currentTags.map(tag => {
					const categories = wordManager.getCategories()
					return categories[tag] ? categories[tag].name : tag
				})
				return `${categoryNames.join('+')}学习`
			}
			
			if (this.currentCategory !== 'all') {
				const categories = wordManager.getCategories()
				const categoryName = categories[this.currentCategory] ? categories[this.currentCategory].name : this.currentCategory
				return `${categoryName}学习`
			}
			
			return '新单词学习'
		}
	},
	async onLoad(options) {
		// 初始化数据管理器
		await wordManager.init()
		settingsManager.init()
		
		// 加载本地数据
		wordManager.loadUserStudyDataFromStorage()
		
		// 获取统计数据
		this.updateCounts()
		
		// 检查是否从首页进入指定模式
		if (options.mode === 'new') {
			this.studyType = 'new'
			
			// 检查是否有分类参数
			if (options.category) {
				this.startNewWordsStudy(options.category)
			} else if (options.tags) {
				this.startNewWordsStudyByTags(options.tags.split(','))
			} else {
				this.startNewWordsStudy()
			}
		} else if (options.mode === 'review') {
			this.studyType = 'review'
			this.startReviewStudy()
		} else {
			// 显示学习建议
			this.showRecommendations()
		}
	},

	onShow() {
		this._enterTs = Date.now()
		// 到达学习页即视为签到
		wordManager.markStudyCheckIn()
	},

	onHide() {
		if (this._enterTs) {
			wordManager.addStudyTime(Date.now() - this._enterTs)
			this._enterTs = 0
		}
	},

	onUnload() {
		if (this._enterTs) {
			wordManager.addStudyTime(Date.now() - this._enterTs)
			this._enterTs = 0
		}
	},
	methods: {
		updateCounts() {
			// 获取新单词数量
			this.newWordsCount = wordManager.getNewWords('all', 100).length
			
			// 获取待复习单词数量
			this.reviewWordsCount = wordManager.getTodayReviewWords().length
		},
		
		showRecommendations() {
			const recommendations = wordManager.getStudyRecommendations()
			if (recommendations.length > 0) {
				uni.showModal({
					title: '学习建议',
					content: recommendations.map(r => r.message).join('\n'),
					showCancel: false
				})
			}
		},
		
		startNewWordsStudy(category = 'all') {
			if (!this.checkDailyLimitAndPrompt()) {
				return
			}
			this.studyType = 'new'
			this.currentCategory = category
			this.currentTags = []
			
			if (category === 'all') {
				this.wordList = wordManager.getNewWords('all', 10)
			} else {
				this.wordList = wordManager.getNewWordsByTag(category, 10)
			}
			
			this.totalWords = this.wordList.length
			this.currentIndex = 0
			this.autoStart = true // 自动开始学习
			
			if (this.wordList.length === 0) {
				uni.showToast({
					title: '没有新单词可学习',
					icon: 'none'
				})
				return
			}
			
			this.loadNextWord()
		},
		
		startNewWordsStudyByTags(tags) {
			if (!this.checkDailyLimitAndPrompt()) {
				return
			}
			this.studyType = 'new'
			this.currentCategory = 'all'
			this.currentTags = tags
			this.wordList = wordManager.getNewWordsByTags(tags, 10)
			this.totalWords = this.wordList.length
			this.currentIndex = 0
			this.autoStart = true // 自动开始学习
			
			if (this.wordList.length === 0) {
				uni.showToast({
					title: '没有新单词可学习',
					icon: 'none'
				})
				return
			}
			
			this.loadNextWord()
		},
		
		startReviewStudy() {
			this.studyType = 'review'
			this.wordList = wordManager.getTodayReviewWords()
			// 若今日无安排，则回退到本地已认识单词（不计入每日新学目标）
			if (this.wordList.length === 0) {
				this.wordList = wordManager.getKnownWordObjects()
			}
			this.totalWords = this.wordList.length
			this.currentIndex = 0
			this.autoStart = true
			
			if (this.wordList.length === 0) {
				uni.showToast({
					title: '没有需要复习的单词',
					icon: 'none'
				})
				return
			}
			
			this.loadNextWord()
		},
		
		loadNextWord() {
			if (this.currentIndex >= this.wordList.length) {
				this.completeStudy()
				return
			}
			
			this.currentWord = this.wordList[this.currentIndex]
			this.showMeaning = false
		},
		
		markAsKnown() {
			this.recordResult(true)
			// 记录为已认识单词（本地存储）
			if (this.currentWord && this.currentWord.id) {
				wordManager.addKnownWord(this.currentWord.word)
			}
		},
		
		markAsUnknown() {
			this.recordResult(false)
		},
		
		recordResult(isCorrect) {
			// 记录学习结果
			wordManager.recordStudyResult(this.currentWord.id, isCorrect)
			// 新词学习时记录当日进度（复习模式不计入每日目标）
			if (this.studyType === 'new') {
				wordManager.trackDailyNew(this.currentWord.word)
			}
			
			// 显示中文意思
			this.showMeaning = true
		},
		
		nextWord() {
			this.currentIndex++
			this.loadNextWord()
		},
		
		completeStudy() {
			const stats = wordManager.getStudyStats()
			uni.showModal({
				title: '学习完成',
				content: `本次学习了${this.totalWords}个单词\n总进度：${stats.progress}%`,
				showCancel: false,
				success: () => {
					uni.navigateBack()
				}
			})
		},
		
		viewDetails() {
			// 跳转到单词详情页面
			uni.navigateTo({
				url: `/pages/detail/detail?id=${this.currentWord.id}`
			})
		},
		
		playPronunciation() {
			if (this.currentWord.audio) {
				// 播放音频
				const audioContext = uni.createInnerAudioContext()
				audioContext.src = this.currentWord.audio
				audioContext.play()
			} else {
				uni.showToast({
					title: '暂无音频',
					icon: 'none'
				})
			}
		},
		
		goBack() {
			uni.navigateBack()
		},

		checkDailyLimitAndPrompt() {
			const s = settingsManager.getSettings()
			const learnedToday = wordManager.getTodayNewWordsCount()
			if (learnedToday >= s.dailyNewWordsTarget) {
				if (s.allowExceed) {
					uni.showModal({
						title: '今日目标已达成',
						content: `已完成今日目标 ${s.dailyNewWordsTarget} 个。是否调整目标？`,
						confirmText: '去设置',
						cancelText: '继续学习',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({ url: '/pages/goal-settings/goal-settings' })
							}
						}
					})
					return true
				} else {
					uni.showModal({
						title: '达到每日上限',
						content: `今日已学习 ${learnedToday} 个，已达上限 ${s.dailyNewWordsTarget} 个。可前往调整目标。`,
						showCancel: false,
						confirmText: '去设置',
						success: () => {
							uni.navigateTo({ url: '/pages/goal-settings/goal-settings' })
						}
					})
					return false
				}
			}
			return true
		},
		
		showSettings() {
			uni.showActionSheet({
				itemList: ['学习设置', '查看统计', '重置进度'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0:
							uni.showToast({
								title: '学习设置',
								icon: 'none'
							})
							break
						case 1:
							uni.navigateTo({
								url: '/pages/profile/profile'
							})
							break
						case 2:
							this.resetProgress()
							break
					}
				}
			})
		},
		
		resetProgress() {
			uni.showModal({
				title: '确认重置',
				content: '确定要重置所有学习进度吗？此操作不可恢复。',
				success: (res) => {
					if (res.confirm) {
						// 重置用户数据
						wordManager.userStudyData = {
							...wordManager.userStudyData,
							wordProgress: {},
							studySessions: [],
							studyStats: {
								totalStudyDays: 0,
								currentStreak: 0,
								longestStreak: 0,
								totalStudyTime: 0,
								totalWordsLearned: 0,
								totalWordsMastered: 0,
								averageAccuracy: 0,
								lastStudyDate: null
							}
						}
						wordManager.saveUserStudyData()
						
						uni.showToast({
							title: '进度已重置',
							icon: 'success'
						})
						
						this.updateCounts()
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: linear-gradient(180deg, #87CEEB 0%, #4682B4 100%);
	padding: 0;
}

.status-bar {
	height: 44px;
	width: 100%;
}

.header {
	padding: 20rpx 30rpx;
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.back-button {
	width: 60rpx;
	height: 60rpx;
	background: #ecf0f1;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 32rpx;
	color: #7f8c8d;
}

.title {
	color: #2c3e50;
	font-size: 36rpx;
	font-weight: bold;
}

.progress-info {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.progress-text {
	color: #7f8c8d;
	font-size: 28rpx;
}

.progress-number {
	color: #2c3e50;
	font-size: 28rpx;
	font-weight: 600;
}

.settings-icon {
	width: 60rpx;
	height: 60rpx;
	background: #ecf0f1;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon {
	font-size: 32rpx;
	color: #7f8c8d;
}

.study-mode {
	padding: 60rpx 30rpx;
}

.mode-title {
	text-align: center;
	margin-bottom: 40rpx;
}

.mode-title text {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.mode-options {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.mode-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
	box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.1);
}

.mode-icon {
	font-size: 60rpx;
}

.mode-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.mode-desc {
	font-size: 26rpx;
	color: #7f8c8d;
}

.mode-count {
	font-size: 24rpx;
	color: #4A90E2;
	font-weight: 500;
}

.word-card {
	margin: 60rpx 30rpx;
	background: #ffffff;
	border-radius: 30rpx;
	padding: 80rpx 40rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

.word-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 30rpx;
}

.word {
	font-size: 60rpx;
	font-weight: bold;
	color: #2c3e50;
	text-align: center;
}

.phonetic {
	font-size: 28rpx;
	color: #7f8c8d;
	font-style: italic;
}

.speaker-button {
	width: 80rpx;
	height: 80rpx;
	background: #4A90E2;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 5rpx 15rpx rgba(74, 144, 226, 0.3);
}

.speaker-icon {
	font-size: 40rpx;
	color: #ffffff;
}

.meaning-section {
	width: 100%;
	padding: 30rpx;
	background: linear-gradient(135deg, #f8fbff 0%, #f0f8ff 100%);
	border-radius: 20rpx;
	margin-top: 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(74, 144, 226, 0.15);
	border: 1rpx solid rgba(74, 144, 226, 0.1);
}

.meaning-card {
	background: #ffffff;
	border-radius: 15rpx;
	padding: 25rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.meaning-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.meaning-title::before {
	content: '📖';
	font-size: 28rpx;
}

.meaning-content {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.meaning-text {
	font-size: 28rpx;
	color: #34495e;
	line-height: 1.5;
	padding: 10rpx 15rpx;
	background: #f8f9fa;
	border-radius: 10rpx;
	border-left: 4rpx solid #4A90E2;
}

.example-section {
	margin-top: 25rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #e9ecef;
}

.example-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 15rpx;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.example-title::before {
	content: '💡';
	font-size: 26rpx;
}

.example-text {
	font-size: 26rpx;
	color: #555;
	margin-bottom: 8rpx;
	line-height: 1.4;
	font-style: italic;
}

.example-translation {
	font-size: 24rpx;
	color: #7f8c8d;
	font-style: italic;
	line-height: 1.4;
}

.difficulty-indicator {
	position: absolute;
	top: 30rpx;
	right: 30rpx;
	display: flex;
	gap: 8rpx;
}

.difficulty-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #ecf0f1;
}

.difficulty-dot.active {
	background: #ff6b6b;
}

.action-buttons {
	display: flex;
	padding: 0 30rpx;
	gap: 20rpx;
	margin-top: 60rpx;
}

.button {
	flex: 1;
	height: 100rpx;
	border-radius: 25rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 600;
}

.unknown {
	background: #ecf0f1;
	color: #7f8c8d;
}

.known {
	background: #ff6b6b;
	color: #ffffff;
}

.next {
	background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 16rpx rgba(74, 144, 226, 0.3);
}

.next:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.4);
}

.details {
	background: #4A90E2;
	color: #ffffff;
}

.study-stats {
	display: flex;
	justify-content: space-around;
	padding: 30rpx;
	margin-top: 40rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	margin: 40rpx 30rpx 0;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
}

.stat-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

.stat-value {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
