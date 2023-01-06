import React, { Component, useState, useEffect } from 'react'

function Counter() {
  const [number, setNumber] = useState(0)

  useEffect(() => {
    document.title = `你点击${number}次`
  })
  return (
    <>
      <p>{number}</p>
      <button onClick={() => setNumber(number + 1)}>+</button>
    </>
  )
}
export default Counter
