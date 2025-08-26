<template>
	<view class="container">
		<!-- 主要轮播图 -->
		<view class="main-banner-section">
			<swiper class="main-banner-swiper" :indicator-dots="true" :autoplay="true" :interval="4000" :duration="500">
				<swiper-item v-for="(banner, index) in mainBanners" :key="index" @click="handleMainBannerClick(banner)">
					<view class="main-banner-item">
						<image class="main-banner-image" :src="banner.image || '/static/banners/welcome.png'" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 快速学习入口 -->
		<view class="quick-study-section">
			<view class="section-header">
				<text class="section-title">快速学习</text>
				<text class="section-subtitle">开始你的单词之旅</text>
			</view>
			<view class="study-options">
				<view class="study-option new-words" @click="startNewWordsStudy">
					<view class="option-icon">📚</view>
					<view class="option-content">
						<text class="option-title">新单词学习</text>
						<text class="option-desc">学习新单词</text>
						<text class="option-count">{{ newWordsCount }}个待学习</text>
					</view>
					<view class="option-arrow">→</view>
				</view>
				<view class="study-option review-words" @click="startReviewStudy">
					<view class="option-icon">🔄</view>
					<view class="option-content">
						<text class="option-title">单词复习</text>
						<text class="option-desc">复习已学单词</text>
						<text class="option-count">{{ reviewWordsCount }}个待复习</text>
					</view>
					<view class="option-arrow">→</view>
				</view>
			</view>
		</view>
		
		<!-- 公告板块 -->
		<view class="announcement-section" v-if="announcements.length > 0">
			<view class="announcement-header">
				<view class="announcement-title">
					<text class="title-icon">📢</text>
					<text class="title-text">最新公告</text>
					<view class="new-badge" v-if="newAnnouncementCount > 0">
						<text class="badge-text">{{ newAnnouncementCount }}</text>
					</view>
				</view>
				<view class="announcement-more" @click="viewAllAnnouncements">
					<text class="more-text">更多</text>
					<text class="more-icon">></text>
				</view>
			</view>
			<view class="announcement-scroll">
				<swiper class="announcement-swiper" :vertical="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
					<swiper-item v-for="(announcement, index) in announcements" :key="index" @click="viewAnnouncement(announcement)">
						<view class="announcement-scroll-item">
							<view class="scroll-icon">{{ announcement.icon }}</view>
							<view class="scroll-content">
								<text class="scroll-text">{{ announcement.title }}</text>
								<text class="scroll-time">{{ announcement.timeAgo }}</text>
							</view>
							<view class="scroll-badge" v-if="announcement.isNew">
								<text class="badge-text">新</text>
							</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</view>
		
		<!-- 学习统计 -->
		<view class="stats-section">
			<view class="section-header">
				<text class="section-title">学习统计</text>
			</view>
			<view class="stats-cards">
				<view class="stat-card streak">
					<view class="stat-icon">🔥</view>
					<view class="stat-content">
						<text class="stat-number">{{ streakDays }}</text>
						<text class="stat-label">连续学习</text>
					</view>
				</view>
				<view class="stat-card time">
					<view class="stat-icon">⏰</view>
					<view class="stat-content">
						<text class="stat-number">{{ studyHours }}</text>
						<text class="stat-label">学习时长</text>
					</view>
				</view>
				<view class="stat-card words">
					<view class="stat-icon">📖</view>
					<view class="stat-content">
						<text class="stat-number">{{ learnedTotal }}</text>
						<text class="stat-label">已学单词</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import announcementManager from '@/utils/announcementManager.js'
import wordManager from '@/utils/wordManager.js'

