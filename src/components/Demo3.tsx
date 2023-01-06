import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

function Dmeo3(prop: any) {
  let [counter, setCounter] = useState({ name: '计数器', number: 0 })
  console.log('render')
  return (
    <>
      <p>
        {counter.name}:{counter.number}
      </p>
      <button onClick={() => setCounter({ ...counter, number: counter.number + 1 })}>+</button>
      <button onClick={() => setCounter(counter)}>++</button>
    </>
  )
}
export default Dmeo3
