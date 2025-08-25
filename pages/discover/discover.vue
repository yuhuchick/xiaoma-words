<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部 -->
		<view class="header">
			<text class="title">发现</text>
			<view class="search-btn" @click="search">
				<text class="search-icon">🔍</text>
			</view>
		</view>
		
		<!-- 推荐内容 -->
		<view class="recommendations">
			<view class="section-title">
				<text>推荐学习</text>
			</view>
			
			<view class="recommendation-cards">
				<view class="rec-card" @click="viewRecommendation">
					<view class="card-image">
						<text class="image-placeholder">📚</text>
					</view>
					<view class="card-content">
						<text class="card-title">每日单词挑战</text>
						<text class="card-desc">挑战你的词汇量，每天学习新单词</text>
						<view class="card-stats">
							<text class="stats-text">2.3万人参与</text>
						</view>
					</view>
				</view>
				
				<view class="rec-card" @click="viewRecommendation">
					<view class="card-image">
						<text class="image-placeholder">🎯</text>
					</view>
					<view class="card-content">
						<text class="card-title">词汇测试</text>
						<text class="card-desc">测试你的词汇掌握程度</text>
						<view class="card-stats">
							<text class="stats-text">1.8万人参与</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 热门话题 -->
		<view class="hot-topics">
			<view class="section-title">
				<text>热门话题</text>
			</view>
			
			<view class="topic-list">
				<view class="topic-item" @click="viewTopic">
					<view class="topic-icon">
						<text class="icon-text">🔥</text>
					</view>
					<view class="topic-content">
						<text class="topic-title">英语学习技巧分享</text>
						<text class="topic-desc">分享你的学习心得和经验</text>
					</view>
					<view class="topic-arrow">
						<text class="arrow-text">></text>
					</view>
				</view>
				
				<view class="topic-item" @click="viewTopic">
					<view class="topic-icon">
						<text class="icon-text">💡</text>
					</view>
					<view class="topic-content">
						<text class="topic-title">记忆单词的方法</text>
						<text class="topic-desc">高效记忆单词的实用技巧</text>
					</view>
					<view class="topic-arrow">
						<text class="arrow-text">></text>
					</view>
				</view>
				
				<view class="topic-item" @click="viewTopic">
					<view class="topic-icon">
						<text class="icon-text">🌟</text>
					</view>
					<view class="topic-content">
						<text class="topic-title">学习打卡挑战</text>
						<text class="topic-desc">坚持学习，养成好习惯</text>
					</view>
					<view class="topic-arrow">
						<text class="arrow-text">></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 学习资源 -->
		<view class="learning-resources">
			<view class="section-title">
				<text>学习资源</text>
			</view>
			
			<view class="resource-grid">
				<view class="resource-item" @click="viewResource">
					<view class="resource-icon">
						<text class="icon-text">📖</text>
					</view>
					<text class="resource-name">词汇书</text>
				</view>
				
				<view class="resource-item" @click="viewResource">
					<view class="resource-icon">
						<text class="icon-text">🎧</text>
					</view>
					<text class="resource-name">听力练习</text>
				</view>
				
				<view class="resource-item" @click="viewResource">
					<view class="resource-icon">
						<text class="icon-text">✍️</text>
					</view>
					<text class="resource-name">写作练习</text>
				</view>
				
				<view class="resource-item" @click="viewResource">
					<view class="resource-icon">
						<text class="icon-text">🎬</text>
					</view>
					<text class="resource-name">视频学习</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	methods: {
		search() {
			uni.showToast({
				title: '搜索功能',
				icon: 'none'
			})
		},
		viewRecommendation() {
			uni.showToast({
				title: '查看推荐内容',
				icon: 'none'
			})
		},
		viewTopic() {
			uni.showToast({
				title: '查看话题',
				icon: 'none'
			})
		},
		viewResource() {
			uni.showToast({
				title: '查看学习资源',
				icon: 'none'
			})
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
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background: #ffffff;
	border-bottom: 1px solid #e9ecef;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #2c3e50;
}

.search-btn {
	width: 60rpx;
	height: 60rpx;
	background: #f8f9fa;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.search-icon {
	font-size: 32rpx;
}

.recommendations {
	padding: 30rpx;
}

.section-title {
	margin-bottom: 20rpx;
}

.section-title text {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.recommendation-cards {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.rec-card {
	background: #ffffff;
	border-radius: 15rpx;
	padding: 30rpx;
	display: flex;
	gap: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-image {
	width: 120rpx;
	height: 120rpx;
	background: #e3f2fd;
	border-radius: 15rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.image-placeholder {
	font-size: 60rpx;
}

.card-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.card-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c3e50;
}

.card-desc {
	font-size: 24rpx;
	color: #6c757d;
	line-height: 1.4;
}

.card-stats {
	margin-top: 10rpx;
}

.stats-text {
	font-size: 22rpx;
	color: #4A90E2;
}

.hot-topics {
	padding: 0 30rpx 30rpx;
}

.topic-list {
	background: #ffffff;
	border-radius: 15rpx;
	overflow: hidden;
}

.topic-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f1f3f4;
}

.topic-item:last-child {
	border-bottom: none;
}

.topic-icon {
	width: 60rpx;
	height: 60rpx;
	background: #fff3e0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.icon-text {
	font-size: 32rpx;
}

.topic-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 5rpx;
}

.topic-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #2c3e50;
}

.topic-desc {
	font-size: 24rpx;
	color: #6c757d;
}

.topic-arrow {
	width: 30rpx;
	height: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow-text {
	font-size: 20rpx;
	color: #6c757d;
}

.learning-resources {
	padding: 0 30rpx 30rpx;
}

.resource-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.resource-item {
	background: #ffffff;
	border-radius: 15rpx;
	padding: 40rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.resource-icon {
	width: 80rpx;
	height: 80rpx;
	background: #e8f5e8;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.resource-name {
	font-size: 26rpx;
	color: #2c3e50;
	font-weight: 500;
}
</style>
