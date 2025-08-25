/**
 * 公告管理工具类
 * 负责公告和banner数据的加载、管理等功能
 */
class AnnouncementManager {
	constructor() {
		this.announcementData = null
		this.banners = []
		this.announcements = []
	}

	/**
	 * 初始化公告管理器
	 */
	async init() {
		try {
			// 加载公告数据
			const response = await uni.request({
				url: '/static/data/announcements.json',
				method: 'GET'
			})
			this.announcementData = response.data
			
			// 处理banner数据
			this.banners = this.getActiveBanners()
			
			// 处理公告数据
			this.announcements = this.getActiveAnnouncements()
			
			console.log('公告数据加载成功')
			return true
		} catch (error) {
			console.error('公告数据加载失败:', error)
			return false
		}
	}

	/**
	 * 获取活跃的banner列表
	 */
	getActiveBanners() {
		if (!this.announcementData?.banners) return []
		
		const now = new Date()
		return this.announcementData.banners.filter(banner => {
			if (!banner.isActive) return false
			
			const startTime = new Date(banner.startTime)
			const endTime = new Date(banner.endTime)
			
			return now >= startTime && now <= endTime
		})
	}

	/**
	 * 获取活跃的公告列表
	 */
	getActiveAnnouncements(limit = 4) {
		if (!this.announcementData?.announcements) return []
		
		// 按优先级和发布时间排序
		const sortedAnnouncements = this.announcementData.announcements.sort((a, b) => {
			// 优先级排序：high > medium > low
			const priorityOrder = { high: 3, medium: 2, low: 1 }
			const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
			
			if (priorityDiff !== 0) return priorityDiff
			
			// 发布时间排序：最新的在前
			return new Date(b.time) - new Date(a.time)
		})
		
		return sortedAnnouncements.slice(0, limit)
	}

	/**
	 * 获取所有公告
	 */
	getAllAnnouncements() {
		return this.announcementData?.announcements || []
	}

	/**
	 * 根据类型获取公告
	 */
	getAnnouncementsByType(type) {
		if (!this.announcementData?.announcements) return []
		
		return this.announcementData.announcements.filter(announcement => 
			announcement.type === type
		)
	}

	/**
	 * 获取新公告数量
	 */
	getNewAnnouncementCount() {
		if (!this.announcementData?.announcements) return 0
		
		return this.announcementData.announcements.filter(announcement => 
			announcement.isNew
		).length
	}

	/**
	 * 标记公告为已读
	 */
	markAnnouncementAsRead(announcementId) {
		// 这里可以保存到本地存储，标记用户已读的公告
		try {
			const readAnnouncements = uni.getStorageSync('readAnnouncements') || []
			if (!readAnnouncements.includes(announcementId)) {
				readAnnouncements.push(announcementId)
				uni.setStorageSync('readAnnouncements', readAnnouncements)
			}
		} catch (error) {
			console.error('保存已读状态失败:', error)
		}
	}

	/**
	 * 检查公告是否已读
	 */
	isAnnouncementRead(announcementId) {
		try {
			const readAnnouncements = uni.getStorageSync('readAnnouncements') || []
			return readAnnouncements.includes(announcementId)
		} catch (error) {
			return false
		}
	}

	/**
	 * 获取未读公告
	 */
	getUnreadAnnouncements() {
		if (!this.announcementData?.announcements) return []
		
		return this.announcementData.announcements.filter(announcement => 
			!this.isAnnouncementRead(announcement.id)
		)
	}

	/**
	 * 获取公告详情
	 */
	getAnnouncementById(id) {
		if (!this.announcementData?.announcements) return null
		
		return this.announcementData.announcements.find(announcement => 
			announcement.id === id
		)
	}

	/**
	 * 获取banner详情
	 */
	getBannerById(id) {
		if (!this.announcementData?.banners) return null
		
		return this.announcementData.banners.find(banner => 
			banner.id === id
		)
	}

