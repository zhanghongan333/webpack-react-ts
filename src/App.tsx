import './public-path'
import React, { lazy, Suspense, useState } from 'react'
// import '@/app.css'
import '@/app.less'
import '@/app.scss'
// import smallImg from '@/assets/images/4kb.png'
// import bigImg from '@/assets/images/22kb.png'
// import { Demo1, Demo2 } from '@/components'
// const LazyDemo = lazy(() => import('@/components/lazyDemo')) //使用import语法配合react的lazy动态引入资源

// function App() {
//   const [count, setCounts] = useState('')
//   const [show, setShow] = useState(false)
//   const onChange = (e: any) => {
//     setCounts(e.target.value)
//   }
//   const onClick = () => {
//     import('./app.css')
//     setShow(true)
//   }
//   return (
//     <>
//       <img src={smallImg} alt='小于10kb' />
//       <img src={bigImg} alt='大于10kb' />
//       <div className='smallImg'></div>
//       <div className='bigImg'></div>
//       <h2>webpack5-react-ts</h2>
//       <p>受控组件</p>
//       <input type='text' value={count} onChange={onChange} />
//       <br />
//       <p>非受控组件</p>
//       <input type='text' />
//       <Demo1></Demo1>
//       <h2 onClick={onClick}>展示</h2>
//       {show && (
//         <Suspense fallback={null}>
//           <LazyDemo />
//         </Suspense>
//       )}
//     </>
//   )
// }
import sourceData from './test/data.json'
import LineageGraph from './components/LineageGraph'
function App() {
  const [layout, setLayout] = useState('vertical')
  const [lineageData, setLineageData] = useState<any>()
  const [nodeSize, setNodeSize] = useState(0)
  const [nodeLevel, setNodeLevel] = useState(0)
  const [highlightColor, setHighlightColor] = useState<string>('red')
  const [textWaterMarker, setTextWaterMarker] = useState<string>('OpenLineage')
  const handleParseSql = () => {
    setLineageData(sourceData.data)
  }
  return (
    <div>
      <button onClick={handleParseSql}>解析</button>
      <LineageGraph
        layout={layout}
        lineageData={lineageData}
        setNodeSize={setNodeSize}
        setNodeLevel={setNodeLevel}
        highlightColor={highlightColor}
        textWaterMarker={textWaterMarker}
      />
    </div>
  )
}
export default App
