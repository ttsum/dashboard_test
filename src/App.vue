<template>
  <div class="dashboard">
    <!-- 顶部 Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-placeholder">
          <el-icon :size="32"><TrendCharts /></el-icon>
        </div>
        <div class="header-title">
          <span class="org-name">国家统计局</span>
          <span class="main-title">省级经济数据报告</span>
        </div>
      </div>
      <div class="header-right">
        <span class="date-text">{{ currentDate }}</span>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="dashboard-main">
      <!-- 四列筛选器面板 -->
      <div class="filter-panel">
        <!-- Column 1: Map Measure -->
        <div class="filter-column">
          <div class="filter-header">地图指标</div>
          <el-radio-group v-model="selectedMapMeasure" class="filter-radio-group">
            <el-radio
              v-for="item in mapMeasures"
              :key="item"
              :label="item"
              class="filter-radio"
            >
              {{ item }}
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Column 2: Map Timeframe -->
        <div class="filter-column">
          <div class="filter-header">年份选择</div>
          <el-radio-group v-model="selectedMapTimeframe" class="filter-radio-group">
            <el-radio
              v-for="item in mapTimeframes"
              :key="item"
              :label="item"
              class="filter-radio"
            >
              {{ item }}
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Column 3: Chart Measures -->
        <div class="filter-column">
          <div class="filter-header">省份选择</div>
          <el-checkbox-group v-model="selectedChartMeasures" class="filter-checkbox-group">
            <el-checkbox
              v-for="item in chartMeasures"
              :key="item"
              :label="item"
              class="filter-checkbox"
            >
              {{ item }}
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- Column 4: Timeframe Slider -->
        <div class="filter-column">
          <div class="filter-header">时间范围</div>
          <div class="timeframe-inputs">
            <el-input-number
              v-model="startYear"
              :min="2021"
              :max="2024"
              :controls="false"
              size="small"
              class="year-input"
            />
            <span class="year-separator">至</span>
            <el-input-number
              v-model="endYear"
              :min="2021"
              :max="2024"
              :controls="false"
              size="small"
              class="year-input"
            />
          </div>
          <div class="slider-container">
            <el-slider
              v-model="yearRange"
              range
              :min="2021"
              :max="2024"
              :marks="yearMarks"
            />
          </div>
        </div>
      </div>

      <!-- 第三步和第四步的可视化区域 -->
      <div class="visualization-area">
        <div class="viz-row">
          <!-- 左侧：地图区域 -->
          <div class="map-section">
            <div class="map-title">
              {{ selectedMapMeasure }}分布图 - {{ selectedMapTimeframe }}年
            </div>

            <div class="map-container">
              <div ref="mapChartRef" class="map-chart"></div>
            </div>

            <!-- 颜色图例 -->
            <div class="map-legend">
              <div class="legend-title">{{ selectedMapMeasure }}</div>
              <div class="legend-scale">
                <div
                  v-for="item in mapLegendItems"
                  :key="item.label"
                  class="legend-item"
                >
                  <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                  <span class="legend-label">{{ item.label }}</span>
                </div>
              </div>
            </div>

            <!-- 底部说明 -->
            <div class="map-footer">
              数据来源：国家统计局。点击地图省份可联动右侧趋势图，港澳台等区域当前显示为暂无统计数据。
            </div>
          </div>

          <!-- 右侧：趋势图区域 -->
          <div class="chart-section">
            <div class="chart-title">
              {{ selectedMapMeasure }}趋势图 ({{ startYear }} - {{ endYear }})
            </div>
            <div ref="trendChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import chinaProvinceGeoJson from './data/china-provinces.json'
import { MEASURE_CONFIG, YEAR_OPTIONS, PROVINCES } from './data/provinceData'

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const measureByLabel = new Map(
  Object.values(MEASURE_CONFIG).map((item) => [item.label, item])
)
const mapMeasures = ref(Object.values(MEASURE_CONFIG).map((item) => item.label))
const selectedMapMeasure = ref('GDP (亿元)')

