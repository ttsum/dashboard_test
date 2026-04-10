import * as echarts from 'echarts/core'
import { LineChart, LinesChart, MapChart, ScatterChart } from 'echarts/charts'
import {
  GeoComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  MapChart,
  LineChart,
  LinesChart,
  ScatterChart,
  GeoComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer
])

export { echarts }
