"use strict";
const common_vendor = require("../common/vendor.js");
class SettingsManager {
  constructor() {
    this.storageKey = "appSettings";
    this.settings = {
      // 每日目标新学习单词数
      dailyNewWordsTarget: 20,
      // 超额时是否允许继续学习（可用于家长或严格模式）
      allowExceed: true
    };
  }
  init() {
    try {
      const raw = common_vendor.index.getStorageSync(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
    }
  }
  save() {
    try {
      common_vendor.index.setStorageSync(this.storageKey, JSON.stringify(this.settings));
    } catch (e) {
    }
  }
  getSettings() {
    return { ...this.settings };
  }
  setDailyNewWordsTarget(value) {
    const num = parseInt(value);
    if (!Number.isFinite(num) || num <= 0) {
      throw new Error("目标必须是正整数");
    }
    this.settings.dailyNewWordsTarget = num;
    this.save();
  }
  setAllowExceed(flag) {
    this.settings.allowExceed = !!flag;
    this.save();
  }
}
const settingsManager = new SettingsManager();
exports.settingsManager = settingsManager;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/settingsManager.js.map
