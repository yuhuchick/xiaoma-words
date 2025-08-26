"use strict";
const common_vendor = require("../common/vendor.js");
const utils_csvParser = require("./csvParser.js");
const utils_settingsManager = require("./settingsManager.js");
class WordManager {
  constructor() {
    this.words = [];
    this.userStudyData = {};
    this.csvParser = new utils_csvParser.CSVParser();
    this.isInitialized = false;
    this.dailyProgress = {
      date: null,
      newWordIds: []
    };
    this.knownWords = [];
    this.studyStats = {
      totalStudyDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyTimeMs: 0,
      lastStudyDate: null,
      studyDates: []
    };
  }
  /**
   * 初始化
   */
  async init() {
    if (this.isInitialized) {
      return;
    }
    try {
      await this.loadCSVData();
      this.loadUserStudyDataFromStorage();
      this.loadDailyProgressFromStorage();
      this.loadKnownWordsFromStorage();
      this.syncKnownWordsToStudyData();
      this.loadStudyStatsFromStorage();
      this.isInitialized = true;
      common_vendor.index.__f__("log", "at utils/wordManager.js:52", "WordManager初始化完成，共加载", this.words.length, "个单词");
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:54", "WordManager初始化失败:", error);
    }
  }
  /**
   * 加载CSV数据
   */
  async loadCSVData() {
    try {
      const response = await common_vendor.index.request({
        url: "/static/data/words.csv",
        method: "GET"
      });
      if (response.statusCode === 200) {
        const csvText = response.data;
        this.words = this.csvParser.parseCSV(csvText);
        common_vendor.index.__f__("log", "at utils/wordManager.js:72", "CSV数据加载成功，共", this.words.length, "个单词");
      } else {
        throw new Error("CSV文件加载失败");
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:77", "加载CSV数据失败:", error);
      this.loadDefaultData();
    }
  }
  /**
   * 加载默认数据（备用方案）
   */
  loadDefaultData() {
    this.words = [
      {
        id: "w001",
        word: "hello",
        phonetic: "/həˈləʊ/",
        definition: ["used as a greeting or to begin a phone conversation"],
        translation: ["你好；喂"],
        pos: ["interjection"],
        collins: 1,
        oxford: 1,
        tag: ["basic"],
        bnc: 1e3,
        frq: 500,
        exchange: ["helloes", "helloed", "helloing"],
        detail: {
          examples: ["Hello, how are you?", "Hello, this is John speaking."]
        },
        audio: "",
        masteryLevel: 0,
        reviewCount: 0,
        lastReviewDate: null,
        nextReviewDate: null
      }
    ];
    common_vendor.index.__f__("log", "at utils/wordManager.js:112", "使用默认数据，共", this.words.length, "个单词");
  }
  /**
   * 加载用户学习数据
   */
  loadUserStudyDataFromStorage() {
    try {
      const data = common_vendor.index.getStorageSync("userStudyData");
      if (data) {
        this.userStudyData = JSON.parse(data);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:125", "加载用户学习数据失败:", error);
      this.userStudyData = {};
    }
  }
  /**
   * 保存用户学习数据
   */
  saveUserStudyDataToStorage() {
    try {
      common_vendor.index.setStorageSync("userStudyData", JSON.stringify(this.userStudyData));
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:137", "保存用户学习数据失败:", error);
    }
  }
  /** 学习统计：加载/保存/更新 */
  loadStudyStatsFromStorage() {
    try {
      const raw = common_vendor.index.getStorageSync("studyStats");
      if (raw) {
        const parsed = JSON.parse(raw);
        this.studyStats = { ...this.studyStats, ...parsed };
      }
    } catch (e) {
    }
  }
  saveStudyStatsToStorage() {
    try {
      common_vendor.index.setStorageSync("studyStats", JSON.stringify(this.studyStats));
    } catch (e) {
    }
  }
  markStudyCheckIn(dateStr) {
    const d = dateStr || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const set = new Set(this.studyStats.studyDates);
    if (!set.has(d)) {
      set.add(d);
      this.studyStats.studyDates = Array.from(set).sort();
      this.recomputeStreaks();
      this.saveStudyStatsToStorage();
    }
  }
  recomputeStreaks() {
    const dates = this.studyStats.studyDates;
    if (!dates.length) {
      this.studyStats.totalStudyDays = 0;
      this.studyStats.currentStreak = 0;
      this.studyStats.longestStreak = 0;
      return;
    }
    this.studyStats.totalStudyDays = dates.length;
    let longest = 1, current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const cur = new Date(dates[i]);
      const diff = (cur - prev) / (24 * 3600 * 1e3);
      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else if (diff > 1) {
        current = 1;
      }
    }
    this.studyStats.currentStreak = current;
    this.studyStats.longestStreak = Math.max(this.studyStats.longestStreak || 0, longest);
  }
  addStudyTime(ms) {
    if (!Number.isFinite(ms) || ms <= 0)
      return;
    this.studyStats.totalStudyTimeMs += ms;
    this.saveStudyStatsToStorage();
  }
  getHomeSummary() {
    utils_settingsManager.settingsManager.init();
    const target = utils_settingsManager.settingsManager.getSettings && utils_settingsManager.settingsManager.getSettings().dailyNewWordsTarget || 20;
    const learnedToday = this.getTodayNewWordsCount();
    const toLearn = Math.max(target - learnedToday, 0);
    const reviewSet = /* @__PURE__ */ new Set([
      ...Object.keys(this.userStudyData || {}),
      // 将 knownWords(word 文本) 映射为 id
      ...this.getKnownWordObjects().map((w) => w.id)
    ]);
    const toReview = reviewSet.size;
    const learnedTotal = Object.keys(this.userStudyData || {}).length;
    const streak = this.studyStats.currentStreak || 0;
    const hours = Math.round(this.studyStats.totalStudyTimeMs / 36e5 * 10) / 10;
    return { toLearn, toReview, learnedTotal, streak, hours };
  }
  /** 加载/保存 已认识单词 列表 */
  loadKnownWordsFromStorage() {
    try {
      const raw = common_vendor.index.getStorageSync("knownWords");
      this.knownWords = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(this.knownWords)) {
        this.knownWords = [];
      }
    } catch (e) {
      this.knownWords = [];
    }
  }
  saveKnownWordsToStorage() {
    try {
      common_vendor.index.setStorageSync("knownWords", JSON.stringify(this.knownWords));
    } catch (e) {
    }
  }
  /**
   * 以单词文本进行存储（而非 id）
   */
  addKnownWord(wordText) {
    const key = String(wordText || "").trim();
    if (!key)
      return;
    if (!this.knownWords.includes(key)) {
      this.knownWords.push(key);
      this.saveKnownWordsToStorage();
    }
  }
  getKnownWords() {
    return [...this.knownWords];
  }
  /**
   * 获取已认识单词对象列表
   */
  getKnownWordObjects() {
    const set = new Set((this.knownWords || []).map((s) => String(s).toLowerCase()));
    return this.words.filter((w) => set.has(String(w.word).toLowerCase()));
  }
  /**
   * 将 knownWords 列表同步到 userStudyData，确保这些词进入复习体系
   * 策略：若某词无学习记录，则创建记录并将 nextReviewDate 设为今天
   */
  syncKnownWordsToStudyData() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (!Array.isArray(this.knownWords))
      return;
    const lowerToWordObj = /* @__PURE__ */ new Map();
    this.words.forEach((w) => lowerToWordObj.set(String(w.word).toLowerCase(), w));
    this.knownWords.forEach((wordText) => {
      const w = lowerToWordObj.get(String(wordText).toLowerCase());
      if (!w)
        return;
      const wordId = w.id;
      if (!this.userStudyData[wordId]) {
        this.userStudyData[wordId] = {
          masteryLevel: 1,
          reviewCount: 0,
          lastReviewDate: null,
          nextReviewDate: today,
          studyHistory: [{ date: today, isCorrect: true, timestamp: Date.now(), source: "knownWords-import" }]
        };
      }
    });
    this.saveUserStudyDataToStorage();
  }
  /**
   * 加载每日进度
   */
  loadDailyProgressFromStorage() {
    try {
      const raw = common_vendor.index.getStorageSync("dailyProgress");
      if (raw) {
        this.dailyProgress = JSON.parse(raw);
      }
    } catch (e) {
      this.dailyProgress = { date: null, newWordIds: [] };
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (this.dailyProgress.date !== today) {
      this.dailyProgress = { date: today, newWordIds: [] };
      this.saveDailyProgressToStorage();
    }
  }
  /**
   * 保存每日进度
   */
  saveDailyProgressToStorage() {
    try {
      common_vendor.index.setStorageSync("dailyProgress", JSON.stringify(this.dailyProgress));
    } catch (e) {
    }
  }
  /**
   * 记录今日新学单词（去重）
   */
  trackDailyNew(wordId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (this.dailyProgress.date !== today) {
      this.dailyProgress = { date: today, newWordIds: [] };
    }
    if (!this.dailyProgress.newWordIds.includes(wordId)) {
      this.dailyProgress.newWordIds.push(wordId);
      this.saveDailyProgressToStorage();
    }
  }
  /**
   * 获取今日新学单词数量
   */
  getTodayNewWordsCount() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return this.dailyProgress.date === today ? this.dailyProgress.newWordIds.length : 0;
  }
  /**
   * 获取新单词
   * @param {string} category - 分类
   * @param {number} limit - 限制数量
   * @returns {Array} 新单词数组
   */
  getNewWords(category = "all", limit = 10) {
    let filteredWords = this.words;
    if (category !== "all") {
      filteredWords = this.csvParser.getWordsByTag(category);
    }
    const newWords = filteredWords.filter((word) => {
      const studyData = this.userStudyData[word.id];
      return !studyData || studyData.masteryLevel === 0;
    });
    newWords.sort((a, b) => a.bnc - b.bnc);
    return newWords.slice(0, limit);
  }
  /**
   * 根据标签获取新单词
   * @param {string} tag - 标签
   * @param {number} limit - 限制数量
   * @returns {Array} 新单词数组
   */
  getNewWordsByTag(tag, limit = 10) {
    const filteredWords = this.csvParser.getWordsByTag(tag);
    const newWords = filteredWords.filter((word) => {
      const studyData = this.userStudyData[word.id];
      return !studyData || studyData.masteryLevel === 0;
    });
    newWords.sort((a, b) => a.bnc - b.bnc);
    return newWords.slice(0, limit);
  }
  /**
   * 根据多个标签获取新单词
   * @param {Array} tags - 标签数组
   * @param {number} limit - 限制数量
   * @returns {Array} 新单词数组
   */
  getNewWordsByTags(tags, limit = 10) {
    const filteredWords = this.csvParser.getWordsByTags(tags);
    const newWords = filteredWords.filter((word) => {
      const studyData = this.userStudyData[word.id];
      return !studyData || studyData.masteryLevel === 0;
    });
    newWords.sort((a, b) => a.bnc - b.bnc);
    return newWords.slice(0, limit);
  }
  /**
   * 获取今日待复习单词
   * @returns {Array} 待复习单词数组
   */
  getTodayReviewWords() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const reviewWords = [];
    this.syncKnownWordsToStudyData();
    Object.keys(this.userStudyData).forEach((wordId) => {
      const studyData = this.userStudyData[wordId];
      if (studyData && studyData.nextReviewDate === today) {
        const word = this.words.find((w) => w.id === wordId);
        if (word) {
          reviewWords.push({
            ...word,
            ...studyData
          });
        }
      }
    });
    return reviewWords;
  }
  /**
   * 记录学习结果
   * @param {string} wordId - 单词ID
   * @param {boolean} isCorrect - 是否正确
   */
  recordStudyResult(wordId, isCorrect) {
    const word = this.words.find((w) => w.id === wordId);
    if (!word) {
      common_vendor.index.__f__("error", "at utils/wordManager.js:444", "单词不存在:", wordId);
      return;
    }
    if (!this.userStudyData[wordId]) {
      this.userStudyData[wordId] = {
        masteryLevel: 0,
        reviewCount: 0,
        lastReviewDate: null,
        nextReviewDate: null,
        studyHistory: []
      };
    }
    const studyData = this.userStudyData[wordId];
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    studyData.studyHistory.push({
      date: today,
      isCorrect,
      timestamp: Date.now()
    });
    if (isCorrect) {
      studyData.masteryLevel = Math.min(studyData.masteryLevel + 1, 5);
    } else {
      studyData.masteryLevel = Math.max(studyData.masteryLevel - 1, 0);
    }
    studyData.reviewCount++;
    studyData.lastReviewDate = today;
    studyData.nextReviewDate = this.calculateNextReviewDate(studyData.masteryLevel, today);
    this.saveUserStudyDataToStorage();
  }
  /**
   * 计算下次复习日期
   * @param {number} masteryLevel - 掌握等级
   * @param {string} lastReviewDate - 上次复习日期
   * @returns {string} 下次复习日期
   */
  calculateNextReviewDate(masteryLevel, lastReviewDate) {
    const intervals = [1, 3, 7, 14, 30, 90];
    const interval = intervals[Math.min(masteryLevel, intervals.length - 1)];
    const lastDate = new Date(lastReviewDate);
    const nextDate = new Date(lastDate.getTime() + interval * 24 * 60 * 60 * 1e3);
    return nextDate.toISOString().split("T")[0];
  }
  /**
   * 获取单词详情
   * @param {string} wordId - 单词ID
   * @returns {Object} 单词详情
   */
  getWordDetail(wordId) {
    const word = this.words.find((w) => w.id === wordId);
    if (!word) {
      return null;
    }
    const studyData = this.userStudyData[wordId] || {
      masteryLevel: 0,
      reviewCount: 0,
      lastReviewDate: null,
      nextReviewDate: null
    };
    return {
      ...word,
      ...studyData
    };
  }
  /**
   * 搜索单词
   * @param {string} query - 搜索查询
   * @returns {Array} 搜索结果
   */
  searchWords(query) {
    return this.csvParser.searchWords(query);
  }
  /**
   * 获取随机单词
   * @param {number} count - 数量
   * @param {Array} excludeIds - 排除的单词ID数组
   * @returns {Array} 随机单词数组
   */
  getRandomWords(count = 1, excludeIds = []) {
    return this.csvParser.getRandomWords(count, excludeIds);
  }
  /**
   * 获取分类信息
   * @returns {Object} 分类信息
   */
  getCategories() {
    return this.csvParser.getCategories();
  }
  /**
   * 获取分类列表
   * @returns {Array} 分类列表
   */
  getCategoryList() {
    return this.csvParser.getCategoryList();
  }
  /**
   * 获取学习统计
   * @returns {Object} 学习统计
   */
  getStudyStats() {
    const totalWords = this.words.length;
    const learnedWords = Object.keys(this.userStudyData).length;
    const masteredWords = Object.values(this.userStudyData).filter((data) => data.masteryLevel >= 3).length;
    const todayReviewWords = this.getTodayReviewWords().length;
    return {
      totalWords,
      learnedWords,
      masteredWords,
      todayReviewWords,
      progress: Math.round(learnedWords / totalWords * 100)
    };
  }
  /**
   * 获取学习建议
   * @returns {Array} 学习建议数组
   */
  getStudyRecommendations() {
    const recommendations = [];
    const stats = this.getStudyStats();
    const newWordsCount = this.getNewWords("all", 100).length;
    if (newWordsCount > 0) {
      recommendations.push({
        message: `有${newWordsCount}个新单词等待学习`
      });
    }
    const reviewWordsCount = this.getTodayReviewWords().length;
    if (reviewWordsCount > 0) {
      recommendations.push({
        message: `有${reviewWordsCount}个单词需要复习`
      });
    }
    if (stats.progress < 10) {
      recommendations.push({
        message: "建议每天学习10-20个新单词"
      });
    }
    return recommendations;
  }
}
const wordManager = new WordManager();
exports.wordManager = wordManager;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/wordManager.js.map
