<template>
	<view class="splash-container">
		<!-- 背景渐变 -->
		<view class="background"></view>
		
		<!-- 应用图标 -->
		<view class="app-icon">
			<image src="/static/app-logo.png" mode="aspectFit"></image>
		</view>
		
		<!-- 应用名称 -->
		<view class="app-name">
			<text class="name">小马单词</text>
			<text class="subtitle">让学习变得更有趣</text>
		</view>
		
		<!-- 加载动画 -->
		<view class="loading">
			<view class="loading-dots">
				<view class="dot" :class="{ active: loadingStep >= 1 }"></view>
				<view class="dot" :class="{ active: loadingStep >= 2 }"></view>
				<view class="dot" :class="{ active: loadingStep >= 3 }"></view>
			</view>
			<text class="loading-text">{{ loadingText }}</text>
		</view>
		
		<!-- 独角兽装饰 -->
		<view class="decorations">
			<view class="star star1">⭐</view>
			<view class="star star2">✨</view>
			<view class="star star3">🌟</view>
			<view class="star star4">💫</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			loadingStep: 0,
			loadingText: '正在加载...',
			loadingTexts: [
				'正在准备学习环境...',
				'正在加载单词库...',
				'正在初始化应用...',
				'准备就绪！'
			]
		}
	},
	onLoad() {
		this.startLoading()
	},
	methods: {
		startLoading() {
			let step = 0
			const timer = setInterval(() => {
				step++
				this.loadingStep = step
				this.loadingText = this.loadingTexts[step - 1] || '准备就绪！'
				
				if (step >= 4) {
					clearInterval(timer)
					setTimeout(() => {
						this.goToHome()
					}, 1000)
				}
			}, 800)
		},
		goToHome() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		}
	}
}
</script>

<style scoped>
.splash-container {
	position: relative;
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background: linear-gradient(135deg, #ff9a9e 0%, #8e44ad 100%);

}

.background {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
}

.app-icon {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 40rpx;
	animation: iconFloat 3s ease-in-out infinite;
}

.app-icon image {
	width: 100%;
	height: 100%;
}

.app-name {
	text-align: center;
	margin-bottom: 80rpx;
}

.name {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 10rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.subtitle {
	display: block;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.loading-dots {
	display: flex;
	gap: 15rpx;
}

.dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.3);
	transition: all 0.3s ease;
}

.dot.active {
	background: #ffffff;
	transform: scale(1.2);
	box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.5);
}

.loading-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.decorations {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.star {
	position: absolute;
	font-size: 40rpx;
	animation: starTwinkle 2s ease-in-out infinite;
}

.star1 {
	top: 20%;
	left: 15%;
	animation-delay: 0s;
}

.star2 {
	top: 30%;
	right: 20%;
	animation-delay: 0.5s;
}

.star3 {
	bottom: 30%;
	left: 20%;
	animation-delay: 1s;
}

.star4 {
	bottom: 20%;
	right: 15%;
	animation-delay: 1.5s;
}

@keyframes iconFloat {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-20rpx);
	}
}

@keyframes starTwinkle {
	0%, 100% {
		opacity: 0.3;
		transform: scale(1);
	}
	50% {
		opacity: 1;
		transform: scale(1.2);
	}
}
</style>
