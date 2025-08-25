<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部 -->
		<view class="header">
			<view class="word-display">
				<text class="word">serendipity</text>
				<text class="phonetic">/ˌserənˈdɪpəti/</text>
			</view>
		</view>
		
		<!-- 导航标签 -->
		<view class="nav-tabs">
			<view class="tab active">
				<text>中文</text>
			</view>
			<view class="tab">
				<text>词性</text>
			</view>
			<view class="tab">
				<text>释义</text>
			</view>
		</view>
		
		<!-- 释义内容 -->
		<view class="definition-section">
			<view class="definition-card">
				<view class="definition-header">
					<view class="icon">
						<text class="icon-text">👤</text>
					</view>
					<view class="definition-content">
						<text class="definition-text">意外发现美好事物的能力</text>
						<text class="definition-note">英文释义: 中文翻译</text>
					</view>
					<view class="arrow">
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 相关词组 -->
		<view class="related-section">
			<view class="section-title">
				<text>相关词组</text>
			</view>
			<view class="related-list">
				<view class="related-item">
					<view class="item-icon">
						<text class="icon-text">📚</text>
					</view>
					<view class="item-content">
						<text class="item-text">serendipitous discovery</text>
						<text class="item-translation">意外的发现</text>
					</view>
					<view class="item-arrow">
						<text class="arrow-text">></text>
					</view>
				</view>
				<view class="related-item">
					<view class="item-icon">
						<text class="icon-text">📚</text>
					</view>
					<view class="item-content">
						<text class="item-text">serendipitous encounter</text>
						<text class="item-translation">意外的相遇</text>
					</view>
					<view class="item-arrow">
						<text class="arrow-text">></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部操作按钮 -->
		<view class="bottom-actions">
			<view class="action-button add-to-vocab" @click="addToVocabulary">
				<text class="button-icon">⭐</text>
				<text class="button-text">加入生词本</text>
			</view>
			<view class="action-button mastered" @click="markAsMastered">
				<text class="button-icon">✅</text>
				<text class="button-text">已掌握</text>
			</view>
			<view class="action-button next" @click="nextWord">
				<text class="button-text">下一个</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			word: 'serendipity',
			phonetic: '/ˌserənˈdɪpəti/',
			definition: '意外发现美好事物的能力',
			relatedWords: [
				{
					word: 'serendipitous discovery',
					translation: '意外的发现'
				},
				{
					word: 'serendipitous encounter',
					translation: '意外的相遇'
				}
			]
		}
	},
	onLoad(options) {
		if (options.word) {
			this.word = options.word
		}
	},
	methods: {
		addToVocabulary() {
			uni.showToast({
				title: '已加入生词本',
				icon: 'success'
			})
		},
		markAsMastered() {
			uni.showToast({
				title: '已标记为掌握',
				icon: 'success'
			})
		},
		nextWord() {
			uni.navigateBack()
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

.status-bar {
	height: 44px;
	width: 100%;
}

.header {
	background: #ffffff;
	padding: 30rpx;
	border-bottom: 1px solid #e9ecef;
}

.word-display {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.word {
	font-size: 48rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 10rpx;
}

.phonetic {
	font-size: 28rpx;
	color: #6c757d;
}

.nav-tabs {
	display: flex;
	background: #ffffff;
	padding: 0 30rpx;
	border-bottom: 1px solid #e9ecef;
}

.tab {
	flex: 1;
	padding: 30rpx 0;
	text-align: center;
	border-bottom: 3px solid transparent;
}

.tab.active {
	border-bottom-color: #4A90E2;
}

.tab text {
	font-size: 28rpx;
	color: #6c757d;
}

.tab.active text {
	color: #4A90E2;
	font-weight: 600;
}

.definition-section {
	padding: 30rpx;
}

.definition-card {
	background: #ffffff;
	border-radius: 15rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.definition-header {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
}

.icon {
	width: 60rpx;
	height: 60rpx;
	background: #e3f2fd;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-text {
	font-size: 32rpx;
}

.definition-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.definition-text {
	font-size: 32rpx;
	color: #2c3e50;
	line-height: 1.5;
}

.definition-note {
	font-size: 24rpx;
	color: #6c757d;
}

.arrow {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow-icon {
	font-size: 24rpx;
	color: #6c757d;
}

.related-section {
	padding: 0 30rpx;
}

.section-title {
	margin-bottom: 20rpx;
}

.section-title text {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.related-list {
	background: #ffffff;
	border-radius: 15rpx;
	overflow: hidden;
}

.related-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f1f3f4;
}

.related-item:last-child {
	border-bottom: none;
}

.item-icon {
	width: 50rpx;
	height: 50rpx;
	background: #e8f5e8;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 5rpx;
}

.item-text {
	font-size: 28rpx;
	color: #2c3e50;
	font-weight: 500;
}

.item-translation {
	font-size: 24rpx;
	color: #6c757d;
}

.item-arrow {
	width: 30rpx;
	height: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow-text {
	font-size: 20rpx;
	color: #4A90E2;
}

.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	padding: 20rpx 30rpx;
	gap: 20rpx;
	background: #ffffff;
	border-top: 1px solid #e9ecef;
}

.action-button {
	flex: 1;
	height: 100rpx;
	border-radius: 25rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	font-size: 28rpx;
	font-weight: 600;
}

.add-to-vocab {
	background: #dc3545;
	color: #ffffff;
}

.mastered {
	background: #fd7e14;
	color: #ffffff;
}

.next {
	background: #4A90E2;
	color: #ffffff;
}

.button-icon {
	font-size: 32rpx;
}

.button-text {
	font-size: 28rpx;
}
</style>
