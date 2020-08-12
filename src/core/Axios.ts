import { AxiosPromise, AxiosRequestConfig } from '..'
import dispatchRequest from './dispatchRequest'
import { Method, AxiosResponse, RejectedFn, ResolvedFn, Interceptors } from '../types'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'

export interface PromiseChain {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}
/**
 * 类大写 文件命名
 */

export default class Axios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  /**
   * 支持函数重载
   */
  request(url: string | AxiosRequestConfig, config?: AxiosRequestConfig): AxiosPromise {
    /**
     * 支持重载
     */
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    /**
     * 每次执行请求都会merge一下配置
     * 用户还可以通过axios.defaults（Axios的实例化对象即可）进行配置
     */
    config = mergeConfig(this.defaults, config)
    /**
     * 运用职责链设计模式
     * 整个过程是一个链式调用的方式，并且每个拦截器都可以支持同步和异步处理(异步用个新的Promise处理)，我们自然而然地就联想到使用 Promise 链的方式来实现整个调用过程。
     * request2 interceptor --> request1 interceptor-->dispatchRequest--> response1 interceptor--> response2 interceptor
     */
    const chain: PromiseChain[] = [
      {
        resolved: dispatchRequest,
        rejected: void 0
      }
    ]
    /**
     * 发布forEach事件
     * 发布将订阅的回调交出的事件
     */
    this.interceptors.request.forEach(interceptor => {
      /**
       * 往前添加
       */
      chain.unshift(interceptor)
    })
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })
    let promise = Promise.resolve(config)
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }
    return promise as AxiosPromise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }
  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }
  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }
  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }
  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }
  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  private _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }
  private _requestMethodWithData(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
