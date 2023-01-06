import React, { useReducer } from 'react'

const initialState = 0

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'increment':
      return { number: state.number + 1 }
    case 'decrement':
      return { number: state.number - 1 }
    default:
      throw new Error()
  }
}
function init(initialState: any) {
  return { number: initialState }
}
function Demo1() {
  const [state, dispatch] = useReducer(reducer, initialState, init)
  return (
    <>
      Dmeo1:{state.number}
      <button
        onClick={() => {
          dispatch({ type: 'increment' })
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'decrement' })
        }}
      >
        -
      </button>
    </>
  )
}
export default Demo1
