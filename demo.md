稀土掘金
首页
探索稀土掘金
搜索
登录
【前端工程化】webpack5从零搭建完整的react18+ts开发和打包环境

Ausra无忧
lv-3

2022年06月22日 12:51 ·  阅读 7662

关注
【前端工程化】webpack5从零搭建完整的react18+ts开发和打包环境
目录
前言
初始化项目
配置基础版react+ts环境
常用功能配置
配置react模块热替换
优化构建速度
优化构建结果文件
总结
全文概览

webpack5+react+ts1.png

一. 前言
从2020年10月10日，webpack 升级至 5 版本到现在已经快两年，webpack5版本优化了很多原有的功能比如tree-shaking优化，也新增了很多新特性，比如联邦模块，具体变动可以看这篇文章阔别两年，webpack 5 正式发布了！。

本文将使用最新的webpack5一步一步从零搭建一个完整的react18+ts开发和打包环境，配置完善的模块热替换以及构建速度和构建结果的优化，完整代码已上传到webpack5-react-ts。本文只是配置webpack的，配置代码规范相关的可以看这篇文章搭建react18+vite2+ts+prettier+eslint+lint-staged+husky+stylelint开发环境

二. 初始化项目
在开始webpack配置之前，先手动初始化一个基本的react+ts项目，新建项目文件夹webpack5-react-18, 在项目下执行

npm init -y
复制代码
初始化好package.json后,在项目下新增以下所示目录结构和文件

├── build
|   ├── webpack.base.js # 公共配置
|   ├── webpack.dev.js  # 开发环境配置
|   └── webpack.prod.js # 打包环境配置
├── public
│   └── index.html # html模板
├── src
|   ├── App.tsx 
│   └── index.tsx # react应用入口页面
├── tsconfig.json  # ts配置
└── package.json
复制代码
安装webpack依赖

npm i webpack webpack-cli -D
复制代码
安装react依赖

npm i react react-dom -S
复制代码
安装react类型依赖

npm i @types/react @types/react-dom -D
复制代码
添加public/index.html内容

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webpack5-react-ts</title>
</head>
<body>
  <!-- 容器节点 -->
  <div id="root"></div>
</body>
</html>
复制代码
添加tsconfig.json内容

{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react", // react18这里也可以改成react-jsx
  },
  "include": ["./src"]
}
复制代码
添加src/App.tsx内容

import React from 'react'

function App() {
  return <h2>webpack5-react-ts</h2>
}
export default App
复制代码
添加src/index.tsx内容

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if(root) {
  createRoot(root).render(<App />)
}
复制代码
现在项目业务代码已经添加好了,接下来可以配置webpack的代码了。

三. 配置基础版React+ts环境
2.1. webpack公共配置
修改webpack.base.js

1. 配置入口文件

// webpack.base.js
const path = require('path')

module.exports = {
  entry: path.join(__dirname, '../src/index.tsx'), // 入口文件
}
复制代码
2. 配置出口文件

// webpack.base.js
const path = require('path')

module.exports = {
  // ...
  // 打包文件出口
  output: {
    filename: 'static/js/[name].js', // 每个输出js的名称
    path: path.join(__dirname, '../dist'), // 打包结果输出路径
    clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
    publicPath: '/' // 打包后文件的公共前缀路径
  },
}
复制代码
3. 配置loader解析ts和jsx

由于webpack默认只能识别js文件,不能识别jsx语法,需要配置loader的预设预设 @babel/preset-typescript 来先ts语法转换为 js 语法,再借助预设 @babel/preset-react 来识别jsx语法。

安装babel核心模块和babel预设

npm i babel-loader @babel/core @babel/preset-react @babel/preset-typescript -D
复制代码
在webpack.base.js添加module.rules配置

// webpack.base.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/, // 匹配.ts, tsx文件
        use: {
          loader: 'babel-loader',
          options: {
            // 预设执行顺序由右往左,所以先处理ts,再处理jsx
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  }
}
复制代码
4. 配置extensions

extensions是webpack的resolve解析配置下的选项，在引入模块时不带文件后缀时，会来该配置数组里面依次添加后缀查找文件，因为ts不支持引入以 .ts, tsx为后缀的文件，所以要在extensions中配置，而第三方库里面很多引入js文件没有带后缀，所以也要配置下js

修改webpack.base.js，注意把高频出现的文件后缀放在前面

// webpack.base.js
module.exports = {
  // ...
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
  }
}
复制代码
这里只配置js, tsx和ts，其他文件引入都要求带后缀，可以提升构建速度。

4. 添加html-webpack-plugin插件

webpack需要把最终构建好的静态资源都引入到一个html文件中,这样才能在浏览器中运行,html-webpack-plugin就是来做这件事情的,安装依赖：

npm i html-webpack-plugin -D
复制代码
因为该插件在开发和构建打包模式都会用到,所以还是放在公共配置webpack.base.js里面

// webpack.base.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'), // 模板取定义root节点的模板
      inject: true, // 自动注入静态资源
    })
  ]
}
复制代码
到这里一个最基础的react基本公共配置就已经配置好了,需要在此基础上分别配置开发环境和打包环境了。

2.2. webpack开发环境配置
1. 安装 webpack-dev-server

开发环境配置代码在webpack.dev.js中,需要借助 webpack-dev-server在开发环境启动服务器来辅助开发,还需要依赖webpack-merge来合并基本配置,安装依赖:

npm i webpack-dev-server webpack-merge -D
复制代码
修改webpack.dev.js代码, 合并公共配置，并添加开发模式配置

// webpack.dev.js
const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.js')

// 合并公共配置,并添加开发环境配置
module.exports = merge(baseConfig, {
  mode: 'development', // 开发模式,打包更加快速,省了代码优化步骤
  devtool: 'eval-cheap-module-source-map', // 源码调试模式,后面会讲
  devServer: {
    port: 3000, // 服务端口号
    compress: false, // gzip压缩,开发环境不开启,提升热更新速度
    hot: true, // 开启热更新，后面会讲react模块热替换具体配置
    historyApiFallback: true, // 解决history路由404问题
    static: {
      directory: path.join(__dirname, "../public"), //托管静态资源public文件夹
    }
  }
})
复制代码
2. package.json添加dev脚本

在package.json的scripts中添加

// package.json
"scripts": {
  "dev": "webpack-dev-server -c build/webpack.dev.js"
},
复制代码
执行npm run dev,就能看到项目已经启动起来了,访问http://localhost:3000/,就可以看到项目界面,具体完善的react模块热替换在下面会讲到。

2.3. webpack打包环境配置
1. 修改webpack.prod.js代码

// webpack.prod.js

const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.js')
module.exports = merge(baseConfig, {
  mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
})
复制代码
2. package.json添加build打包命令脚本

在package.json的scripts中添加build打包命令

"scripts": {
    "dev": "webpack-dev-server -c build/webpack.dev.js",
    "build": "webpack -c build/webpack.prod.js"
},
复制代码
执行npm run build,最终打包在dist文件中, 打包结果:

dist                    
├── static
|   ├── js
|     ├── main.js
├── index.html
复制代码
3. 浏览器查看打包结果

打包后的dist文件可以在本地借助node服务器serve打开,全局安装serve

npm i serve -g
复制代码
然后在项目根目录命令行执行serve -s dist,就可以启动打包后的项目了。

到现在一个基础的支持react和ts的webpack5就配置好了,但只有这些功能是远远不够的,还需要继续添加其他配置。

四. 基础功能配置
4.1 配置环境变量
环境变量按作用来分分两种

区分是开发模式还是打包构建模式
区分项目业务环境,开发/测试/预测/正式环境
区分开发模式还是打包构建模式可以用process.env.NODE_ENV,因为很多第三方包里面判断都是采用的这个环境变量。

区分项目接口环境可以自定义一个环境变量process.env.BASE_ENV,设置环境变量可以借助cross-env和webpack.DefinePlugin来设置。

cross-env：兼容各系统的设置环境变量的包
webpack.DefinePlugin：webpack内置的插件,可以为业务代码注入环境变量
安装cross-env

npm i cross-env -D
复制代码
修改package.json的scripts脚本字段,删除原先的dev和build,改为

"scripts": {
    "dev:dev": "cross-env NODE_ENV=development BASE_ENV=development webpack-dev-server -c build/webpack.dev.js",
    "dev:test": "cross-env NODE_ENV=development BASE_ENV=test webpack-dev-server -c build/webpack.dev.js",
    "dev:pre": "cross-env NODE_ENV=development BASE_ENV=pre webpack-dev-server -c build/webpack.dev.js",
    "dev:prod": "cross-env NODE_ENV=development BASE_ENV=production webpack-dev-server -c build/webpack.dev.js",
    
    "build:dev": "cross-env NODE_ENV=production BASE_ENV=development webpack -c build/webpack.prod.js",
    "build:test": "cross-env NODE_ENV=production BASE_ENV=test webpack -c build/webpack.prod.js",
    "build:pre": "cross-env NODE_ENV=production BASE_ENV=pre webpack -c build/webpack.prod.js",
    "build:prod": "cross-env NODE_ENV=production BASE_ENV=production webpack -c build/webpack.prod.js",
  },
