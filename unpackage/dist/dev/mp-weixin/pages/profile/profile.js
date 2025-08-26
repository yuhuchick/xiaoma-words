"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pointsManager = require("../../utils/pointsManager.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      userPoints: {
        totalPoints: 0,
        earnedPoints: 0,
        usedPoints: 0
      }
    };
  },
  async onLoad() {
    await utils_pointsManager.pointsManager.init();
    this.loadPointsData();
  },
  methods: {
    loadPointsData() {
      this.userPoints = utils_pointsManager.pointsManager.getUserPoints();
    },
    goToGoalSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/goal-settings/goal-settings"
      });
    },
    goToStatistics() {
      common_vendor.index.showToast({
        title: "学习统计",
        icon: "none"
      });
    },
    goToReminders() {
      common_vendor.index.showToast({
        title: "提醒设置",
        icon: "none"
      });
    },
    goToHelp() {
      common_vendor.index.showToast({
        title: "帮助反馈",
        icon: "none"
      });
    },
    goToPointsHistory() {
      common_vendor.index.showModal({
        title: "积分记录",
        content: "查看详细的积分获得和使用记录",
        showCancel: false,
        confirmText: "知道了"
      });
    },
    goToLuckyDraw() {
      if (this.userPoints.totalPoints < 100) {
        common_vendor.index.showModal({
          title: "积分不足",
          content: "抽奖需要100积分，当前积分不足",
          showCancel: false,
          confirmText: "去签到"
        });
      } else {
        common_vendor.index.navigateTo({
          url: "/pages/lucky-draw/lucky-draw"
        });
      }
    },
    performLuckyDraw() {
      const result = utils_pointsManager.pointsManager.usePoints(100, "积分抽奖");
      if (result.success) {
        const prizes = [
          { name: "谢谢参与", points: 0 },
          { name: "10积分", points: 10 },
          { name: "20积分", points: 20 },
          { name: "50积分", points: 50 },
          { name: "100积分", points: 100 }
        ];
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        if (randomPrize.points > 0) {
          utils_pointsManager.pointsManager.userPointsData.totalPoints += randomPrize.points;
          utils_pointsManager.pointsManager.userPointsData.earnedPoints += randomPrize.points;
          utils_pointsManager.pointsManager.saveToStorage();
          common_vendor.index.showModal({
            title: "恭喜中奖！",
            content: `获得${randomPrize.name}！
当前积分：${utils_pointsManager.pointsManager.userPointsData.totalPoints}`,
            showCancel: false,
            confirmText: "太棒了"
          });
        } else {
          common_vendor.index.showModal({
            title: "很遗憾",
            content: "本次未中奖，再接再厉！\n当前积分：" + result.remainingPoints,
            showCancel: false,
            confirmText: "继续努力"
          });
        }
        this.loadPointsData();
      } else {
        common_vendor.index.showToast({
          title: result.message,
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.t($data.userPoints.totalPoints),
    c: common_vendor.t($data.userPoints.totalPoints),
    d: common_vendor.t($data.userPoints.earnedPoints),
    e: common_vendor.t($data.userPoints.usedPoints),
    f: common_vendor.o((...args) => $options.goToPointsHistory && $options.goToPointsHistory(...args)),
    g: common_vendor.o((...args) => $options.goToLuckyDraw && $options.goToLuckyDraw(...args)),
    h: common_vendor.o((...args) => $options.goToGoalSettings && $options.goToGoalSettings(...args)),
    i: common_vendor.o((...args) => $options.goToStatistics && $options.goToStatistics(...args)),
    j: common_vendor.o((...args) => $options.goToReminders && $options.goToReminders(...args)),
    k: common_vendor.o((...args) => $options.goToHelp && $options.goToHelp(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
