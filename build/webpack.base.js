const path = require('path')
const HtmlWebpackPlugin=require('html-webpack-plugin')

module.exports={
    entry:path.join(__dirname,'../src/index.tsx'),
    output:{
        filename:'static/js/[name].js',//每个输出就是的名称
        path:path.join(__dirname,'../dist'),
        clean:true,//wabpack4需要配置clean-wabpack-plugin来删除dist文件，webpack5内置了
        publicPath:''//打包后文件的公共前缀路径
    },
    module:{
        rules:[
            {
                test:/.(ts|tsx)$/,
                use:{
                    loader:'babel-loader',
                    options:{
                    // 预设执行顺序由右往左，所以先处理ts，再处理jsx
                        presets:[
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ]
                    }
                }
            }
        ]
    },
    resolve:{
        extensions:['.js','.tsx','.ts']//因为ts不支持引入以 .ts, tsx为后缀的文件，所以要在extensions中配置，而第三方库里面很多引入js文件没有带后缀，所以也要配置下js
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:path.resolve(__dirname,'../public/index.html'),//模板取定义root节点的模板
            inject:true,//自动注入静态资源
        })
    ]
}