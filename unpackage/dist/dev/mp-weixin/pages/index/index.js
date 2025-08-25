"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_announcementManager = require("../../utils/announcementManager.js");
const utils_wordManager = require("../../utils/wordManager.js");
const _sfc_main = {
  data() {
    return {
      banners: [],
      announcements: [],
      newAnnouncementCount: 0,
      newWordsCount: 0,
      reviewWordsCount: 0,
      mainBanners: [
        {
          id: 1,
          title: "智能学习算法",
          description: "科学记忆，高效背单词",
          icon: "🧠",
          bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          url: "/pages/word/word"
        },
        {
          id: 2,
          title: "学习挑战赛",
          description: "参与挑战，赢取奖励",
          icon: "🏆",
          bgColor: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
          url: "/pages/calendar/calendar"
        },
        {
          id: 3,
          title: "每日签到",
          description: "连续签到，获得奖励",
          icon: "📅",
          bgColor: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
          url: "/pages/profile/profile"
        }
      ]
    };
  },
  async onLoad() {
    await Promise.all([
      utils_announcementManager.announcementManager.init(),
      utils_wordManager.wordManager.init()
    ]);
    utils_announcementManager.announcementManager.loadFromStorage();
    utils_wordManager.wordManager.loadUserStudyDataFromStorage();
    this.banners = utils_announcementManager.announcementManager.banners;
    this.announcements = utils_announcementManager.announcementManager.announcements;
    this.newAnnouncementCount = utils_announcementManager.announcementManager.getNewAnnouncementCount();
    this.updateStudyCounts();
  },
  methods: {
    updateStudyCounts() {
      this.newWordsCount = utils_wordManager.wordManager.getNewWords("all", 100).length;
      this.reviewWordsCount = utils_wordManager.wordManager.getTodayReviewWords().length;
    },
    handleMainBannerClick(banner) {
      if (banner.url) {
        common_vendor.index.navigateTo({
          url: banner.url
        });
      }
    },
    startNewWordsStudy() {
      common_vendor.index.navigateTo({
        url: "/pages/word/word?mode=new"
      });
    },
    startReviewStudy() {
      common_vendor.index.navigateTo({
        url: "/pages/word/word"
      });
    },
    handleBannerClick(banner) {
      if (banner.url) {
        common_vendor.index.navigateTo({
          url: banner.url
        });
      }
    },
    viewAnnouncement(announcement) {
      utils_announcementManager.announcementManager.markAnnouncementAsRead(announcement.id);
      common_vendor.index.showModal({
        title: announcement.title,
        content: announcement.content || announcement.title,
        showCancel: false,
        success: () => {
          this.newAnnouncementCount = utils_announcementManager.announcementManager.getNewAnnouncementCount();
        }
      });
    },
    viewAllAnnouncements() {
      common_vendor.index.navigateTo({
        url: "/pages/announcements/announcements"
      });
    },
    isAnnouncementRead(announcementId) {
      return utils_announcementManager.announcementManager.isAnnouncementRead(announcementId);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.mainBanners, (banner, index, i0) => {
      return {
        a: banner.bgColor,
        b: common_vendor.t(banner.icon),
        c: common_vendor.t(banner.title),
        d: common_vendor.t(banner.description),
        e: index,
        f: common_vendor.o(($event) => $options.handleMainBannerClick(banner), index)
      };
    }),
    b: common_vendor.t($data.newWordsCount),
    c: common_vendor.o((...args) => $options.startNewWordsStudy && $options.startNewWordsStudy(...args)),
    d: common_vendor.t($data.reviewWordsCount),
    e: common_vendor.o((...args) => $options.startReviewStudy && $options.startReviewStudy(...args)),
    f: $data.announcements.length > 0
  }, $data.announcements.length > 0 ? common_vendor.e({
    g: $data.newAnnouncementCount > 0
  }, $data.newAnnouncementCount > 0 ? {
    h: common_vendor.t($data.newAnnouncementCount)
  } : {}, {
    i: common_vendor.o((...args) => $options.viewAllAnnouncements && $options.viewAllAnnouncements(...args)),
    j: common_vendor.f($data.announcements, (announcement, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(announcement.icon),
        b: common_vendor.t(announcement.title),
        c: common_vendor.t(announcement.timeAgo),
        d: announcement.isNew
      }, announcement.isNew ? {} : {}, {
        e: index,
        f: common_vendor.o(($event) => $options.viewAnnouncement(announcement), index)
      });
    })
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
