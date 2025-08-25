"use strict";
const common_vendor = require("../common/vendor.js");
class WordManager {
  constructor() {
    this.wordsData = null;
    this.userStudyData = null;
    this.currentSession = null;
  }
  /**
   * 初始化数据管理器
   */
  async init() {
    try {
      const wordsResponse = await common_vendor.index.request({
        url: "/static/data/words.json",
        method: "GET"
      });
      this.wordsData = wordsResponse.data;
      const userStudyResponse = await common_vendor.index.request({
        url: "/static/data/user-study.json",
        method: "GET"
      });
      this.userStudyData = userStudyResponse.data;
      common_vendor.index.__f__("log", "at utils/wordManager.js:31", "数据加载成功");
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:34", "数据加载失败:", error);
      return false;
    }
  }
  /**
   * 获取所有单词分类
   */
  getCategories() {
    var _a;
    return ((_a = this.wordsData) == null ? void 0 : _a.categories) || [];
  }
  /**
   * 根据分类获取单词列表
   */
  getWordsByCategory(categoryId) {
    var _a;
    if (!((_a = this.wordsData) == null ? void 0 : _a.words))
      return [];
    if (categoryId === "all") {
      return this.wordsData.words;
    }
    return this.wordsData.words.filter((word) => word.category === categoryId);
  }
  /**
   * 根据ID获取单词详情
   */
  getWordById(wordId) {
    var _a, _b;
    return ((_b = (_a = this.wordsData) == null ? void 0 : _a.words) == null ? void 0 : _b.find((word) => word.id === wordId)) || null;
  }
  /**
   * 获取用户学习进度
   */
  getUserProgress() {
    var _a;
    return ((_a = this.userStudyData) == null ? void 0 : _a.studyStats) || {};
  }
  /**
   * 获取单词学习进度
   */
  getWordProgress(wordId) {
    var _a, _b;
    return ((_b = (_a = this.userStudyData) == null ? void 0 : _a.wordProgress) == null ? void 0 : _b[wordId]) || null;
  }
  /**
   * 获取今日需要复习的单词
   */
  getTodayReviewWords() {
    var _a;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const reviewWords = [];
    Object.values(((_a = this.userStudyData) == null ? void 0 : _a.wordProgress) || {}).forEach((progress) => {
      if (progress.nextReviewDate === today) {
        const wordData = this.getWordById(progress.wordId);
        if (wordData) {
          reviewWords.push({
            ...wordData,
            progress
          });
        }
      }
    });
    return reviewWords;
  }
  /**
   * 获取新单词列表（未学习过的）
   */
  getNewWords(categoryId = "all", limit = 10) {
    const categoryWords = this.getWordsByCategory(categoryId);
    const newWords = [];
    for (const word of categoryWords) {
      const progress = this.getWordProgress(word.id);
      if (!progress || progress.masteryLevel === 0) {
        newWords.push(word);
        if (newWords.length >= limit)
          break;
      }
    }
    return newWords;
  }
  /**
   * 更新单词学习进度
   */
  updateWordProgress(wordId, result, studyType = "review") {
    var _a;
    if (!((_a = this.userStudyData) == null ? void 0 : _a.wordProgress)) {
      this.userStudyData.wordProgress = {};
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const progress = this.userStudyData.wordProgress[wordId] || {
      wordId,
      masteryLevel: 0,
      reviewCount: 0,
      accuracy: 0,
      studyHistory: []
    };
    progress.studyHistory.push({
      date: today,
      type: studyType,
      result,
      timeSpent: 30
      // 默认30秒
    });
    if (result === "correct") {
      if (studyType === "new") {
        progress.masteryLevel = Math.min(progress.masteryLevel + 1, 3);
      } else {
        progress.masteryLevel = Math.min(progress.masteryLevel + 0.5, 3);
      }
    } else {
      progress.masteryLevel = Math.max(progress.masteryLevel - 0.5, 0);
    }
    progress.reviewCount++;
    progress.lastReviewDate = today;
    const intervals = [1, 3, 7, 14, 30, 90];
    const intervalIndex = Math.min(progress.reviewCount - 1, intervals.length - 1);
    const nextReviewDays = intervals[intervalIndex];
    const nextReviewDate = /* @__PURE__ */ new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);
    progress.nextReviewDate = nextReviewDate.toISOString().split("T")[0];
    const recentHistory = progress.studyHistory.slice(-10);
    const correctCount = recentHistory.filter((h) => h.result === "correct").length;
    progress.accuracy = recentHistory.length > 0 ? correctCount / recentHistory.length : 0;
    this.userStudyData.wordProgress[wordId] = progress;
    this.saveUserStudyData();
    return progress;
  }
  /**
   * 开始学习会话
   */
  startStudySession(category = "all") {
    this.currentSession = {
      id: "session_" + Date.now(),
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      startTime: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      category,
      wordsStudied: 0,
      newWords: 0,
      reviewWords: 0,
      correctAnswers: 0,
      totalAnswers: 0
    };
  }
  /**
   * 结束学习会话
   */
  endStudySession() {
    if (!this.currentSession)
      return null;
    this.currentSession.endTime = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    this.currentSession.duration = this.calculateSessionDuration();
    this.currentSession.accuracy = this.currentSession.totalAnswers > 0 ? this.currentSession.correctAnswers / this.currentSession.totalAnswers : 0;
    if (!this.userStudyData.studySessions) {
      this.userStudyData.studySessions = [];
    }
    this.userStudyData.studySessions.unshift(this.currentSession);
    this.updateUserStats();
    const session = this.currentSession;
    this.currentSession = null;
    this.saveUserStudyData();
    return session;
  }
  /**
   * 记录学习结果
   */
  recordStudyResult(wordId, result, studyType = "review") {
    this.updateWordProgress(wordId, result, studyType);
    if (this.currentSession) {
      this.currentSession.wordsStudied++;
      this.currentSession.totalAnswers++;
      if (result === "correct") {
        this.currentSession.correctAnswers++;
      }
      if (studyType === "new") {
        this.currentSession.newWords++;
      } else {
        this.currentSession.reviewWords++;
      }
    }
  }
  /**
   * 计算会话时长
   */
  calculateSessionDuration() {
    var _a;
    if (!((_a = this.currentSession) == null ? void 0 : _a.startTime))
      return 0;
    const start = /* @__PURE__ */ new Date(`2000-01-01 ${this.currentSession.startTime}`);
    const end = /* @__PURE__ */ new Date(`2000-01-01 ${this.currentSession.endTime}`);
    return Math.round((end - start) / 1e3 / 60);
  }
  /**
   * 更新用户统计
   */
  updateUserStats() {
    if (!this.userStudyData.studyStats) {
      this.userStudyData.studyStats = {};
    }
    const stats = this.userStudyData.studyStats;
    stats.totalStudyTime += this.currentSession.duration || 0;
    stats.lastStudyDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const lastStudyDate = stats.lastStudyDate;
    if (lastStudyDate) {
      const lastDate = new Date(lastStudyDate);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate - lastDate) / (1e3 * 60 * 60 * 24));
      if (diffDays === 1) {
        stats.currentStreak = (stats.currentStreak || 0) + 1;
      } else if (diffDays > 1) {
        stats.currentStreak = 1;
      }
      if (stats.currentStreak > (stats.longestStreak || 0)) {
        stats.longestStreak = stats.currentStreak;
      }
    }
  }
  /**
   * 获取学习建议
   */
  getStudyRecommendations() {
    const recommendations = [];
    const dailyGoals = this.userStudyData.dailyGoals;
    const currentDay = dailyGoals.currentDay;
    if (currentDay.newWords < dailyGoals.newWords) {
      recommendations.push({
        type: "new_words",
        message: `今日还需学习${dailyGoals.newWords - currentDay.newWords}个新单词`,
        priority: "high"
      });
    }
    if (currentDay.reviewWords < dailyGoals.reviewWords) {
      recommendations.push({
        type: "review_words",
        message: `今日还需复习${dailyGoals.reviewWords - currentDay.reviewWords}个单词`,
        priority: "medium"
      });
    }
    const reviewWords = this.getTodayReviewWords();
    if (reviewWords.length > 0) {
      recommendations.push({
        type: "scheduled_review",
        message: `有${reviewWords.length}个单词需要复习`,
        priority: "high",
        data: reviewWords
      });
    }
    return recommendations;
  }
  /**
   * 保存用户学习数据到本地存储
   */
  saveUserStudyData() {
    try {
      common_vendor.index.setStorageSync("userStudyData", JSON.stringify(this.userStudyData));
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:344", "保存用户数据失败:", error);
    }
  }
  /**
   * 从本地存储加载用户学习数据
   */
  loadUserStudyDataFromStorage() {
    try {
      const data = common_vendor.index.getStorageSync("userStudyData");
      if (data) {
        this.userStudyData = JSON.parse(data);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:358", "加载用户数据失败:", error);
    }
  }
  /**
   * 搜索单词
   */
  searchWords(keyword) {
    var _a;
    if (!((_a = this.wordsData) == null ? void 0 : _a.words))
      return [];
    const results = [];
    const lowerKeyword = keyword.toLowerCase();
    this.wordsData.words.forEach((word) => {
      if (word.word.toLowerCase().includes(lowerKeyword) || word.translations.some((t) => t.meaning.includes(keyword)) || word.tags.some((tag) => tag.includes(keyword))) {
        results.push(word);
      }
    });
    return results;
  }
  /**
   * 获取难度分布统计
   */
  getDifficultyStats() {
    var _a, _b;
    const stats = { 1: 0, 2: 0, 3: 0 };
    (_b = (_a = this.wordsData) == null ? void 0 : _a.words) == null ? void 0 : _b.forEach((word) => {
      stats[word.difficulty] = (stats[word.difficulty] || 0) + 1;
    });
    return stats;
  }
  /**
   * 获取分类统计
   */
  getCategoryStats() {
    var _a, _b;
    const stats = {};
    (_b = (_a = this.wordsData) == null ? void 0 : _a.words) == null ? void 0 : _b.forEach((word) => {
      stats[word.category] = (stats[word.category] || 0) + 1;
    });
    return stats;
  }
}
const wordManager = new WordManager();
exports.wordManager = wordManager;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/wordManager.js.map
