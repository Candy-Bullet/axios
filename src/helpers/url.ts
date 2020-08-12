import { isDate, isPlainObject } from './util'

export function encode(val: string): string {
  /**
   * 对于字符 @、:、$、,、、[、]
   * 我们是允许出现在 url 中的，不希望被 encode。
   */
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(url: string, params?: any): string {
  /**
   * 形式如下
   * params:{}
   */
  if (!params) {
    return url
  }
  const parts: string[] = []
  Object.keys(params).forEach(key => {
    let val = params[key]
    /**
     * 对于undefined和null认为无效
     * ''0这种肯定有意义啊
     * 别受隐式类型转换概念的影响 认为false就是无效
     */
    if (val === void 0 || val === null) {
      return
    }
    let values: string[] = []
    if (Array.isArray(val)) {
      values = val
      /**
       * 数组在url展示是a[]=1&a[]=2
       */
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach(val => {
      /**
       * 这种情况是专门处理如果传了一个日期对象
       * 但实际正常情况下前后端是约定字符串
       */
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isPlainObject(val)) {
        /**
         * 只处理第一层的就行 传递过去的值可以是对象 只不过要进行序列化
         * 想想如果拍平的话 那就没有层级关系了
         */
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
    let serializedParams = parts.join('&')
    /**
     * 去掉hash值
     * 判断url有没有?
     */
    if (serializedParams) {
      const markIndex = url.indexOf('#')
      if (markIndex !== -1) {
        /**
         * url#后面不保留
         */
        url = url.slice(0, markIndex)
      }
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  })
  return url
}