复制代码
dev开头是开发模式,build开头是打包模式,冒号后面对应的dev/test/pre/prod是对应的业务环境的开发/测试/预测/正式环境。

process.env.NODE_ENV环境变量webpack会自动根据设置的mode字段来给业务代码注入对应的development和prodction,这里在命令中再次设置环境变量NODE_ENV是为了在webpack和babel的配置文件中访问到。

在webpack.base.js中打印一下设置的环境变量

// webpack.base.js
// ...
console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)
复制代码
执行npm run build:dev,可以看到打印的信息

// NODE_ENV production
// BASE_ENV development
复制代码
当前是打包模式,业务环境是开发环境,这里需要把process.env.BASE_ENV注入到业务代码里面,就可以通过该环境变量设置对应环境的接口地址和其他数据,要借助webpack.DefinePlugin插件。

修改webpack.base.js

// webpack.base.js
// ...
const webpack = require('webpack')
module.export = {
  // ...
  plugins: [
    // ...
    new webpack.DefinePlugin({
      'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV)
    })
  ]
}
复制代码
配置后会把值注入到业务代码里面去,webpack解析代码匹配到process.env.BASE_ENV,就会设置到对应的值。测试一下，在src/index.tsx打印一下两个环境变量

// src/index.tsx
// ...
console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)
复制代码
执行npm run dev:test,可以在浏览器控制台看到打印的信息

// NODE_ENV development
// BASE_ENV test
复制代码
当前是开发模式,业务环境是测试环境。

4.2 处理css和less文件
在src下新增app.css

h2 {
    color: red;
    transform: translateY(100px);
}
复制代码
在src/App.tsx中引入app.css

import React from 'react'
import './app.css'

function App() {
  return <h2>webpack5-rea11ct-ts</h2>
}
export default App
复制代码
执行打包命令npm run build:dev,会发现有报错, 因为webpack默认只认识js,是不识别css文件的,需要使用loader来解析css, 安装依赖

npm i style-loader css-loader -D
复制代码
style-loader: 把解析后的css代码从js中抽离,放到头部的style标签中(在运行时做的)
css-loader: 解析css文件代码
因为解析css的配置开发和打包环境都会用到,所以加在公共配置webpack.base.js中

// webpack.base.js
// ...
module.exports = {
  // ...
  module: { 
    rules: [
      // ...
      {
        test: /.css$/, //匹配 css 文件
        use: ['style-loader','css-loader']
      }
    ]
  },
  // ...
}
复制代码
上面提到过,loader执行顺序是从右往左,从下往上的,匹配到css文件后先用css-loader解析css, 最后借助style-loader把css插入到头部style标签中。

配置完成后再npm run build:dev打包,借助serve -s dist启动后在浏览器查看,可以看到样式生效了。

微信截图_20220608102524.png

4.3 支持less或scss
项目开发中,为了更好的提升开发体验,一般会使用css超集less或者scss,对于这些超集也需要对应的loader来识别解析。以less为例,需要安装依赖:

npm i less-loader less -D
复制代码
less-loader: 解析less文件代码,把less编译为css
less: less核心
实现支持less也很简单,只需要在rules中添加less文件解析,遇到less文件,使用less-loader解析为css,再进行css解析流程,修改webpack.base.js：

// webpack.base.js
module.exports = {
  // ...
  module: {
    // ...
    rules: [
      // ...
      {
        test: /.(css|less)$/, //匹配 css和less 文件
        use: ['style-loader','css-loader', 'less-loader']
      }
    ]
  },
  // ...
}
复制代码
测试一下,新增src/app.less

#root {
  h2 {
    font-size: 20px;
  }
}
复制代码
在App.tsx中引入app.less,执行npm run build:dev打包,借助serve -s dist启动项目,可以看到less文件编写的样式编译css后也插入到style标签了了。

微信截图_20220608102536.png

4.4 处理css3前缀兼容
虽然css3现在浏览器支持率已经很高了, 但有时候需要兼容一些低版本浏览器,需要给css3加前缀,可以借助插件来自动加前缀, postcss-loader就是来给css3加浏览器前缀的,安装依赖：

npm i postcss-loader autoprefixer -D
复制代码
postcss-loader：处理css时自动加前缀
autoprefixer：决定添加哪些浏览器前缀到css中
修改webpack.base.js, 在解析css和less的规则中添加配置

module.exports = {
  // ...
  module: { 
    rules: [
      // ...
      {
        test: /.(css|less)$/, //匹配 css和less 文件
        use: [
          'style-loader',
          'css-loader',
          // 新增
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer']
              }
            }
          },
          'less-loader'
        ]
      }
    ]
  },
  // ...
}
复制代码
配置完成后,需要有一份要兼容浏览器的清单,让postcss-loader知道要加哪些浏览器的前缀,在根目录创建 .browserslistrc文件

IE 9 # 兼容IE 9
chrome 35 # 兼容chrome 35
复制代码
以兼容到ie9和chrome35版本为例,配置好后,执行npm run build:dev打包,可以看到打包后的css文件已经加上了ie和谷歌内核的前缀

微信截图_20220608102538.png

上面可以看到解析css和less有很多重复配置,可以进行提取postcss-loader配置优化一下

postcss.config.js是postcss-loader的配置文件,会自动读取配置,根目录新建postcss.config.js：

module.exports = {
  plugins: ['autoprefixer']
}
复制代码
修改webpack.base.js, 取消postcss-loader的options配置

// webpack.base.js
// ...
module.exports = {
  // ...
  module: { 
    rules: [
      // ...
      {
        test: /.(css|less)$/, //匹配 css和less 文件
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
    ]
  },
  // ...
}
复制代码
提取postcss-loader配置后,再次打包,可以看到依然可以解析css, less文件, css3对应前缀依然存在。

4.5 babel预设处理js兼容
现在js不断新增很多方便好用的标准语法来方便开发,甚至还有非标准语法比如装饰器,都极大的提升了代码可读性和开发效率。但前者标准语法很多低版本浏览器不支持,后者非标准语法所有的浏览器都不支持。需要把最新的标准语法转换为低版本语法,把非标准语法转换为标准语法才能让浏览器识别解析,而babel就是来做这件事的,这里只讲配置,更详细的可以看Babel 那些事儿。

安装依赖

npm i babel-loader @babel/core @babel/preset-env core-js -D
复制代码
babel-loader: 使用 babel 加载最新js代码并将其转换为 ES5（上面已经安装过）
@babel/corer: babel 编译的核心包
@babel/preset-env: babel 编译的预设,可以转换目前最新的js标准语法
core-js: 使用低版本js语法模拟高版本的库,也就是垫片
修改webpack.base.js

// webpack.base.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            // 执行顺序由右往左,所以先处理ts,再处理jsx,最后再试一下babel转换为低版本语法
            presets: [
              [
                "@babel/preset-env",
                {
                  // 设置兼容目标浏览器版本,这里可以不写,babel-loader会自动寻找上面配置好的文件.browserslistrc
                  // "targets": {
                  //  "chrome": 35,
                  //  "ie": 9
                  // },
                   "useBuiltIns": "usage", // 根据配置的浏览器兼容,以及代码中使用到的api进行引入polyfill按需添加
                   "corejs": 3, // 配置使用core-js低版本
                  }
                ],
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  }
}
复制代码
此时再打包就会把语法转换为对应浏览器兼容的语法了。

为了避免webpack配置文件过于庞大,可以把babel-loader的配置抽离出来, 新建babel.config.js文件,使用js作为配置文件,是因为可以访问到process.env.NODE_ENV环境变量来区分是开发还是打包模式。

// babel.config.js
module.exports = {
  // 执行顺序由右往左,所以先处理ts,再处理jsx,最后再试一下babel转换为低版本语法
  "presets": [
    [
      "@babel/preset-env",
      {
        // 设置兼容目标浏览器版本,这里可以不写,babel-loader会自动寻找上面配置好的文件.browserslistrc
        // "targets": {
        //  "chrome": 35,
        //  "ie": 9
        // },
        "useBuiltIns": "usage", // 根据配置的浏览器兼容,以及代码中使用到的api进行引入polyfill按需添加
        "corejs": 3 // 配置使用core-js使用的版本
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
}
复制代码
移除webpack.base.js中babel-loader的options配置

// webpack.base.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        use: 'babel-loader'
      },
      // 如果node_moduels中也有要处理的语法，可以把js|jsx文件配置加上
      // {
      //  test: /.(js|jsx)$/,
      //  use: 'babel-loader'
      // }
      // ...
    ]
  }
}
复制代码
4.6 babel处理js非标准语法
现在react主流开发都是函数组件和react-hooks,但有时也会用类组件,可以用装饰器简化代码。

