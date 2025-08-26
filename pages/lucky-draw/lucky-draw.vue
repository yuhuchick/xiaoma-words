<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部 -->
		<view class="header">
			<view class="back-button" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="title">积分抽奖</text>
			<view class="points-display">
				<text class="points-icon">🎯</text>
				<text class="points-number">{{ userPoints.totalPoints }}</text>
			</view>
		</view>
		
		<!-- 转盘区域 -->
		<view class="wheel-section">
			<!-- 装饰元素 -->
			<view class="decorations">
				<text class="decoration-star">⭐</text>
				<text class="decoration-heart">💖</text>
				<text class="decoration-star">⭐</text>
				<text class="decoration-heart">💖</text>
				<text class="decoration-star">⭐</text>
				<text class="decoration-heart">💖</text>
			</view>
			
			<view class="wheel-container">
				<!-- 转盘背景 -->
				<view class="wheel-background" :class="{ rotating: isDrawing }" :style="{ transform: `rotate(${rotationAngle}deg)` }">
					<view 
						v-for="(prize, index) in prizes" 
						:key="index"
						class="wheel-segment"
						:style="getSegmentStyle(index)"
					>
						<view class="prize-icon" :style="getTextStyle(index)">{{ prize.icon }}</view>
					</view>
				</view>
				
				<!-- 转盘中心 -->
				<view class="wheel-center">
					<view class="center-circle">
						<text class="center-text">抽奖</text>
					</view>
				</view>
				
				<!-- 指针 -->
				<view class="pointer"></view>
			</view>
		</view>
		
		<!-- 抽奖按钮 -->
		<view class="draw-section">
			<view class="draw-info">
				<text class="draw-title">消耗100积分参与抽奖</text>
				<text class="draw-desc">点击转盘开始抽奖</text>
			</view>
			<view class="draw-button" @click="startDraw" :class="{ disabled: isDrawing || userPoints.totalPoints < 100 }">
				<text class="draw-text">{{ getDrawButtonText() }}</text>
			</view>
		</view>
		
		<!-- 奖品列表 -->
		<view class="prizes-section">
			<view class="section-header">
				<text class="section-title">奖品列表</text>
			</view>
			<view class="prizes-grid">
				<view 
					v-for="(prize, index) in prizes" 
					:key="index"
					class="prize-item"
				>
					<view class="prize-list-icon">{{ prize.icon }}</view>
					<text class="prize-name">{{ prize.name }}</text>
					<text class="prize-probability">{{ prize.probability }}%</text>
				</view>
			</view>
		</view>
		
		<!-- 中奖记录 -->
		<view class="history-section">
			<view class="section-header">
				<text class="section-title">中奖记录</text>
			</view>
			<view class="history-list">
				<view 
					v-for="(record, index) in drawHistory" 
					:key="index"
					class="history-item"
				>
					<view class="history-icon">{{ record.icon }}</view>
					<view class="history-content">
						<text class="history-prize">{{ record.prize }}</text>
						<text class="history-time">{{ record.time }}</text>
					</view>
				</view>
				<view v-if="drawHistory.length === 0" class="empty-history">
					<text class="empty-text">暂无中奖记录</text>
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
				totalPoints: 0
			},
			isDrawing: false,
			rotationAngle: 0,
			prizes: [
				{ name: '谢谢参与', icon: '🐰', probability: 40, points: 0 },
				{ name: '10积分', icon: '🐱', probability: 25, points: 10 },
				{ name: '20积分', icon: '🐶', probability: 20, points: 20 },
				{ name: '50积分', icon: '🐼', probability: 10, points: 50 },
				{ name: '100积分', icon: '🦊', probability: 4, points: 100 },
				{ name: '200积分', icon: '🐯', probability: 1, points: 200 }
			],
			drawHistory: []
		}
	},
	async onLoad() {
		// 初始化积分管理器
		await pointsManager.init()
		
		// 加载积分数据
		this.loadPointsData()
		
		// 加载抽奖历史
		this.loadDrawHistory()
		
		// 测试角度计算
		this.testAngleCalculation()
	},
	methods: {
		loadPointsData() {
			this.userPoints = pointsManager.getUserPoints()
		},
		
		loadDrawHistory() {
			// 从本地存储加载抽奖历史
			try {
				const history = uni.getStorageSync('drawHistory')
				if (history) {
					this.drawHistory = JSON.parse(history)
				}
			} catch (error) {
				console.error('加载抽奖历史失败:', error)
			}
		},
		
		saveDrawHistory() {
			try {
				uni.setStorageSync('drawHistory', JSON.stringify(this.drawHistory))
			} catch (error) {
				console.error('保存抽奖历史失败:', error)
			}
		},
		
		goBack() {
			uni.navigateBack()
		},
		
		getSegmentStyle(index) {
			const segmentAngle = 360 / this.prizes.length
			const startAngle = index * segmentAngle
			const centerAngle = startAngle + segmentAngle / 2
			
			return {
				transform: `rotate(${startAngle}deg)`,
				background: this.getSegmentColor(index)
			}
		},
		
		getTextStyle(index) {
			const segmentAngle = 360 / this.prizes.length
			const startAngle = index * segmentAngle
			const centerAngle = startAngle + segmentAngle / 2
			
			return {
				transform: `rotate(${centerAngle}deg)`,
				transformOrigin: 'center center'
			}
		},
		
		getSegmentColor(index) {
			const colors = [
				'#E8B4CB', '#B8E6B8', '#FFE5B4', 
				'#B4D4E8', '#E6D4B4', '#D4B4E8'
			]
			return colors[index % colors.length]
		},
		
		getDrawButtonText() {
			if (this.isDrawing) {
				return '抽奖中...'
			} else if (this.userPoints.totalPoints < 100) {
				return '积分不足'
			} else {
				return '开始抽奖'
			}
		},
		
		startDraw() {
			if (this.isDrawing || this.userPoints.totalPoints < 100) {
				return
			}
			
			this.isDrawing = true
			
			// 消耗积分
			const result = pointsManager.usePoints(100, '转盘抽奖')
			
			if (!result.success) {
				uni.showToast({
					title: result.message,
					icon: 'none'
				})
				this.isDrawing = false
				return
			}
			
			// 随机选择奖品
			const randomPrize = this.getRandomPrize()
			
			// 计算旋转角度
			// 转盘扇形区域从右侧（3点钟方向）开始，顺时针排列
			// 指针在顶部（12点钟方向），需要让指针指向目标扇形区域
			const prizeIndex = this.prizes.findIndex(p => p.name === randomPrize.name)
			const segmentAngle = 360 / this.prizes.length
			
			// 计算目标扇形区域的中心角度（相对于转盘中心）
			const segmentCenterAngle = prizeIndex * segmentAngle + segmentAngle / 2
			
			// 转盘需要逆时针旋转，让指针指向目标扇形区域
			// 由于扇形区域从右侧开始（3点钟方向），指针在顶部（12点钟方向）
			// 需要旋转的角度 = 扇形中心角度 - 90度
			const targetAngle = segmentCenterAngle - 90
			
			// 计算需要旋转的角度，每次都是固定的6圈加上目标角度
			const additionalRotation = 360 * 6 + targetAngle
			const totalRotation = this.rotationAngle + additionalRotation
			
			// 调试信息
			console.log('抽奖信息:', {
				prize: randomPrize.name,
				prizeIndex: prizeIndex,
				segmentAngle: segmentAngle,
				segmentCenterAngle: segmentCenterAngle,
				targetAngle: targetAngle,
				totalRotation: totalRotation
			})
			
			// 开始旋转动画
			this.rotationAngle = totalRotation
			
			setTimeout(() => {
				this.showDrawResult(randomPrize)
				this.isDrawing = false
			}, 4000)
		},
		
		getRandomPrize() {
			const random = Math.random() * 100
			let cumulativeProbability = 0
			
			for (const prize of this.prizes) {
				cumulativeProbability += prize.probability
				if (random <= cumulativeProbability) {
					return prize
				}
			}
			
			return this.prizes[0] // 默认返回谢谢参与
		},
		
		showDrawResult(prize) {
			// 如果中奖了，添加积分
			if (prize.points > 0) {
				pointsManager.userPointsData.totalPoints += prize.points
				pointsManager.userPointsData.earnedPoints += prize.points
				pointsManager.saveToStorage()
			}
			
			// 记录抽奖历史
			const historyItem = {
				prize: prize.name,
				icon: prize.icon,
				time: new Date().toLocaleString()
			}
			this.drawHistory.unshift(historyItem)
			
			// 只保留最近10条记录
			if (this.drawHistory.length > 10) {
				this.drawHistory = this.drawHistory.slice(0, 10)
			}
			
			this.saveDrawHistory()
			
			// 更新积分显示
			this.loadPointsData()
			
			// 显示结果
			if (prize.points > 0) {
				uni.showModal({
					title: `恭喜中奖！${prize.icon}`,
					content: `获得${prize.name}！\n当前积分：${pointsManager.userPointsData.totalPoints}`,
					showCancel: false,
					confirmText: '太棒了'
				})
			} else {
				uni.showModal({
					title: `很遗憾 ${prize.icon}`,
					content: '本次未中奖，再接再厉！\n当前积分：' + pointsManager.userPointsData.totalPoints,
					showCancel: false,
					confirmText: '继续努力'
				})
			}
		},
		
		// 测试角度计算方法
		testAngleCalculation() {
			console.log('=== 角度计算测试 ===')
			this.prizes.forEach((prize, index) => {
				const segmentAngle = 360 / this.prizes.length
				const segmentCenterAngle = index * segmentAngle + segmentAngle / 2
				const targetAngle = segmentCenterAngle - 90
				
				console.log(`奖品${index}: ${prize.name} (${prize.icon})`)
				console.log(`  扇形角度: ${segmentAngle}°`)
				console.log(`  扇形中心角度: ${segmentCenterAngle}°`)
				console.log(`  目标旋转角度: ${targetAngle}°`)
				console.log('---')
			})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 100%);
	padding: 0;
}

