import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import { parseHeaders } from './helpers/headers'
import { createError } from './helpers/error'
/**
 * 抽离请求逻辑
 * 利用模块化的编程思想，把这个功能拆分到一个单独的模块中
 */
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials
    } = config
    const xhr = new XMLHttpRequest()

    xhr.open(method.toUpperCase(), url!, true)

    Object.keys(headers).forEach(name => {
      /**
       * 如果传递的数据为空
       * 那么Content-Type就没有意义了
       * 其它数据比如Document浏览器会帮我们自动携带
       */
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        /**
         * 设置头部字段
         */
        xhr.setRequestHeader(name, headers[name])
      }
    })

    if (responseType) {
      xhr.responseType = responseType
    }
    if (withCredentials) {
      xhr.withCredentials = withCredentials
    }
    /**
     * 如果有cancelToken
     * 加入这段取消功能
     * 实现异步分离
     * 实质就是利用promise内部实现了发布订阅功能
     * then函数注册了一个回调函数，一旦promise状态变为fulfiled状态就执行then参数里的回调函数
     */
    if (cancelToken) {
      cancelToken.promise.then(reason => {
        /**
         * ❗️如果该请求已被发出，XMLHttpRequest.abort() 方法将终止该请求。当一个请求被终止，它的 readyState 属性将被置为0
         * 执行完abort之后，浏览器和被请求的服务器都会发生什么呢？MDN的解释非常的简单，就是中断已发送的请求。
         * 这个请求指的是http请求，而不是tcp连接，这样就会出现一个问题，基于http请求原理，当一个请求从客户端发出去之后，服务器端收到请求后，一个请求过程就结束了，这时就算是客户端abort这个请求，
         * 服务器端仍会做出完整的响应，只是这个响应客户端(浏览器)不会接收罢了。
         * 所以这个abort是仅给客户端使用的，不能作为供服务器端判断请求是否继续执行的依据。
         */
        xhr.abort()
        reject(reason)
      })
    }
    /**
     * 当 readyState 属性发生变化时，调用的 EventHandler
     * state为4 请求操作已经完成。这意味着数据传输已经彻底完成或失败
     */

    xhr.onreadystatechange = function() {
      /**
       * ❗️如果该请求已被发出，XMLHttpRequest.abort() 方法将终止该请求。当一个请求被终止，它的 readyState 属性将被置为0
       */
      if (xhr.status === 0) {
        return
      }
      if (xhr.readyState !== 4) {
        return
      }
      const response: AxiosResponse = {
        /**
         * 对于JSON字符串 ts-axios内部会尝试转化成对象
         */
        data: responseType && responseType !== 'text' ? xhr.response : xhr.responseText,
        /**
         * 拿到响应response的头部字段
         */
        headers: parseHeaders(xhr.getAllResponseHeaders()),
        status: xhr.status,
        statusText: xhr.statusText,
        request: xhr,
        config
      }
      handleResponse(response)
    }

    /**
     * 错误处理：
     * 一.处理网络异常错误
     * 二.处理超时错误
     * 三.处理非 200 状态码
     */
    if (timeout) {
      xhr.timeout = timeout
    }
    xhr.onerror = function() {
      /**
       * 网络错误没有response
       */
      reject(createError(`NetWork Error`, config, null, xhr))
    }
    xhr.ontimeout = function() {
      reject(createError(`Timeout of ${timeout}`, config, 'ECONNABORTED', xhr))
    }
    function handleResponse(response: AxiosResponse) {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            xhr,
            response
          )
        )
      }
    }

    /**
     * XMLHttpRequest.send(body)
     * 在XHR请求中要发送的数据体. 可以是:
     * 可以为 Document, 在这种情况下，它在发送之前被序列化.（自动处理了）
     * 为 XMLHttpRequestBodyInit, 从 per the Fetch spec （规范中）可以是 Blob, BufferSource, FormData, URLSearchParams, 或者 USVString(JSON字符串包含在这个对象里的，我觉得这个对象序列化) 对象.
     * null
     * 如果body没有指定值，则默认值为 null
     * 注意HTTP请求传输数据 数据是要经过序列化的 记住这点就行
     */

    xhr.send(data)
  })
}