const mapTimeframes = ref([...YEAR_OPTIONS].reverse().map((year) => String(year)))
const selectedMapTimeframe = ref('2024')

const chartMeasures = computed(() => PROVINCES.map((province) => province.name))
const selectedChartMeasures = ref(['广东省', '江苏省', '山东省', '浙江省', '河南省'])

const yearRange = ref([2021, 2024])
const yearMarks = YEAR_OPTIONS.reduce((marks, year) => {
  marks[year] = String(year)
  return marks
}, {})

const startYear = computed({
  get: () => yearRange.value[0],
  set: (value) => {
    const nextStart = Math.min(value, yearRange.value[1])
    yearRange.value = [nextStart, yearRange.value[1]]
  }
})

const endYear = computed({
  get: () => yearRange.value[1],
  set: (value) => {
    const nextEnd = Math.max(value, yearRange.value[0])
    yearRange.value = [yearRange.value[0], nextEnd]
  }
})

const MAP_NAME = 'china-province-svg'
const MAP_COLORS = ['#81C784', '#66BB6A', '#4CAF50', '#2E7D32', '#1B5E20']
const SERIES_COLORS = ['#E91E63', '#9C27B0', '#00BCD4', '#FF9800', '#4CAF50', '#2196F3', '#FF5722', '#3F51B5']

const mapChartRef = ref(null)
const trendChartRef = ref(null)
let mapChart = null
let trendChart = null

const provinceByName = new Map(PROVINCES.map((province) => [province.name, province]))
const mapGeoRegionNames = (chinaProvinceGeoJson.features || [])
  .map((feature) => feature?.properties?.name)
  .filter((name) => Boolean(name))
const nonStatRegionNames = mapGeoRegionNames.filter((name) => !provinceByName.has(name))
const seriesColorByName = new Map()

const selectedMeasure = computed(() => (
  measureByLabel.get(selectedMapMeasure.value) || MEASURE_CONFIG.gdp
))
const selectedYear = computed(() => Number(selectedMapTimeframe.value))
const trendYears = computed(() => YEAR_OPTIONS.filter((year) => (
  year >= startYear.value && year <= endYear.value
)))

const formatNumber = (value) => Number(value || 0).toLocaleString('zh-CN')

const getSeriesColor = (name) => {
  if (!seriesColorByName.has(name)) {
    const colorIndex = seriesColorByName.size % SERIES_COLORS.length
    seriesColorByName.set(name, SERIES_COLORS[colorIndex])
  }
  return seriesColorByName.get(name)
}

const getMapSnapshot = (selectedMeasureKey, selectedYearValue) => (
  Object.fromEntries(
    PROVINCES.map((province) => [
      province.adcode,
      province.metrics[selectedMeasureKey]?.[selectedYearValue] || 0
    ])
  )
)

const mapSeriesData = computed(() => {
  const snapshot = getMapSnapshot(selectedMeasure.value.key, selectedYear.value)
  const provinceData = PROVINCES.map((province) => ({
    name: province.name,
    value: snapshot[province.adcode],
    adcode: province.adcode
  }))
  const noDataRegions = nonStatRegionNames.map((name) => ({
    name,
    value: null,
    isNoData: true,
    itemStyle: { areaColor: '#D1D5DB' }
  }))
  return [...provinceData, ...noDataRegions]
})

const buildLegendItems = (values, unit) => {
  if (!values.length) {
    return []
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) {
    return [{ color: MAP_COLORS[2], min, max, label: `${formatNumber(min)} ${unit}` }]
  }
  const step = (max - min) / MAP_COLORS.length
  return MAP_COLORS.map((color, index) => {
    const lower = Math.round(min + step * index)
    const upper = Math.round(min + step * (index + 1))
    if (index === 0) {
      return {
        color,
        min,
        max: upper,
        label: `${formatNumber(min)} - ${formatNumber(upper)} ${unit}`
      }
    }
    if (index === MAP_COLORS.length - 1) {
      return {
        color,
        min: lower,
        max,
        label: `${formatNumber(lower)} - ${formatNumber(max)} ${unit}`
      }
    }
    return {
      color,
      min: lower,
      max: upper,
      label: `${formatNumber(lower)} - ${formatNumber(upper)} ${unit}`
    }
  })
}

