"use strict";
const common_vendor = require("../common/vendor.js");
class CSVParser {
  constructor() {
    this.words = [];
    this.categories = {
      zk: { name: "中考词汇", wordCount: 0, icon: "📚", color: "#4A90E2" },
      gk: { name: "高考词汇", wordCount: 0, icon: "🎓", color: "#FF6B6B" },
      cet4: { name: "四级词汇", wordCount: 0, icon: "📖", color: "#2ECC71" },
      cet6: { name: "六级词汇", wordCount: 0, icon: "📚", color: "#9B59B6" },
      ky: { name: "考研词汇", wordCount: 0, icon: "🎯", color: "#E67E22" },
      toefl: { name: "托福词汇", wordCount: 0, icon: "🌍", color: "#3498DB" },
      ielts: { name: "雅思词汇", wordCount: 0, icon: "🇬🇧", color: "#E74C3C" },
      gre: { name: "GRE词汇", wordCount: 0, icon: "🎓", color: "#8E44AD" },
      basic: { name: "基础词汇", wordCount: 0, icon: "🔤", color: "#95A5A6" }
    };
  }
  /**
   * 解析CSV数据
   * @param {string} csvText - CSV文本内容
   * @returns {Array} 解析后的单词数组
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = this.parseCSVLine(lines[0]);
    const words = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = this.parseCSVLine(line);
        const word = this.createWordObject(headers, values);
        if (word) {
          words.push(word);
        }
      }
    }
    this.words = words;
    this.updateCategories();
    return words;
  }
  /**
   * 解析CSV行
   * @param {string} line - CSV行
   * @returns {Array} 解析后的字段数组
   */
  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
  /**
   * 创建单词对象
   * @param {Array} headers - 表头数组
   * @param {Array} values - 值数组
   * @returns {Object} 单词对象
   */
  createWordObject(headers, values) {
    if (headers.length !== values.length) {
      common_vendor.index.__f__("warn", "at utils/csvParser.js:81", "CSV行字段数量不匹配:", headers.length, values.length);
      return null;
    }
    const word = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      let value = values[i];
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      switch (header) {
        case "collins":
        case "oxford":
        case "bnc":
        case "frq":
          word[header] = parseInt(value) || 0;
          break;
        case "detail":
          try {
            word[header] = JSON.parse(value || "{}");
          } catch (e) {
            word[header] = {};
          }
          break;
        case "definition":
        case "translation":
          word[header] = value.split("\n").filter((item) => item.trim());
          break;
        case "pos":
        case "exchange":
          word[header] = value.split("/").filter((item) => item.trim());
          break;
        case "tag":
          word[header] = value.split(" ").filter((item) => item.trim());
          break;
        default:
          word[header] = value;
      }
    }
    word.masteryLevel = 0;
    word.reviewCount = 0;
    word.lastReviewDate = null;
    word.nextReviewDate = null;
    word.id = `w${String(word.bnc || 0).padStart(3, "0")}`;
    return word;
  }
  /**
   * 更新分类统计
   */
  updateCategories() {
    Object.keys(this.categories).forEach((key) => {
      this.categories[key].wordCount = 0;
    });
    this.words.forEach((word) => {
      if (word.tag && Array.isArray(word.tag)) {
        word.tag.forEach((tag) => {
          if (this.categories[tag]) {
            this.categories[tag].wordCount++;
          }
        });
      }
    });
    Object.keys(this.categories).forEach((key) => {
      if (this.categories[key].wordCount === 0) {
        delete this.categories[key];
      }
    });
  }
  /**
   * 根据标签获取单词
   * @param {string} tag - 标签
   * @returns {Array} 单词数组
   */
  getWordsByTag(tag) {
    return this.words.filter(
      (word) => word.tag && Array.isArray(word.tag) && word.tag.includes(tag)
    );
  }
  /**
   * 根据多个标签获取单词
   * @param {Array} tags - 标签数组
   * @returns {Array} 单词数组
   */
  getWordsByTags(tags) {
    return this.words.filter(
      (word) => word.tag && Array.isArray(word.tag) && tags.some((tag) => word.tag.includes(tag))
    );
  }
  /**
   * 根据难度获取单词
   * @param {number} minCollins - 最小柯林斯星级
   * @param {number} maxCollins - 最大柯林斯星级
   * @returns {Array} 单词数组
   */
  getWordsByDifficulty(minCollins = 0, maxCollins = 5) {
    return this.words.filter(
      (word) => word.collins >= minCollins && word.collins <= maxCollins
    );
  }
  /**
   * 根据词频获取单词
   * @param {number} maxBnc - 最大BNC词频
   * @returns {Array} 单词数组
   */
  getWordsByFrequency(maxBnc = 1e3) {
    return this.words.filter((word) => word.bnc <= maxBnc);
  }
  /**
   * 搜索单词
   * @param {string} query - 搜索查询
   * @returns {Array} 匹配的单词数组
   */
  searchWords(query) {
    const lowerQuery = query.toLowerCase();
    return this.words.filter(
      (word) => word.word.toLowerCase().includes(lowerQuery) || word.translation.some((trans) => trans.toLowerCase().includes(lowerQuery))
    );
  }
  /**
   * 获取随机单词
   * @param {number} count - 数量
   * @param {Array} excludeIds - 排除的单词ID数组
   * @returns {Array} 随机单词数组
   */
  getRandomWords(count = 1, excludeIds = []) {
    const availableWords = this.words.filter((word) => !excludeIds.includes(word.id));
    const result = [];
    for (let i = 0; i < Math.min(count, availableWords.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      result.push(availableWords.splice(randomIndex, 1)[0]);
    }
    return result;
  }
  /**
   * 获取所有单词
   * @returns {Array} 所有单词数组
   */
  getAllWords() {
    return this.words;
  }
  /**
   * 获取分类信息
   * @returns {Object} 分类信息
   */
  getCategories() {
    return this.categories;
  }
  /**
   * 获取有效的分类列表（按单词数量排序）
   * @returns {Array} 分类列表
   */
  getCategoryList() {
    return Object.entries(this.categories).filter(([key, category]) => category.wordCount > 0).sort((a, b) => b[1].wordCount - a[1].wordCount).map(([key, category]) => ({
      key,
      ...category
    }));
  }
}
exports.CSVParser = CSVParser;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/csvParser.js.map
