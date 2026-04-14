import { markRaw, onMounted, shallowRef } from 'vue'
import hunanCountyGeoJsonUrl from '../assets/geo/hunan-counties.json?url'

let cachedCountyGeoJson = null
let cachedCityGeoJson = null
let cachedProvinceGeoJson = null
let geoJsonPromise = null

const getCityAdcode = (adcode) => {
  const normalizedAdcode = String(adcode || '').padStart(6, '0')
  if (!/^\d{6}$/.test(normalizedAdcode)) {
    return ''
  }

  return `${normalizedAdcode.slice(0, 4)}00`
}

const collectBounds = (coordinates, bounds = {
  minLng: Infinity,
  maxLng: -Infinity,
  minLat: Infinity,
  maxLat: -Infinity
}) => {
  if (!Array.isArray(coordinates)) {
    return bounds
  }

  if (typeof coordinates[0] === 'number') {
    const lng = Number(coordinates[0])
    const lat = Number(coordinates[1])
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      bounds.minLng = Math.min(bounds.minLng, lng)
      bounds.maxLng = Math.max(bounds.maxLng, lng)
      bounds.minLat = Math.min(bounds.minLat, lat)
      bounds.maxLat = Math.max(bounds.maxLat, lat)
    }
    return bounds
  }

  coordinates.forEach((item) => collectBounds(item, bounds))
  return bounds
}

const getBoundsCenter = (bounds) => {
  if (
    !Number.isFinite(bounds.minLng)
    || !Number.isFinite(bounds.maxLng)
    || !Number.isFinite(bounds.minLat)
    || !Number.isFinite(bounds.maxLat)
  ) {
    return null
  }

  return [
    Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
    Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
  ]
}

const normalizeFeaturePoint = (feature, fallbackGeometry) => (
  feature?.properties?.centroid
  || feature?.properties?.center
  || getBoundsCenter(collectBounds(fallbackGeometry?.coordinates))
)

const toCountyGeoJson = (geoJson) => markRaw({
  type: 'FeatureCollection',
  features: (geoJson.features || [])
    .filter((feature) => ['county', 'district'].includes(feature?.properties?.level))
    .map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: String(feature?.properties?.name || '').trim(),
        adcode: String(feature?.properties?.adcode || ''),
        cityAdcode: String(feature?.properties?.cityAdcode || feature?.properties?.parent?.adcode || getCityAdcode(feature?.properties?.adcode)),
        center: feature?.properties?.center || getBoundsCenter(collectBounds(feature.geometry?.coordinates)),
        centroid: normalizeFeaturePoint(feature, feature.geometry),
        level: 'county'
      }
    }))
})

const toCityGeoJson = (geoJson) => markRaw({
  type: 'FeatureCollection',
  features: (geoJson.features || [])
    .filter((feature) => feature?.properties?.level === 'city')
    .map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: String(feature?.properties?.name || '').trim(),
        adcode: String(feature?.properties?.adcode || ''),
        center: feature?.properties?.center || getBoundsCenter(collectBounds(feature.geometry?.coordinates)),
        centroid: normalizeFeaturePoint(feature, feature.geometry),
        level: 'city'
      }
    }))
})

const toProvinceGeoJson = (geoJson) => markRaw({
  type: 'FeatureCollection',
  features: (geoJson.features || []).filter(
    (feature) => ['province', 'province-outline'].includes(feature?.properties?.level)
  )
})

export function useHunanGeoJson() {
  const geoJson = shallowRef(cachedCountyGeoJson)
  const cityGeoJson = shallowRef(cachedCityGeoJson)
  const provinceGeoJson = shallowRef(cachedProvinceGeoJson)
  const isGeoJsonLoading = shallowRef(!cachedCountyGeoJson || !cachedCityGeoJson || !cachedProvinceGeoJson)
  const geoJsonError = shallowRef('')

  const loadHunanGeoJson = async () => {
    if (cachedCountyGeoJson && cachedCityGeoJson && cachedProvinceGeoJson) {
      geoJson.value = cachedCountyGeoJson
      cityGeoJson.value = cachedCityGeoJson
      provinceGeoJson.value = cachedProvinceGeoJson
      isGeoJsonLoading.value = false
      return
    }

    isGeoJsonLoading.value = true
    geoJsonError.value = ''

    try {
      if (!geoJsonPromise) {
        geoJsonPromise = fetch(hunanCountyGeoJsonUrl).then((response) => {
          if (!response.ok) {
            throw new Error(`County HTTP ${response.status}`)
          }
          return response.json()
        })
      }

      const countyRaw = await geoJsonPromise
      cachedCountyGeoJson = toCountyGeoJson(countyRaw)
      cachedCityGeoJson = toCityGeoJson(countyRaw)
      cachedProvinceGeoJson = toProvinceGeoJson(countyRaw)
      geoJson.value = cachedCountyGeoJson
      cityGeoJson.value = cachedCityGeoJson
      provinceGeoJson.value = cachedProvinceGeoJson
    } catch (error) {
      geoJsonError.value = `地图数据加载失败: ${error.message}`
      geoJsonPromise = null
    } finally {
      isGeoJsonLoading.value = false
    }
  }

  onMounted(loadHunanGeoJson)

  return {
    geoJson,
    cityGeoJson,
    provinceGeoJson,
    isGeoJsonLoading,
    geoJsonError,
    loadHunanGeoJson
  }
}
