"use client"
import React from 'react'
import ChatArea from '~/components/chat-area'
import Sidebar from '~/components/sidebar'
import { useSocket } from './hooks/useSocket'
function page() {
  const {sendWs} = useSocket();
  return (
    <div className='flex'>
      <Sidebar sendWs={sendWs}/>
      <ChatArea sendWs = {sendWs} />
    </div>
  )
}

export default page