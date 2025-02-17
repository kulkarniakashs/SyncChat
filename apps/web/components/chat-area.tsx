'use client'
import React,{useRef } from 'react'
import MessageList from './message-list'
import MessageInput from './message-input'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import GroupTitle from './GroupTitle'

function ChatArea({ sendWs }: { sendWs: (data: string) => void }) {
  const messageListRef = useRef<HTMLDivElement>(null)
  const groupInfo = useSelector((state : RootState)=>state.selectedGroup.groupInfo)
  if(!groupInfo){
    return <div></div>
  }

  return (
    <div className="flex flex-col max-h-screen h-full w-full">
      <div className="p-4 border-b">
      <GroupTitle sendWs={sendWs}/>
      </div>
      <div ref={messageListRef} className="flex-grow overflow-auto">
        <MessageList sendWs = {sendWs} />
      </div>
      <div className='h-1/5'>
        <MessageInput sendWs={sendWs} />
      </div>
    </div>
  )
}

export default React.memo(ChatArea)