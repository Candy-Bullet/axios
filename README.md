# 需要完成以下功能：

- 在浏览器端使用 XMLHttpRequest 对象通讯
- 支持 Promise API
- 支持请求和响应的拦截器
- 支持请求数据和响应数据的转换
- 支持请求的取消
- JSON 数据的自动转换
- 客户端防止 XSRF

```javascript
const axios = require('axios')

// Make a request for a user with a given ID
axios
  .get('/user?ID=12345')
  .then(function(response) {
    // handle success
    console.log(response)
  })
  .catch(function(error) {
    // handle error
    console.log(error)
  })
  .then(function() {
    // always executed
  })

// Optionally the request above could also be done as
axios
  .get('/user', {
    params: {
      ID: 12345
    }
  })
  .then(function(response) {
    console.log(response)
  })
  .catch(function(error) {
    console.log(error)
  })
  .then(function() {
    // always executed
  })

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getUser() {
  try {
    const response = await axios.get('/user?ID=12345')
    console.log(response)
  } catch (error) {
    console.error(error)
  }
}
```
