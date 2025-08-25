"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      word: "serendipity",
      phonetic: "/ˌserənˈdɪpəti/",
      definition: "意外发现美好事物的能力",
      relatedWords: [
        {
          word: "serendipitous discovery",
          translation: "意外的发现"
        },
        {
          word: "serendipitous encounter",
          translation: "意外的相遇"
        }
      ]
    };
  },
  onLoad(options) {
    if (options.word) {
      this.word = options.word;
    }
  },
  methods: {
    addToVocabulary() {
      common_vendor.index.showToast({
        title: "已加入生词本",
        icon: "success"
      });
    },
    markAsMastered() {
      common_vendor.index.showToast({
        title: "已标记为掌握",
        icon: "success"
      });
    },
    nextWord() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.addToVocabulary && $options.addToVocabulary(...args)),
    b: common_vendor.o((...args) => $options.markAsMastered && $options.markAsMastered(...args)),
    c: common_vendor.o((...args) => $options.nextWord && $options.nextWord(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eca06f3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/detail/detail.js.map
