import React, { useState, useMemo, memo, useCallback } from 'react'

function SubCounter({ onClick, data }) {
  console.log('SubCounter render')
  return <button onClick={onClick}>{data.number}</button>
}

SubCounter = memo(SubCounter)

let oldData: any, oldAddClick: any
function Demo2() {
  console.log('counter render')
  const [name, setName] = useState('计数器')
  const [number, setNumber] = useState(0)
  const data = useMemo(
    () => ({
      number
    }),
    [number]
  )
  console.log('data===oldData', data === oldData)
  oldData = data
  const addClick = useCallback(() => {
    setNumber(number + 1)
  }, [number])
  console.log('addClick===oldAddClick', addClick === oldAddClick)
  oldAddClick = addClick
  return (
    <>
      <input type='text' value={name} onChange={e => setName(e.target.value)} />
      <SubCounter data={data} onClick={addClick}></SubCounter>
    </>
  )
}
export default Demo2
