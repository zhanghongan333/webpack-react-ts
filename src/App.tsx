import React,{useState} from 'react'
import './app.css'
import './app.less'
import './app.scss'
import smallImg from './assets/images/4kb.png'
import bigImg from './assets/images/22kb.png'

function App(){
    const [count ,setCounts] = useState('')
    const onChange=(e:any)=>{
        setCounts(e.target.value)
    }
    return (
        <>
        <img src={smallImg} alt="小于10kb" />
        <img src={bigImg} alt="大于10kb" />
        <div className="smallImg"></div>
        <div className="bigImg"></div>
         <h2>webpack5-react-ts</h2>
         <p>受控组件</p>
         <input type="text" value={count} onChange={onChange} />
         <br />
         <p>非受控组件</p>
         <input type="text" />
        </>
    )
}
export default App