.status-bar {
	height: 44px;
	width: 100%;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	color: #8B4513;
	background: rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(10rpx);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.4);
}

.back-button {
	width: 70rpx;
	height: 70rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 
		0 4rpx 16rpx rgba(0, 0, 0, 0.1),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.5);
	border: 1rpx solid rgba(255, 255, 255, 0.5);
	transition: all 0.3s ease;
}

.back-button:active {
	transform: scale(0.95);
	box-shadow: 
		0 2rpx 8rpx rgba(0, 0, 0, 0.2),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
}

.back-icon {
	font-size: 36rpx;
	color: #8B4513;
	font-weight: 600;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
}

.title {
	font-size: 38rpx;
	font-weight: 700;
	color: #8B4513;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
	letter-spacing: 2rpx;
}

.points-display {
	display: flex;
	align-items: center;
	gap: 12rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
	padding: 18rpx 25rpx;
	border-radius: 30rpx;
	box-shadow: 
		0 4rpx 16rpx rgba(0, 0, 0, 0.1),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.5);
	border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.points-icon {
	font-size: 36rpx;
	filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.2));
}

.points-number {
	font-size: 34rpx;
	font-weight: 700;
	color: #8B4513;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
}

.wheel-section {
	display: flex;
	justify-content: center;
	padding: 50rpx 30rpx;
}

