import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from '../xhr'
import { buildURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/util'
import transform from './transform'

/**
 * 处理config参数
 */
export function processConfig(config: AxiosRequestConfig): void {
  /**
   * 处理url
   */
  config.url = transformUrl(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url!, params)
}

export function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

export function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) config.cancelToken.throwIfRequested()
}

function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  /**
   * 当一个请求携带的 cancelToken 已经被使用过，那么我们甚至都可以不发送这个请求，只需要抛一个异常即可
   */
  throwIfCancellationRequested(config)
  processConfig(config)
  return xhr(config).then(data => transformResponseData(data))
}

export default dispatchRequest
