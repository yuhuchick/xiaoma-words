"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pointsManager = require("../../utils/pointsManager.js");
const _sfc_main = {
  data() {
    return {
      currentTab: "all",
      filterTabs: [
        { label: "全部", value: "all" },
        { label: "本月", value: "month" },
        { label: "本周", value: "week" },
        { label: "今日", value: "today" }
      ],
      userPoints: {},
      checkInStats: {},
      isTodayCheckedIn: false,
      selectedDate: null,
      currentYear: (/* @__PURE__ */ new Date()).getFullYear(),
      currentMonth: (/* @__PURE__ */ new Date()).getMonth() + 1,
      weekdays: ["日", "一", "二", "三", "四", "五", "六"],
      calendarDays: []
    };
  },
  async onLoad() {
    await utils_pointsManager.pointsManager.init();
    this.loadData();
    this.generateCalendar();
  },
  methods: {
    loadData() {
      this.userPoints = utils_pointsManager.pointsManager.getUserPoints();
      this.checkInStats = utils_pointsManager.pointsManager.getCheckInStats();
      this.isTodayCheckedIn = utils_pointsManager.pointsManager.isTodayCheckedIn();
    },
    // 生成日历数据
    generateCalendar() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const firstDay = new Date(year, month - 1, 1).getDay();
      const daysInMonth = new Date(year, month, 0).getDate();
      const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
      this.calendarDays = [];
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        this.calendarDays.push({
          day,
          year: month === 1 ? year - 1 : year,
          month: month === 1 ? 12 : month - 1,
          type: "prev"
        });
      }
      for (let day = 1; day <= daysInMonth; day++) {
        this.calendarDays.push({
          day,
          year,
          month,
          type: "current"
        });
      }
      const remainingDays = 42 - this.calendarDays.length;
      for (let day = 1; day <= remainingDays; day++) {
        this.calendarDays.push({
          day,
          year: month === 12 ? year + 1 : year,
          month: month === 12 ? 1 : month + 1,
          type: "next"
        });
      }
    },
    // 切换标签
    switchTab(tab) {
      this.currentTab = tab;
    },
    // 处理签到
    handleCheckIn() {
      if (this.isTodayCheckedIn) {
        common_vendor.index.showToast({
          title: "今日已签到",
          icon: "none"
        });
        return;
      }
      const result = utils_pointsManager.pointsManager.checkIn();
      if (result.success) {
        common_vendor.index.showToast({
          title: result.message,
          icon: "success"
        });
        this.loadData();
        this.showCheckInAnimation(result.points);
      } else {
        common_vendor.index.showToast({
          title: result.message,
          icon: "none"
        });
      }
    },
    // 显示签到成功动画
    showCheckInAnimation(points) {
      common_vendor.index.showModal({
        title: "签到成功！",
        content: `恭喜获得${points}积分！
当前总积分：${this.userPoints.totalPoints}`,
        showCancel: false,
        confirmText: "太棒了"
      });
    },
    // 上个月
    previousMonth() {
      if (this.currentMonth === 1) {
        this.currentMonth = 12;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.generateCalendar();
    },
    // 下个月
    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentMonth = 1;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.generateCalendar();
    },
    // 日期点击事件
    onDayClick(day) {
      if (day.type === "current") {
        this.selectedDate = day;
        const isCheckedIn = this.isCheckInDay(day);
        if (isCheckedIn) {
          common_vendor.index.showToast({
            title: `${day.year}-${day.month}-${day.day} 已签到`,
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: `${day.year}-${day.month}-${day.day} 未签到`,
            icon: "none"
          });
        }
      }
    },
    // 获取日期样式类
    getDayClass(day) {
      const classes = [];
      if (day.type !== "current") {
        classes.push("other-month");
      }
      const today = /* @__PURE__ */ new Date();
      if (day.type === "current" && today.getFullYear() === day.year && today.getMonth() + 1 === day.month && today.getDate() === day.day) {
        classes.push("today");
      }
      if (this.isCheckInDay(day)) {
        classes.push("checked-in");
      }
      if (this.selectedDate && this.selectedDate.year === day.year && this.selectedDate.month === day.month && this.selectedDate.day === day.day) {
        classes.push("selected");
      }
      return classes.join(" ");
    },
    // 检查是否为签到日
    isCheckInDay(day) {
      const dateStr = `${day.year}-${day.month.toString().padStart(2, "0")}-${day.day.toString().padStart(2, "0")}`;
      const monthlyCheckIns = utils_pointsManager.pointsManager.getMonthlyCheckIns(day.year, day.month);
      return monthlyCheckIns.includes(dateStr);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.checkInStats.currentStreak),
    b: common_vendor.t($data.isTodayCheckedIn ? "✓" : "📅"),
    c: common_vendor.t($data.isTodayCheckedIn ? "已签到" : "立即签到"),
    d: common_vendor.o((...args) => $options.handleCheckIn && $options.handleCheckIn(...args)),
    e: $data.isTodayCheckedIn ? 1 : "",
    f: common_vendor.o((...args) => $options.previousMonth && $options.previousMonth(...args)),
    g: common_vendor.t($data.currentYear),
    h: common_vendor.t($data.currentMonth),
    i: common_vendor.o((...args) => $options.nextMonth && $options.nextMonth(...args)),
    j: common_vendor.f($data.weekdays, (day, k0, i0) => {
      return {
        a: common_vendor.t(day),
        b: day
      };
    }),
    k: common_vendor.f($data.calendarDays, (day, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(day.day),
        b: $options.isCheckInDay(day)
      }, $options.isCheckInDay(day) ? {} : {}, {
        c: index,
        d: common_vendor.n($options.getDayClass(day)),
        e: common_vendor.o(($event) => $options.onDayClick(day), index)
      });
    }),
    l: common_vendor.t($data.checkInStats.currentStreak),
    m: common_vendor.t($data.checkInStats.longestStreak),
    n: common_vendor.t($data.checkInStats.totalCheckIns),
    o: common_vendor.t($data.userPoints.totalPoints)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6e8913ab"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/calendar/calendar.js.map
