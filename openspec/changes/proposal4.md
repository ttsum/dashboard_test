# 阶段四：前端交互逻辑与数据映射实现文档 (JS/Vue/React)

## 1. 任务目标
基于已获取的 2021-2024 年省级统计 JSON 数据，实现与现有前端组件（导航、滑块、SVG 地图、趋势图）的深度集成。

## 2. 现有开发环境上下文
- **导航项:** `primaryNavItems` (Statewide/County), `secondaryNavItems` (GDP/Population/Income)。
- **筛选器:** `Timeframe Slider` (返回年份字符串)。
- **地图结构:** 内联 SVG，每个 `<path>` 包含 `id` (adcode) 或 `data-name` 属性。
- **趋势数据:** `trendData` 对象，包含 `years` 数组和 `series` 数组。

---

## 3. 核心逻辑开发需求

### A. 数据抽取函数 (Data Fetching Logic)
编写一个名为 `getMapSnapshot` 的函数：
- **输入参数：** `selectedMeasure` (指标名), `selectedYear` (年份)。
- **输出结果：** 返回一个以 `adcode` 为键（Key），数值为值（Value）的 Map 对象，用于快速查询。

### B. SVG 属性动态绑定 (DOM/VDOM Update)
提供一段逻辑，实现地图状态的实时更新：
- 遍历所有地图 `<path>` 元素。
- 根据路径的 `id` 或 `data-name` 从 `getMapSnapshot` 结果中检索数值。
- 将检索到的数值动态写入该路径的 `data-value` 属性中。

### C. 动态颜色映射算法 (Heatmap Scale)
实现一个 `getColor` 颜色渲染算法：
- **逻辑：** 自动获取当前指标在 31 个省份中的最大值（Max）和最小值（Min）。
- **映射：** 采用 5 级颜色阶梯（例如从浅蓝色 `#E3F2FD` 到深红色 `#B71C1C`）。
- **输出：** 根据输入的数值返回对应的十六进制颜色代码，并更新对应 SVG 路径的 `fill` 属性。

### D. 趋势图联动逻辑 (Chart Sync)
实现地图与趋势图的交互：
- **触发条件：** 用户点击地图上的某个省份路径。
- **动作：** 1. 获取该路径的 `adcode`。
  2. 从全量 JSON 中提取该省份 2021-2024 四年的连续数据。
  3. 更新全局 `trendData` 变量，触发折线图（ECharts/Chart.js）重绘。

---

## 4. 技术约束
- **兼容性：** 需处理数据缺失（Null/Undefined）的情况，默认显示为 0 或灰色。
- **性能：** 切换年份滑块时，DOM 操作需流畅，建议使用 `RequestAnimationFrame` 或响应式框架的计算属性（Computed）。
- **单位处理：** Tooltip 弹出层需根据 `measures` 自动切换单位（亿元/万人/元）。

**请根据上述逻辑，为我编写对应的 JavaScript 代码实现。**