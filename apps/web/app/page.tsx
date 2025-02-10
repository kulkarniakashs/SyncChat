"use client"
import React, { useEffect } from 'react'
import { checkUser } from './action/checkUser'
function page() {
  async function main(){
    const token =await checkUser();
    console.log(token);
    const socket = new WebSocket(`ws://localhost:8080?token=${token}`);
    socket.onopen = ()=>{
      console.log("connected")
    }
    socket.onclose =()=>{
      console.log("dis")
    }
  }
  useEffect(() => {
    main();
  }, [])
  
  return (
    <div>
      
    </div>
  )
}

export default page