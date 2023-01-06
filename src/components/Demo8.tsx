import React, { useState, useRef } from 'react'
function Child(props: any, ref: any) {
  console.log(ref)
  return <input type='text' ref={ref} />
}
Child = React.forwardRef(Child)
function Parent() {
  const [number, setNumber] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  function getFocus() {
    if (inputRef.current) {
      inputRef.current.value = 'focus'
      inputRef?.current?.focus()
    }
  }
  return (
    <>
      <Child ref={inputRef}></Child>
      <button onClick={() => setNumber(number + 1)}>+</button>
      <button onClick={getFocus}>获取焦点</button>
    </>
  )
}
export default Parent
