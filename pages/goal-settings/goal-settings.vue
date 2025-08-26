<template>
	<view class="container">
		<view class="status-bar"></view>
		<view class="header">
			<view class="back" @click="goBack">←</view>
			<text class="title">学习目标设置</text>
		</view>

		<view class="card">
			<text class="label">每日新学单词目标</text>
			<view class="row">
				<input class="input" type="number" v-model="targetStr" placeholder="例如：20" />
				<view class="btn" @click="saveTarget">保存</view>
			</view>
			<text class="hint">用于限制每天的新学习量，达到上限后会提示引导。</text>
		</view>

		<view class="card">
			<text class="label">是否允许超额学习</text>
			<view class="switch-row">
				<switch :checked="allowExceed" @change="toggleExceed"/>
				<text class="switch-text">{{ allowExceed ? '允许' : '不允许' }}</text>
			</view>
			<text class="hint">若关闭，则达到目标后将阻止继续开始新学习。</text>
		</view>
	</view>
</template>

<script>
import settingsManager from '@/utils/settingsManager.js'

export default {
	data() {
		return {
			targetStr: '20',
			allowExceed: true
		}
	},
	onLoad() {
		settingsManager.init()
		const s = settingsManager.getSettings()
		this.targetStr = String(s.dailyNewWordsTarget)
		this.allowExceed = s.allowExceed
	},
	methods: {
		saveTarget() {
			try {
				settingsManager.setDailyNewWordsTarget(this.targetStr)
				uni.showToast({ title: '已保存', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: e.message || '无效的目标值', icon: 'none' })
			}
		},
		toggleExceed(e) {
			this.allowExceed = e.detail.value
			settingsManager.setAllowExceed(this.allowExceed)
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #ffffff;
}
.header {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 30rpx;
	border-bottom: 1px solid #f1f3f4;
}
.back { font-size: 32rpx; padding-right: 20rpx; }
.title { font-size: 36rpx; font-weight: 600; color: #2c3e50; }

.card {
	margin: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
}
.label { font-size: 28rpx; color: #2c3e50; font-weight: 600; }
.row { display: flex; align-items: center; gap: 20rpx; margin-top: 20rpx; }
.input {
	flex: 1;
	background: #f7f8fa;
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
}
.btn {
	background: #4A90E2;
	color: #fff;
	padding: 16rpx 24rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
}
.hint { display: block; margin-top: 16rpx; color: #6c757d; font-size: 22rpx; }

.switch-row { display: flex; align-items: center; gap: 16rpx; margin-top: 20rpx; }
.switch-text { color: #2c3e50; font-size: 28rpx; }
</style>
