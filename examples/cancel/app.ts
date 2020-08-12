import axios, { Canceler } from '../../src/index'

const CancelToken = axios.CancelToken
const source = CancelToken.source()

/**
 * 只要执行CancelToken.source()就能获取新的一对token/cancel
 */
axios
  .get('/cancel/get', {
    cancelToken: source.token
  })
  .catch(function(e) {
    console.log('e', e)
    if (axios.isCancel(e)) {
      console.log('Request canceled', e.message)
    }
  })

setTimeout(() => {
  source.cancel('Operation canceled by the user.')

  axios.post('/cancel/post', { a: 1 }, { cancelToken: source.token }).catch(function(e) {
    if (axios.isCancel(e)) {
      console.log(e.message)
    }
  })
}, 10)

let cancel: Canceler

axios
  .get('/cancel/get', {
    cancelToken: new CancelToken(c => {
      cancel = c
    })
  })
  .catch(function(e) {
    if (axios.isCancel(e)) {
      console.log('Request canceled')
    }
  })

setTimeout(() => {
  cancel('xxx')
}, 200)

/**
 * 输出：
 * Operation canceled by the user.
 * Request canceled Operation canceled by the user.
 * Request canceled
 * 事件循环来讲
 * 发起一个ajax请求 属于宏任务 完成以后 注入then函数的回调函数 执行是以微任务的方式来执行
 * 按照上面的理解 并不是Promise+ajax===>发起的请求是微任务 而是处理回调是微任务形式处理的
 * ❗️这点得明白
 */
