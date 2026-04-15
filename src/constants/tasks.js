export const TASKS = [
  {
    id: '1',
    content: '找到2020年长沙市芙蓉区的GDP数量',
    view: {
      measureKey: 'gdp',
      mapYear: 2020,
      selectedCounties: ['芙蓉区'],
      yearRange: [2020, 2020]
    }
  },
  {
    id: '2',
    content: '比较长沙市芙蓉区和岳阳市岳阳楼区哪个GDP高',
    view: {
      measureKey: 'gdp',
      mapYear: 2023,
      selectedCounties: ['芙蓉区', '岳阳楼区'],
      yearRange: [2015, 2023]
    }
  }
]

export const DEFAULT_TASK_ID = TASKS[0].id
export const TASK_ROUTE_PREFIX = '/task/'
export const TASKS_BY_ID = new Map(TASKS.map((task) => [task.id, task]))

export const getTaskById = (taskId) => TASKS_BY_ID.get(String(taskId)) || TASKS[0]

export const getTaskIndexById = (taskId) => {
  const index = TASKS.findIndex((task) => task.id === String(taskId))
  return index >= 0 ? index : 0
}

export const getNextTask = (taskId) => {
  const currentIndex = getTaskIndexById(taskId)
  return TASKS[(currentIndex + 1) % TASKS.length]
}
