"use strict";
const common_vendor = require("../common/vendor.js");
class PointsManager {
  constructor() {
    this.userPointsData = null;
    this.checkInData = null;
  }
  /**
   * 初始化积分管理器
   */
  async init() {
    try {
      this.loadFromStorage();
      if (!this.userPointsData) {
        this.userPointsData = {
          totalPoints: 0,
          earnedPoints: 0,
          usedPoints: 0,
          checkInStreak: 0,
          longestStreak: 0,
          lastCheckInDate: null,
          checkInHistory: [],
          pointsHistory: []
        };
      }
      if (!this.checkInData) {
        this.checkInData = {
          monthlyCheckIns: {},
          yearlyStats: {}
        };
      }
      common_vendor.index.__f__("log", "at utils/pointsManager.js:40", "积分管理器初始化成功");
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/pointsManager.js:43", "积分管理器初始化失败:", error);
      return false;
    }
  }
  /**
   * 获取用户积分信息
   */
  getUserPoints() {
    return this.userPointsData || {
      totalPoints: 0,
      earnedPoints: 0,
      usedPoints: 0,
      checkInStreak: 0,
      longestStreak: 0
    };
  }
  /**
   * 获取今日是否已签到
   */
  isTodayCheckedIn() {
    var _a;
    if (!((_a = this.userPointsData) == null ? void 0 : _a.lastCheckInDate))
      return false;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return this.userPointsData.lastCheckInDate === today;
  }
  /**
   * 执行签到
   */
  checkIn() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (this.isTodayCheckedIn()) {
      return {
        success: false,
        message: "今日已签到",
        points: 0
      };
    }
    const points = Math.floor(Math.random() * 41) + 100;
    let streak = 1;
    if (this.userPointsData.lastCheckInDate) {
      const lastDate = new Date(this.userPointsData.lastCheckInDate);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate - lastDate) / (1e3 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak = this.userPointsData.checkInStreak + 1;
      }
    }
    this.userPointsData.totalPoints += points;
    this.userPointsData.earnedPoints += points;
    this.userPointsData.checkInStreak = streak;
    this.userPointsData.lastCheckInDate = today;
    if (streak > this.userPointsData.longestStreak) {
      this.userPointsData.longestStreak = streak;
    }
    this.userPointsData.checkInHistory.push({
      date: today,
      points,
      streak
    });
    this.userPointsData.pointsHistory.push({
      date: today,
      type: "checkin",
      points,
      description: "每日签到"
    });
    const month = today.substring(0, 7);
    if (!this.checkInData.monthlyCheckIns[month]) {
      this.checkInData.monthlyCheckIns[month] = [];
    }
    this.checkInData.monthlyCheckIns[month].push(today);
    this.saveToStorage();
    return {
      success: true,
      message: `签到成功！获得${points}积分`,
      points,
      streak,
      totalPoints: this.userPointsData.totalPoints
    };
  }
  /**
   * 获取月度签到数据
   */
  getMonthlyCheckIns(year, month) {
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
    return this.checkInData.monthlyCheckIns[monthKey] || [];
  }
  /**
   * 获取签到统计
   */
  getCheckInStats() {
    return {
      currentStreak: this.userPointsData.checkInStreak,
      longestStreak: this.userPointsData.longestStreak,
      totalCheckIns: this.userPointsData.checkInHistory.length,
      totalPoints: this.userPointsData.totalPoints
    };
  }
  /**
   * 使用积分
   */
  usePoints(points, reason) {
    if (this.userPointsData.totalPoints < points) {
      return {
        success: false,
        message: "积分不足"
      };
    }
    this.userPointsData.totalPoints -= points;
    this.userPointsData.usedPoints += points;
    this.userPointsData.pointsHistory.push({
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      type: "use",
      points: -points,
      description: reason
    });
    this.saveToStorage();
    return {
      success: true,
      message: `成功使用${points}积分`,
      remainingPoints: this.userPointsData.totalPoints
    };
  }
  /**
   * 获取积分历史
   */
  getPointsHistory(limit = 20) {
    return this.userPointsData.pointsHistory.slice(-limit).reverse();
  }
  /**
   * 保存数据到本地存储
   */
  saveToStorage() {
    try {
      common_vendor.index.setStorageSync("userPointsData", JSON.stringify(this.userPointsData));
      common_vendor.index.setStorageSync("checkInData", JSON.stringify(this.checkInData));
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/pointsManager.js:212", "保存积分数据失败:", error);
    }
  }
  /**
   * 从本地存储加载数据
   */
  loadFromStorage() {
    try {
      const pointsData = common_vendor.index.getStorageSync("userPointsData");
      if (pointsData) {
        this.userPointsData = JSON.parse(pointsData);
      }
      const checkInData = common_vendor.index.getStorageSync("checkInData");
      if (checkInData) {
        this.checkInData = JSON.parse(checkInData);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/pointsManager.js:231", "加载积分数据失败:", error);
    }
  }
  /**
   * 重置积分数据（用于测试）
   */
  resetData() {
    this.userPointsData = {
      totalPoints: 0,
      earnedPoints: 0,
      usedPoints: 0,
      checkInStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      checkInHistory: [],
      pointsHistory: []
    };
    this.checkInData = {
      monthlyCheckIns: {},
      yearlyStats: {}
    };
    this.saveToStorage();
  }
}
const pointsManager = new PointsManager();
exports.pointsManager = pointsManager;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/pointsManager.js.map
