项目结构

package.json:1 表明这是 Vite 5 + Vue 3 仪表盘，依赖 Element Plus、ECharts 5 以及 echarts-extension-amap（目前未被代码引用）。
index.html:1 只提供 #app 占位和 src/main.js 入口，所有视图逻辑都集中在单页组件里。
src/main.js:1 创建应用、全量注册 Element Plus 图标并挂载插件，因此整站状态与布局都收敛在 App.vue。
src/style.css:1 负责全局 reset、字体与滚动条皮肤，覆盖 Element Plus 默认样式。
src/App.vue:1 同时包含模板、业务状态、ECharts 配置与 scoped CSS，目前没有拆分组件或数据层。
openspec/changes/proposal4.md:1 等文档记录了后续需求（如数据抓取、地图交互），可作为理解背景的参考资料。
地图部分

模板 src/App.vue:136 起的 map-section 使用静态 <svg> 绘制全国轮廓；30 余个 <path> 通过 data-name、data-adcode、data-value 和固定填充色编码 GDP，占位数据直接写在标签上。
左侧过滤器与地图标题绑定到 mapMeasures、mapTimeframes、chartMeasures 等响应式数组（src/App.vue:331），但这些状态只改变标题文本，尚未驱动 <path> 颜色或数字更新。
图例与“数据来源”说明在 src/App.vue:253 与 src/App.vue:280 附近写死，色阶区间与 SVG 初始填色对应；切换指标/年份不会刷新这些内容。
样式段 src/App.vue:466 为 .map-section、.china-map .province、.map-legend 等提供布局与 hover 描边，尚无“选中省份”或动态配色的状态样式。
右侧折线图逻辑在 src/App.vue:372（trendData + initTrendChart），watch([selectedChartMeasures, startYear, endYear], …) 目前只调用 resize()（src/App.vue:449），因此地图与折线图都展示静态占位数据，没有与过滤器联动。
虽然依赖里包含 echarts-extension-amap，源码里并未 import 或实例化高德底图；若计划提升地图交互，可利用现有 data-adcode 作为键值，把 SVG 数据迁移到 JSON，再用 ECharts map/AMap 驱动着色与联动。