新增src/components/Class.tsx组件, 在App.tsx中引入该组件使用

import React, { PureComponent } from "react";

// 装饰器为,组件添加age属性
function addAge(Target: Function) {
  Target.prototype.age = 111
}
// 使用装饰圈
@addAge
class Class extends PureComponent {

  age?: number

  render() {
    return (
      <h2>我是类组件---{this.age}</h2>
    )
  }
}

export default Class
复制代码
需要开启一下ts装饰器支持,修改tsconfig.json文件

// tsconfig.json
{
  "compilerOptions": {
    // ...
    // 开启装饰器使用
    "experimentalDecorators": true
  }
}
复制代码
上面Class组件代码中使用了装饰器,目前js标准语法是不支持的,现在运行或者打包会报错,不识别装饰器语法,需要借助babel-loader插件,安装依赖

npm i @babel/plugin-proposal-decorators -D
复制代码
在babel.config.js中添加插件

module.exports = { 
  // ...
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
复制代码
现在项目就支持装饰器了。

4.7 复制public文件夹
一般public文件夹都会放一些静态资源,可以直接根据绝对路径引入,比如图片,css,js文件等,不需要webpack进行解析,只需要打包的时候把public下内容复制到构建出口文件夹中,可以借助copy-webpack-plugin插件,安装依赖

npm i copy-webpack-plugin -D
复制代码
开发环境已经在devServer中配置了static托管了public文件夹,在开发环境使用绝对路径可以访问到public下的文件,但打包构建时不做处理会访问不到,所以现在需要在打包配置文件webpack.prod.js中新增copy插件配置。

// webpack.prod.js
// ..
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin');
module.exports = merge(baseConfig, {
  mode: 'production',
  plugins: [
    // 复制文件插件
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'), // 复制public下文件
          to: path.resolve(__dirname, '../dist'), // 复制到dist目录中
          filter: source => {
            return !source.includes('index.html') // 忽略index.html
          }
        },
      ],
    }),
  ]
})
复制代码
在上面的配置中,忽略了index.html,因为html-webpack-plugin会以public下的index.html为模板生成一个index.html到dist文件下,所以不需要再复制该文件了。

测试一下,在public中新增一个favicon.ico图标文件,在index.html中引入

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- 绝对路径引入图标文件 -->
  <link data-n-head="ssr" rel="icon" type="image/x-icon" href="/favicon.ico">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webpack5-react-ts</title>
</head>
<body>
  <!-- 容器节点 -->
  <div id="root"></div>
</body>
</html>
复制代码
再执行npm run build:dev打包,就可以看到public下的favicon.ico图标文件被复制到dist文件中了。

微信截图_20220608102540.png

4.8 处理图片文件
对于图片文件,webpack4使用file-loader和url-loader来处理的,但webpack5不使用这两个loader了,而是采用自带的asset-module来处理

修改webpack.base.js,添加图片解析配置

module.exports = {
  module: {
    rules: [
      // ...
      {
        test:/.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          }
        },
        generator:{ 
          filename:'static/images/[name][ext]', // 文件输出目录和命名
        },
      },
    ]
  }
}
复制代码
测试一下,准备一张小于10kb的图片和大于10kb的图片,放在src/assets/imgs目录下, 修改App.tsx:

import React from 'react'
import smallImg from './assets/imgs/5kb.png'
import bigImg from './assets/imgs/22kb.png'
import './app.css'
import './app.less'

function App() {
  return (
    <>
      <img src={smallImg} alt="小于10kb的图片" />
      <img src={bigImg} alt="大于于10kb的图片" />
    </>
  )
}
export default App
复制代码
这个时候在引入图片的地方会报：找不到模块“./assets/imgs/22kb.png”或其相应的类型声明，需要添加一个图片的声明文件

新增src/images.d.ts文件，添加内容

declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'
declare module '*.less'
declare module '*.css'
复制代码
添加图片声明文件后,就可以正常引入图片了, 然后执行npm run build:dev打包,借助serve -s dist查看效果,可以看到可以正常解析图片了,并且小于10kb的图片被转成了base64位格式的。

微信截图_20220608102550.png

css中的背景图片一样也可以解析,修改app.tsx。

import React from 'react'
import smallImg from './assets/imgs/5kb.png'
import bigImg from './assets/imgs/22kb.png'
import './app.css'
import './app.less'

function App() {
  return (
    <>
      <img src={smallImg} alt="小于10kb的图片" />
      <img src={bigImg} alt="大于于10kb的图片" />
      <div className='smallImg'></div> {/* 小图片背景容器 */}
      <div className='bigImg'></div> {/* 大图片背景容器 */}
    </>
  )
}
export default App
复制代码
修改app.less

// app.less
#root {
  .smallImg {
    width: 69px;
    height: 75px;
    background: url('./assets/imgs/5kb.png') no-repeat;
  }
  .bigImg {
    width: 232px;
    height: 154px;
    background: url('./assets/imgs/22kb.png') no-repeat;
  }
}
复制代码
可以看到背景图片也一样可以识别,小于10kb转为base64位。

微信截图_20220608102560.png

4.9 处理字体和媒体文件
字体文件和媒体文件这两种资源处理方式和处理图片是一样的,只需要把匹配的路径和打包后放置的路径修改一下就可以了。修改webpack.base.js文件：

// webpack.base.js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test:/.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          }
        },
        generator:{ 
          filename:'static/fonts/[name][ext]', // 文件输出目录和命名
        },
      },
      {
        test:/.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          }
        },
        generator:{ 
          filename:'static/media/[name][ext]', // 文件输出目录和命名
        },
      },
    ]
  }
}
复制代码
五. 配置react模块热更新
热更新上面已经在devServer中配置hot为true, 在webpack4中,还需要在插件中添加了HotModuleReplacementPlugin,在webpack5中,只要devServer.hot为true了,该插件就已经内置了。

现在开发模式下修改css和less文件，页面样式可以在不刷新浏览器的情况实时生效，因为此时样式都在style标签里面，style-loader做了替换样式的热替换功能。但是修改App.tsx,浏览器会自动刷新后再显示修改后的内容,但我们想要的不是刷新浏览器,而是在不需要刷新浏览器的前提下模块热更新,并且能够保留react组件的状态。

可以借助@pmmmwh/react-refresh-webpack-plugin插件来实现,该插件又依赖于react-refresh, 安装依赖：

npm i @pmmmwh/react-refresh-webpack-plugin react-refresh -D
复制代码
配置react热更新插件,修改webpack.dev.js

// webpack.dev.js
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(baseConfig, {
  // ...
  plugins: [
    new ReactRefreshWebpackPlugin(), // 添加热更新插件
  ]
})
复制代码
为babel-loader配置react-refesh刷新插件,修改babel.config.js文件

const isDEV = process.env.NODE_ENV === 'development' // 是否是开发模式
module.exports = {
  // ...
  "plugins": [
    isDEV && require.resolve('react-refresh/babel'), // 如果是开发模式,就启动react热更新插件
    // ...
  ].filter(Boolean) // 过滤空值
}
复制代码
测试一下,修改App.tsx代码

import React, { useState } from 'react'

function App() {
  const [ count, setCounts ] = useState('')
  const onChange = (e: any) => {
    setCounts(e.target.value)
  }
  return (
    <>
      <h2>webpack5+react+ts</h2>
      <p>受控组件</p>
      <input type="text" value={count} onChange={onChange} />
      <br />
      <p>非受控组件</p>
      <input type="text" />
    </>
  )
}
export default App
复制代码
在两个输入框分别输入内容后,修改App.tsx中h2标签的文本,会发现在不刷新浏览器的情况下,页面内容进行了热更新,并且react组件状态也会保留。

微信截图_20220608103100.png

微信截图_20220608103103.png

新增或者删除页面hooks时,热更新时组件状态不会保留。

六. 优化构建速度
6.1 构建耗时分析
当进行优化的时候,肯定要先知道时间都花费在哪些步骤上了,而speed-measure-webpack-plugin插件可以帮我们做到,安装依赖：

npm i speed-measure-webpack-plugin -D
复制代码
使用的时候为了不影响到正常的开发/打包模式,我们选择新建一个配置文件,新增webpack构建分析配置文件build/webpack.analy.js

