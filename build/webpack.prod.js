const {merge} =require('webpack-merge')

const baseConfig = require('./webpack.base.js')

const copyPlugin = require('copy-webpack-plugin')

const path =require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(baseConfig,{
    mode:'production',//生产模式，会开启tree-shaking和压缩代码，以及其他优化
    plugins:[
        new copyPlugin({
            patterns:[
                {
                    from:path.resolve(__dirname,'../public'),//复制public下文件
                    to:path.resolve(__dirname,'../dist'),//复制到dist目录中
                    filter:source =>{
                        return !source.includes('index.html')
                    }//忽略index.html

                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename:'static/css/[name].css'//抽离css的输出目录和名称
        })
    ],
    optimization:{
        minimizer:[
            new CssMinimizerPlugin(),//压缩css
            new TerserPlugin({ //压缩js
                parallel:true,//开启多线程压缩
                terserOptions:{
                    compress:{
                        pure_funcs:["console.log"]//删除console.log
                    }
                }
            })
        ]
    }
})