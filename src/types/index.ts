import InterceptorManager from '../core/InterceptorManager'
import Cancel from '../cancel/Cancel'

export type Method =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'
  | 'options'
  | 'OPTIONS'
  | 'patch'
  | 'PATCH'
  | 'head'
  | 'HEAD'

export interface AxiosRequestConfig {
  url?: string
  method?: Method
  params?: any
  data?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType
  timeout?: number
  [propName: string]: any
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  cancelToken?: CancelToken
  withCredentials?: boolean
}

/**
 * CancelToken 是实例类型的接口定义
 */
export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  throwIfRequested: () => void
}

/**
 * Canceler 是取消方法的接口定义
 */
export interface Canceler {
  (message?: string): void
}
/**
 * CancelExecutor
 */

export interface CancelExecutor {
  (cancel: Canceler): void
}
/**
 * CancelTokenSource 作为 CancelToken 类静态方法 source 函数的返回值类型
 */

export interface CacelTokenSource {
  token: CancelToken
  cancel: Canceler
}

/**
 * CancelTokenStatic 则作为 CancelToken 类的类类型
 * ❗️如何为一个类写接口
 * ❗️如果类作为接口也只是适用于类的实例
 */
export interface CancelTokenStatic {
  new (executor: CancelExecutor): CancelToken
  source(): CacelTokenSource
}

export interface CancelStatic {
  new (message?: string): Cancel // Cancel可以认为是类的实例接口，返回一个Cancel实例化类
}

/**
 * 约定最后把处理的data返回 才能给Promise resolve
 */
export interface AxiosTransformer {
  (data: any, headers?: any): any
}

export interface AxiosResponse<T = any> {
  /**
   * 响应数据支持泛型
   * 我们可以通过外部的接口给后端返回的data定义类型
   * 这个我们平时的axios写法倒是没注意
   * 以前是有意识到能不能给返回的data定义接口 原来axios已经支持的
   */
  data: T
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: XMLHttpRequest
}
/**
 * Promise<AxiosResponse>
 * 表示reslove函数接收的参数类型是AxiosResponse
 */
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

/**
 * 错误信息增强：
 * 我们希望对外提供的信息不仅仅包含错误文本信息，还包括了请求对象配置 config，
 * 错误代码 code，XMLHttpRequest 对象实例 request以及自定义响应对象 response
 * 为实例化对象声明接口
 */

export interface AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string | null
  request?: XMLHttpRequest
  response?: AxiosResponse
  isAxiosError: boolean
}

/**
 * 定义Axios实例化对象接口
 */

export interface Axios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  /**
   * 传入实参 调用这个泛型之前先看看有没创建或者支持
   */
  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T> // 这是实参
  get<T = any>(url: String, config?: AxiosRequestConfig): AxiosPromise<T>
  delete<T = any>(url: String, config?: AxiosRequestConfig): AxiosPromise<T>
  head<T = any>(url: String, config?: AxiosRequestConfig): AxiosPromise<T>
  options<T = any>(url: String, config?: AxiosRequestConfig): AxiosPromise<T>
  post<T = any>(url: String, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
  put<T = any>(url: String, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
  patch<T = any>(url: String, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

/**
 * 我们声明一个拦截器实例化接口
 * 这里为什么要用泛型 因为使用了resolvedFn接口
 */

export interface AxiosInterceptorManager<T = any> {
  /**
   * 注册拦截器
   */
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number
  /**
   * 删除拦截器
   */
  eject(id: number): void
}

/**
 * 这里我们定义了 AxiosInterceptorManager 泛型接口，因为对于 resolve 函数的参数，请求拦截器和响应拦截器是不同的。
 * 并且我们要把值传递给下一个拦截器 所以有输出类型的功能 就是要使用到泛型了
 */
/**
 * 定义传入的use回调函数
 * 回调函数的签名要有返回值
 */
export interface ResolvedFn<T = any> {
  (val: T): T | Promise<T>
}

/**
 * 处理响应错误
 */
export interface RejectedFn {
  (err: any): any
}

export interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

export interface AxiosStatic extends AxiosInstance {
  /**
   * @param config:请求配置
   */
  create(config?: AxiosRequestConfig): AxiosInstance
  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  isCancel: (val: any) => boolean
}
