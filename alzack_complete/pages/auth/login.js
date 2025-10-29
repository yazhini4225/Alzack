import {useState} from 'react'; import {useRouter} from 'next/router'
export default function Login(){ const r=useRouter(); const [f,setF]=useState({email:'',password:''})
 async function s(e){ e.preventDefault(); const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)}); if(res.ok) r.push('/dashboard'); else { const j=await res.json(); alert('Error: '+j.error) } }
 return (<div style={{padding:20}}><h2>Login</h2><form onSubmit={s}><input placeholder='Email' value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><br/><input type='password' placeholder='Password' value={f.password} onChange={e=>setF({...f,password:e.target.value})}/><br/><button>Login</button></form></div>) }
