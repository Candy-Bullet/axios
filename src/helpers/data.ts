import { isPlainObject } from './util'

export function transformRequest(data: any): any {
  /**
   * 我们发现 send 方法的参数支持 Document 和 BodyInit 类型，
   * BodyInit 包括了 Blob, BufferSource, FormData, URLSearchParams,
   * ReadableStream、USVString，当没有数据的时候，我们还可以传入 null。
   */
  /**
   * config data 可能是这种形式:
   * {} []
   */
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  /**
   * 数组好像直接传递就行
   */
  return data
}

export function transformResponse(data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      // todo
    }
  }
  return data
}
