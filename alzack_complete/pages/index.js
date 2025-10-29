import Link from 'next/link'
export default function Home(){ return (<div style={{padding:40}}><h1>Alzack</h1><ul><li><Link href='/auth/signup?role=PATIENT'>Patient Signup</Link></li><li><Link href='/auth/signup?role=CAREGIVER'>Caregiver Signup</Link></li><li><Link href='/auth/login'>Login</Link></li></ul></div>) }
