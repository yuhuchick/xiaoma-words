"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_settingsManager = require("../../utils/settingsManager.js");
const _sfc_main = {
  data() {
    return {
      targetStr: "20",
      allowExceed: true
    };
  },
  onLoad() {
    utils_settingsManager.settingsManager.init();
    const s = utils_settingsManager.settingsManager.getSettings();
    this.targetStr = String(s.dailyNewWordsTarget);
    this.allowExceed = s.allowExceed;
  },
  methods: {
    saveTarget() {
      try {
        utils_settingsManager.settingsManager.setDailyNewWordsTarget(this.targetStr);
        common_vendor.index.showToast({ title: "已保存", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "无效的目标值", icon: "none" });
      }
    },
    toggleExceed(e) {
      this.allowExceed = e.detail.value;
      utils_settingsManager.settingsManager.setAllowExceed(this.allowExceed);
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.targetStr,
    c: common_vendor.o(($event) => $data.targetStr = $event.detail.value),
    d: common_vendor.o((...args) => $options.saveTarget && $options.saveTarget(...args)),
    e: $data.allowExceed,
    f: common_vendor.o((...args) => $options.toggleExceed && $options.toggleExceed(...args)),
    g: common_vendor.t($data.allowExceed ? "允许" : "不允许")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a8cd8353"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/goal-settings/goal-settings.js.map
