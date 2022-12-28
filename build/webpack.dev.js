const path=require('path')

const {merge} = require('webpack-merge')

const baseConfing = require('./webpack.base.js');

const ReactRefreshWebpackPlugin=require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = merge(baseConfing,{
    mode:'development',//开发模式，打包更加快速，省了代码优化步骤
    devtool:'eval-cheap-module-source-map',//源码调试模式
    devServer:{
        port:3000,
        compress:false,//gzip压缩，开发环境不开启，提升热更新速度
        // 在webpack4中,还需要在插件中添加了HotModuleReplacementPlugin,在webpack5中,只要devServer.hot为true了,该插件就已经内置了
        hot:true,//开启热更新，
        historyApiFallback:true,//解读history路由404问题
        static:{
            directory:path.join(__dirname,"../public"),//托管静态资源public文件夹
        }
    },
    plugins:[
        new ReactRefreshWebpackPlugin(),//添加热更新插件
    ]
})