const mapLegendItems = computed(() => (
  buildLegendItems(
    mapSeriesData.value
      .map((item) => item.value)
      .filter((value) => Number.isFinite(value)),
    selectedMeasure.value.unit
  )
))

const trendSeriesData = computed(() => (
  selectedChartMeasures.value
    .map((name) => provinceByName.get(name))
    .filter(Boolean)
    .map((province) => ({
      name: province.name,
      color: getSeriesColor(province.name),
      data: trendYears.value.map((year) => province.metrics[selectedMeasure.value.key][year] || 0)
    }))
))

const syncMapSelection = () => {
  if (!mapChart) {
    return
  }
  const selectedNames = new Set(selectedChartMeasures.value)
  PROVINCES.forEach((province) => {
    mapChart.dispatchAction({
      type: selectedNames.has(province.name) ? 'select' : 'unselect',
      seriesIndex: 0,
      name: province.name
    })
  })
}

const updateMapChart = () => {
  if (!mapChart) {
    return
  }

  const visualPieces = mapLegendItems.value.map((item, index) => ({
    gte: index === 0 ? item.min : item.min,
    lte: index === mapLegendItems.value.length - 1 ? item.max : item.max,
    color: item.color
  }))

  mapChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const rawValue = params?.data?.value
        const hasValue = Number.isFinite(Number(rawValue))
        if (!hasValue) {
          return `${params.name}<br>暂无统计数据`
        }
        const value = formatNumber(rawValue)
        return `${params.name}<br>${selectedMeasure.value.label}: ${value} ${selectedMeasure.value.unit}`
      }
    },
    visualMap: {
      type: 'piecewise',
      show: false,
      pieces: visualPieces,
      outOfRange: {
        color: '#D1D5DB'
      }
    },
    series: [{
      type: 'map',
      map: MAP_NAME,
      roam: true,
      zoom: 1.05,
      selectedMode: 'multiple',
      emphasis: {
        label: {
          show: true,
          fontSize: 11,
          color: '#111827'
        },
        itemStyle: {
          borderColor: '#002D56',
          borderWidth: 2
        }
      },
      select: {
        itemStyle: {
          borderColor: '#002D56',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 45, 86, 0.35)'
        }
      },
      itemStyle: {
        areaColor: '#E5E7EB',
        borderColor: '#FFFFFF',
        borderWidth: 1
      },
      data: mapSeriesData.value
    }]
  }, true)

  syncMapSelection()
}

const updateTrendChart = () => {
  if (!trendChart) {
    return
  }
  const hasSeries = trendSeriesData.value.length > 0
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      valueFormatter: (value) => `${formatNumber(value)} ${selectedMeasure.value.unit}`
    },
    grid: {
      left: '3%',
      right: '20%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendYears.value.map((year) => String(year)),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: selectedMapMeasure.value,
      nameTextStyle: {
        fontSize: 11
      }
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 11
      }
    },
    series: trendSeriesData.value.map((item) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
      itemStyle: { color: item.color },
      emphasis: {
        focus: 'series'
      }
    })),
    graphic: hasSeries ? [] : [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '请至少选择一个省份',
        fill: '#9CA3AF',
        fontSize: 13
      }
    }]
  }, true)
}

const initMapChart = () => {
  if (!mapChartRef.value) {
    return
  }
  echarts.registerMap(MAP_NAME, chinaProvinceGeoJson)
  mapChart = echarts.init(mapChartRef.value)
  mapChart.on('click', (params) => {
    if (!params.name || !provinceByName.has(params.name)) {
      return
    }
    const selected = new Set(selectedChartMeasures.value)
    if (selected.has(params.name)) {
      selected.delete(params.name)
    } else {
      selected.add(params.name)
    }
    selectedChartMeasures.value = Array.from(selected)
  })
  updateMapChart()
}