const prodConfig = require('./webpack.prod.js') // 引入打包配置
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin'); // 引入webpack打包速度分析插件
const smp = new SpeedMeasurePlugin(); // 实例化分析插件
const { merge } = require('webpack-merge') // 引入合并webpack配置方法

// 使用smp.wrap方法,把生产环境配置传进去,由于后面可能会加分析配置,所以先留出合并空位
module.exports = smp.wrap(merge(prodConfig, {

}))
复制代码
修改package.json添加启动webpack打包分析脚本命令,在scripts新增：

{
  // ...
  "scripts": {
    // ...
    "build:analy": "cross-env NODE_ENV=production BASE_ENV=production webpack -c build/webpack.analy.js"
  }
  // ...
}
复制代码
执行npm run build:analy命令

微信截图_20220615110031.png

可以在图中看到各plugin和loader的耗时时间,现在因为项目内容比较少,所以耗时都比较少,在真正的项目中可以通过这个来分析打包时间花费在什么地方,然后来针对性的优化。

6.2 开启持久化存储缓存
在webpack5之前做缓存是使用babel-loader缓存解决js的解析结果,cache-loader缓存css等资源的解析结果,还有模块缓存插件hard-source-webpack-plugin,配置好缓存后第二次打包,通过对文件做哈希对比来验证文件前后是否一致,如果一致则采用上一次的缓存,可以极大地节省时间。

webpack5 较于 webpack4,新增了持久化缓存、改进缓存算法等优化,通过配置 webpack 持久化缓存,来缓存生成的 webpack 模块和 chunk,改善下一次打包的构建速度,可提速 90% 左右,配置也简单，修改webpack.base.js

// webpack.base.js
// ...
module.exports = {
  // ...
  cache: {
    type: 'filesystem', // 使用文件缓存
  },
}
复制代码
当前文章代码的测试结果

模式	第一次耗时	第二次耗时
启动开发模式	2869毫秒	687毫秒
启动打包模式	5455毫秒	552毫秒
通过开启webpack5持久化存储缓存,再次打包的时间提升了90%。

微信截图_20220615163590.png

缓存的存储位置在node_modules/.cache/webpack,里面又区分了development和production缓存

微信截图_20220615163601.png

6.3 开启多线程loader
webpack的loader默认在单线程执行,现代电脑一般都有多核cpu,可以借助多核cpu开启多线程loader解析,可以极大地提升loader解析的速度,thread-loader就是用来开启多进程解析loader的,安装依赖

npm i thread-loader -D
复制代码
使用时,需将此 loader 放置在其他 loader 之前。放置在此 loader 之后的 loader 会在一个独立的 worker 池中运行。

修改webpack.base.js

// webpack.base.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        use: ['thread-loader', 'babel-loader']
      }
    ]
  }
}
复制代码
由于thread-loader不支持抽离css插件MiniCssExtractPlugin.loader(下面会讲),所以这里只配置了多进程解析js,开启多线程也是需要启动时间,大约600ms左右,所以适合规模比较大的项目。

6.4 配置alias别名
webpack支持设置别名alias,设置别名可以让后续引用的地方减少路径的复杂度。

修改webpack.base.js

module.export = {
  // ...
   resolve: {
    // ...
    alias: {
      '@': path.join(__dirname, '../src')
    }
  }
}
复制代码
修改tsconfig.json,添加baseUrl和paths

{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  }
}
复制代码
配置修改完成后,在项目中使用 @/xxx.xx,就会指向项目中src/xxx.xx,在js/ts文件和css文件中都可以用。

src/App.tsx可以修改为

import React from 'react'
import smallImg from '@/assets/imgs/5kb.png'
import bigImg from '@/assets/imgs/22kb.png'
import '@/app.css'
import '@/app.less'

function App() {
  return (
    <>
      <img src={smallImg} alt="小于10kb的图片" />
      <img src={bigImg} alt="大于于10kb的图片" />
      <div className='smallImg'></div> {/* 小图片背景容器 */}
      <div className='bigImg'></div> {/* 大图片背景容器 */}
    </>
  )
}
export default App
复制代码
src/app.less可以修改为

// app.less
#root {
  .smallImg {
    width: 69px;
    height: 75px;
    background: url('@/assets/imgs/5kb.png') no-repeat;
  }
  .bigImg {
    width: 232px;
    height: 154px;
    background: url('@/assets/imgs/22kb.png') no-repeat;
  }
}
复制代码
6.5 缩小loader作用范围
一般第三库都是已经处理好的,不需要再次使用loader去解析,可以按照实际情况合理配置loader的作用范围,来减少不必要的loader解析,节省时间,通过使用 include和exclude 两个配置项,可以实现这个功能,常见的例如：

include：只解析该选项配置的模块
exclude：不解该选项配置的模块,优先级更高
修改webpack.base.js

// webpack.base.js
const path = require('path')
module.exports = {
  // ...
  module: {
    rules: [
      {
        include: [path.resolve(__dirname, '../src')], 只对项目src文件的ts,tsx进行loader解析
        test: /.(ts|tsx)$/,
        use: ['thread-loader', 'babel-loader']
      }
    ]
  }
}
复制代码
其他loader也是相同的配置方式,如果除src文件外也还有需要解析的,就把对应的目录地址加上就可以了,比如需要引入antd的css,可以把antd的文件目录路径添加解析css规则到include里面。

6.6 精确使用loader
loader在webpack构建过程中使用的位置是在webpack构建模块依赖关系引入新文件时，会根据文件后缀来倒序遍历rules数组，如果文件后缀和test正则匹配到了，就会使用该rule中配置的loader依次对文件源代码进行处理，最终拿到处理后的sourceCode结果，可以通过避免使用无用的loader解析来提升构建速度，比如使用less-loader解析css文件。

可以拆分上面配置的less和css, 避免让less-loader再去解析css文件

// webpack.base.js
// ...
module.exports = {
  module: {
    // ...
    rules: [
      // ...
      {
        test: /.css$/, //匹配所有的 css 文件
        include: [path.resolve(__dirname, '../src')],
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /.less$/, //匹配所有的 less 文件
        include: [path.resolve(__dirname, '../src')],
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
    ]
  }
}
复制代码
ts和tsx也是如此，ts里面是不能写jsx语法的，所以可以尽可能避免使用 @babel/preset-react对 .ts 文件语法做处理。

6.7 缩小模块搜索范围
node里面模块有三种

node核心模块
node_modules模块
自定义文件模块
使用require和import引入模块时如果有准确的相对或者绝对路径,就会去按路径查询,如果引入的模块没有路径,会优先查询node核心模块,如果没有找到会去当前目录下node_modules中寻找,如果没有找到会查从父级文件夹查找node_modules,一直查到系统node全局模块。

这样会有两个问题,一个是当前项目没有安装某个依赖,但是上一级目录下node_modules或者全局模块有安装,就也会引入成功,但是部署到服务器时可能就会找不到造成报错,另一个问题就是一级一级查询比较消耗时间。可以告诉webpack搜索目录范围,来规避这两个问题。

修改webpack.base.js

// webpack.base.js
const path = require('path')
module.exports = {
  // ...
  resolve: {
     // ...
     modules: [path.resolve(__dirname, '../node_modules')], // 查找第三方模块只在本项目的node_modules中查找
  },
}
复制代码
6.8 devtool 配置
开发过程中或者打包后的代码都是webpack处理后的代码,如果进行调试肯定希望看到源代码,而不是编译后的代码, source map就是用来做源码映射的,不同的映射模式会明显影响到构建和重新构建的速度, devtool选项就是webpack提供的选择源码映射方式的配置。

devtool的命名规则为 ^(inline-|hidden-|eval-)?(nosources-)?(cheap-(module-)?)?source-map$

关键字	描述
inline	代码内通过 dataUrl 形式引入 SourceMap
hidden	生成 SourceMap 文件,但不使用
eval	eval(...) 形式执行代码,通过 dataUrl 形式引入 SourceMap
nosources	不生成 SourceMap
cheap	只需要定位到行信息,不需要列信息
module	展示源代码中的错误位置
开发环境推荐：eval-cheap-module-source-map

本地开发首次打包慢点没关系,因为 eval 缓存的原因, 热更新会很快
开发中,我们每行代码不会写的太长,只需要定位到行就行,所以加上 cheap
我们希望能够找到源代码的错误,而不是打包后的,所以需要加上 module
修改webpack.dev.js

// webpack.dev.js
module.exports = {
  // ...
  devtool: 'eval-cheap-module-source-map'
}
复制代码
打包环境推荐：none(就是不配置devtool选项了，不是配置devtool: 'none')

// webpack.prod.js
module.exports = {
  // ...
  // devtool: '', // 不用配置devtool此项
}
复制代码
none话调试只能看到编译后的代码,也不会泄露源代码,打包速度也会比较快。
只是不方便线上排查问题, 但一般都可以根据报错信息在本地环境很快找出问题所在。
6.9 其他优化配置
除了上面的配置外，webpack还提供了其他的一些优化方式,本次搭建没有使用到，所以只简单罗列下

externals: 外包拓展，打包时会忽略配置的依赖，会从上下文中寻找对应变量
module.noParse: 匹配到设置的模块,将不进行依赖解析，适合jquery,boostrap这类不依赖外部模块的包
ignorePlugin: 可以使用正则忽略一部分文件，常在使用多语言的包时可以把非中文语言包过滤掉
七. 优化构建结果文件
7.1 webpack包分析工具
webpack-bundle-analyzer是分析webpack打包后文件的插件,使用交互式可缩放树形图可视化 webpack 输出文件的大小。通过该插件可以对打包后的文件进行观察和分析,可以方便我们对不完美的地方针对性的优化,安装依赖：

npm install webpack-bundle-analyzer -D
复制代码
修改webpack.analy.js

// webpack.analy.js
const prodConfig = require('./webpack.prod.js')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const { merge } = require('webpack-merge')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer') // 引入分析打包结果插件
module.exports = smp.wrap(merge(prodConfig, {
  plugins: [
    new BundleAnalyzerPlugin() // 配置分析打包结果插件
  ]
}))
复制代码
配置好后,执行npm run build:analy命令,打包完成后浏览器会自动打开窗口,可以看到打包文件的分析结果页面,可以看到各个文件所占的资源大小。

微信截图_20220616153950.png

7.2 抽取css样式文件
在开发环境我们希望css嵌入在style标签里面,方便样式热替换,但打包时我们希望把css单独抽离出来,方便配置缓存策略。而插件mini-css-extract-plugin就是来帮我们做这件事的,安装依赖：

npm i mini-css-extract-plugin -D
复制代码
修改webpack.base.js, 根据环境变量设置开发环境使用style-looader,打包模式抽离css

// webpack.base.js
// ...
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDev = process.env.NODE_ENV === 'development' // 是否是开发模式
module.exports = {
  // ...
  module: { 
    rules: [
      // ...
      {
        test: /.css$/, //匹配所有的 css 文件
        include: [path.resolve(__dirname, '../src')],
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /.less$/, //匹配所有的 less 文件
        include: [path.resolve(__dirname, '../src')],
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
    ]
  },
  // ...
}
复制代码
再修改webpack.prod.js, 打包时添加抽离css插件

// webpack.prod.js
// ...
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = merge(baseConfig, {
  mode: 'production',
  plugins: [
    // ...
    // 抽离css插件
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css' // 抽离css的输出目录和名称
    }),
  ]
})
复制代码
配置完成后,在开发模式css会嵌入到style标签里面,方便样式热替换,打包时会把css抽离成单独的css文件。

