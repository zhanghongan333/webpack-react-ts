import React, {
  useState,
  memo,
  useMemo,
  useCallback,
  useReducer,
  createContext,
  useContext
} from 'react'

const initialState = 0

export interface StateProps {
  number: number
}

export interface CounterProps {
  state: any
  dispatch: any
}

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'ADD':
      return { number: state.number + 1 }
    default:
      break
  }
}
const CounterContext = createContext({} as CounterProps)
// 第一种获取 CounterContext方法：不使用 hook
// function SubCounter_one() {
//   return (
//     <CounterContext.Consumer>
//       {(value: any) => (
//         <>
//           <p>{value.state.number}</p>
//           <button onClick={() => value.dispatch({ type: 'ADD' })}>+</button>
//         </>
//       )}
//     </CounterContext.Consumer>
//   )
// }
function SubCounter() {
  const { state, dispatch } = useContext(CounterContext)
  return (
    <>
      <p>{state.number}</p>
      <button onClick={() => dispatch({ type: 'ADD' })}>+</button>
    </>
  )
}
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState, () => ({ number: initialState }))
  console.log(state, 'state')
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      <SubCounter></SubCounter>
    </CounterContext.Provider>
  )
}
export default Counter
