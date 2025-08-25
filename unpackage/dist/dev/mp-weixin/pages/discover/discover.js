"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {
    search() {
      common_vendor.index.showToast({
        title: "搜索功能",
        icon: "none"
      });
    },
    viewRecommendation() {
      common_vendor.index.showToast({
        title: "查看推荐内容",
        icon: "none"
      });
    },
    viewTopic() {
      common_vendor.index.showToast({
        title: "查看话题",
        icon: "none"
      });
    },
    viewResource() {
      common_vendor.index.showToast({
        title: "查看学习资源",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.search && $options.search(...args)),
    b: common_vendor.o((...args) => $options.viewRecommendation && $options.viewRecommendation(...args)),
    c: common_vendor.o((...args) => $options.viewRecommendation && $options.viewRecommendation(...args)),
    d: common_vendor.o((...args) => $options.viewTopic && $options.viewTopic(...args)),
    e: common_vendor.o((...args) => $options.viewTopic && $options.viewTopic(...args)),
    f: common_vendor.o((...args) => $options.viewTopic && $options.viewTopic(...args)),
    g: common_vendor.o((...args) => $options.viewResource && $options.viewResource(...args)),
    h: common_vendor.o((...args) => $options.viewResource && $options.viewResource(...args)),
    i: common_vendor.o((...args) => $options.viewResource && $options.viewResource(...args)),
    j: common_vendor.o((...args) => $options.viewResource && $options.viewResource(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7f6951af"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/discover/discover.js.map
