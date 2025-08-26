"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_wordManager = require("../../utils/wordManager.js");
const _sfc_main = {
  data() {
    return {
      categoryList: [],
      recommendations: [
        {
          id: "basic",
          title: "基础入门",
          description: "适合英语初学者",
          icon: "🌟",
          tags: ["zk", "basic"],
          color: "#4A90E2"
        },
        {
          id: "exam",
          title: "考试必备",
          description: "涵盖中考、高考核心词汇",
          icon: "📝",
          tags: ["zk", "gk"],
          color: "#FF6B6B"
        },
        {
          id: "college",
          title: "大学英语",
          description: "四级、六级词汇全覆盖",
          icon: "🎓",
          tags: ["cet4", "cet6"],
          color: "#2ECC71"
        },
        {
          id: "advanced",
          title: "高级词汇",
          description: "考研、托福、雅思、GRE",
          icon: "🚀",
          tags: ["ky", "toefl", "ielts", "gre"],
          color: "#9B59B6"
        }
      ]
    };
  },
  async onLoad() {
    await utils_wordManager.wordManager.init();
    this.categoryList = utils_wordManager.wordManager.getCategoryList();
  },
  methods: {
    selectCategory(category) {
      common_vendor.index.navigateTo({
        url: `/pages/word/word?mode=new&category=${category.key}`
      });
    },
    selectRecommendation(recommendation) {
      const tags = recommendation.tags.join(",");
      common_vendor.index.navigateTo({
        url: `/pages/word/word?mode=new&tags=${tags}`
      });
    },
    getCategoryName(tag) {
      const category = this.categoryList.find((cat) => cat.key === tag);
      return category ? category.name : tag;
    },
    getBookImage(key) {
      switch (key) {
        case "zk":
          return "/static/books/zhongkao.png";
        case "gk":
          return "/static/books/gaokao.png";
        case "cet4":
          return "/static/books/siji.png";
        case "cet6":
          return "/static/books/liuji.png";
        case "ky":
          return "/static/books/koayan.png";
        case "toefl":
          return "/static/books/tuofu.png";
        case "ielts":
          return "/static/books/yasi.png";
        case "gre":
          return "/static/books/gre.png";
        default:
          return "/static/books/zhongkao.png";
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.categoryList, (category, k0, i0) => {
      return {
        a: $options.getBookImage(category.key),
        b: common_vendor.t(category.wordCount),
        c: category.key,
        d: common_vendor.o(($event) => $options.selectCategory(category), category.key)
      };
    }),
    b: $data.recommendations.length > 0
  }, $data.recommendations.length > 0 ? {
    c: common_vendor.f($data.recommendations, (recommendation, k0, i0) => {
      return {
        a: common_vendor.t(recommendation.icon),
        b: common_vendor.t(recommendation.title),
        c: common_vendor.t(recommendation.description),
        d: common_vendor.f(recommendation.tags, (tag, k1, i1) => {
          return {
            a: common_vendor.t($options.getCategoryName(tag)),
            b: tag
          };
        }),
        e: recommendation.id,
        f: common_vendor.o(($event) => $options.selectRecommendation(recommendation), recommendation.id)
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7e173c47"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/word-category/word-category.js.map
