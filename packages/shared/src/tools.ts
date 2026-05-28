/**
 * 数组路径转访问函数
 * @param arr 路径数组，元素为字符串或数字 - ['page1','user','0']
 * @returns 访问函数，接收上下文对象作为参数
 */
export function arrayToExpression(arr: (string | number)[]): (context: Record<string, unknown>) => unknown {
  if (!Array.isArray(arr) || arr.length === 0) {
    return () => undefined
  }

  const processed: (string | number)[] = arr.map((item) => {
    if (!isNaN(Number(item)) && item !== '') {
      return Number(item)
    }
    return item
  })

  return (context: Record<string, unknown>) => {
    let result: unknown = context
    for (const key of processed) {
      if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[key]
      }
      else {
        return undefined
      }
    }
    return result
  }
}

export interface SearchResult<T = Record<string, unknown>> {
  index: number[]
  object: T[]
}

/**
 * 闭包搜索函数 - 搜索对象并返回索引组和对象组
 * @param obj 目标对象，应包含数组属性
 * @returns 搜索函数，接收键名和搜索条件
 */
export function searchObj<T extends Record<string, unknown[]>>(obj: T) {
  return <K extends keyof T>(k: K, v: Record<string, unknown>): SearchResult<T[K][number]> => {
    const result: SearchResult<T[K][number]> = {
      index: [],
      object: [],
    }

    const arr = obj[k]
    arr.forEach((item, index) => {
      const searchKey = Object.keys(v)[0]
      const searchValue = Object.values(v)[0]

      if ((item as Record<string, unknown>)[searchKey] == searchValue) {
        result.index.push(index)
        result.object.push(item)
      }
    })

    return result
  }
}

export interface Chainable {
  rbq: (val: unknown) => Chainable
  rq: (val: unknown) => Chainable
  br: (val: unknown) => Chainable
}

/**
 * 函数链式调用
 */
export function chainFun(): Chainable {
  const objs: Chainable = {
    rbq(val: unknown) {
      console.log(val)
      return this
    },
    rq(val: unknown) {
      console.log(val)
      return this
    },
    br(val: unknown) {
      console.log(val)
      return this
    },
  }
  return objs
}

export interface ContributionDay {
  date: string
  count: number
  intensity: number
}

export interface ContributionData {
  contributions: ContributionDay[][]
}

/**
 * 处理贡献数据
 */
export function processContributions(apiData: ContributionData): Map<string, ContributionDay> {
  const contributionsMap = new Map<string, ContributionDay>()

  apiData.contributions.forEach(week =>
    week.forEach((day) => {
      contributionsMap.set(day.date, {
        date: day.date,
        count: day.count,
        intensity: Number.parseInt(String(day.intensity)),
      })
    }),
  )

  return contributionsMap
}

/**
 * 根据贡献次数计算颜色强度（0-4）
 */
export function getIntensityLevel(count: number): number {
  if (count === 0)
    return 0
  if (count <= 3)
    return 1
  if (count <= 6)
    return 2
  if (count <= 9)
    return 3
  return 4
}