7.3 压缩css文件
上面配置了打包时把css抽离为单独css文件的配置,打开打包后的文件查看,可以看到默认css是没有压缩的,需要手动配置一下压缩css的插件。

微信截图_20220616153959.png

可以借助css-minimizer-webpack-plugin来压缩css,安装依赖

npm i css-minimizer-webpack-plugin -D
复制代码
修改webpack.prod.js文件， 需要在优化项optimization下的minimizer属性中配置

// webpack.prod.js
// ...
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = {
  // ...
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
    ],
  },
}
复制代码
再次执行打包就可以看到css已经被压缩了。

7.4 压缩js文件
设置mode为production时,webpack会使用内置插件terser-webpack-plugin压缩js文件,该插件默认支持多线程压缩,但是上面配置optimization.minimizer压缩css后,js压缩就失效了,需要手动再添加一下,webpack内部安装了该插件,由于pnpm解决了幽灵依赖问题,如果用的pnpm的话,需要手动再安装一下依赖。

npm i terser-webpack-plugin -D
复制代码
修改webpack.prod.js文件

// ...
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  // ...
  optimization: {
    minimizer: [
      // ...
      new TerserPlugin({ // 压缩js
        parallel: true, // 开启多线程压缩
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"] // 删除console.log
          }
        }
      }),
    ],
  },
}
复制代码
配置完成后再打包,css和js就都可以被压缩了。

7.5 合理配置打包文件hash
项目维护的时候,一般只会修改一部分代码,可以合理配置文件缓存,来提升前端加载页面速度和减少服务器压力,而hash就是浏览器缓存策略很重要的一部分。webpack打包的hash分三种：

hash：跟整个项目的构建相关,只要项目里有文件更改,整个项目构建的hash值都会更改,并且全部文件都共用相同的hash值
chunkhash：不同的入口文件进行依赖文件解析、构建对应的chunk,生成对应的哈希值,文件本身修改或者依赖文件修改,chunkhash值会变化
contenthash：每个文件自己单独的 hash 值,文件的改动只会影响自身的 hash 值
hash是在输出文件时配置的,格式是filename: "[name].[chunkhash:8][ext]",[xx] 格式是webpack提供的占位符, :8是生成hash的长度。

占位符	解释
ext	文件后缀名
name	文件名
path	文件相对路径
folder	文件所在文件夹
hash	每次构建生成的唯一 hash 值
chunkhash	根据 chunk 生成 hash 值
contenthash	根据文件内容生成hash 值
因为js我们在生产环境里会把一些公共库和程序入口文件区分开,单独打包构建,采用chunkhash的方式生成哈希值,那么只要我们不改动公共库的代码,就可以保证其哈希值不会受影响,可以继续使用浏览器缓存,所以js适合使用chunkhash。

css和图片资源媒体资源一般都是单独存在的,可以采用contenthash,只有文件本身变化后会生成新hash值。

修改webpack.base.js,把js输出的文件名称格式加上chunkhash,把css和图片媒体资源输出格式加上contenthash

// webpack.base.js
// ...
module.exports = {
  // 打包文件出口
  output: {
    filename: 'static/js/[name].[chunkhash:8].js', // // 加上[chunkhash:8]
    // ...
  },
  module: {
    rules: [
      {
        test:/.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        // ...
        generator:{ 
          filename:'static/images/[name].[contenthash:8][ext]' // 加上[contenthash:8]
        },
      },
      {
        test:/.(woff2?|eot|ttf|otf)$/, // 匹配字体文件
        // ...
        generator:{ 
          filename:'static/fonts/[name].[contenthash:8][ext]', // 加上[contenthash:8]
        },
      },
      {
        test:/.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        // ...
        generator:{ 
          filename:'static/media/[name].[contenthash:8][ext]', // 加上[contenthash:8]
        },
      },
    ]
  },
  // ...
}
复制代码
再修改webpack.prod.js,修改抽离css文件名称格式

// webpack.prod.js
// ...
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = merge(baseConfig, {
  mode: 'production',
  plugins: [
    // 抽离css插件
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css' // 加上[contenthash:8]
    }),
    // ...
  ],
  // ...
})
复制代码
再次打包就可以看到文件后面的hash了

7.6 代码分割第三方包和公共模块
一般第三方包的代码变化频率比较小,可以单独把node_modules中的代码单独打包, 当第三包代码没变化时,对应chunkhash值也不会变化,可以有效利用浏览器缓存，还有公共的模块也可以提取出来,避免重复打包加大代码整体体积, webpack提供了代码分隔功能, 需要我们手动在优化项optimization中手动配置下代码分隔splitChunks规则。

修改webpack.prod.js

module.exports = {
  // ...
  optimization: {
    // ...
    splitChunks: { // 分隔代码
      cacheGroups: {
        vendors: { // 提取node_modules代码
          test: /node_modules/, // 只匹配node_modules里面的模块
          name: 'vendors', // 提取文件命名为vendors,js后缀和chunkhash会自动加
          minChunks: 1, // 只要使用一次就提取出来
          chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
          priority: 1, // 提取优先级为1
        },
        commons: { // 提取页面公共代码
          name: 'commons', // 提取文件命名为commons
          minChunks: 2, // 只要使用两次就提取出来
          chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
        }
      }
    }
  }
}
复制代码
配置完成后执行打包,可以看到node_modules里面的模块被抽离到verdors.ec725ef1.js中,业务代码在main.9a6bf38a.js中。

微信截图_20220616180505.png

测试一下,此时verdors.js的chunkhash是ec725ef1,main.js文件的chunkhash是9a6bf38a,改动一下App.tsx,再次打包,可以看到下图main.js的chunkhash值变化了,但是vendors.js的chunkhash还是原先的,这样发版后,浏览器就可以继续使用缓存中的verdors.ec725ef1.js,只需要重新请求main.js就可以了。

