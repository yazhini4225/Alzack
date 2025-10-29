import {useEffect,useState} from 'react'
export default function Memory(){ const [e,setE]=useState([]); useEffect(()=>{ fetch('/api/memory').then(r=>r.json()).then(j=>setE(j)) },[]); return (<div style={{padding:20}}><h2>Memory Book</h2><ul>{e.map(i=><li key={i.id}><strong>{i.name}</strong> ({i.relationship})<p>{i.story}</p></li>)}</ul></div>) }