.wheel-container {
	position: relative;
	width: 600rpx;
	height: 600rpx;
	perspective: 1000rpx;
}

.wheel-background {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	position: relative;
	overflow: hidden;
	box-shadow: 
		0 15rpx 45rpx rgba(0, 0, 0, 0.15),
		0 8rpx 25rpx rgba(0, 0, 0, 0.1),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.4);
	transition: transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	border: 10rpx solid rgba(255, 255, 255, 0.9);
	transform-style: preserve-3d;
	transform: rotate(0deg);
	will-change: transform;
	backface-visibility: hidden;
}

.wheel-background.rotating {
	transform: rotate(v-bind(rotationAngle + 'deg'));
}

.wheel-segment {
	position: absolute;
	width: 50%;
	height: 50%;
	transform-origin: 100% 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	clip-path: polygon(0 0, 100% 0, 100% 100%);
	box-shadow: inset 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
	border-right: 1rpx solid rgba(255, 255, 255, 0.5);
}

.wheel-segment::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%);
	pointer-events: none;
}

.wheel-center {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10;
}

.center-circle {
	width: 150rpx;
	height: 150rpx;
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 
		0 10rpx 30rpx rgba(0, 0, 0, 0.15),
		0 5rpx 15rpx rgba(0, 0, 0, 0.1),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.8);
	border: 5rpx solid rgba(255, 255, 255, 0.9);
	position: relative;
	overflow: hidden;
}