微信截图_20220617102854.png

7.7 tree-shaking清理未引用js
Tree Shaking的意思就是摇树,伴随着摇树这个动作,树上的枯叶都会被摇晃下来,这里的tree-shaking在代码中摇掉的是未使用到的代码,也就是未引用的代码,最早是在rollup库中出现的,webpack在2版本之后也开始支持。模式mode为production时就会默认开启tree-shaking功能以此来标记未引入代码然后移除掉,测试一下。

在src/components目录下新增Demo1,Demo2两个组件

// src/components/Demo1.tsx
import React from "react";
function Demo1() {
  return <h3>我是Demo1组件</h3>
}
export default Demo1

// src/components/Demo2.tsx
import React from "react";
function Demo2() {
  return <h3>我是Demo2组件</h3>
}
export default Demo2
复制代码
再在src/components目录下新增index.ts, 把Demo1和Demo2组件引入进来再暴露出去

// src/components/index.ts
export { default as Demo1 } from './Demo1'
export { default as Demo2 } from './Demo2'
复制代码
在App.tsx中引入两个组件,但只使用Demo1组件

// ...
import { Demo1, Demo2 } from '@/components'

function App() {
  return <Demo1 />
}
export default App
复制代码
执行打包,可以看到在main.js中搜索Demo,只搜索到了Demo1, 代表Demo2组件被tree-shaking移除掉了。

微信截图_20220617111640.png

7..8 tree-shaking清理未使用css
js中会有未使用到的代码,css中也会有未被页面使用到的样式,可以通过purgecss-webpack-plugin插件打包的时候移除未使用到的css样式,这个插件是和mini-css-extract-plugin插件配合使用的,在上面已经安装过,还需要glob-all来选择要检测哪些文件里面的类名和id还有标签名称, 安装依赖:

npm i purgecss-webpack-plugin glob-all -D
复制代码
修改webpack.prod.js

// webpack.prod.js
// ...
const globAll = require('glob-all')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
  // ...
  plugins: [
    // 抽离css插件
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css'
    }),
    // 清理无用css
    new PurgeCSSPlugin({
      // 检测src下所有tsx文件和public下index.html中使用的类名和id和标签名称
      // 只打包这些文件中用到的样式
      paths: globAll.sync([
        `${path.join(__dirname, '../src')}/**/*.tsx`,
        path.join(__dirname, '../public/index.html')
      ]),
    }),
  ]
}
复制代码
测试一下,用上面配置解析图片文件代码拿过来,修改App.tsx

import React from 'react'
import './app.css'
import './app.less'

function App() {
  return (
    <>
      <div className='smallImg'></div>
      <div className='bigImg'></div>
    </>
  )
}
export default App
复制代码
App.tsx中有两个div,类名分别是smallImg和bigImg,当前app.less代码为

#root {
  .smallImg {
    width: 69px;
    height: 75px;
    background: url('./assets/imgs/5kb.png') no-repeat;
  }
  .bigImg {
    width: 232px;
    height: 154px;
    background: url('./assets/imgs/22kb.png') no-repeat;
  }
}
复制代码
此时先执行一下打包,查看main.css

微信截图_20220617141338.png

因为页面中中有h2标签, smallImg和bigImg类名,所以打包后的css也有,此时修改一下app.less中的 .smallImg为 .smallImg1,此时 .smallImg1就是无用样式了,因为没有页面没有类名为 .smallImg1的节点,再打包后查看 main.css

微信截图_20220617141901.png

可以看到main.css已经没有 .smallImg1类名的样式了,做到了删除无用css的功能。

但是purgecss-webpack-plugin插件不是全能的,由于项目业务代码的复杂,插件不能百分百识别哪些样式用到了,哪些没用到,所以请不要寄希望于它能够百分百完美解决你的问题,这个是不现实的。

插件本身也提供了一些白名单safelist属性,符合配置规则选择器都不会被删除掉,比如使用了组件库antd, purgecss-webpack-plugin插件检测src文件下tsx文件中使用的类名和id时,是检测不到在src中使用antd组件的类名的,打包的时候就会把antd的类名都给过滤掉,可以配置一下安全选择列表,避免删除antd组件库的前缀ant。

new PurgeCSSPlugin({
  // ...
  safelist: {
    standard: [/^ant-/], // 过滤以ant-开头的类名，哪怕没用到也不删除
  }
})
复制代码
7.9 资源懒加载
像react,vue等单页应用打包默认会打包到一个js文件中,虽然使用代码分割可以把node_modules模块和公共模块分离,但页面初始加载还是会把整个项目的代码下载下来,其实只需要公共资源和当前页面的资源就可以了,其他页面资源可以等使用到的时候再加载,可以有效提升首屏加载速度。

webpack默认支持资源懒加载,只需要引入资源使用import语法来引入资源,webpack打包的时候就会自动打包为单独的资源文件,等使用到的时候动态加载。

以懒加载组件和css为例,新建懒加载组件src/components/LazyDemo.tsx

import React from "react";

function LazyDemo() {
  return <h3>我是懒加载组件组件</h3>
}

export default LazyDemo
复制代码
修改App.tsx

import React, { lazy, Suspense, useState } from 'react'
const LazyDemo = lazy(() => import('@/components/LazyDemo')) // 使用import语法配合react的Lazy动态引入资源

function App() {
  const [ show, setShow ] = useState(false)
  
  // 点击事件中动态引入css, 设置show为true
  const onClick = () => {
    import('./app.css')
    setShow(true)
  }
  return (
    <>
      <h2 onClick={onClick}>展示</h2>
      {/* show为true时加载LazyDemo组件 */}
      { show && <Suspense fallback={null}><LazyDemo /></Suspense> }
    </>
  )
}
export default App
复制代码
点击展示文字时,才会动态加载app.css和LazyDemo组件的资源。

微信截图_20220617151624.png

7.10 资源预加载
上面配置了资源懒加载后,虽然提升了首屏渲染速度,但是加载到资源的时候会有一个去请求资源的延时,如果资源比较大会出现延迟卡顿现象,可以借助link标签的rel属性prefetch与preload,link标签除了加载css之外也可以加载js资源,设置rel属性可以规定link提前加载资源,但是加载资源后不执行,等用到了再执行。

rel的属性值

preload是告诉浏览器页面必定需要的资源,浏览器一定会加载这些资源。
prefetch是告诉浏览器页面可能需要的资源,浏览器不一定会加载这些资源,会在空闲时加载。
对于当前页面很有必要的资源使用 preload ,对于可能在将来的页面中使用的资源使用 prefetch。

webpack v4.6.0+ 增加了对预获取和预加载的支持,使用方式也比较简单,在import引入动态资源时使用webpack的魔法注释

// 单个目标
import(
  /* webpackChunkName: "my-chunk-name" */ // 资源打包后的文件chunkname
  /* webpackPrefetch: true */ // 开启prefetch预获取
  /* webpackPreload: true */ // 开启preload预获取
  './module'
);
复制代码
测试一下,在src/components目录下新建PreloadDemo.tsx, PreFetchDemo.tsx

// src/components/PreloadDemo.tsx
import React from "react";
function PreloadDemo() {
  return <h3>我是PreloadDemo组件</h3>
}
export default PreloadDemo

// src/components/PreFetchDemo.tsx
import React from "react";
function PreFetchDemo() {
  return <h3>我是PreFetchDemo组件</h3>
}
export default PreFetchDemo
复制代码
修改App.tsx

import React, { lazy, Suspense, useState } from 'react'

// prefetch
const PreFetchDemo = lazy(() => import(
  /* webpackChunkName: "PreFetchDemo" */
  /*webpackPrefetch: true*/
  '@/components/PreFetchDemo'
))
// preload
const PreloadDemo = lazy(() => import(
  /* webpackChunkName: "PreloadDemo" */
  /*webpackPreload: true*/
  '@/components/PreloadDemo'
 ))

function App() {
  const [ show, setShow ] = useState(false)

  const onClick = () => {
    setShow(true)
  }
  return (
    <>
      <h2 onClick={onClick}>展示</h2>
      {/* show为true时加载组件 */}
      { show && (
        <>
          <Suspense fallback={null}><PreloadDemo /></Suspense>
          <Suspense fallback={null}><PreFetchDemo /></Suspense>
        </>
      ) }
    </>
  )
}
export default App
复制代码
然后打包后查看效果,页面初始化时预加载了PreFetchDemo.js组件资源,但是不执行里面的代码,等点击展示按钮后从预加载的资源中直接取出来执行,不用再从服务器请求,节省了很多时间。

微信截图_20220617173416.png

在测试时发现只有js资源设置prefetch模式才能触发资源预加载,preload模式触发不了,css和图片等资源不管设置prefetch还是preload都不能触发,不知道是哪里没配置好。

