<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部标题 -->
		<view class="header">
			<text class="title">个人中心</text>
		</view>
		
		<!-- 用户信息 -->
		<view class="user-section">
			<view class="user-info">
				<view class="avatar">
					<image src="/static/avatar.svg" mode="aspectFill"></image>
				</view>
				<view class="user-details">
					<view class="name-level">
						<text class="name">学习达人</text>
						<view class="level-badge">
							<text class="level-text">LV.8</text>
						</view>
					</view>
					<text class="user-desc">坚持学习，成就更好的自己</text>
				</view>
			</view>
			<view class="user-score">
				<text class="score-text">{{ userPoints.totalPoints }}</text>
			</view>
		</view>
		
		<!-- 积分卡片 -->
		<view class="points-card">
			<view class="points-header">
				<text class="points-title">我的积分</text>
				<view class="points-icon">🎯</view>
			</view>
			<view class="points-content">
				<view class="points-main">
					<text class="points-number">{{ userPoints.totalPoints }}</text>
					<text class="points-label">总积分</text>
				</view>
				<view class="points-stats">
					<view class="points-stat">
						<text class="stat-number">{{ userPoints.earnedPoints }}</text>
						<text class="stat-label">已获得</text>
					</view>
					<view class="points-stat">
						<text class="stat-number">{{ userPoints.usedPoints }}</text>
						<text class="stat-label">已使用</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 统计数据卡片 -->
		<view class="stats-cards">
			<view class="stat-card blue">
				<text class="stat-title">总学习天数</text>
				<view class="stat-number">
					<text class="number">126</text>
					<text class="unit">天</text>
				</view>
				<text class="stat-desc">坚持学习</text>
			</view>
			
			<view class="stat-card green">
				<text class="stat-title">掌握单词</text>
				<view class="stat-number">
					<text class="number">1850+</text>
				</view>
				<text class="stat-desc">词汇量</text>
			</view>
			
			<view class="stat-card orange">
				<text class="stat-title">学习时长</text>
				<view class="stat-number">
					<text class="number">368</text>
					<text class="unit">小时</text>
				</view>
				<text class="stat-desc">累计学习</text>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToPointsHistory">
				<view class="menu-icon purple">
					<text class="icon-text">📈</text>
				</view>
				<text class="menu-text">积分记录</text>
				<view class="menu-arrow">
					<text class="arrow-text">></text>
				</view>
			</view>
			
			<view class="menu-item" @click="goToLuckyDraw">
				<view class="menu-icon gold">
					<text class="icon-text">🎁</text>
				</view>
				<text class="menu-text">积分抽奖</text>
				<view class="menu-arrow">
					<text class="arrow-text">></text>
				</view>
			</view>
			
			<view class="menu-item" @click="goToGoalSettings">
				<view class="menu-icon blue">
					<text class="icon-text">📁</text>
				</view>
				<text class="menu-text">学习目标设置</text>
				<view class="menu-arrow">
					<text class="arrow-text">></text>
				</view>
			</view>
			
			<view class="menu-item" @click="goToStatistics">
				<view class="menu-icon orange">
					<text class="icon-text">📊</text>
				</view>
				<text class="menu-text">学习统计</text>
				<view class="menu-arrow">
					<text class="arrow-text">></text>
				</view>
			</view>
			
			<view class="menu-item" @click="goToReminders">
				<view class="menu-icon red">
					<text class="icon-text">⏰</text>
				</view>
				<text class="menu-text">提醒设置</text>
				<view class="menu-arrow">
					<text class="arrow-text">></text>
				</view>
			</view>
			
			<view class="menu-item" @click="goToHelp">
				<view class="menu-icon green">
					<text class="icon-text">💬</text>
				</view>
				<text class="menu-text">帮助反馈</text>
				<view class="menu-arrow">
					<text class="arrow-text">></text>
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
			userPoints: {
				totalPoints: 0,
				earnedPoints: 0,
				usedPoints: 0
			}
		}
	},
	async onLoad() {
		// 初始化积分管理器
		await pointsManager.init()
		
		// 加载积分数据
		this.loadPointsData()
	},
	methods: {
		loadPointsData() {
			// 获取用户积分信息
			this.userPoints = pointsManager.getUserPoints()
		},
		
		goToGoalSettings() {
			uni.showToast({
				title: '学习目标设置',
				icon: 'none'
			})
		},
		
		goToStatistics() {
			uni.showToast({
				title: '学习统计',
				icon: 'none'
			})
		},
		
		goToReminders() {
			uni.showToast({
				title: '提醒设置',
				icon: 'none'
			})
		},
		
		goToHelp() {
			uni.showToast({
				title: '帮助反馈',
				icon: 'none'
			})
		},
		
		goToPointsHistory() {
			uni.showModal({
				title: '积分记录',
				content: '查看详细的积分获得和使用记录',
				showCancel: false,
				confirmText: '知道了'
			})
		},
		
		goToLuckyDraw() {
			if (this.userPoints.totalPoints < 100) {
				uni.showModal({
					title: '积分不足',
					content: '抽奖需要100积分，当前积分不足',
					showCancel: false,
					confirmText: '去签到'
				})
			} else {
				uni.showModal({
					title: '积分抽奖',
					content: '消耗100积分参与抽奖，有机会获得丰厚奖励！',
					success: (res) => {
						if (res.confirm) {
							this.performLuckyDraw()
						}
					}
				})
			}
		},
		
		performLuckyDraw() {
			const result = pointsManager.usePoints(100, '积分抽奖')
			
			if (result.success) {
				// 模拟抽奖结果
				const prizes = [
					{ name: '谢谢参与', points: 0 },
					{ name: '10积分', points: 10 },
					{ name: '20积分', points: 20 },
					{ name: '50积分', points: 50 },
					{ name: '100积分', points: 100 }
				]
				
				const randomPrize = prizes[Math.floor(Math.random() * prizes.length)]
				
				if (randomPrize.points > 0) {
					// 如果中奖了，添加积分
					pointsManager.userPointsData.totalPoints += randomPrize.points
					pointsManager.userPointsData.earnedPoints += randomPrize.points
					pointsManager.saveToStorage()
					
					uni.showModal({
						title: '恭喜中奖！',
						content: `获得${randomPrize.name}！\n当前积分：${pointsManager.userPointsData.totalPoints}`,
						showCancel: false,
						confirmText: '太棒了'
					})
				} else {
					uni.showModal({
						title: '很遗憾',
						content: '本次未中奖，再接再厉！\n当前积分：' + result.remainingPoints,
						showCancel: false,
						confirmText: '继续努力'
					})
				}
				
				// 更新显示
				this.loadPointsData()
			} else {
				uni.showToast({
					title: result.message,
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #ffffff;
	padding: 0;
}

.status-bar {
	height: 44px;
	width: 100%;
}

.header {
	padding: 30rpx;
	text-align: center;
	border-bottom: 1px solid #f1f3f4;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #2c3e50;
}

.user-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f1f3f4;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	overflow: hidden;
}

.avatar image {
	width: 100%;
	height: 100%;
}

.user-details {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.name-level {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.level-badge {
	background: #dc3545;
	padding: 5rpx 15rpx;
	border-radius: 15rpx;
}

.level-text {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 600;
}

.user-desc {
	font-size: 24rpx;
	color: #6c757d;
}

.user-score {
	background: #4A90E2;
	padding: 15rpx 25rpx;
	border-radius: 20rpx;
}

.score-text {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 600;
}

.points-card {
	margin: 30rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
	color: #ffffff;
}

.points-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 25rpx;
}

.points-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}

.points-icon {
	font-size: 40rpx;
	color: #ffffff;
}

.points-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.points-main {
	text-align: center;
}

.points-number {
	font-size: 48rpx;
	font-weight: bold;
	color: #ffffff;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.points-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
}

.points-stats {
	display: flex;
	gap: 30rpx;
}

.points-stat {
	text-align: center;
}

.stat-number {
	font-size: 28rpx;
	font-weight: bold;
	color: #ffffff;
}

.stat-label {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.8);
}

.stats-cards {
	display: flex;
	padding: 30rpx;
	gap: 20rpx;
}

.stat-card {
	flex: 1;
	padding: 30rpx 20rpx;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15rpx;
}

.stat-card.blue {
	background: #e3f2fd;
}

.stat-card.green {
	background: #e8f5e8;
}

.stat-card.orange {
	background: #fff3e0;
}

.stat-title {
	font-size: 22rpx;
	color: #6c757d;
	text-align: center;
}

.stat-number {
	display: flex;
	align-items: baseline;
	gap: 5rpx;
}

.number {
	font-size: 40rpx;
	font-weight: bold;
	color: #2c3e50;
}

.unit {
	font-size: 20rpx;
	color: #6c757d;
}

.stat-desc {
	font-size: 20rpx;
	color: #6c757d;
	text-align: center;
}

.menu-section {
	padding: 0 30rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1px solid #f1f3f4;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 15rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.menu-icon.blue {
	background: #e3f2fd;
}

.menu-icon.orange {
	background: #fff3e0;
}

.menu-icon.red {
	background: #ffebee;
}

.menu-icon.green {
	background: #e8f5e8;
}

.menu-icon.purple {
	background: #e0e0e0;
}

.menu-icon.gold {
	background: #fff9c4;
}

.icon-text {
	font-size: 32rpx;
}

.menu-text {
	flex: 1;
	font-size: 28rpx;
	color: #2c3e50;
	font-weight: 500;
}

.menu-arrow {
	display: flex;
	align-items: center;
}

.arrow-text {
	font-size: 24rpx;
	color: #6c757d;
}
</style>
