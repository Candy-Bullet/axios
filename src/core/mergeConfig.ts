import { AxiosRequestConfig } from '../types'
import { isPlainObject, deepMerge } from '../helpers/util'

/**
 * 策略模式
 * {
 *  url:()=>void
 * }
 */
const strats = Object.create(null)

/**
 * 默认合并策略
 * 这是大部分属性的合并策略，如下：
 */
function defaultStrat<T = any, U = any>(val1: T, val2: U): T | U {
  return typeof val2 !== 'undefined' ? val2 : val1
}

/**
 * 只接受自定义配置合并策略:
 * 对于一些属性如 url、params、data，合并策略如下
 */
function fromVal2Strat<T = any, U = any>(val1: T, val2: U): U | undefined {
  if (typeof val2 !== 'undefined') return val2
}

/**
 * 复杂对象合并策略:
 * 对于一些属性如 headers，合并策略如下：
 */
function deepMergeStrat<T = any, U = any>(val1: T, val2: U): T | U | undefined {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 === 'undefined') {
    return val1
  }
}

const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

const stratKeysFromDeepMerge = ['headers']
stratKeysFromDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

/**
 * config1 代表默认配置
 * config2 代表自定义配置
 * 相同key下 config2权重比较大
 */
export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }

  const config = Object.create(null)

  for (const key in config2) {
    mergeField(key)
  }

  for (const key in config1) {
    /**
     * 如果config2[key]不存在才继续进行
     */
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }

  return config
}
