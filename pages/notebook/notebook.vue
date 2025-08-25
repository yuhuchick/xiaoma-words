<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		
		<!-- 头部 -->
		<view class="header">
			<text class="title">学习笔记本</text>
			<view class="add-btn" @click="addNote">
				<text class="add-icon">+</text>
			</view>
		</view>
		
		<!-- 筛选标签 -->
		<view class="filter-tabs">
			<view class="tab active">
				<text>全部</text>
			</view>
			<view class="tab">
				<text>生词本</text>
			</view>
			<view class="tab">
				<text>已掌握</text>
			</view>
		</view>
		
		<!-- 笔记列表 -->
		<view class="notes-list">
			<view 
				v-for="(note, index) in notes" 
				:key="index"
				class="note-item"
				@click="viewNote(note)"
			>
				<view class="note-header">
					<text class="word">{{ note.word }}</text>
					<text class="date">{{ note.date }}</text>
				</view>
				<view class="note-content">
					<text class="translation">{{ note.translation }}</text>
					<text class="note-text">{{ note.note }}</text>
				</view>
				<view class="note-tags">
					<view class="tag" v-for="(tag, tagIndex) in note.tags" :key="tagIndex">
						<text class="tag-text">{{ tag }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			notes: [
				{
					word: 'serendipity',
					translation: '意外发现美好事物的能力',
					note: '这个词很有趣，来自一个古老的波斯故事。',
					date: '2024-01-15',
					tags: ['生词', '有趣']
				},
				{
					word: 'ephemeral',
					translation: '短暂的，瞬息的',
					note: '形容事物存在时间很短，像昙花一现。',
					date: '2024-01-14',
					tags: ['已掌握', '形容词']
				},
				{
					word: 'mellifluous',
					translation: '甜美的，悦耳的',
					note: '形容声音甜美动听，如蜜般流畅。',
					date: '2024-01-13',
					tags: ['生词', '声音']
				}
			]
		}
	},
	methods: {
		addNote() {
			uni.showToast({
				title: '添加笔记',
				icon: 'none'
			})
		},
		viewNote(note) {
			uni.showToast({
				title: `查看笔记: ${note.word}`,
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

.add-btn {
	width: 60rpx;
	height: 60rpx;
	background: #4A90E2;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-icon {
	font-size: 40rpx;
	color: #ffffff;
	font-weight: bold;
}

.filter-tabs {
	display: flex;
	padding: 20rpx 30rpx;
	gap: 30rpx;
	background: #ffffff;
	border-bottom: 1px solid #e9ecef;
}

.tab {
	padding: 15rpx 25rpx;
	border-radius: 20rpx;
	background: #f8f9fa;
}

.tab.active {
	background: #4A90E2;
}

.tab text {
	font-size: 26rpx;
	color: #6c757d;
}

.tab.active text {
	color: #ffffff;
	font-weight: 600;
}

.notes-list {
	padding: 30rpx;
}

.note-item {
	background: #ffffff;
	border-radius: 15rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.note-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.word {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.date {
	font-size: 24rpx;
	color: #6c757d;
}

.note-content {
	margin-bottom: 20rpx;
}

.translation {
	font-size: 28rpx;
	color: #495057;
	margin-bottom: 10rpx;
	display: block;
}

.note-text {
	font-size: 26rpx;
	color: #6c757d;
	line-height: 1.5;
}

.note-tags {
	display: flex;
	gap: 10rpx;
}

.tag {
	background: #e3f2fd;
	padding: 8rpx 15rpx;
	border-radius: 15rpx;
}

.tag-text {
	font-size: 22rpx;
	color: #4A90E2;
}
</style>
