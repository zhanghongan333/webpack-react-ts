const path = require('path')
const HtmlWebpackPlugin=require('html-webpack-plugin')
const { webpack,DefinePlugin  } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDev = process.env.NODE_ENV ==='development'//是否是开发模式

module.exports={
    entry:path.join(__dirname,'../src/index.tsx'),
    output:{
        filename:'static/js/[name].js',//每个输出就是的名称
        path:path.join(__dirname,'../dist'),
        clean:true,//wabpack4需要配置clean-wabpack-plugin来删除dist文件，webpack5内置了
        publicPath:''//打包后文件的公共前缀路径
    },
    cache:{
        type:'filesystem'//使用文件缓存
    },
    module:{
        rules:[
            {
                include:[path.resolve(__dirname,'../src')],//只对项目src文件的ts,tsx进行loader解析
                test:/.(ts|tsx)$/,
                use:['thread-loader','babel-loader']
                // ,
                // 如果node_moduels中也有要处理的语法，可以把js|jsx文件配置上
                // {
                //     test:/.(js|jsx)$/,
                //     use:'bable-loader'
                // }
            },
            {
                test:/.(css|less|scss)$/,
                use:[
                    isDev?'style-loader':MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    // {
                    //     loader:'postcss-loader',
                    //     options:{
                    //         postcssOptions:{
                    //             plugins:['autoprefixer']
                    //         }
                    //     }
                    // },
                    'less-loader',
                    'sass-loader'
                ]
            },
            {
                test:/.(png|jpg|gif|svg)$/,//匹配图片文件
                // webpack4使用file-loader和url-loader来处理的,但webpack5不使用这两个loader了,而是采用自带的asset-module来处理
                type:'asset',//type选择asset
                parser:{
                    dataUrlCondition:{
                        maxSize:10*1024,//小于10kb转base64位
                    }
                },
                generator:{
                    filename:"static/images/[name][ext]"//文件输出目录和命名
                },

            },
            {
                test:/.(woff2?|eot|ttf|otf)$/,//匹配字体图标文件
                type:"asset",//type选择asset
                parser:{
                    dataURLCondition:{
                        maxSize:10*1024,//小于10kb转base64位
                    }
                },
                generator:{
                    filename:'static/fonts/[name][ext]',//文件输出目录和命名
                }
            },
            {
                test:/.(mp4|webm|ogg|mp3|wav|flac|aac)$/,//匹配媒体文件
                type:"asset",//type选择asset
                parser:{
                    dataUrlCondition:{
                        maxSize:10*1024//小于10kb转base64位
                    }
                },
                generator:{
                    filename:'static/media/[name][ext]'//文件输出目录和命名
                }
            },
            // {
            //     test:/.(ts|tsx)$/,
            //     use:['thread-loader','babel-loader']
            // }
        ]
    },
    resolve:{
        extensions:['.js','.tsx','.ts'],//因为ts不支持引入以 .ts, tsx为后缀的文件，所以要在extensions中配置，而第三方库里面很多引入js文件没有带后缀，所以也要配置下js
        alias:{
            '@':path.join(__dirname,'../src')
        },
        modules:[path.resolve(__dirname,'../node_modules')],//查看第三方模块只在本项目的node——modules中查找
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:path.resolve(__dirname,'../public/index.html'),//模板取定义root节点的模板
            inject:true,//自动注入静态资源
        }),
        new DefinePlugin({
            'process.env.BASE_ENV':JSON.stringify(process.env.BASE_ENV),  
        })
    ]
}
console.log('webpack_BASE_ENV',process.env.BASE_ENV)
console.log('webpack_NODE_ENV',process.env.NODE_ENV)