export default {
	data() {
		return {
			banners: [],
			announcements: [],
			newAnnouncementCount: 0,
			newWordsCount: 0,
			reviewWordsCount: 0,
			streakDays: 0,
			studyHours: 0,
			learnedTotal: 0,
			mainBanners: [
				{ id: 1, image: '/static/banners/image.png', url: '/pages/word/word' },
				{ id: 2, image: '/static/banners/banner2.png', url: '/pages/word/word' },
				{ id: 3, image: '/static/banners/banner3.png', url: '/pages/word/word' }
			]
		}
	},
	async onLoad() {
		// 初始化数据管理器
		await Promise.all([
			announcementManager.init(),
			wordManager.init()
		])
		
		// 获取数据
		this.banners = announcementManager.banners
		this.announcements = announcementManager.announcements
		this.newAnnouncementCount = announcementManager.getNewAnnouncementCount()
		
		// 获取学习数据
		this.updateStudyCounts()
	},
	onShow() {
		// 返回首页时刷新统计
		this.updateStudyCounts()
	},
	methods: {
		updateStudyCounts() {
			// 首页显示真实数据
			const s = wordManager.getHomeSummary()
			this.newWordsCount = s.toLearn
			this.reviewWordsCount = s.toReview
			this.streakDays = s.streak
			this.studyHours = s.hours
			this.learnedTotal = s.learnedTotal
		},
		
		handleMainBannerClick(banner) {
			if (banner.url) {
				uni.navigateTo({
					url: banner.url
				})
			}
		},
		
		startNewWordsStudy() {
			uni.navigateTo({
				url: '/pages/word-category/word-category'
			})
		},
		
		startReviewStudy() {
			uni.navigateTo({
				url: '/pages/word/word?mode=review'
			})
		},
		
		handleBannerClick(banner) {
			if (banner.url) {
				uni.navigateTo({
					url: banner.url
				})
			}
		},
		
		viewAnnouncement(announcement) {
			// 标记为已读
			announcementManager.markAnnouncementAsRead(announcement.id)
			
			// 显示公告详情
			uni.showModal({
				title: announcement.title,
				content: announcement.content || announcement.title,
				showCancel: false,
				success: () => {
					// 更新未读数量
					this.newAnnouncementCount = announcementManager.getNewAnnouncementCount()
				}
			})
		},
		
		viewAllAnnouncements() {
			uni.navigateTo({
				url: '/pages/announcements/announcements'
			})
		},
		
		isAnnouncementRead(announcementId) {
			return announcementManager.isAnnouncementRead(announcementId)
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

/* 主要轮播图样式 */
.main-banner-section {
	padding: 0;
	margin: 0;
}

.main-banner-swiper {
	height: 450rpx;
	border-radius: 0;
	overflow: hidden;
	box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.1);
}

.main-banner-image {
	width: 100%;
	height: 100%;
	display: block;
}

.main-banner-item {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
}

.banner-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
}

.banner-content {
	position: relative;
	z-index: 2;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.banner-icon {
	font-size: 80rpx;
	margin-bottom: 10rpx;
}

.banner-title {
	color: #ffffff;
	font-size: 40rpx;
	font-weight: bold;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.banner-desc {
	color: rgba(255, 255, 255, 0.9);
	font-size: 28rpx;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

/* 快速学习入口 */
.quick-study-section {
	padding: 30rpx 30rpx 30rpx;
	margin-top: -20rpx;
	position: relative;
	z-index: 10;
}

.section-header {
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #2c3e50;
	display: block;
	margin-top: 20rpx;
	margin-bottom: 10rpx;
}

.section-subtitle {
	font-size: 26rpx;
	color: #6c757d;
}

.study-options {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.study-option {
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

.study-option:active {
	transform: translateY(2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.study-option.new-words {
	border-left: 8rpx solid #4A90E2;
	background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
}

.study-option.review-words {
	border-left: 8rpx solid #ff6b6b;
	background: linear-gradient(135deg, #ffffff 0%, #fff8f8 100%);
}

.option-icon {
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

.option-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.option-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.option-desc {
	font-size: 26rpx;
	color: #6c757d;
}

.option-count {
	font-size: 24rpx;
	color: #4A90E2;
	font-weight: 500;
}

.option-arrow {
	font-size: 40rpx;
	color: #4A90E2;
	font-weight: bold;
}

/* 公告板块样式 */
.announcement-section {
	margin: 0 30rpx 30rpx;
	background: #ffffff;
	border-radius: 30rpx;
	padding: 35rpx 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.announcement-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.announcement-title {
	display: flex;
	align-items: center;
	gap: 10rpx;
	position: relative;
}

.title-icon {
	font-size: 32rpx;
}

.title-text {
	color: #2c3e50;
	font-size: 28rpx;
	font-weight: 600;
}

.new-badge {
	background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
	border-radius: 15rpx;
	padding: 4rpx 12rpx;
	min-width: 30rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.announcement-more {
	display: flex;
	align-items: center;
	gap: 5rpx;
}

.more-text {
	color: #6c757d;
	font-size: 24rpx;
}

.more-icon {
	color: #6c757d;
	font-size: 20rpx;
}

.announcement-scroll {
	height: 120rpx;
	position: relative;
	overflow: hidden;
}

.announcement-swiper {
	height: 100%;
}

.announcement-scroll-item {
	display: flex;
	align-items: center;
	padding: 15rpx 0;
	height: 120rpx;
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.announcement-scroll-item:active {
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 20rpx;
}

.scroll-icon {
	font-size: 32rpx;
	width: 60rpx;
	height: 60rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
	box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.scroll-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 5rpx;
	overflow: hidden;
}

.scroll-text {
	color: #2c3e50;
	font-size: 26rpx;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.scroll-time {
	color: #6c757d;
	font-size: 22rpx;
}

.scroll-badge {
	background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
	border-radius: 15rpx;
	padding: 6rpx 12rpx;
	margin-left: 15rpx;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.badge-text {
	color: #ffffff;
	font-size: 20rpx;
	font-weight: 600;
}

/* 学习统计 */
.stats-section {
	padding: 0 30rpx 30rpx;
}

.stats-cards {
	display: flex;
	gap: 20rpx;
}

.stat-card {
	flex: 1;
	background: #ffffff;
	border-radius: 30rpx;
	padding: 35rpx 25rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	border: 1rpx solid rgba(255, 255, 255, 0.8);
	transition: all 0.3s ease;
}

.stat-card:active {
	transform: translateY(2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.stat-card.streak {
	background: linear-gradient(135deg, #ffffff 0%, #fff8f0 100%);
}

.stat-card.time {
	background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
}

.stat-card.words {
	background: linear-gradient(135deg, #ffffff 0%, #f8fff0 100%);
}

.stat-icon {
	font-size: 40rpx;
	width: 70rpx;
	height: 70rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
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
	font-size: 22rpx;
	color: #6c757d;
}
</style>