.center-circle::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%);
	border-radius: 50%;
}

.center-text {
	font-size: 32rpx;
	color: #4A90E2;
	font-weight: 700;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
	position: relative;
	z-index: 2;
	letter-spacing: 2rpx;
}

.pointer {
	position: absolute;
	top: -35rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 28rpx solid transparent;
	border-right: 28rpx solid transparent;
	border-top: 55rpx solid #ffffff;
	z-index: 5;
	filter: drop-shadow(0 3rpx 6rpx rgba(0, 0, 0, 0.2));
}

.pointer::after {
	content: '';
	position: absolute;
	top: -55rpx;
	left: -28rpx;
	width: 0;
	height: 0;
	border-left: 28rpx solid transparent;
	border-right: 28rpx solid transparent;
	border-top: 55rpx solid rgba(255, 255, 255, 0.7);
}

.draw-section {
	padding: 40rpx 30rpx;
	text-align: center;
	background: rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(10rpx);
	margin: 0 30rpx;
	border-radius: 25rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.4);
	box-shadow: 
		0 8rpx 32rpx rgba(0, 0, 0, 0.1),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
}

.draw-info {
	margin-bottom: 35rpx;
}

.draw-title {
	font-size: 34rpx;
	color: #8B4513;
	font-weight: 700;
	display: block;
	margin-bottom: 12rpx;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
	letter-spacing: 1rpx;
}

.draw-desc {
	font-size: 28rpx;
	color: rgba(139, 69, 19, 0.8);
	font-weight: 500;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.3);
}

.draw-button {
	background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
	padding: 35rpx 70rpx;
	border-radius: 50rpx;
	box-shadow: 
		0 12rpx 40rpx rgba(255, 107, 107, 0.4),
		0 6rpx 20rpx rgba(255, 107, 107, 0.3),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
	transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	position: relative;
	overflow: hidden;
}

.draw-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	transition: left 0.5s ease;
}

.draw-button:hover::before {
	left: 100%;
}

.draw-button.disabled {
	background: linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%);
	box-shadow: 
		0 6rpx 20rpx rgba(0, 0, 0, 0.2),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.1);
	border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.draw-button:active:not(.disabled) {
	transform: scale(0.95) translateY(2rpx);
	box-shadow: 
		0 6rpx 20rpx rgba(255, 107, 107, 0.3),
		0 3rpx 10rpx rgba(255, 107, 107, 0.2),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
}

.draw-text {
	font-size: 34rpx;
	color: #ffffff;
	font-weight: 700;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	letter-spacing: 2rpx;
	position: relative;
	z-index: 2;
}

