import { CancelExecutor, CacelTokenSource, Canceler } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })
    /**
     * 执行executor方法
     * executor(fn)
     * cancel=fn
     * 执行cancel(message)就是执行fn message 取消的提示信息
     * 可以在下一次请求前abort上一个请求
     */
    executor(message => {
      /**
       * 防止重复调用
       */
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }
  /**
   * 注意
   * ❗️产出的token和cancel是一一对应的 成对的
   * 不然就会失效
   * token就是我们的CancelToken实例化对象
   */
  static source(): CacelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
  /**
   * 比如当一个请求携带的 cancelToken 已经被使用过，那么我们甚至都可以不发送这个请求，只需要抛一个异常即可
   * 并且抛异常的信息就是我们取消的原因，所以我们需要给 CancelToken 扩展一个方法。
   */
  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }
}
