export const YEAR_OPTIONS = [2021, 2022, 2023, 2024]

export const MEASURE_CONFIG = {
  gdp: {
    key: 'gdp',
    label: 'GDP (亿元)',
    unit: '亿元'
  },
  population: {
    key: 'population',
    label: '人口 (万人)',
    unit: '万人'
  },
  income: {
    key: 'income',
    label: '收入 (元)',
    unit: '元'
  }
}

const YEAR_FACTORS = {
  gdp: [0.84, 0.9, 0.95, 1],
  population: [0.992, 0.996, 0.998, 1],
  income: [0.82, 0.89, 0.95, 1]
}

const BASE_PROVINCES = [
  { adcode: '230000', name: '黑龙江省', path: 'M460 40 L520 35 L540 80 L520 120 L480 100 L450 70 Z', gdp: 16800, population: 3090, income: 38200 },
  { adcode: '220000', name: '吉林省', path: 'M480 100 L520 120 L530 150 L500 160 L460 140 L450 110 Z', gdp: 13800, population: 2370, income: 36500 },
  { adcode: '210000', name: '辽宁省', path: 'M460 140 L500 160 L510 190 L480 200 L440 180 L430 150 Z', gdp: 30500, population: 4190, income: 41800 },
  { adcode: '150000', name: '内蒙古自治区', path: 'M380 90 L430 80 L450 110 L440 150 L400 160 L370 130 Z', gdp: 25000, population: 2390, income: 40600 },
  { adcode: '130000', name: '河北省', path: 'M400 160 L440 150 L450 180 L430 210 L390 200 Z', gdp: 44000, population: 7390, income: 40100 },
  { adcode: '110000', name: '北京市', path: 'M405 175 L425 170 L435 190 L420 205 L400 195 Z', gdp: 45000, population: 2180, income: 85500 },
  { adcode: '120000', name: '天津市', path: 'M410 195 L430 200 L435 220 L415 230 L395 215 Z', gdp: 17000, population: 1370, income: 56300 },
  { adcode: '140000', name: '山西省', path: 'M370 180 L400 195 L410 230 L380 250 L340 230 Z', gdp: 27000, population: 3490, income: 38900 },
  { adcode: '370000', name: '山东省', path: 'M470 200 L510 190 L530 230 L510 270 L470 260 L450 230 Z', gdp: 98000, population: 10120, income: 47200 },
  { adcode: '320000', name: '江苏省', path: 'M450 240 L480 260 L480 290 L450 300 L420 280 Z', gdp: 132000, population: 8520, income: 60200 },
  { adcode: '310000', name: '上海市', path: 'M480 260 L510 250 L520 280 L500 310 L470 300 Z', gdp: 49000, population: 2480, income: 84800 },
  { adcode: '330000', name: '浙江省', path: 'M450 300 L480 310 L480 340 L450 360 L420 340 Z', gdp: 85000, population: 6660, income: 63800 },
  { adcode: '340000', name: '安徽省', path: 'M400 280 L440 270 L460 310 L440 350 L400 340 Z', gdp: 48000, population: 6120, income: 39700 },
  { adcode: '350000', name: '福建省', path: 'M430 350 L470 340 L490 380 L460 410 L420 400 Z', gdp: 56000, population: 4190, income: 55200 },
  { adcode: '360000', name: '江西省', path: 'M370 310 L410 300 L430 340 L410 380 L370 370 Z', gdp: 34000, population: 4520, income: 39100 },
  { adcode: '410000', name: '河南省', path: 'M350 250 L400 240 L420 280 L390 320 L350 300 Z', gdp: 62000, population: 9870, income: 35600 },
  { adcode: '420000', name: '湖北省', path: 'M340 310 L390 300 L400 340 L370 380 L330 360 Z', gdp: 58000, population: 5830, income: 43200 },
  { adcode: '430000', name: '湖南省', path: 'M330 360 L370 350 L380 390 L350 420 L320 400 Z', gdp: 52000, population: 6620, income: 40500 },
  { adcode: '440000', name: '广东省', path: 'M340 420 L400 410 L440 450 L410 490 L350 480 Z', gdp: 141000, population: 12720, income: 54800 },
  { adcode: '450000', name: '广西壮族自治区', path: 'M290 410 L340 420 L350 470 L310 490 L270 460 Z', gdp: 28000, population: 5010, income: 34300 },
  { adcode: '460000', name: '海南省', path: 'M330 480 L360 490 L360 520 L330 530 L300 510 Z', gdp: 8000, population: 1040, income: 36800 },
  { adcode: '500000', name: '重庆市', path: 'M250 340 L310 330 L340 380 L310 420 L250 400 Z', gdp: 31000, population: 3210, income: 44300 },
  { adcode: '510000', name: '四川省', path: 'M180 320 L260 300 L310 340 L280 420 L200 400 Z', gdp: 64000, population: 8360, income: 38900 },
  { adcode: '520000', name: '贵州省', path: 'M240 400 L290 420 L280 460 L240 480 L200 450 Z', gdp: 22000, population: 3860, income: 36000 },
  { adcode: '530000', name: '云南省', path: 'M180 410 L240 400 L250 460 L210 500 L160 470 Z', gdp: 32000, population: 4690, income: 37800 },
  { adcode: '540000', name: '西藏自治区', path: 'M60 260 L140 240 L180 320 L140 400 L50 380 Z', gdp: 2400, population: 365, income: 42000 },
  { adcode: '610000', name: '陕西省', path: 'M320 190 L380 180 L400 220 L380 260 L320 250 Z', gdp: 36000, population: 3950, income: 42300 },
  { adcode: '620000', name: '甘肃省', path: 'M220 180 L320 170 L340 250 L280 290 L200 260 Z', gdp: 13000, population: 2490, income: 33000 },
  { adcode: '630000', name: '青海省', path: 'M140 160 L220 150 L250 200 L210 250 L130 220 Z', gdp: 3800, population: 595, income: 36200 },
  { adcode: '640000', name: '宁夏回族自治区', path: 'M280 150 L330 140 L350 180 L320 200 L270 180 Z', gdp: 5500, population: 730, income: 39600 },
  { adcode: '650000', name: '新疆维吾尔自治区', path: 'M40 100 L180 80 L250 170 L200 270 L60 250 Z', gdp: 21000, population: 2590, income: 37100 }
]

const buildMetricSeries = (baseValue, factors, adcode) => {
  const suffix = Number(adcode.slice(-2))
  return YEAR_OPTIONS.reduce((series, year, index) => {
    const bias = 1 + ((suffix % 7) - 3) * 0.004 * index
    const value = Math.round(baseValue * factors[index] * bias)
    series[year] = Math.max(value, 1)
    return series
  }, {})
}

export const PROVINCES = BASE_PROVINCES.map((province) => ({
  adcode: province.adcode,
  name: province.name,
  path: province.path,
  metrics: {
    gdp: buildMetricSeries(province.gdp, YEAR_FACTORS.gdp, province.adcode),
    population: buildMetricSeries(province.population, YEAR_FACTORS.population, province.adcode),
    income: buildMetricSeries(province.income, YEAR_FACTORS.income, province.adcode)
  }
}))

export const buildChinaSvg = () => {
  const paths = PROVINCES.map(
    (province) => `<path name="${province.name}" id="${province.adcode}" d="${province.path}" />`
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">${paths}</svg>`
}