	/**
	 * 格式化时间
	 */
	formatTimeAgo(dateString) {
		const now = new Date()
		const date = new Date(dateString)
		const diffInSeconds = Math.floor((now - date) / 1000)
		
		if (diffInSeconds < 60) {
			return '刚刚'
		} else if (diffInSeconds < 3600) {
			return `${Math.floor(diffInSeconds / 60)}分钟前`
		} else if (diffInSeconds < 86400) {
			return `${Math.floor(diffInSeconds / 3600)}小时前`
		} else if (diffInSeconds < 2592000) {
			return `${Math.floor(diffInSeconds / 86400)}天前`
		} else if (diffInSeconds < 31536000) {
			return `${Math.floor(diffInSeconds / 2592000)}个月前`
		} else {
			return `${Math.floor(diffInSeconds / 31536000)}年前`
		}
	}

	/**
	 * 更新公告数据
	 */
	updateAnnouncementData(newData) {
		this.announcementData = newData
		this.banners = this.getActiveBanners()
		this.announcements = this.getActiveAnnouncements()
	}

	/**
	 * 添加新公告
	 */
	addAnnouncement(announcement) {
		if (!this.announcementData) {
			this.announcementData = { announcements: [], banners: [] }
		}
		
		// 生成新ID
		const maxId = Math.max(...this.announcementData.announcements.map(a => a.id), 0)
		announcement.id = maxId + 1
		
		// 设置默认值
		announcement.time = announcement.time || new Date().toISOString()
		announcement.timeAgo = this.formatTimeAgo(announcement.time)
		announcement.isNew = true
		announcement.priority = announcement.priority || 'medium'
		
		this.announcementData.announcements.unshift(announcement)
		this.announcements = this.getActiveAnnouncements()
	}

	/**
	 * 添加新banner
	 */
	addBanner(banner) {
		if (!this.announcementData) {
			this.announcementData = { announcements: [], banners: [] }
		}
		
		// 生成新ID
		const maxId = Math.max(...this.announcementData.banners.map(b => b.id), 0)
		banner.id = maxId + 1
		
		// 设置默认值
		banner.isActive = true
		banner.startTime = banner.startTime || new Date().toISOString().split('T')[0]
		banner.endTime = banner.endTime || '2024-12-31'
		
		this.announcementData.banners.push(banner)
		this.banners = this.getActiveBanners()
	}

	/**
	 * 删除公告
	 */
	removeAnnouncement(id) {
		if (!this.announcementData?.announcements) return false
		
		const index = this.announcementData.announcements.findIndex(a => a.id === id)
		if (index !== -1) {
			this.announcementData.announcements.splice(index, 1)
			this.announcements = this.getActiveAnnouncements()
			return true
		}
		return false
	}

	/**
	 * 删除banner
	 */
	removeBanner(id) {
		if (!this.announcementData?.banners) return false
		
		const index = this.announcementData.banners.findIndex(b => b.id === id)
		if (index !== -1) {
			this.announcementData.banners.splice(index, 1)
			this.banners = this.getActiveBanners()
			return true
		}
		return false
	}

	/**
	 * 保存数据到本地存储
	 */
	saveToStorage() {
		try {
			uni.setStorageSync('announcementData', JSON.stringify(this.announcementData))
		} catch (error) {
			console.error('保存公告数据失败:', error)
		}
	}

	/**
	 * 从本地存储加载数据
	 */
	loadFromStorage() {
		try {
			const data = uni.getStorageSync('announcementData')
			if (data) {
				this.announcementData = JSON.parse(data)
				this.banners = this.getActiveBanners()
				this.announcements = this.getActiveAnnouncements()
			}
		} catch (error) {
			console.error('加载公告数据失败:', error)
		}
	}
}

// 创建单例实例
const announcementManager = new AnnouncementManager()

export default announcementManager
