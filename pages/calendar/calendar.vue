<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 签到卡片 -->
		<view class="checkin-card">
			<view class="checkin-header">
				<text class="checkin-title">每日签到</text>
				<text class="checkin-subtitle">连续签到可获得更多积分</text>
			</view>
			<view class="checkin-content">
				<view class="streak-info">
					<text class="streak-number">{{ checkInStats.currentStreak }}</text>
					<text class="streak-label">连续签到</text>
				</view>
				<view class="checkin-button" @click="handleCheckIn" :class="{ checked: isTodayCheckedIn }">
					<text class="checkin-icon">{{ isTodayCheckedIn ? '✓' : '📅' }}</text>
					<text class="checkin-text">{{ isTodayCheckedIn ? '已签到' : '立即签到' }}</text>
				</view>
			</view>
		</view>
		<!-- 自定义日历组件 -->
		<view class="calendar-section">
			<view class="calendar-header">
				<view class="month-nav" @click="previousMonth">
					<text class="nav-icon">‹</text>
				</view>
				<text class="current-month">{{ currentYear }}年{{ currentMonth }}月</text>
				<view class="month-nav" @click="nextMonth">
					<text class="nav-icon">›</text>
				</view>
			</view>
			
			<view class="calendar-weekdays">
				<text class="weekday" v-for="day in weekdays" :key="day">{{ day }}</text>
			</view>
			
			<view class="calendar-grid">
				<view 
					v-for="(day, index) in calendarDays" 
					:key="index"
					:class="['calendar-day', getDayClass(day)]"
					@click="onDayClick(day)"
				>
					<text class="day-number">{{ day.day }}</text>
					<view v-if="isCheckInDay(day)" class="checkin-dot"></view>
				</view>
			</view>
		</view>
		
		<!-- 学习统计 -->
		<view class="stats-section">
			<view class="stats-header">
				<text class="stats-title">学习统计</text>
			</view>
			<view class="stats-grid">
				<view class="stat-item">
					<view class="stat-icon">🔥</view>
					<view class="stat-content">
						<text class="stat-number">{{ checkInStats.currentStreak }}</text>
						<text class="stat-label">连续签到</text>
					</view>
				</view>
				<view class="stat-item">
					<view class="stat-icon">🏆</view>
					<view class="stat-content">
						<text class="stat-number">{{ checkInStats.longestStreak }}</text>
						<text class="stat-label">最长记录</text>
					</view>
				</view>
				<view class="stat-item">
					<view class="stat-icon">📊</view>
					<view class="stat-content">
						<text class="stat-number">{{ checkInStats.totalCheckIns }}</text>
						<text class="stat-label">总签到</text>
					</view>
				</view>
				<view class="stat-item">
					<view class="stat-icon">🎯</view>
					<view class="stat-content">
						<text class="stat-number">{{ userPoints.totalPoints }}</text>
						<text class="stat-label">总积分</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import pointsManager from '@/utils/pointsManager.js'

