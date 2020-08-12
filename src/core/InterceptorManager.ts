import { ResolvedFn, RejectedFn } from '../types'

export interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

/**
 * 用到发布订阅设计模式
 * 拦截器管理类
 */
export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>
  constructor() {
    this.interceptors = []
  }
  /**
   * 注册-订阅
   */
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1
  }
  /**
   * 发布
   * 不过这里的发布不会执行订阅的回调
   * 而是把订阅的回调拿出来交给别人
   */
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor) {
        fn(interceptor)
      }
    })
  }
  /**
   * 注销
   */
  eject(id: number) {
    /**
     * 不要直接删除 会影响拦截器顺序
     */
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
