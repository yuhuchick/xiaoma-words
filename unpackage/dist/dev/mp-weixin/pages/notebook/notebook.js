"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      notes: [
        {
          word: "serendipity",
          translation: "意外发现美好事物的能力",
          note: "这个词很有趣，来自一个古老的波斯故事。",
          date: "2024-01-15",
          tags: ["生词", "有趣"]
        },
        {
          word: "ephemeral",
          translation: "短暂的，瞬息的",
          note: "形容事物存在时间很短，像昙花一现。",
          date: "2024-01-14",
          tags: ["已掌握", "形容词"]
        },
        {
          word: "mellifluous",
          translation: "甜美的，悦耳的",
          note: "形容声音甜美动听，如蜜般流畅。",
          date: "2024-01-13",
          tags: ["生词", "声音"]
        }
      ]
    };
  },
  methods: {
    addNote() {
      common_vendor.index.showToast({
        title: "添加笔记",
        icon: "none"
      });
    },
    viewNote(note) {
      common_vendor.index.showToast({
        title: `查看笔记: ${note.word}`,
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.addNote && $options.addNote(...args)),
    b: common_vendor.f($data.notes, (note, index, i0) => {
      return {
        a: common_vendor.t(note.word),
        b: common_vendor.t(note.date),
        c: common_vendor.t(note.translation),
        d: common_vendor.t(note.note),
        e: common_vendor.f(note.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        }),
        f: index,
        g: common_vendor.o(($event) => $options.viewNote(note), index)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17181d6d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notebook/notebook.js.map
