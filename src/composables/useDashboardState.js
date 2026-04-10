import { computed, ref } from 'vue'
import {
  COLOR_SCHEMES,
  COUNTIES,
  DEFAULT_MEASURE_LABEL,
  DEFAULT_SELECTED_COUNTIES,
  MEASURE_CONFIG,
  SERIES_COLORS,
  YEAR_OPTIONS
} from '../constants/dashboard'
import { formatNumber } from '../utils/format'

export function useDashboardState(_geoJson) {
  const measureItems = Object.values(MEASURE_CONFIG).map((item) => ({
    ...item,
    displayLabel: item.displayLabel || `${item.label} (${item.unit})`
  }))

  const measureByLabel = new Map(
    measureItems.map((item) => [item.displayLabel, item])
  )
  const countyByName = new Map(COUNTIES.map((county) => [county.name, county]))
  const seriesColorByName = new Map()

  const mapMeasures = measureItems.map((item) => item.displayLabel)
  const selectedMapMeasure = ref(DEFAULT_MEASURE_LABEL)

  const minYear = Math.min(...YEAR_OPTIONS)
  const maxYear = Math.max(...YEAR_OPTIONS)
  const mapTimeframes = [...YEAR_OPTIONS].reverse().map((year) => String(year))
  const selectedMapTimeframe = ref(String(maxYear))

  const chartMeasures = computed(() => COUNTIES.map((county) => county.name))
  const selectedChartMeasures = ref([...DEFAULT_SELECTED_COUNTIES])

  const clearSelectedCounties = () => {
    selectedChartMeasures.value = []
  }

  const toggleCountySelection = (name) => {
    if (!countyByName.has(name)) {
      return
    }

    const selected = new Set(selectedChartMeasures.value)
    if (selected.has(name)) {
      selected.delete(name)
    } else {
      selected.add(name)
    }

    selectedChartMeasures.value = Array.from(selected)
  }

  const yearRange = ref([minYear, maxYear])
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

  const selectedMeasure = computed(() => (
    measureByLabel.get(selectedMapMeasure.value) || measureItems[0]
  ))
  const selectedYear = computed(() => Number(selectedMapTimeframe.value))
  const trendYears = computed(() => YEAR_OPTIONS.filter((year) => (
    year >= startYear.value && year <= endYear.value
  )))
  const mapColors = computed(() => (
    COLOR_SCHEMES[selectedMeasure.value.key] || COLOR_SCHEMES.population
  ))

  const getSeriesColor = (name) => {
    if (!seriesColorByName.has(name)) {
      const colorIndex = seriesColorByName.size % SERIES_COLORS.length
      seriesColorByName.set(name, SERIES_COLORS[colorIndex])
    }
    return seriesColorByName.get(name)
  }

  const mapSeriesData = computed(() => (
    COUNTIES.map((county) => {
      const rawValue = county.metrics[selectedMeasure.value.key]?.[selectedYear.value]
      return {
        name: county.name,
        value: Number.isFinite(rawValue) ? rawValue : null
      }
    })
  ))

  const buildLegendItems = (values, unit, colors) => {
    if (!values.length) {
      return []
    }

    const min = Math.min(...values)
    const max = Math.max(...values)

    if (min === max) {
      return [{ color: colors[2], min, max, label: `${formatNumber(min)} ${unit}` }]
    }

    const step = (max - min) / colors.length

    return colors.map((color, index) => {
      const exactLower = min + step * index
      const exactUpper = min + step * (index + 1)
      const labelLower = Math.round(index === 0 ? min : exactLower)
      const labelUpper = Math.round(index === colors.length - 1 ? max : exactUpper)
      const rangeLabel = index === colors.length - 1
        ? `${formatNumber(labelLower)} - ${formatNumber(Math.round(max))} ${unit}`
        : `${formatNumber(labelLower)} - ${formatNumber(labelUpper)} ${unit}`

      return {
        color,
        min: index === 0 ? min : exactLower,
        max: index === colors.length - 1 ? max : exactUpper,
        label: rangeLabel
      }
    })
  }

  const mapLegendItems = computed(() => (
    buildLegendItems(
      mapSeriesData.value
        .map((item) => item.value)
        .filter((value) => Number.isFinite(value)),
      selectedMeasure.value.unit,
      mapColors.value
    )
  ))

  const trendSeriesData = computed(() => (
    selectedChartMeasures.value
      .map((name) => countyByName.get(name))
      .filter(Boolean)
      .map((county) => ({
        name: county.name,
        color: getSeriesColor(county.name),
        data: trendYears.value.map((year) => {
          const value = county.metrics[selectedMeasure.value.key]?.[year]
          return Number.isFinite(value) ? value : null
        })
      }))
  ))

  return {
    mapMeasures,
    selectedMapMeasure,
    minYear,
    maxYear,
    mapTimeframes,
    selectedMapTimeframe,
    chartMeasures,
    selectedChartMeasures,
    clearSelectedCounties,
    toggleCountySelection,
    yearRange,
    yearMarks,
    startYear,
    endYear,
    selectedMeasure,
    mapLegendItems,
    mapSeriesData,
    trendYears,
    trendSeriesData
  }
}
