import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  DEFAULT_TASK_ID,
  TASK_ROUTE_PREFIX,
  TASKS,
  TASKS_BY_ID,
  getNextTask,
  getTaskById,
  getTaskIndexById
} from '../constants/tasks'

const normalizeTaskId = (taskId) => (
  TASKS_BY_ID.has(String(taskId)) ? String(taskId) : DEFAULT_TASK_ID
)

const readTaskIdFromUrl = () => {
  const hashMatch = window.location.hash.match(/^#\/task\/([^/?#]+)/)
  if (hashMatch) {
    return normalizeTaskId(decodeURIComponent(hashMatch[1]))
  }

  const params = new URLSearchParams(window.location.search)
  const queryTaskId = params.get('taskId') || params.get('task')
  if (queryTaskId) {
    return normalizeTaskId(queryTaskId)
  }

  const pathIndex = window.location.pathname.indexOf(TASK_ROUTE_PREFIX)
  if (pathIndex >= 0) {
    const pathTaskId = window.location.pathname
      .slice(pathIndex + TASK_ROUTE_PREFIX.length)
      .split('/')[0]
    return normalizeTaskId(decodeURIComponent(pathTaskId))
  }

  return DEFAULT_TASK_ID
}

const getAppRootPath = () => {
  const pathIndex = window.location.pathname.indexOf(TASK_ROUTE_PREFIX)
  if (pathIndex >= 0) {
    return window.location.pathname.slice(0, pathIndex + 1)
  }

  return window.location.pathname
}

const buildTaskUrl = (taskId) => (
  `${getAppRootPath()}#/task/${encodeURIComponent(taskId)}`
)

const isInteractiveTarget = (target) => (
  target?.isContentEditable
  || Boolean(target?.closest?.([
    'input',
    'textarea',
    'select',
    'button',
    '[role="button"]',
    '[role="slider"]',
    '.el-checkbox',
    '.el-radio',
    '.el-slider'
  ].join(',')))
)

export function useTaskRoute({ enableKeyboard = false } = {}) {
  const currentTaskId = ref(readTaskIdFromUrl())
  const currentTask = computed(() => getTaskById(currentTaskId.value))
  const currentTaskIndex = computed(() => getTaskIndexById(currentTaskId.value))
  const currentTaskNumber = computed(() => currentTaskIndex.value + 1)
  const taskCount = TASKS.length
  const currentTaskUrl = computed(() => buildTaskUrl(currentTaskId.value))

  const syncTaskIdFromUrl = () => {
    currentTaskId.value = readTaskIdFromUrl()
  }

  const setTaskId = (taskId, { replace = false } = {}) => {
    const nextTaskId = normalizeTaskId(taskId)
    const nextUrl = buildTaskUrl(nextTaskId)

    currentTaskId.value = nextTaskId
    if (replace) {
      window.history.replaceState({ taskId: nextTaskId }, '', nextUrl)
    } else {
      window.history.pushState({ taskId: nextTaskId }, '', nextUrl)
    }
  }

  const goToNextTask = () => {
    setTaskId(getNextTask(currentTaskId.value).id)
  }

  const handleKeydown = (event) => {
    if (
      event.code !== 'Space'
      || event.altKey
      || event.ctrlKey
      || event.metaKey
      || event.shiftKey
      || isInteractiveTarget(event.target)
    ) {
      return
    }

    event.preventDefault()
    goToNextTask()
  }

  onMounted(() => {
    setTaskId(currentTaskId.value, { replace: true })
    window.addEventListener('popstate', syncTaskIdFromUrl)
    window.addEventListener('hashchange', syncTaskIdFromUrl)
    if (enableKeyboard) {
      window.addEventListener('keydown', handleKeydown)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', syncTaskIdFromUrl)
    window.removeEventListener('hashchange', syncTaskIdFromUrl)
    if (enableKeyboard) {
      window.removeEventListener('keydown', handleKeydown)
    }
  })

  return {
    tasks: TASKS,
    currentTaskId,
    currentTask,
    currentTaskIndex,
    currentTaskNumber,
    taskCount,
    currentTaskUrl,
    setTaskId,
    goToNextTask
  }
}
