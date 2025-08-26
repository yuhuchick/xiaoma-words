"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pointsManager = require("../../utils/pointsManager.js");
const _sfc_main = {
  data() {
    return {
      userPoints: {
        totalPoints: 0
      },
      isDrawing: false,
      rotationAngle: 0,
      prizes: [
        { name: "谢谢参与", icon: "🐰", probability: 40, points: 0 },
        { name: "10积分", icon: "🐱", probability: 25, points: 10 },
        { name: "20积分", icon: "🐶", probability: 20, points: 20 },
        { name: "50积分", icon: "🐼", probability: 10, points: 50 },
        { name: "100积分", icon: "🦊", probability: 4, points: 100 },
        { name: "200积分", icon: "🐯", probability: 1, points: 200 }
      ],
      drawHistory: []
    };
  },
  async onLoad() {
    await utils_pointsManager.pointsManager.init();
    this.loadPointsData();
    this.loadDrawHistory();
    this.testAngleCalculation();
  },
  methods: {
    loadPointsData() {
      this.userPoints = utils_pointsManager.pointsManager.getUserPoints();
    },
    loadDrawHistory() {
      try {
        const history = common_vendor.index.getStorageSync("drawHistory");
        if (history) {
          this.drawHistory = JSON.parse(history);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/lucky-draw/lucky-draw.vue:157", "加载抽奖历史失败:", error);
      }
    },
    saveDrawHistory() {
      try {
        common_vendor.index.setStorageSync("drawHistory", JSON.stringify(this.drawHistory));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/lucky-draw/lucky-draw.vue:165", "保存抽奖历史失败:", error);
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    getSegmentStyle(index) {
      const segmentAngle = 360 / this.prizes.length;
      const startAngle = index * segmentAngle;
      return {
        transform: `rotate(${startAngle}deg)`,
        background: this.getSegmentColor(index)
      };
    },
    getTextStyle(index) {
      const segmentAngle = 360 / this.prizes.length;
      const startAngle = index * segmentAngle;
      const centerAngle = startAngle + segmentAngle / 2;
      return {
        transform: `rotate(${centerAngle}deg)`,
        transformOrigin: "center center"
      };
    },
    getSegmentColor(index) {
      const colors = [
        "#E8B4CB",
        "#B8E6B8",
        "#FFE5B4",
        "#B4D4E8",
        "#E6D4B4",
        "#D4B4E8"
      ];
      return colors[index % colors.length];
    },
    getDrawButtonText() {
      if (this.isDrawing) {
        return "抽奖中...";
      } else if (this.userPoints.totalPoints < 100) {
        return "积分不足";
      } else {
        return "开始抽奖";
      }
    },
    startDraw() {
      if (this.isDrawing || this.userPoints.totalPoints < 100) {
        return;
      }
      this.isDrawing = true;
      const result = utils_pointsManager.pointsManager.usePoints(100, "转盘抽奖");
      if (!result.success) {
        common_vendor.index.showToast({
          title: result.message,
          icon: "none"
        });
        this.isDrawing = false;
        return;
      }
      const randomPrize = this.getRandomPrize();
      const prizeIndex = this.prizes.findIndex((p) => p.name === randomPrize.name);
      const segmentAngle = 360 / this.prizes.length;
      const segmentCenterAngle = prizeIndex * segmentAngle + segmentAngle / 2;
      const targetAngle = segmentCenterAngle - 90;
      const additionalRotation = 360 * 6 + targetAngle;
      const totalRotation = this.rotationAngle + additionalRotation;
      common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:254", "抽奖信息:", {
        prize: randomPrize.name,
        prizeIndex,
        segmentAngle,
        segmentCenterAngle,
        targetAngle,
        totalRotation
      });
      this.rotationAngle = totalRotation;
      setTimeout(() => {
        this.showDrawResult(randomPrize);
        this.isDrawing = false;
      }, 4e3);
    },
    getRandomPrize() {
      const random = Math.random() * 100;
      let cumulativeProbability = 0;
      for (const prize of this.prizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          return prize;
        }
      }
      return this.prizes[0];
    },
    showDrawResult(prize) {
      if (prize.points > 0) {
        utils_pointsManager.pointsManager.userPointsData.totalPoints += prize.points;
        utils_pointsManager.pointsManager.userPointsData.earnedPoints += prize.points;
        utils_pointsManager.pointsManager.saveToStorage();
      }
      const historyItem = {
        prize: prize.name,
        icon: prize.icon,
        time: (/* @__PURE__ */ new Date()).toLocaleString()
      };
      this.drawHistory.unshift(historyItem);
      if (this.drawHistory.length > 10) {
        this.drawHistory = this.drawHistory.slice(0, 10);
      }
      this.saveDrawHistory();
      this.loadPointsData();
      if (prize.points > 0) {
        common_vendor.index.showModal({
          title: `恭喜中奖！${prize.icon}`,
          content: `获得${prize.name}！
当前积分：${utils_pointsManager.pointsManager.userPointsData.totalPoints}`,
          showCancel: false,
          confirmText: "太棒了"
        });
      } else {
        common_vendor.index.showModal({
          title: `很遗憾 ${prize.icon}`,
          content: "本次未中奖，再接再厉！\n当前积分：" + utils_pointsManager.pointsManager.userPointsData.totalPoints,
          showCancel: false,
          confirmText: "继续努力"
        });
      }
    },
    // 测试角度计算方法
    testAngleCalculation() {
      common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:332", "=== 角度计算测试 ===");
      this.prizes.forEach((prize, index) => {
        const segmentAngle = 360 / this.prizes.length;
        const segmentCenterAngle = index * segmentAngle + segmentAngle / 2;
        const targetAngle = segmentCenterAngle - 90;
        common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:338", `奖品${index}: ${prize.name} (${prize.icon})`);
        common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:339", `  扇形角度: ${segmentAngle}°`);
        common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:340", `  扇形中心角度: ${segmentCenterAngle}°`);
        common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:341", `  目标旋转角度: ${targetAngle}°`);
        common_vendor.index.__f__("log", "at pages/lucky-draw/lucky-draw.vue:342", "---");
      });
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "88c9fae0": _ctx.rotationAngle + "deg"
  }));
};
const __setup__ = _sfc_main.setup;
_sfc_main.setup = __setup__ ? (props, ctx) => {
  __injectCSSVars__();
  return __setup__(props, ctx);
} : __injectCSSVars__;
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.userPoints.totalPoints),
    c: common_vendor.f($data.prizes, (prize, index, i0) => {
      return {
        a: common_vendor.t(prize.icon),
        b: common_vendor.s($options.getTextStyle(index)),
        c: index,
        d: common_vendor.s($options.getSegmentStyle(index))
      };
    }),
    d: $data.isDrawing ? 1 : "",
    e: `rotate(${$data.rotationAngle}deg)`,
    f: common_vendor.t($options.getDrawButtonText()),
    g: common_vendor.o((...args) => $options.startDraw && $options.startDraw(...args)),
    h: $data.isDrawing || $data.userPoints.totalPoints < 100 ? 1 : "",
    i: common_vendor.f($data.prizes, (prize, index, i0) => {
      return {
        a: common_vendor.t(prize.icon),
        b: common_vendor.t(prize.name),
        c: common_vendor.t(prize.probability),
        d: index
      };
    }),
    j: common_vendor.f($data.drawHistory, (record, index, i0) => {
      return {
        a: common_vendor.t(record.icon),
        b: common_vendor.t(record.prize),
        c: common_vendor.t(record.time),
        d: index
      };
    }),
    k: $data.drawHistory.length === 0
  }, $data.drawHistory.length === 0 ? {} : {}, {
    l: common_vendor.s(_ctx.__cssVars())
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d94fda97"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/lucky-draw/lucky-draw.js.map
