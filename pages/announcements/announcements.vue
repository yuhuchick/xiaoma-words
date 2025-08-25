<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部 -->
		<view class="header">
			<view class="header-content">
				<view class="back-button" @click="goBack">
					<text class="back-icon">←</text>
				</view>
				<text class="title">公告中心</text>
				<view class="filter-button" @click="showFilter">
					<text class="filter-icon">⚙</text>
				</view>
			</view>
		</view>
		
		<!-- 筛选标签 -->
		<view class="filter-tabs" v-if="showFilterTabs">
			<view 
				v-for="(tab, index) in filterTabs" 
				:key="index"
				:class="['filter-tab', { active: activeFilter === tab.key }]"
				@click="selectFilter(tab.key)"
			>
				<text>{{ tab.name }}</text>
			</view>
		</view>
		
		<!-- 公告列表 -->
		<view class="announcement-list">
			<view 
				v-for="(announcement, index) in filteredAnnouncements" 
				:key="index"
				:class="['announcement-item', { unread: !isAnnouncementRead(announcement.id) }]"
				@click="viewAnnouncement(announcement)"
			>
				<view class="announcement-icon">
					<text class="icon-text">{{ announcement.icon }}</text>
				</view>
				<view class="announcement-content">
					<view class="announcement-header">
						<text class="announcement-title">{{ announcement.title }}</text>
						<view class="announcement-badges">
							<view class="badge new" v-if="announcement.isNew">
								<text class="badge-text">新</text>
							</view>
							<view class="badge priority" :class="announcement.priority">
								<text class="badge-text">{{ getPriorityText(announcement.priority) }}</text>
							</view>
						</view>
					</view>
					<text class="announcement-time">{{ announcement.timeAgo }}</text>
					<text class="announcement-preview">{{ getPreviewText(announcement.content) }}</text>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-if="filteredAnnouncements.length === 0">
			<view class="empty-icon">📢</view>
			<text class="empty-text">暂无公告</text>
		</view>
	</view>
</template>

<script>
import announcementManager from '@/utils/announcementManager.js'

export default {
	data() {
		return {
			announcements: [],
			activeFilter: 'all',
			showFilterTabs: false,
			filterTabs: [
				{ key: 'all', name: '全部' },
				{ key: 'maintenance', name: '维护' },
				{ key: 'update', name: '更新' },
				{ key: 'activity', name: '活动' },
				{ key: 'feature', name: '功能' },
				{ key: 'content', name: '内容' }
			]
		}
	},
	computed: {
		filteredAnnouncements() {
			if (this.activeFilter === 'all') {
				return this.announcements
			}
			return this.announcements.filter(announcement => 
				announcement.type === this.activeFilter
			)
		}
	},
	onLoad() {
		this.loadAnnouncements()
	},
	methods: {
		loadAnnouncements() {
			this.announcements = announcementManager.getAllAnnouncements()
		},
		
		goBack() {
			uni.navigateBack()
		},
		
		showFilter() {
			this.showFilterTabs = !this.showFilterTabs
		},
		
		selectFilter(filter) {
			this.activeFilter = filter
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
					// 重新加载数据
					this.loadAnnouncements()
				}
			})
		},
		
		isAnnouncementRead(announcementId) {
			return announcementManager.isAnnouncementRead(announcementId)
		},
		
		getPriorityText(priority) {
			const priorityMap = {
				high: '重要',
				medium: '普通',
				low: '一般'
			}
			return priorityMap[priority] || '普通'
		},
		
		getPreviewText(content) {
			if (!content) return ''
			return content.length > 50 ? content.substring(0, 50) + '...' : content
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
	padding: 20rpx 30rpx;
	border-bottom: 1px solid #e9ecef;
}

.header-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.back-button {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 32rpx;
	color: #4A90E2;
}

.title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.filter-button {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.filter-icon {
	font-size: 28rpx;
	color: #6c757d;
}

.filter-tabs {
	background: #ffffff;
	padding: 20rpx 30rpx;
	border-bottom: 1px solid #e9ecef;
	display: flex;
	gap: 20rpx;
	overflow-x: auto;
}

.filter-tab {
	padding: 15rpx 25rpx;
	border-radius: 25rpx;
	background: #f8f9fa;
	white-space: nowrap;
}

.filter-tab.active {
	background: #4A90E2;
}

.filter-tab text {
	font-size: 26rpx;
	color: #6c757d;
}

.filter-tab.active text {
	color: #ffffff;
}

.announcement-list {
	padding: 20rpx 30rpx;
}

.announcement-item {
	background: #ffffff;
	border-radius: 15rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}

.announcement-item.unread {
	border-left: 4rpx solid #4A90E2;
	background: #f8f9ff;
}

.announcement-icon {
	width: 60rpx;
	height: 60rpx;
	background: #e3f2fd;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.icon-text {
	font-size: 28rpx;
}

.announcement-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.announcement-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 15rpx;
}

.announcement-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c3e50;
	line-height: 1.4;
	flex: 1;
}

.announcement-badges {
	display: flex;
	gap: 10rpx;
	flex-shrink: 0;
}

.badge {
	padding: 5rpx 10rpx;
	border-radius: 10rpx;
}

.badge.new {
	background: #ff6b6b;
}

.badge.priority {
	font-size: 20rpx;
}

.badge.priority.high {
	background: #ff6b6b;
}

.badge.priority.medium {
	background: #ffa726;
}

.badge.priority.low {
	background: #66bb6a;
}

.badge-text {
	color: #ffffff;
	font-size: 20rpx;
	font-weight: 600;
}

.announcement-time {
	font-size: 24rpx;
	color: #6c757d;
}

.announcement-preview {
	font-size: 26rpx;
	color: #495057;
	line-height: 1.5;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 30rpx;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #6c757d;
}
</style>
