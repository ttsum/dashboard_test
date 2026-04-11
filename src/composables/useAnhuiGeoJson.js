import { markRaw, onMounted, shallowRef } from 'vue'
import anhuiCountyGeoJsonUrl from '../assets/geo/anhui-counties.raw.geo.json?url'
import anhuiCityGeoJsonUrl from '../assets/geo/anhui-cities.raw.geo.json?url'

let cachedCountyGeoJson = null
let cachedCityGeoJson = null
let geoJsonPromise = null

const toCountyGeoJson = (geoJson) => markRaw({
  type: 'FeatureCollection',
  features: (geoJson.features || [])
    .filter((feature) => feature?.properties?.level === 'district')
    .map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: String(feature?.properties?.name || '').trim(),
        adcode: String(feature?.properties?.adcode || ''),
        cityAdcode: String(feature?.properties?.parent?.adcode || ''),
        level: 'county'
      }
    }))
})

const toCityGeoJson = (geoJson) => markRaw({
  type: 'FeatureCollection',
  features: (geoJson.features || []).filter(
    (feature) => feature?.properties?.level === 'city'
  )
})

export function useAnhuiGeoJson() {
  const geoJson = shallowRef(cachedCountyGeoJson)
  const cityGeoJson = shallowRef(cachedCityGeoJson)
  const isGeoJsonLoading = shallowRef(!cachedCountyGeoJson || !cachedCityGeoJson)
  const geoJsonError = shallowRef('')

  const loadAnhuiGeoJson = async () => {
    if (cachedCountyGeoJson && cachedCityGeoJson) {
      geoJson.value = cachedCountyGeoJson
      cityGeoJson.value = cachedCityGeoJson
      isGeoJsonLoading.value = false
      return
    }

    isGeoJsonLoading.value = true
    geoJsonError.value = ''

    try {
      if (!geoJsonPromise) {
        geoJsonPromise = Promise.all([
          fetch(anhuiCountyGeoJsonUrl).then((response) => {
            if (!response.ok) {
              throw new Error(`County HTTP ${response.status}`)
            }
            return response.json()
          }),
          fetch(anhuiCityGeoJsonUrl).then((response) => {
            if (!response.ok) {
              throw new Error(`City HTTP ${response.status}`)
            }
            return response.json()
          })
        ])
      }

      const [countyRaw, cityRaw] = await geoJsonPromise
      cachedCountyGeoJson = toCountyGeoJson(countyRaw)
      cachedCityGeoJson = toCityGeoJson(cityRaw)
      geoJson.value = cachedCountyGeoJson
      cityGeoJson.value = cachedCityGeoJson
    } catch (error) {
      geoJsonError.value = `地图数据加载失败: ${error.message}`
      geoJsonPromise = null
    } finally {
      isGeoJsonLoading.value = false
    }
  }

  onMounted(loadAnhuiGeoJson)

  return {
    geoJson,
    cityGeoJson,
    isGeoJsonLoading,
    geoJsonError,
    loadAnhuiGeoJson
  }
}
