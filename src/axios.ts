import { AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'
/**
 * 不要把代码暴露在全局 用函数封装起来
 */
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config)
  const instance = Axios.prototype.request.bind(context)
  extend(instance, context)
  return instance as AxiosStatic
}

const axios = createInstance(defaults)

/**
 * 目前为止，我们的 axios 都是一个单例，一旦我们修改了 axios 的默认配置，会影响所有的请求。
 * 我们希望提供了一个 axios.create 的静态接口允许我们创建一个新的 axios 实例，
 * 同时允许我们传入新的配置和默认配置合并，并做为新的默认配置。
 */
axios.create = function(config) {
  /**
   * new Axios时候我们传递进去的是defaults作为initConfig
   * create的时候config作为initConfig传递进去 所以我们还得merge下defaults
   * axios.create(xx)==>instance instance.defaults
   */
  return createInstance(mergeConfig(defaults, config))
}

axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

export default axios