7.11 打包时生成gzip文件
前端代码在浏览器运行,需要从服务器把html,css,js资源下载执行,下载的资源体积越小,页面加载速度就会越快。一般会采用gzip压缩,现在大部分浏览器和服务器都支持gzip,可以有效减少静态资源文件大小,压缩率在 70% 左右。

nginx可以配置gzip: on来开启压缩,但是只在nginx层面开启,会在每次请求资源时都对资源进行压缩,压缩文件会需要时间和占用服务器cpu资源，更好的方式是前端在打包的时候直接生成gzip资源,服务器接收到请求,可以直接把对应压缩好的gzip文件返回给浏览器,节省时间和cpu。

webpack可以借助compression-webpack-plugin 插件在打包时生成 gzip 文章,安装依赖

npm i compression-webpack-plugin -D
复制代码
添加配置,修改webpack.prod.js

const glob = require('glob')
const CompressionPlugin  = require('compression-webpack-plugin')
module.exports = {
  // ...
  plugins: [
     // ...
     new CompressionPlugin({
      test: /.(js|css)$/, // 只生成css,js压缩文件
      filename: '[path][base].gz', // 文件命名
      algorithm: 'gzip', // 压缩格式,默认是gzip
      test: /.(js|css)$/, // 只生成css,js压缩文件
      threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
      minRatio: 0.8 // 压缩率,默认值是 0.8
    })
  ]
}
复制代码
配置完成后再打包,可以看到打包后js的目录下多了一个 .gz 结尾的文件

微信截图_20220620105008.png

因为只有verdors.js的大小超过了10k, 所以只有它生成了gzip压缩文件,借助serve -s dist启动dist,查看verdors.js加载情况

微信截图_20220620105520.png

可以看到verdors.js的原始大小是182kb, 使用gzip压缩后的文件只剩下了60.4kb,减少了70% 的大小,可以极大提升页面加载速度。

八. 总结
到目前为止已经使用webpack5把react18+ts的开发环境配置完成，并且配置比较完善的保留组件状态的热更新，以及常见的优化构建速度和构建结果的配置，完整代码已上传到webpack5-react-ts 。还有细节需要优化，比如把容易改变的配置单独写个config.js来配置，输出文件路径封装。这篇文章只是配置，如果想学好webpack，还需要学习webpack的构建原理以及loader和plugin的实现机制。

本文是总结自己在工作中使用webpack5搭建react+ts构建环境中使用到的配置, 肯定也很多没有做好的地方，后续有好的使用技巧和配置也会继续更新记录。

附上上面安装依赖的版本

"devDependencies": {
    "@babel/core": "^7.18.2",
    "@babel/plugin-proposal-decorators": "^7.18.2",
    "@babel/plugin-transform-runtime": "^7.18.5",
    "@babel/preset-env": "^7.18.2",
    "@babel/preset-react": "^7.17.12",
    "@babel/preset-typescript": "^7.17.12",
    "@pmmmwh/react-refresh-webpack-plugin": "^0.5.7",
    "@types/react": "^18.0.12",
    "@types/react-dom": "^18.0.5",
    "autoprefixer": "^10.4.7",
    "babel-loader": "^8.2.5",
    "compression-webpack-plugin": "^10.0.0",
    "copy-webpack-plugin": "^11.0.0",
    "core-js": "^3.23.0",
    "cross-env": "^7.0.3",
    "css-loader": "^6.7.1",
    "css-minimizer-webpack-plugin": "^4.0.0",
    "html-webpack-plugin": "^5.5.0",
    "less": "^4.1.3",
    "less-loader": "^11.0.0",
    "mini-css-extract-plugin": "^2.6.1",
    "postcss": "^8.4.14",
    "postcss-loader": "^7.0.0",
    "purgecss-webpack-plugin": "^4.1.3",
    "react-refresh": "^0.14.0",
    "speed-measure-webpack-plugin": "^1.5.0",
    "style-loader": "^3.3.1",
    "thread-loader": "^3.0.4",
    "typescript": "^4.7.3",
    "webpack": "^5.73.0",
    "webpack-bundle-analyzer": "^4.5.0",
    "webpack-cli": "^4.9.2",
    "webpack-dev-server": "^4.9.1",
    "webpack-merge": "^5.8.0"
  },
  "dependencies": {
    "react": "^18.1.0",
    "react-dom": "^18.1.0"
  }
复制代码
参考
webpack官网
babel官网
【万字】透过分析 webpack 面试题，构建 webpack5.x 知识体系
Babel 那些事儿
阔别两年，webpack 5 正式发布了！
webpack从入门到进阶
分类：
前端
标签：
Webpack
前端
文章被收录于专栏：
cover
前端工程化
记录自己前端工作和学习过程中和工程化相关的知识。
关注专栏
安装掘金浏览器插件
多内容聚合浏览、多引擎快捷搜索、多工具便捷提效、多模式随心畅享，你想要的，这里都有！
前往安装
相关课程
「Webpack5 核心原理与应用实践」封面
Webpack5 核心原理与应用实践
范文杰
lv-5
3733购买
¥29.95
¥59.9
首单券后价首单券后价
「从 0 到 1 落地前端工程化」封面
从 0 到 1 落地前端工程化
JowayYoung
lv-6

2932购买
¥14.95
¥29.9
首单券后价首单券后价

评论

看完啦，
登录
分享一下感受吧～
全部评论 87
最新
最热
老鱼的头像
老鱼
掘友等级
前端
10天前
请教一下作者，在开启了sourcemap后，在Chrome中调试项目，发现源码的文件名后带了一些哈希值，比如index.tsx变成了index.tsx?ic6d，这是为什么。另外看网上很多项目开启了sourcemap后调试面板都有一个webpack://的文件夹，这是怎么做的

老鱼
10天前
github上有个issue,但是没有后续解决方案，github.com
老鱼的头像
老鱼
掘友等级
前端
13天前
使用webpack-merge会报ts2345错误，类型不匹配怎么解决的，看github有个2020年的issue，github.com

Ausra无忧

（作者）
13天前
你那边webpack配置文件是用的ts吗

老鱼
回复
Ausra无忧
12天前
是JS，我找到问题所在了，是我的vscode默认设置tsconfig会check JS[捂脸]
“
你那边webpack配置文件是用的ts吗
”
用户3164447441366的头像
用户3164447441366
掘友等级
15天前
nb[赞]
哈库呐么塔塔的头像
哈库呐么塔塔
掘友等级
20天前
感谢楼主 用了半天时间 跟着做完了楼主的 非常感谢哦
希望楼主 再加个vite react ts 版本
徐青山的头像
徐青山
掘友等级
前端开发 @ 阿巴阿巴
20天前
大佬，请教下 package 命令中加 “ -c ”是为什么

Ausra无忧

（作者）
20天前
-c是为webpack指定一个配置文件，默认配置文件是webpack.config.js，可以通过-c指定配置文件，--config也可以。

徐青山
回复
Ausra无忧
20天前
谢谢大佬，那有什么办法可以指定loader.config的配置文件路径吗，我在想把loader的配置文件从根目录移到一个统一目录下，但在网上并没有搜到相关东西
“
-c是为webpack指定一个配置文件，默认配置文件是webpack.config.js，可以通过-c指定配置文件，--config也可以。
”

Ausra无忧

（作者）
回复
徐青山
20天前
loader.config，是指babel.config.js文件吗
“
谢谢大佬，那有什么办法可以指定loader.config的配置文件路径吗，我在想把loader的配置文件从根目录移到一个统一目录下，但在网上并没有搜到相关东西
”