.prizes-section {
	background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
	margin: 30rpx;
	border-radius: 25rpx;
	padding: 35rpx;
	box-shadow: 
		0 12rpx 40rpx rgba(0, 0, 0, 0.1),
		0 6rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.section-header {
	margin-bottom: 25rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.prizes-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
}

.prize-item {
	text-align: center;
	padding: 25rpx 20rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
	border-radius: 20rpx;
	box-shadow: 
		0 4rpx 16rpx rgba(0, 0, 0, 0.08),
		inset 0 1rpx 4rpx rgba(255, 255, 255, 0.8);
	border: 1rpx solid rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}

.prize-item:hover {
	transform: translateY(-2rpx);
	box-shadow: 
		0 8rpx 24rpx rgba(0, 0, 0, 0.12),
		inset 0 1rpx 4rpx rgba(255, 255, 255, 0.8);
}

.prize-list-icon {
	font-size: 44rpx;
	margin-bottom: 12rpx;
	filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.prize-name {
	font-size: 26rpx;
	color: #2c3e50;
	font-weight: 600;
	display: block;
	margin-bottom: 6rpx;
}

.prize-probability {
	font-size: 22rpx;
	color: #6c757d;
	font-weight: 500;
}

.history-section {
	background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
	margin: 30rpx;
	border-radius: 25rpx;
	padding: 35rpx;
	box-shadow: 
		0 12rpx 40rpx rgba(0, 0, 0, 0.1),
		0 6rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1rpx solid rgba(255, 255, 255, 0.8);
	margin-bottom: 50rpx;
}

.history-list {
	max-height: 400rpx;
	overflow-y: auto;
}

.history-item {
	display: flex;
	align-items: center;
	padding: 25rpx 0;
	border-bottom: 1rpx solid rgba(241, 243, 244, 0.8);
	transition: all 0.3s ease;
}

.history-item:hover {
	background: rgba(248, 249, 250, 0.5);
	border-radius: 15rpx;
	padding-left: 15rpx;
	padding-right: 15rpx;
	margin-left: -15rpx;
	margin-right: -15rpx;
}

.history-item:last-child {
	border-bottom: none;
}

.history-icon {
	font-size: 36rpx;
	margin-right: 25rpx;
	filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.history-content {
	flex: 1;
}

.history-prize {
	font-size: 30rpx;
	color: #2c3e50;
	font-weight: 600;
	display: block;
	margin-bottom: 6rpx;
}

.history-time {
	font-size: 24rpx;
	color: #6c757d;
	font-weight: 500;
}

.empty-history {
	text-align: center;
	padding: 60rpx 0;
}

.empty-text {
	font-size: 26rpx;
	color: #6c757d;
}

.prize-icon {
	font-size: 65rpx;
	color: #ffffff;
	text-align: center;
	filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.4));
	position: absolute;
	z-index: 2;
	width: 90rpx;
	left: 50%;
	top: 28%;
	margin-left: -45rpx;
	transform-origin: center 150rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.6);
	animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
	0%, 100% {
		transform: translateY(0rpx);
	}
	50% {
		transform: translateY(-3rpx);
	}
}

.decorations {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	pointer-events: none;
}

.decoration-star, .decoration-heart {
	position: absolute;
	font-size: 30rpx;
	color: rgba(255, 255, 255, 0.6);
	filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
	animation: float 4s ease-in-out infinite;
}

.decoration-star:nth-child(1) {
	top: 10%;
	left: 10%;
	animation-delay: 0s;
}

.decoration-heart:nth-child(2) {
	top: 15%;
	right: 15%;
	animation-delay: 0.5s;
}

.decoration-star:nth-child(3) {
	bottom: 20%;
	left: 20%;
	animation-delay: 1s;
}

.decoration-heart:nth-child(4) {
	bottom: 15%;
	right: 10%;
	animation-delay: 1.5s;
}

.decoration-star:nth-child(5) {
	top: 50%;
	left: 5%;
	animation-delay: 2s;
}

.decoration-heart:nth-child(6) {
	top: 50%;
	right: 5%;
	animation-delay: 2.5s;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0rpx);
	}
	50% {
		transform: translateY(-5rpx);
	}
}
</style>
