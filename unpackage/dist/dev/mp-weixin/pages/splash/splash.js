"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loadingStep: 0,
      loadingText: "正在加载...",
      loadingTexts: [
        "正在准备学习环境...",
        "正在加载单词库...",
        "正在初始化应用...",
        "准备就绪！"
      ]
    };
  },
  onLoad() {
    this.startLoading();
  },
  methods: {
    startLoading() {
      let step = 0;
      const timer = setInterval(() => {
        step++;
        this.loadingStep = step;
        this.loadingText = this.loadingTexts[step - 1] || "准备就绪！";
        if (step >= 4) {
          clearInterval(timer);
          setTimeout(() => {
            this.goToHome();
          }, 1e3);
        }
      }, 800);
    },
    goToHome() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.loadingStep >= 1 ? 1 : "",
    c: $data.loadingStep >= 2 ? 1 : "",
    d: $data.loadingStep >= 3 ? 1 : "",
    e: common_vendor.t($data.loadingText)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b5d3b004"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/splash/splash.js.map