徐青山
回复
Ausra无忧
19天前
是的，比如babel.config.js，postcss.config.js这类文件，我该在互联网上搜索什么关键字，才能实现把它们放到一个统一目录呢
“
loader.config，是指babel.config.js文件吗
”
徐青山的头像
徐青山
掘友等级
前端开发 @ 阿巴阿巴
21天前
感谢作者分享，受益良多[赞][赞][赞]
Strive_的头像
Strive_
掘友等级
码畜 @ 加班公司
23天前
求 vue3+vite的[呲牙]
用户1030227180781的头像
用户1030227180781
掘友等级
1月前
楼主什么时候来一份vue3+vite的，这个也是目前主流的，文章流量估计也是很热门
zpcsgo的头像
zpcsgo
掘友等级
web前端工程师
1月前
如果使用antd，引入less@import '~antd/dist/antd.less';
修改less-loader
use: [
isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
'css-loader',
'postcss-loader',
{
loader: 'less-loader',
options: {
lessOptions: {
javascriptEnabled: true,
},
},
},
],
展开
果味110的头像
果味110
lv-1
掘友等级
1月前
真不错 学习学习
用户5160085919016的头像
用户5160085919016
掘友等级
1月前
如果我想引入antd design 需要怎么改配置
一叶知秋一叶障目的头像
一叶知秋一叶障目
lv-1
掘友等级
前端 @ 东方money
1月前
感谢作者辛苦发文分享[赞][赞][赞]
wk的头像
wk
lv-2
掘友等级
前端开发
2月前
感谢作者分享[赞]
渝十四的头像
渝十四
掘友等级
前端开发
2月前
请问：webpack4的webpack.config.js文件，一定要在根目录下的么？我将webpackconfig迁移到了/build/下面，然后根目录下.babellrc文件配置的preset-react就失效了，将.babellrc也迁移到/build/下也不行
用户1030227180781的头像
用户1030227180781
掘友等级
2月前
eslint这些没有吗
木槿xxx的头像
木槿xxx
掘友等级
2月前
请教下，我这把在到清理无用css时，下载好了依赖PurgeCSSPlugin，但是打包时会提示TypeError: PurgeCSSPlugin is not a constructor。重新下了好几次 请问是什么情况

木槿xxx
2月前
我看nodemodules里面是有这个依赖的

Ausra无忧

（作者）
2月前
我看下你PurgeCSSPlugin这一块配置的代码，还有PurgeCSSPlugin的版本号是多少。
查看更多回复
用户2487376982224的头像
用户2487376982224
掘友等级
2月前
大佬，public复刻那块，我在public下面的html引入了同级的favicon.ico，打包后
dist下面有，但是怎么都加载不出来

Ausra无忧

（作者）
2月前
html引入favicon.ico的路径是什么，还有打包后是用什么方式启动dist文件的，serve吗？

用户2487376982224
回复
Ausra无忧
2月前
解决了，大佬，那会儿怎么都不行，今天一启动就好了，[微笑]
“
html引入favicon.ico的路径是什么，还有打包后是用什么方式启动dist文件的，serve吗？
”
海南之南的头像
海南之南
掘友等级
前端工程师
3月前
mac使用pnpm配置resolve的modules后，运行pnpm dev:dev，提示webpack-dev-server中的一些模块can't resolve，用pnpm add安装也不行，把resolve里的modules设置注释了才行

Ausra无忧

（作者）
3月前
resolve.modules规定了依赖查找范围，在当前node_modules找不到就会报错，pnpm会报错感觉应该和它解决了幽灵依赖的机制有关，我去试一下看看。这篇文章当时主要讲react+webpack配置的，用的也是npm，就没有在这一块多讲。

用户1030227180781
回复
Ausra无忧
2月前
这问题解决了吗
“
resolve.modules规定了依赖查找范围，在当前node_modules找不到就会报错，pnpm会报错感觉应该和它解决了幽灵依赖的机制有关，我去试一下看看。这篇文章当时主要讲react+webpack配置的，用的也是npm，就没有在这一块多讲。
”
小李秋秋的头像
小李秋秋
掘友等级

前端开发攻城狮 @ 水泥厂
3月前
blog.csdn.net，大佬，这里有人转载你文章标原创，，

Ausra无忧

（作者）
3月前
收到，多谢啦[嘿哈][嘿哈]
buchiyu的头像
buchiyu
lv-2
掘友等级
前端菜鸟 @ 前端实习生
3月前
```babel.config.js
const isDEV = process.env.NODE_ENV === 'development' // 是否是开发模式
```
这个const会报eslint报错“ESLint: Parsing error: The keyword 'const' is reserved”
这个是为什么？
查看全部 87 条回复

相关推荐
10月前
前端
面试
做了一份前端面试复习计划，保熟～
39.0w
7405
405
1月前
前端
Webpack
Vite
耗时一年半才出第一版，这个工具会一统前端么？
4.7w
263
67
2年前
前端
Webpack
webpack打包原理 ? 看完这篇你就懂了 !
5.6w
1400
62
8月前
前端
ts保姆级教程，别再说你不会ts了
8.1w
1846
184
3年前
前端框架
前端
架构
大型项目前端架构浅谈（8000字原创）
16.5w
4307
287
2年前
JavaScript
面试
写给女朋友的中级前端面试秘籍（含详细答案，15k级别）
22.2w
3329
211
1月前
前端
React.js
Antd5一出，治好了我组件库选择内耗，我直接搭配React18+Vite+Ts做了一个管理后台
4.5w
504
153
2年前
JavaScript
字节跳动面试官：请你实现一个大文件上传和断点续传
26.7w
5717
579
2年前
JavaScript
面试
写给初中级前端的高级进阶指南
33.6w
7868
348
8月前
前端
JavaScript
Webpack
每个前端都必须要学会的Webpack优化手段
3.7w
884
63
9月前
前端
关于电竞职业选手转前端开发这件事
13.1w
1137
506
1年前
前端
Webpack
学习 Webpack5 之路（优化篇）- 近 7k 字
1.2w
243
24
3年前
React.js
React Hooks 详解 【近 1W 字】+ 项目实战
15.0w
2728
107
9月前
面试
最近两周出去面试遇到的面试题（前端初级、长更）
27.3w
4136
440
9月前
Vue.js
Webpack
前端
如何优化你的 vue-cli 项目？
1.4w
163
25
4年前
React.js
前端
阿里巴巴
30分钟精通React Hooks
12.3w
2606
168
3年前
HTML
CSS
灵活运用CSS开发技巧
16.8w
5023
314
1年前
JavaScript
面试
🔥 连八股文都不懂还指望在前端混下去么
55.7w
11025
565
1年前
前端
算法
面试了十几个高级前端，竟然连（扁平数据结构转Tree）都写不出来
25.2w
3654
1891
3年前
面试
前端
【1 月最新】前端 100 问：能搞懂 80% 的请把简历给我
60.7w
10567
362
lzg9527
2年前
前端
Webpack
总结18个webpack插件，总会有你想要的！
2.0w
411
19
nowThen
2年前
React.js
从零搭建完整的React项目模板(Webpack + React hooks + Mobx + Antd) 【演戏演全套】
1.7w
242
28
arlendp2012
4年前
Webpack
前端
CDN
Webpack打包优化
1.7w
177
1
伊人a
1年前
前端
面试
2021年我的前端面试准备
29.9w
5804
567
卤蛋实验室
3年前
Webpack
前端
辛辛苦苦学会的 webpack dll 配置，可能已经过时了
2.0w
368
68
摸鱼的春哥
11月前
前端
JavaScript
2022，前端的天🌦️要怎么变？
18.1w
1722
737
SBDavid
4年前
JavaScript
Webpack
CSS
如何让webpack打包的速度提升50%？
1.0w
355
36
AlienZHOU
4年前
JavaScript
前端
Webpack
【webpack进阶】你真的掌握了loader么？- loader十问
1.7w
210
9
Fundebug
3年前
React.js
JavaScript
你要的 React 面试知识点，都在这了
13.0w
2432
64
我不是外星人
1年前
React.js
JavaScript
「react进阶」一文吃透react-hooks原理
6.9w
2170
136
乘风gg
4年前
Vue.js
JavaScript
前端
vue多页面开发和打包的正确姿势
4.4w
1321
82
前端先锋
2年前
面试
前端
2020最新：100道有答案的前端面试题（上）
21.1w
2814
69
和光不同尘
1年前
前端
Vue.js
保姆级教程：从零搭建 Webpack5+ts+Vue3 开发环境
4952
59
9
凹凸实验室
7月前
Taro
Taro 3.5 beta 编译提速，支持 Webpack5、React 18...
2.2w
20
9
Sunshine_Lin
1年前
前端
Vite
Webpack
Vite为什么快呢？快在哪？说一下我自己的理解吧
1.5w
102
33
荒山
3年前
前端
团队管理
if 我是前端团队 Leader，怎么制定前端协作规范?
17.3w
4531
230
掘金翻译计划
8月前
前端
前端框架
Ruby
作为一名前端工程师，我浪费了时间学习了这些技术
20.3w
792
446
Neal_yang
3年前
面试
前端
一个合格(优秀)的前端都应该阅读这些文章
35.4w
8901
394
郑鱼咚
1年前
前端
Webpack
leader要我三天时间搭一套“ react-cli ”出来，我答应了...
1.4w
208
36
Mondo
2年前
React.js
从零搭建 React 开发 H5 模板
6710
27
7
友情链接：

穿越洪荒当祖巫
我有一座天道图书馆，功法成精了
大唐：开局娶长乐，李二找上门
我的大怨种蛇夫又撒娇了
郭姝彤
css百分比设置图像高度
angularjs 1.5.3 vulnerabilities
string concatenation with comma in typescript
app.js 运行
bho 加载js文件