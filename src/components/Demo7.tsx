import React, { useState, useEffect, useRef } from 'react'

function Parent() {
  let [number, setNumber] = useState(0)
  return (
    <>
      <Child></Child>
      {number}
      <button onClick={() => setNumber(number + 1)}>+</button>
    </>
  )
}
let input: any
function Child() {
  const inputRef = useRef<HTMLInputElement>(null)
  console.log('input===inputRef', input === inputRef)
  input = inputRef
  function getFocus() {
    inputRef?.current?.focus()
  }
  return (
    <>
      <input type='text' ref={inputRef}></input>
      <button onClick={getFocus}>获取焦点</button>
    </>
  )
}
export default Parent
