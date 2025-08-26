<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-header">
			<view class="header-content">
				<text class="page-title">选择学习分类</text>
				<text class="page-subtitle">选择你想要的单词分类开始学习</text>
			</view>
		</view>
		
		<!-- 分类列表 -->
		<view class="category-list">
			<view 
				class="category-item" 
				v-for="category in categoryList" 
				:key="category.key"
				@click="selectCategory(category)"
			>
				<view class="category-image-card">
					<image class="book-image" :src="getBookImage(category.key)" mode="aspectFill"></image>
					<view class="book-count-bar">
						<text class="book-count">{{ category.wordCount }}个单词</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 推荐组合 -->
		<view class="recommendation-section" v-if="recommendations.length > 0">
			<view class="section-header">
				<text class="section-title">推荐组合</text>
				<text class="section-subtitle">适合不同学习目标的组合</text>
			</view>
			<view class="recommendation-list">
				<view 
					class="recommendation-item" 
					v-for="recommendation in recommendations" 
					:key="recommendation.id"
					@click="selectRecommendation(recommendation)"
				>
					<view class="recommendation-icon">{{ recommendation.icon }}</view>
					<view class="recommendation-content">
						<text class="recommendation-title">{{ recommendation.title }}</text>
						<text class="recommendation-desc">{{ recommendation.description }}</text>
						<view class="recommendation-tags">
							<text 
								class="tag" 
								v-for="tag in recommendation.tags" 
								:key="tag"
							>{{ getCategoryName(tag) }}</text>
						</view>
					</view>
					<view class="recommendation-arrow">→</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import wordManager from '@/utils/wordManager.js'

export default {
	data() {
		return {
			categoryList: [],
			recommendations: [
				{
					id: 'basic',
					title: '基础入门',
					description: '适合英语初学者',
					icon: '🌟',
					tags: ['zk', 'basic'],
					color: '#4A90E2'
				},
				{
					id: 'exam',
					title: '考试必备',
					description: '涵盖中考、高考核心词汇',
					icon: '📝',
					tags: ['zk', 'gk'],
					color: '#FF6B6B'
				},
				{
					id: 'college',
					title: '大学英语',
					description: '四级、六级词汇全覆盖',
					icon: '🎓',
					tags: ['cet4', 'cet6'],
					color: '#2ECC71'
				},
				{
					id: 'advanced',
					title: '高级词汇',
					description: '考研、托福、雅思、GRE',
					icon: '🚀',
					tags: ['ky', 'toefl', 'ielts', 'gre'],
					color: '#9B59B6'
				}
			]
		}
	},
	
	async onLoad() {
		// 确保wordManager已初始化
		await wordManager.init()
		
		// 获取分类列表
		this.categoryList = wordManager.getCategoryList()
	},
	
	methods: {
		selectCategory(category) {
			// 跳转到单词学习页面，传递分类参数
			uni.navigateTo({
				url: `/pages/word/word?mode=new&category=${category.key}`
			})
		},
		
		selectRecommendation(recommendation) {
			// 跳转到单词学习页面，传递多个标签参数
			const tags = recommendation.tags.join(',')
			uni.navigateTo({
				url: `/pages/word/word?mode=new&tags=${tags}`
			})
		},
		
		getCategoryName(tag) {
			const category = this.categoryList.find(cat => cat.key === tag)
			return category ? category.name : tag
		},
		
		getBookImage(key) {
			switch (key) {
				case 'zk': return '/static/books/zhongkao.png'
				case 'gk': return '/static/books/gaokao.png'
				case 'cet4': return '/static/books/siji.png'
				case 'cet6': return '/static/books/liuji.png'
				case 'ky': return '/static/books/koayan.png'
				case 'toefl': return '/static/books/tuofu.png'
				case 'ielts': return '/static/books/yasi.png'
				case 'gre': return '/static/books/gre.png'
				default: return '/static/books/zhongkao.png'
			}
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	padding: 0;
}

/* 页面标题 */
.page-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 60rpx 30rpx 40rpx;
	position: relative;
	overflow: hidden;
}

.page-header::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
	opacity: 0.3;
}

.header-content {
	position: relative;
	z-index: 2;
	text-align: center;
}

.page-title {
	color: #ffffff;
	font-size: 48rpx;
	font-weight: bold;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	display: block;
	margin-bottom: 15rpx;
}

.page-subtitle {
	color: rgba(255, 255, 255, 0.9);
	font-size: 28rpx;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

/* 分类列表 */
.category-list {
	padding: 40rpx 30rpx;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 30rpx;
}

.category-item {
	position: relative;
	height: 400rpx;
	perspective: 1000rpx;
	transform-style: preserve-3d;
	transition: all 0.3s ease;
}

.category-item:active {
	transform: scale(0.95);
}

.book-cover {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
	transform: rotateY(-15deg);
	transform-origin: left center;
	transition: all 0.3s ease;
}

.category-item:active .book-cover {
	transform: rotateY(-5deg);
}

.book-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.book-title {
	color: #ffffff;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 15rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.book-count {
	color: rgba(255, 255, 255, 0.9);
	font-size: 24rpx;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.book-spine {
	position: absolute;
	left: -10rpx;
	top: 20rpx;
	bottom: 20rpx;
	width: 20rpx;
	border-radius: 10rpx 0 0 10rpx;
	box-shadow: inset -2rpx 0 4rpx rgba(0, 0, 0, 0.2);
}

.book-pages {
	position: absolute;
	left: 10rpx;
	top: 10rpx;
	bottom: 10rpx;
	right: 10rpx;
	display: flex;
	flex-direction: column;
	gap: 2rpx;
}

.page {
	flex: 1;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 5rpx;
	box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

/* 推荐组合 */
.recommendation-section {
	padding: 0 30rpx 40rpx;
}

.section-header {
	margin-bottom: 30rpx;
	text-align: center;
}

.section-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #2c3e50;
	display: block;
	margin-bottom: 10rpx;
}

.section-subtitle {
	font-size: 26rpx;
	color: #6c757d;
}

.recommendation-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.recommendation-item {
	background: #ffffff;
	border-radius: 30rpx;
	padding: 35rpx 30rpx;
	display: flex;
	align-items: center;
	gap: 25rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	transition: all 0.3s ease;
	border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.recommendation-item:active {
	transform: translateY(2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.recommendation-icon {
	font-size: 60rpx;
	width: 90rpx;
	height: 90rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.recommendation-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.recommendation-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.recommendation-desc {
	font-size: 26rpx;
	color: #6c757d;
}

.recommendation-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.tag {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 20rpx;
	padding: 6rpx 12rpx;
	border-radius: 15rpx;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.recommendation-arrow {
	font-size: 40rpx;
	color: #4A90E2;
	font-weight: bold;
}

/* 图片书本卡片样式（新） */
.category-image-card {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 20rpx;
	overflow: hidden;
	background: #f5f5f5;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.book-image {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}

.book-count-bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.35);
	padding: 14rpx 18rpx;
	text-align: center;
}

.category-image-card .book-count {
	color: #ffffff;
	font-size: 24rpx;
}
</style>
