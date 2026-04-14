import hunanCountyMetrics from './data/hunanCountyMetrics.json'

export const YEAR_OPTIONS = hunanCountyMetrics.years

const toHundredMillionYuan = (value) => (
  Number.isFinite(Number(value)) ? Number((Number(value) / 10000).toFixed(2)) : value
)

export const MEASURE_CONFIG = {
  ...hunanCountyMetrics.measures,
  gdp: {
    ...hunanCountyMetrics.measures.gdp,
    unit: '亿元',
    displayLabel: 'GDP (亿元)'
  }
}

export const COUNTIES = hunanCountyMetrics.counties.map((county) => ({
  ...county,
  metrics: {
    ...county.metrics,
    gdp: Object.fromEntries(
      Object.entries(county.metrics.gdp || {}).map(([year, value]) => [
        year,
        toHundredMillionYuan(value)
      ])
    )
  }
}))
