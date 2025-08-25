"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_wordManager = require("../../utils/wordManager.js");
const _sfc_main = {
  data() {
    return {
      currentWord: null,
      currentIndex: 0,
      totalWords: 0,
      wordList: [],
      currentSession: null,
      studyType: "new",
      // 'new' 或 'review'
      newWordsCount: 0,
      reviewWordsCount: 0,
      showMeaning: false,
      // 控制是否显示中文意思
      autoStart: false
      // 控制是否自动开始学习
    };
  },
  computed: {
    accuracyPercentage() {
      if (!this.currentSession || this.currentSession.totalAnswers === 0) {
        return 0;
      }
      return Math.round(this.currentSession.correctAnswers / this.currentSession.totalAnswers * 100);
    }
  },
  async onLoad(options) {
    await utils_wordManager.wordManager.init();
    utils_wordManager.wordManager.loadUserStudyDataFromStorage();
    this.updateCounts();
    if (options.mode === "new") {
      this.studyType = "new";
      this.startNewWordsStudy();
    } else {
      this.showRecommendations();
    }
  },
  methods: {
    updateCounts() {
      this.newWordsCount = utils_wordManager.wordManager.getNewWords("all", 100).length;
      this.reviewWordsCount = utils_wordManager.wordManager.getTodayReviewWords().length;
    },
    showRecommendations() {
      const recommendations = utils_wordManager.wordManager.getStudyRecommendations();
      if (recommendations.length > 0) {
        common_vendor.index.showModal({
          title: "学习建议",
          content: recommendations.map((r) => r.message).join("\n"),
          showCancel: false
        });
      }
    },
    startNewWordsStudy() {
      this.studyType = "new";
      this.wordList = utils_wordManager.wordManager.getNewWords("all", 10);
      this.totalWords = this.wordList.length;
      this.currentIndex = 0;
      this.autoStart = true;
      if (this.wordList.length === 0) {
        common_vendor.index.showToast({
          title: "没有新单词可学习",
          icon: "none"
        });
        return;
      }
      utils_wordManager.wordManager.startStudySession("all");
      this.currentSession = utils_wordManager.wordManager.currentSession;
      this.loadNextWord();
    },
    startReviewStudy() {
      this.studyType = "review";
      this.wordList = utils_wordManager.wordManager.getTodayReviewWords();
      this.totalWords = this.wordList.length;
      this.currentIndex = 0;
      this.autoStart = true;
      if (this.wordList.length === 0) {
        common_vendor.index.showToast({
          title: "没有需要复习的单词",
          icon: "none"
        });
        return;
      }
      utils_wordManager.wordManager.startStudySession("all");
      this.currentSession = utils_wordManager.wordManager.currentSession;
      this.loadNextWord();
    },
    loadNextWord() {
      if (this.currentIndex < this.wordList.length) {
        this.currentWord = this.wordList[this.currentIndex];
        this.showMeaning = false;
      } else {
        this.completeStudy();
      }
    },
    playPronunciation() {
      var _a;
      if ((_a = this.currentWord) == null ? void 0 : _a.audioUrl) {
        common_vendor.index.showToast({
          title: "播放发音",
          icon: "none"
        });
      } else {
        common_vendor.index.showToast({
          title: "暂无音频",
          icon: "none"
        });
      }
    },
    markAsUnknown() {
      this.recordResult("incorrect");
    },
    markAsKnown() {
      this.recordResult("correct");
    },
    recordResult(result) {
      if (!this.currentWord)
        return;
      utils_wordManager.wordManager.recordStudyResult(
        this.currentWord.id,
        result,
        this.studyType
      );
      this.currentSession = utils_wordManager.wordManager.currentSession;
      if (result === "correct") {
        common_vendor.index.showToast({
          title: "回答正确！",
          icon: "success"
        });
        this.showMeaning = true;
      } else {
        common_vendor.index.showToast({
          title: "继续加油！",
          icon: "none"
        });
        this.showMeaning = true;
      }
    },
    viewDetails() {
      if (this.currentWord) {
        common_vendor.index.navigateTo({
          url: `/pages/detail/detail?wordId=${this.currentWord.id}`
        });
      }
    },
    completeStudy() {
      const session = utils_wordManager.wordManager.endStudySession();
      common_vendor.index.showModal({
        title: "学习完成",
        content: `本次学习了${session.wordsStudied}个单词
新单词：${session.newWords}个
复习：${session.reviewWords}个
正确率：${Math.round(session.accuracy * 100)}%`,
        showCancel: false,
        success: () => {
          this.currentWord = null;
          this.currentIndex = 0;
          this.totalWords = 0;
          this.wordList = [];
          this.currentSession = null;
          this.showMeaning = false;
          this.autoStart = false;
          this.updateCounts();
        }
      });
    },
    nextWord() {
      this.currentIndex++;
      this.loadNextWord();
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    showSettings() {
      common_vendor.index.showActionSheet({
        itemList: ["学习设置", "查看统计", "重置进度"],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              common_vendor.index.showToast({
                title: "学习设置",
                icon: "none"
              });
              break;
            case 1:
              common_vendor.index.navigateTo({
                url: "/pages/profile/profile"
              });
              break;
            case 2:
              this.resetProgress();
              break;
          }
        }
      });
    },
    resetProgress() {
      common_vendor.index.showModal({
        title: "确认重置",
        content: "确定要重置所有学习进度吗？此操作不可恢复。",
        success: (res) => {
          if (res.confirm) {
            utils_wordManager.wordManager.userStudyData = {
              ...utils_wordManager.wordManager.userStudyData,
              wordProgress: {},
              studySessions: [],
              studyStats: {
                totalStudyDays: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalStudyTime: 0,
                totalWordsLearned: 0,
                totalWordsMastered: 0,
                averageAccuracy: 0,
                lastStudyDate: null
              }
            };
            utils_wordManager.wordManager.saveUserStudyData();
            common_vendor.index.showToast({
              title: "进度已重置",
              icon: "success"
            });
            this.updateCounts();
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.studyType === "new" ? "新单词学习" : "单词复习"),
    c: common_vendor.t($data.currentIndex),
    d: common_vendor.t($data.totalWords),
    e: !$data.currentWord && !$data.autoStart
  }, !$data.currentWord && !$data.autoStart ? {
    f: common_vendor.t($data.newWordsCount),
    g: common_vendor.o((...args) => $options.startNewWordsStudy && $options.startNewWordsStudy(...args)),
    h: common_vendor.t($data.reviewWordsCount),
    i: common_vendor.o((...args) => $options.startReviewStudy && $options.startReviewStudy(...args))
  } : {}, {
    j: $data.currentWord
  }, $data.currentWord ? common_vendor.e({
    k: common_vendor.t($data.currentWord.word),
    l: common_vendor.t($data.currentWord.phonetic),
    m: common_vendor.o((...args) => $options.playPronunciation && $options.playPronunciation(...args)),
    n: $data.showMeaning
  }, $data.showMeaning ? common_vendor.e({
    o: common_vendor.f($data.currentWord.translations, (translation, index, i0) => {
      return {
        a: common_vendor.t(translation.type),
        b: common_vendor.t(translation.meaning),
        c: index
      };
    }),
    p: (_a = $data.currentWord.translations[0]) == null ? void 0 : _a.example
  }, ((_b = $data.currentWord.translations[0]) == null ? void 0 : _b.example) ? {
    q: common_vendor.t($data.currentWord.translations[0].example),
    r: common_vendor.t($data.currentWord.translations[0].exampleTranslation)
  } : {}) : {}, {
    s: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i,
        b: common_vendor.n({
          active: i <= $data.currentWord.difficulty
        })
      };
    })
  }) : {}, {
    t: $data.currentWord
  }, $data.currentWord ? common_vendor.e({
    v: !$data.showMeaning
  }, !$data.showMeaning ? {
    w: common_vendor.o((...args) => $options.markAsUnknown && $options.markAsUnknown(...args))
  } : {}, {
    x: !$data.showMeaning
  }, !$data.showMeaning ? {
    y: common_vendor.o((...args) => $options.markAsKnown && $options.markAsKnown(...args))
  } : {}, {
    z: $data.showMeaning
  }, $data.showMeaning ? {
    A: common_vendor.o((...args) => $options.nextWord && $options.nextWord(...args))
  } : {}, {
    B: common_vendor.o((...args) => $options.viewDetails && $options.viewDetails(...args))
  }) : {}, {
    C: $data.currentSession
  }, $data.currentSession ? {
    D: common_vendor.t($data.currentSession.newWords),
    E: common_vendor.t($data.currentSession.reviewWords),
    F: common_vendor.t($options.accuracyPercentage)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ce61a269"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/word/word.js.map
