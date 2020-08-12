const express = require('express')
const bodyParser = require('body-parser')
const webpack = require('webpack')
/**
 * webpack-dev-middleware,作用就是，生成一个与webpack的compiler绑定的中间件，然后在express启动的服务app中调用这个中间件。
 * 这个中间件的作用呢，简单总结为以下三点：通过watch mode，监听资源的变更，然后自动打包（如何实现，见下文详解);快速编译，走内存；返回中间件，支持express的use格式。特别注明：webpack明明可以用watch mode，可以实现一样的效果，但是为什么还需要这个中间件呢？
 * 答案就是，第二点所提到的，采用了内存方式。如果，只依赖webpack的watch mode来监听文件变更，自动打包，每次变更，都将新文件打包到本地，就会很慢。
 */
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')
const app = express()
const compiler = webpack(WebpackConfig)

const router = express.Router()


app.use(webpackHotMiddleware(compiler))

app.use(express.static(__dirname))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



router.get('/simple/get', function (req, res) {
    res.json({
        msg: `hello world`
    })
})

router.get('/base/get', function (req, res) {
    res.json(req.query)
})

router.post('/base/post', function (req, res) {
    console.log(req.body)
    res.json(req.body)
})

router.post('/base/buffer', function (req, res) {
    let msg = []
    req.on('data', (chunk) => {
        if (chunk) {
            msg.push(chunk)
        }
    })
    req.on('end', () => {
        let buf = Buffer.concat(msg)
        res.json(buf.toJSON())
    })
})



router.get('/error/get', function (req, res) {
    if (Math.random() > 0.5) {
        res.json({
            msg: `hello world`
        })
    } else {
        res.status(500)
        res.end()
    }
})

router.get('/error/timeout', function (req, res) {
    setTimeout(() => {
        res.json({
            msg: `hello world`
        })
    }, 3000)
})

function registerExtendRouter() {
    router.get('/extend/get', function (req, res) {
        res.json({
            msg: 'hello world'
        })
    })

    router.options('/extend/options', function (req, res) {
        res.end()
    })

    router.head('/extend/head', function (req, res) {
        res.end()
    })

    router.delete('/extend/delete', function (req, res) {
        res.end()
    })

    router.post('/extend/post', function (req, res) {
        res.json(req.body)
    })

    router.put('/extend/put', function (req, res) {
        res.json(req.body)
    })

    router.patch('/extend/patch', function (req, res) {
        res.json(req.body)
    })

    // 响应数据支持泛型接口
    router.get('/extend/user', function (req, res) {
        res.json({
            code: 0,
            message: 'ok',
            result: {
                name: 'Alice',
                age: 18
            }
        })
    })
}
function registerInterceptorRrouter() {
    router.get('/interceptor/get', function (req, res) {
        res.end('hello ')
    })
}

function registerConfigRouter() {
    router.post('/config/post', function (req, res) {
        console.log("req.body", req.body)
        res.json(req.body)
    })
}
registerExtendRouter()

registerInterceptorRrouter()
registerConfigRouter()

function registerCancelRouter() {
    router.get('/cancel/get', function (req, res) {
        setTimeout(() => {
            res.json('hello')
        }, 1000)
    })

    router.post('/cancel/post', function (req, res) {
        setTimeout(() => {
            res.json(req.body)
        }, 1000)
    })
}


registerCancelRouter()

app.use(router)

app.use(webpackDevMiddleware(compiler, {
    publicPath: '/__build__/',
    logLevel: 'silent',
    stats: {
        colors: true,
        chunks: false
    }
}))


const port = process.env.PORT || 8080
module.exports = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})