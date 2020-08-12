import { Method } from '..'

const toString = Object.prototype.toString

/**
 * 这里可以注意到我们不得不多次使用类型断言。如果我们一旦检查过类型（用于检测类型的方法）
 * 就能在之后的每个分支里清楚地知道 pet 的类型的话就好了
 */
export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

export function isObject(val: any): val is Object {
  /**
   * typeof FormData类型也是Object 很正常啊 typeof判断引用类型都是归为Object
   */
  return val !== null && typeof val === 'object'
}

export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

export function extend<T, U>(to: T, from: U): T & U {
  for (let key in from) {
    ;(to as any)[key] = from[key]
  }
  return to as T & U
}

export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge(val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })

  return result
}

/**
 * 我们可以通过 deepMerge 的方式把 common、post 的属性拷贝到 headers 这一级，
 * 然后再把 common、post 这些属性删掉。
 */
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  /**
   * headers.common || {}, headers[method] || {}, headers
   * 从左到右 权重越来越大 headers是用户传递过来的
   * headers[method]的权重比headers.common大
   */
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  methodsToDelete.forEach(method => {
    delete headers[method]
  })
  return headers
}