export default {
	data() {
		return {
			currentTab: 'all',
			filterTabs: [
				{ label: '全部', value: 'all' },
				{ label: '本月', value: 'month' },
				{ label: '本周', value: 'week' },
				{ label: '今日', value: 'today' }
			],
			userPoints: {},
			checkInStats: {},
			isTodayCheckedIn: false,
			selectedDate: null,
			currentYear: new Date().getFullYear(),
			currentMonth: new Date().getMonth() + 1,
			weekdays: ['日', '一', '二', '三', '四', '五', '六'],
			calendarDays: []
		}
	},
	async onLoad() {
		// 初始化积分管理器
		await pointsManager.init()
		
		// 加载数据
		this.loadData()
		
		// 生成日历数据
		this.generateCalendar()
	},
	methods: {
		loadData() {
			// 获取用户积分信息
			this.userPoints = pointsManager.getUserPoints()
			
			// 获取签到统计
			this.checkInStats = pointsManager.getCheckInStats()
			
			// 检查今日是否已签到
			this.isTodayCheckedIn = pointsManager.isTodayCheckedIn()
		},
		
		// 生成日历数据
		generateCalendar() {
			const year = this.currentYear
			const month = this.currentMonth
			
			// 获取当月第一天是星期几
			const firstDay = new Date(year, month - 1, 1).getDay()
			
			// 获取当月天数
			const daysInMonth = new Date(year, month, 0).getDate()
			
			// 获取上个月的天数
			const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
			
			this.calendarDays = []
			
			// 添加上个月的日期
			for (let i = firstDay - 1; i >= 0; i--) {
				const day = daysInPrevMonth - i
				this.calendarDays.push({
					day: day,
					year: month === 1 ? year - 1 : year,
					month: month === 1 ? 12 : month - 1,
					type: 'prev'
				})
			}
			
			// 添加当月的日期
			for (let day = 1; day <= daysInMonth; day++) {
				this.calendarDays.push({
					day: day,
					year: year,
					month: month,
					type: 'current'
				})
			}
			
			// 添加下个月的日期（填充到6行）
			const remainingDays = 42 - this.calendarDays.length
			for (let day = 1; day <= remainingDays; day++) {
				this.calendarDays.push({
					day: day,
					year: month === 12 ? year + 1 : year,
					month: month === 12 ? 1 : month + 1,
					type: 'next'
				})
			}
		},
		
		// 切换标签
		switchTab(tab) {
			this.currentTab = tab
			// 这里可以根据标签筛选数据
		},
		
		// 处理签到
		handleCheckIn() {
			if (this.isTodayCheckedIn) {
				uni.showToast({
					title: '今日已签到',
					icon: 'none'
				})
				return
			}
			
			const result = pointsManager.checkIn()
			
			if (result.success) {
				uni.showToast({
					title: result.message,
					icon: 'success'
				})
				
				// 更新数据
				this.loadData()
				
				// 显示签到成功动画
				this.showCheckInAnimation(result.points)
			} else {
				uni.showToast({
					title: result.message,
					icon: 'none'
				})
			}
		},
		
		// 显示签到成功动画
		showCheckInAnimation(points) {
			uni.showModal({
				title: '签到成功！',
				content: `恭喜获得${points}积分！\n当前总积分：${this.userPoints.totalPoints}`,
				showCancel: false,
				confirmText: '太棒了'
			})
		},
		
		// 上个月
		previousMonth() {
			if (this.currentMonth === 1) {
				this.currentMonth = 12
				this.currentYear--
			} else {
				this.currentMonth--
			}
			this.generateCalendar()
		},
		
		// 下个月
		nextMonth() {
			if (this.currentMonth === 12) {
				this.currentMonth = 1
				this.currentYear++
			} else {
				this.currentMonth++
			}
			this.generateCalendar()
		},
		
		// 日期点击事件
		onDayClick(day) {
			if (day.type === 'current') {
				this.selectedDate = day
				
				// 检查该日期是否已签到
				const isCheckedIn = this.isCheckInDay(day)
				
				if (isCheckedIn) {
					uni.showToast({
						title: `${day.year}-${day.month}-${day.day} 已签到`,
						icon: 'none'
					})
				} else {
					uni.showToast({
						title: `${day.year}-${day.month}-${day.day} 未签到`,
						icon: 'none'
					})
				}
			}
		},
		
		// 获取日期样式类
		getDayClass(day) {
			const classes = []
			
			// 非当前月的日期
			if (day.type !== 'current') {
				classes.push('other-month')
			}
			
			// 今天
			const today = new Date()
			if (day.type === 'current' && 
				today.getFullYear() === day.year && 
				today.getMonth() + 1 === day.month && 
				today.getDate() === day.day) {
				classes.push('today')
			}
			
			// 已签到
			if (this.isCheckInDay(day)) {
				classes.push('checked-in')
			}
			
			// 选中
			if (this.selectedDate && 
				this.selectedDate.year === day.year && 
				this.selectedDate.month === day.month && 
				this.selectedDate.day === day.day) {
				classes.push('selected')
			}
			
			return classes.join(' ')
		},
		
		// 检查是否为签到日
		isCheckInDay(day) {
			const dateStr = `${day.year}-${day.month.toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`
			const monthlyCheckIns = pointsManager.getMonthlyCheckIns(day.year, day.month)
			return monthlyCheckIns.includes(dateStr)
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #f8f9fa;
	padding: 0;
}

/* .status-bar {
	height: 44px;
	width: 100%;
} */

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.stats-info {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.stats-title {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
}

.stats-number {
	display: flex;
	align-items: baseline;
	gap: 10rpx;
}

.number {
	font-size: 48rpx;
	font-weight: bold;
	color: #ffffff;
}

.unit {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

.points-info {
	display: flex;
	align-items: center;
	gap: 10rpx;
	background: rgba(255, 255, 255, 0.2);
	padding: 15rpx 20rpx;
	border-radius: 25rpx;
}

.points-icon {
	font-size: 32rpx;
}

.points-number {
	font-size: 32rpx;
	font-weight: bold;
	color: #ffffff;
}

.checkin-card {
	margin: 30rpx;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.checkin-header {
	margin-bottom: 25rpx;
}

.checkin-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
	display: block;
	margin-bottom: 8rpx;
}

.checkin-subtitle {
	font-size: 24rpx;
	color: #6c757d;
}

.checkin-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.streak-info {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 5rpx;
}

.streak-number {
	font-size: 48rpx;
	font-weight: bold;
	color: #ff6b6b;
}

.streak-label {
	font-size: 24rpx;
	color: #6c757d;
}

.checkin-button {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
	padding: 25rpx 40rpx;
	background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	border-radius: 25rpx;
	transition: all 0.3s ease;
}

.checkin-button.checked {
	background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.checkin-button:active {
	transform: scale(0.95);
}

.checkin-icon {
	font-size: 40rpx;
	color: #ffffff;
}

.checkin-text {
	font-size: 26rpx;
	color: #ffffff;
	font-weight: 600;
}

.filter-tabs {
	display: flex;
	padding: 20rpx 30rpx;
	gap: 20rpx;
	background: #ffffff;
	margin: 0 30rpx;
	border-radius: 15rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.tab {
	padding: 15rpx 25rpx;
	border-radius: 20rpx;
	background: #f8f9fa;
	transition: all 0.3s ease;
}

.tab.active {
	background: #4A90E2;
}

.tab text {
	font-size: 26rpx;
	color: #6c757d;
	transition: all 0.3s ease;
}

.tab.active text {
	color: #ffffff;
	font-weight: 600;
}

.calendar-section {
	margin: 30rpx;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.calendar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 20rpx 0;
}

.month-nav {
	width: 60rpx;
	height: 60rpx;
	background: #f8f9fa;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.month-nav:active {
	background: #e9ecef;
	transform: scale(0.95);
}

.nav-icon {
	font-size: 36rpx;
	color: #6c757d;
	font-weight: bold;
}

.current-month {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.calendar-weekdays {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	text-align: center;
	margin-bottom: 15rpx;
	padding: 15rpx 0;
	border-bottom: 1rpx solid #f1f3f4;
}

.weekday {
	font-size: 26rpx;
	color: #6c757d;
	font-weight: 500;
}

.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 8rpx;
	padding: 10rpx 0;
}

.calendar-day {
	position: relative;
	width: 100%;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10rpx;
	transition: all 0.3s ease;
	cursor: pointer;
}

.calendar-day.other-month {
	opacity: 0.3;
}

.calendar-day.other-month .day-number {
	color: #ccc;
}

.calendar-day.today {
	background: #4A90E2;
}

.calendar-day.checked-in {
	background: #2ecc71;
}

.calendar-day.selected {
	background: #ff6b6b;
}

.calendar-day:active {
	transform: scale(0.95);
}

.day-number {
	font-size: 28rpx;
	color: #2c3e50;
	font-weight: 500;
}

.calendar-day.today .day-number,
.calendar-day.checked-in .day-number,
.calendar-day.selected .day-number {
	color: #ffffff;
}

.checkin-dot {
	position: absolute;
	bottom: 8rpx;
	width: 8rpx;
	height: 8rpx;
	background: #ffffff;
	border-radius: 50%;
}

.stats-section {
	margin: 30rpx;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.stats-header {
	margin-bottom: 25rpx;
}

.stats-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 25rpx;
	background: #f8f9fa;
	border-radius: 15rpx;
}

.stat-icon {
	font-size: 40rpx;
	width: 60rpx;
	height: 60rpx;
	background: #ffffff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 5rpx;
}

.stat-number {
	font-size: 32rpx;
	font-weight: bold;
	color: #2c3e50;
}

.stat-label {
	font-size: 24rpx;
	color: #6c757d;
}
</style>
