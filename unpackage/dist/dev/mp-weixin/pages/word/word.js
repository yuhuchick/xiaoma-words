"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_wordManager = require("../../utils/wordManager.js");
const utils_settingsManager = require("../../utils/settingsManager.js");
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
      autoStart: false,
      // 控制是否自动开始学习
      currentCategory: "all",
      // 当前学习的分类
      currentTags: []
      // 当前学习的标签
    };
  },
  computed: {
    accuracyPercentage() {
      if (!this.currentSession || this.currentSession.totalAnswers === 0) {
        return 0;
      }
      return Math.round(this.currentSession.correctAnswers / this.currentSession.totalAnswers * 100);
    },
    pageTitle() {
      if (this.studyType === "review") {
        return "单词复习";
      }
      if (this.currentTags.length > 0) {
        const categoryNames = this.currentTags.map((tag) => {
          const categories = utils_wordManager.wordManager.getCategories();
          return categories[tag] ? categories[tag].name : tag;
        });
        return `${categoryNames.join("+")}学习`;
      }
      if (this.currentCategory !== "all") {
        const categories = utils_wordManager.wordManager.getCategories();
        const categoryName = categories[this.currentCategory] ? categories[this.currentCategory].name : this.currentCategory;
        return `${categoryName}学习`;
      }
      return "新单词学习";
    }
  },
  async onLoad(options) {
    await utils_wordManager.wordManager.init();
    utils_settingsManager.settingsManager.init();
    utils_wordManager.wordManager.loadUserStudyDataFromStorage();
    this.updateCounts();
    if (options.mode === "new") {
      this.studyType = "new";
      if (options.category) {
        this.startNewWordsStudy(options.category);
      } else if (options.tags) {
        this.startNewWordsStudyByTags(options.tags.split(","));
      } else {
        this.startNewWordsStudy();
      }
    } else if (options.mode === "review") {
      this.studyType = "review";
      this.startReviewStudy();
    } else {
      this.showRecommendations();
    }
  },
  onShow() {
    this._enterTs = Date.now();
    utils_wordManager.wordManager.markStudyCheckIn();
  },
  onHide() {
    if (this._enterTs) {
      utils_wordManager.wordManager.addStudyTime(Date.now() - this._enterTs);
      this._enterTs = 0;
    }
  },
  onUnload() {
    if (this._enterTs) {
      utils_wordManager.wordManager.addStudyTime(Date.now() - this._enterTs);
      this._enterTs = 0;
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
    startNewWordsStudy(category = "all") {
      if (!this.checkDailyLimitAndPrompt()) {
        return;
      }
      this.studyType = "new";
      this.currentCategory = category;
      this.currentTags = [];
      if (category === "all") {
        this.wordList = utils_wordManager.wordManager.getNewWords("all", 10);
      } else {
        this.wordList = utils_wordManager.wordManager.getNewWordsByTag(category, 10);
      }
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
      this.loadNextWord();
    },
    startNewWordsStudyByTags(tags) {
      if (!this.checkDailyLimitAndPrompt()) {
        return;
      }
      this.studyType = "new";
      this.currentCategory = "all";
      this.currentTags = tags;
      this.wordList = utils_wordManager.wordManager.getNewWordsByTags(tags, 10);
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
      this.loadNextWord();
    },
    startReviewStudy() {
      this.studyType = "review";
      this.wordList = utils_wordManager.wordManager.getTodayReviewWords();
      if (this.wordList.length === 0) {
        this.wordList = utils_wordManager.wordManager.getKnownWordObjects();
      }
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
      this.loadNextWord();
    },
    loadNextWord() {
      if (this.currentIndex >= this.wordList.length) {
        this.completeStudy();
        return;
      }
      this.currentWord = this.wordList[this.currentIndex];
      this.showMeaning = false;
    },
    markAsKnown() {
      this.recordResult(true);
      if (this.currentWord && this.currentWord.id) {
        utils_wordManager.wordManager.addKnownWord(this.currentWord.word);
      }
    },
    markAsUnknown() {
      this.recordResult(false);
    },
    recordResult(isCorrect) {
      utils_wordManager.wordManager.recordStudyResult(this.currentWord.id, isCorrect);
      if (this.studyType === "new") {
        utils_wordManager.wordManager.trackDailyNew(this.currentWord.id);
      }
      this.showMeaning = true;
    },
    nextWord() {
      this.currentIndex++;
      this.loadNextWord();
    },
    completeStudy() {
      const stats = utils_wordManager.wordManager.getStudyStats();
      common_vendor.index.showModal({
        title: "学习完成",
        content: `本次学习了${this.totalWords}个单词
总进度：${stats.progress}%`,
        showCancel: false,
        success: () => {
          common_vendor.index.navigateBack();
        }
      });
    },
    viewDetails() {
      common_vendor.index.navigateTo({
        url: `/pages/detail/detail?id=${this.currentWord.id}`
      });
    },
    playPronunciation() {
      if (this.currentWord.audio) {
        const audioContext = common_vendor.index.createInnerAudioContext();
        audioContext.src = this.currentWord.audio;
        audioContext.play();
      } else {
        common_vendor.index.showToast({
          title: "暂无音频",
          icon: "none"
        });
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    checkDailyLimitAndPrompt() {
      const s = utils_settingsManager.settingsManager.getSettings();
      const learnedToday = utils_wordManager.wordManager.getTodayNewWordsCount();
      if (learnedToday >= s.dailyNewWordsTarget) {
        if (s.allowExceed) {
          common_vendor.index.showModal({
            title: "今日目标已达成",
            content: `已完成今日目标 ${s.dailyNewWordsTarget} 个。是否调整目标？`,
            confirmText: "去设置",
            cancelText: "继续学习",
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.navigateTo({ url: "/pages/goal-settings/goal-settings" });
              }
            }
          });
          return true;
        } else {
          common_vendor.index.showModal({
            title: "达到每日上限",
            content: `今日已学习 ${learnedToday} 个，已达上限 ${s.dailyNewWordsTarget} 个。可前往调整目标。`,
            showCancel: false,
            confirmText: "去设置",
            success: () => {
              common_vendor.index.navigateTo({ url: "/pages/goal-settings/goal-settings" });
            }
          });
          return false;
        }
      }
      return true;
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
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($options.pageTitle),
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
    o: common_vendor.f($data.currentWord.translation, (translation, index, i0) => {
      return {
        a: common_vendor.t(translation),
        b: index
      };
    }),
    p: $data.currentWord.detail && $data.currentWord.detail.examples
  }, $data.currentWord.detail && $data.currentWord.detail.examples ? {
    q: common_vendor.f($data.currentWord.detail.examples, (example, index, i0) => {
      return {
        a: common_vendor.t(example),
        b: index
      };
    })
  } : {}) : {}, {
    r: common_vendor.f(5, (i, k0, i0) => {
      return {
        a: i,
        b: common_vendor.n({
          active: i <= $data.currentWord.collins
        })
      };
    })
  }) : {}, {
    s: $data.currentWord
  }, $data.currentWord ? common_vendor.e({
    t: !$data.showMeaning
  }, !$data.showMeaning ? {
    v: common_vendor.o((...args) => $options.markAsUnknown && $options.markAsUnknown(...args))
  } : {}, {
    w: !$data.showMeaning
  }, !$data.showMeaning ? {
    x: common_vendor.o((...args) => $options.markAsKnown && $options.markAsKnown(...args))
  } : {}, {
    y: $data.showMeaning
  }, $data.showMeaning ? {
    z: common_vendor.o((...args) => $options.nextWord && $options.nextWord(...args))
  } : {}, {
    A: common_vendor.o((...args) => $options.viewDetails && $options.viewDetails(...args))
  }) : {}, {
    B: $data.currentSession
  }, $data.currentSession ? {
    C: common_vendor.t($data.currentSession.newWords),
    D: common_vendor.t($data.currentSession.reviewWords),
    E: common_vendor.t($options.accuracyPercentage)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ce61a269"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/word/word.js.map
