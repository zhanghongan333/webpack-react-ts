import React, { PureComponent } from 'react'

function addAge(Target: Function) {
  Target.prototype.age = 111
}
// 使用装饰器
@addAge
class Class extends PureComponent {
  age?: number
  render() {
    return <h2>我是类组件---{this.age}</h2>
  }
}

export default Class
