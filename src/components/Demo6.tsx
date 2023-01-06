import React, { useEffect, useState } from 'react'

function Demo6() {
  let [number, setNumber] = useState(0)
  let [text, setText] = useState('')
  useEffect(() => {
    console.log('开启一个新的定时器')
    let $timer = setInterval(() => {
      setNumber(number => number + 1)
    }, 1000)
    // return () => {
    //   console.log('destroy effect')
    //   clearInterval($timer)
    // }
  }, [text])
  return (
    <>
      <input value={text} onChange={event => setText(event.target.value)} />
      <p>{number}</p>
      <button>+</button>
    </>
  )
}
export default Demo6
