import { isPlainObject } from './util'

/**
 * 允许传递的头部字段开头小写
 */
export function normalizedHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders(headers: any, data: any): any {
  normalizedHeaderName(headers, 'Content-Type')
  /**
   * 如果是data是个普通对象
   */
  if (isPlainObject(data)) {
    /**
     * 我们做了请求数据的处理，把 data 转换成了 JSON 字符串，但是数据发送到服务端的时候，
     * 服务端并不能正常解析我们发送的数据，
     * 因为我们并没有给请求 header 设置正确的 Content-Type。
     * 允许用户来自定义 我们还要配置一个默认的
     */
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

export function parseHeaders(headers: string): Object {
  const parsed = Object.create(null)
  if (!headers) {
    return parsed
  }
  headers.split('\r\n').forEach(line => {
    let [key, val] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      /**
       * key值为空，进入下次循环
       */
      return
    }
    if (val) {
      val = val.trim()
    }
    parsed[key] = val
  })
  return parsed
}
