import axios, { AxiosTransformer } from '../../src/index'
import qs from 'qs'

// console.log(
//   qs.stringify({
//     name: 'vnues',
//     age: 24,
//     height: '&?%?$@/'
//   })
// )
// axios({
//   url: '/config/post',
//   method: 'post',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded'
//   },
//   data: "name='vnues'&age= 24"
// }).then(res => {
//   console.log(res.data)
// })

// axios({
//   transformRequest: [
//     function(data) {
//       console.log('经过transformRequest处理')
//       return qs.stringify(data)
//     }
//   ],
//   transformResponse: [
//     ...(axios.defaults.transformResponse as AxiosTransformer[]),
//     function(data) {
//       if (typeof data === 'object') {
//         console.log('经过transformResponse处理')
//         data.b = 2
//       }
//       return data
//     }
//   ],
//   url: '/config/post',
//   method: 'post',
//   data: {
//     a: 1
//   }
// }).then(res => {
//   console.log(res.data)
// })

const instance = axios.create({
  transformRequest: [
    function(data) {
      return qs.stringify(data)
    }
  ],
  transformResponse: [
    function(data) {
      if (typeof data === 'object') {
        data.b = 2
      }
      return data
    }
  ]
})

instance({
  url: '/config/post',
  method: 'post',
  data: {
    a: 1
  }
}).then(res => {
  console.log(res.data)
})
