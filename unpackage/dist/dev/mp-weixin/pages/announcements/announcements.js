"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_announcementManager = require("../../utils/announcementManager.js");
const _sfc_main = {
  data() {
    return {
      announcements: [],
      activeFilter: "all",
      showFilterTabs: false,
      filterTabs: [
        { key: "all", name: "全部" },
        { key: "maintenance", name: "维护" },
        { key: "update", name: "更新" },
        { key: "activity", name: "活动" },
        { key: "feature", name: "功能" },
        { key: "content", name: "内容" }
      ]
    };
  },
  computed: {
    filteredAnnouncements() {
      if (this.activeFilter === "all") {
        return this.announcements;
      }
      return this.announcements.filter(
        (announcement) => announcement.type === this.activeFilter
      );
    }
  },
  onLoad() {
    this.loadAnnouncements();
  },
  methods: {
    loadAnnouncements() {
      this.announcements = utils_announcementManager.announcementManager.getAllAnnouncements();
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    showFilter() {
      this.showFilterTabs = !this.showFilterTabs;
    },
    selectFilter(filter) {
      this.activeFilter = filter;
    },
    viewAnnouncement(announcement) {
      utils_announcementManager.announcementManager.markAnnouncementAsRead(announcement.id);
      common_vendor.index.showModal({
        title: announcement.title,
        content: announcement.content || announcement.title,
        showCancel: false,
        success: () => {
          this.loadAnnouncements();
        }
      });
    },
    isAnnouncementRead(announcementId) {
      return utils_announcementManager.announcementManager.isAnnouncementRead(announcementId);
    },
    getPriorityText(priority) {
      const priorityMap = {
        high: "重要",
        medium: "普通",
        low: "一般"
      };
      return priorityMap[priority] || "普通";
    },
    getPreviewText(content) {
      if (!content)
        return "";
      return content.length > 50 ? content.substring(0, 50) + "..." : content;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.o((...args) => $options.showFilter && $options.showFilter(...args)),
    c: $data.showFilterTabs
  }, $data.showFilterTabs ? {
    d: common_vendor.f($data.filterTabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: index,
        c: common_vendor.n({
          active: $data.activeFilter === tab.key
        }),
        d: common_vendor.o(($event) => $options.selectFilter(tab.key), index)
      };
    })
  } : {}, {
    e: common_vendor.f($options.filteredAnnouncements, (announcement, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(announcement.icon),
        b: common_vendor.t(announcement.title),
        c: announcement.isNew
      }, announcement.isNew ? {} : {}, {
        d: common_vendor.t($options.getPriorityText(announcement.priority)),
        e: common_vendor.n(announcement.priority),
        f: common_vendor.t(announcement.timeAgo),
        g: common_vendor.t($options.getPreviewText(announcement.content)),
        h: index,
        i: common_vendor.n({
          unread: !$options.isAnnouncementRead(announcement.id)
        }),
        j: common_vendor.o(($event) => $options.viewAnnouncement(announcement), index)
      });
    }),
    f: $options.filteredAnnouncements.length === 0
  }, $options.filteredAnnouncements.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-72d5943a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/announcements/announcements.js.map
