import { AxiosTransformer } from '..'

/**
 * 其中 transformRequst 允许你在将请求数据发送到服务器之前对其进行修改，
 * 这只适用于请求方法 put、post 和 patch，如果值是数组，❗️因为只有这些方式才会有body数据啊
 * 则数组中的最后一个函数必须返回一个字符串或 FormData、URLSearchParams、Blob 等类型作为 xhr.send 方法的参数，
 * 而且在 transform 过程中可以修改 headers 对象。
 */
export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
) {
  /**
   * 存在transformRequst:[]这种情况
   */
  if (!fns) {
    return data
  }
  if (!Array.isArray(fns)) {
    fns = [fns]
  }
  /**
   * 依次按顺序执行我们的传入的transform函数
   * 这也是职责链的应用啊
   * 最后一步由内部的transformRequest或者transformResponse处理
   */
  fns.forEach(fn => {
    data = fn(data, headers)
  })
  return data
}