const initTrendChart = () => {
  if (!trendChartRef.value) {
    return
  }
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

// 监听窗口大小变化
const handleResize = () => {
  mapChart?.resize()
  trendChart?.resize()
}

watch([selectedMapMeasure, selectedMapTimeframe], () => {
  updateMapChart()
})

watch([selectedChartMeasures, yearRange, selectedMapMeasure], () => {
  updateTrendChart()
  syncMapSelection()
}, { deep: true })

onMounted(() => {
  initMapChart()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  mapChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped>
/* 整体容器 */
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', Arial, sans-serif;
}

/* 顶部 Header */
.dashboard-header {
  background-color: #002D56;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-placeholder {
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.org-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
}

.main-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.date-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 主内容区域 */
.dashboard-main {
  flex: 1;
  background-color: #E5E7EB;
  padding: 16px;
}

/* 筛选器面板 */
.filter-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.filter-column {
  padding: 12px;
  background-color: #F9FAFB;
  border-radius: 4px;
  border: 1px solid #E5E7EB;
}

.filter-header {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E5E7EB;
}

.filter-radio-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-radio {
  margin-right: 0 !important;
  font-size: 12px !important;
  color: #4B5563;
}

.filter-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 8px;
}

.filter-checkbox {
  margin-right: 0 !important;
  font-size: 12px !important;
  color: #4B5563;
}

/* Timeframe 滑块区域 */
.timeframe-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.year-input {
  width: 70px !important;
}

.year-input :deep(.el-input__inner) {
  text-align: center;
  font-size: 13px;
}

.year-separator {
  font-size: 13px;
  color: #6B7280;
}

.slider-container {
  padding: 0 8px;
}

.slider-container :deep(.el-slider__marks-text) {
  font-size: 10px;
  color: #9CA3AF;
}

.visualization-area {
  background-color: #fff;
  border-radius: 4px;
  min-height: 500px;
  padding: 16px;
}

.viz-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 地图区域 */
.map-section {
  display: flex;
  flex-direction: column;
}

.map-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #002D56;
}

.map-container {
  flex: 1;
  min-height: 300px;
  background-color: #F9FAFB;
  border-radius: 4px;
  padding: 16px;
}

.map-chart {
  width: 100%;
  height: 360px;
}

.map-chart :deep(svg) {
  overflow: visible;
}

/* 地图图例 */
.map-legend {
  margin-top: 16px;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: #4B5563;
  margin-bottom: 8px;
}

.legend-scale {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1 1 calc(50% - 4px);
}

.legend-color {
  width: 100%;
  height: 16px;
  border-radius: 2px;
}

.legend-label {
  font-size: 10px;
  color: #6B7280;
  white-space: nowrap;
}

/* 地图底部说明 */
.map-footer {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #F3F4F6;
  border-radius: 4px;
  font-size: 11px;
  color: #6B7280;
  font-style: italic;
}

/* 趋势图区域 */
.chart-section {
  display: flex;
  flex-direction: column;
  background-color: #F9FAFB;
  border-radius: 4px;
  min-height: 400px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 12px;
  padding: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #002D56;
  background-color: #fff;
  border-radius: 4px 4px 0 0;
}

.chart-container {
  flex: 1;
  min-height: 350px;
  background-color: #fff;
  border-radius: 0 0 4px 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .filter-panel {
    grid-template-columns: repeat(2, 1fr);
  }

  .viz-row {
    grid-template-columns: 1fr;
  }

  .map-section, .chart-section {
    min-height: 350px;
  }
}

@media (max-width: 768px) {
  .filter-panel {
    grid-template-columns: 1fr;
  }

  .header-title {
    display: none;
  }

  .main-title {
    font-size: 16px;
  }

  .dashboard-header {
    padding: 12px 16px;
  }

  .dashboard-main {
    padding: 12px;
  }
}
</style>
