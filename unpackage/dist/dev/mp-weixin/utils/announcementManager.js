"use strict";
const common_vendor = require("../common/vendor.js");
class AnnouncementManager {
  constructor() {
    this.announcementData = null;
    this.banners = [];
    this.announcements = [];
  }
  /**
   * 初始化公告管理器
   */
  async init() {
    try {
      const response = await common_vendor.index.request({
        url: "/static/data/announcements.json",
        method: "GET"
      });
      this.announcementData = response.data;
      this.banners = this.getActiveBanners();
      this.announcements = this.getActiveAnnouncements();
      common_vendor.index.__f__("log", "at utils/announcementManager.js:30", "公告数据加载成功");
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/announcementManager.js:33", "公告数据加载失败:", error);
      return false;
    }
  }
  /**
   * 获取活跃的banner列表
   */
  getActiveBanners() {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.banners))
      return [];
    const now = /* @__PURE__ */ new Date();
    return this.announcementData.banners.filter((banner) => {
      if (!banner.isActive)
        return false;
      const startTime = new Date(banner.startTime);
      const endTime = new Date(banner.endTime);
      return now >= startTime && now <= endTime;
    });
  }
  /**
   * 获取活跃的公告列表
   */
  getActiveAnnouncements(limit = 4) {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.announcements))
      return [];
    const sortedAnnouncements = this.announcementData.announcements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0)
        return priorityDiff;
      return new Date(b.time) - new Date(a.time);
    });
    return sortedAnnouncements.slice(0, limit);
  }
  /**
   * 获取所有公告
   */
  getAllAnnouncements() {
    var _a;
    return ((_a = this.announcementData) == null ? void 0 : _a.announcements) || [];
  }
  /**
   * 根据类型获取公告
   */
  getAnnouncementsByType(type) {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.announcements))
      return [];
    return this.announcementData.announcements.filter(
      (announcement) => announcement.type === type
    );
  }
  /**
   * 获取新公告数量
   */
  getNewAnnouncementCount() {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.announcements))
      return 0;
    return this.announcementData.announcements.filter(
      (announcement) => announcement.isNew
    ).length;
  }
  /**
   * 标记公告为已读
   */
  markAnnouncementAsRead(announcementId) {
    try {
      const readAnnouncements = common_vendor.index.getStorageSync("readAnnouncements") || [];
      if (!readAnnouncements.includes(announcementId)) {
        readAnnouncements.push(announcementId);
        common_vendor.index.setStorageSync("readAnnouncements", readAnnouncements);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/announcementManager.js:117", "保存已读状态失败:", error);
    }
  }
  /**
   * 检查公告是否已读
   */
  isAnnouncementRead(announcementId) {
    try {
      const readAnnouncements = common_vendor.index.getStorageSync("readAnnouncements") || [];
      return readAnnouncements.includes(announcementId);
    } catch (error) {
      return false;
    }
  }
  /**
   * 获取未读公告
   */
  getUnreadAnnouncements() {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.announcements))
      return [];
    return this.announcementData.announcements.filter(
      (announcement) => !this.isAnnouncementRead(announcement.id)
    );
  }
  /**
   * 获取公告详情
   */
  getAnnouncementById(id) {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.announcements))
      return null;
    return this.announcementData.announcements.find(
      (announcement) => announcement.id === id
    );
  }
  /**
   * 获取banner详情
   */
  getBannerById(id) {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.banners))
      return null;
    return this.announcementData.banners.find(
      (banner) => banner.id === id
    );
  }
  /**
   * 格式化时间
   */
  formatTimeAgo(dateString) {
    const now = /* @__PURE__ */ new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1e3);
    if (diffInSeconds < 60) {
      return "刚刚";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 2592e3) {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else if (diffInSeconds < 31536e3) {
      return `${Math.floor(diffInSeconds / 2592e3)}个月前`;
    } else {
      return `${Math.floor(diffInSeconds / 31536e3)}年前`;
    }
  }
  /**
   * 更新公告数据
   */
  updateAnnouncementData(newData) {
    this.announcementData = newData;
    this.banners = this.getActiveBanners();
    this.announcements = this.getActiveAnnouncements();
  }
  /**
   * 添加新公告
   */
  addAnnouncement(announcement) {
    if (!this.announcementData) {
      this.announcementData = { announcements: [], banners: [] };
    }
    const maxId = Math.max(...this.announcementData.announcements.map((a) => a.id), 0);
    announcement.id = maxId + 1;
    announcement.time = announcement.time || (/* @__PURE__ */ new Date()).toISOString();
    announcement.timeAgo = this.formatTimeAgo(announcement.time);
    announcement.isNew = true;
    announcement.priority = announcement.priority || "medium";
    this.announcementData.announcements.unshift(announcement);
    this.announcements = this.getActiveAnnouncements();
  }
  /**
   * 添加新banner
   */
  addBanner(banner) {
    if (!this.announcementData) {
      this.announcementData = { announcements: [], banners: [] };
    }
    const maxId = Math.max(...this.announcementData.banners.map((b) => b.id), 0);
    banner.id = maxId + 1;
    banner.isActive = true;
    banner.startTime = banner.startTime || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    banner.endTime = banner.endTime || "2024-12-31";
    this.announcementData.banners.push(banner);
    this.banners = this.getActiveBanners();
  }
  /**
   * 删除公告
   */
  removeAnnouncement(id) {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.announcements))
      return false;
    const index = this.announcementData.announcements.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.announcementData.announcements.splice(index, 1);
      this.announcements = this.getActiveAnnouncements();
      return true;
    }
    return false;
  }
  /**
   * 删除banner
   */
  removeBanner(id) {
    var _a;
    if (!((_a = this.announcementData) == null ? void 0 : _a.banners))
      return false;
    const index = this.announcementData.banners.findIndex((b) => b.id === id);
    if (index !== -1) {
      this.announcementData.banners.splice(index, 1);
      this.banners = this.getActiveBanners();
      return true;
    }
    return false;
  }
  /**
   * 保存数据到本地存储
   */
  saveToStorage() {
    try {
      common_vendor.index.setStorageSync("announcementData", JSON.stringify(this.announcementData));
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/announcementManager.js:278", "保存公告数据失败:", error);
    }
  }
  /**
   * 从本地存储加载数据
   */
  loadFromStorage() {
    try {
      const data = common_vendor.index.getStorageSync("announcementData");
      if (data) {
        this.announcementData = JSON.parse(data);
        this.banners = this.getActiveBanners();
        this.announcements = this.getActiveAnnouncements();
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/announcementManager.js:294", "加载公告数据失败:", error);
    }
  }
}
const announcementManager = new AnnouncementManager();
exports.announcementManager = announcementManager;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/announcementManager.js.map
