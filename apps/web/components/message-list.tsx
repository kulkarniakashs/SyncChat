"use client"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useSelector } from "react-redux"
import { RootState } from "~/app/store/store"
import { data, types } from "@repo/types";
import React,{ useEffect, useRef } from "react";


function MessageList({sendWs}: {sendWs : (data : string)=>void}) {
  const userDetails = useSelector((state: RootState)=> state.userDetails);
  const ref = useRef<null | HTMLDivElement>(null)
  const selectedGroup  = useSelector((state : RootState)=>state.selectedGroup.groupInfo?.groupid)
  const messages = useSelector((state:RootState)=>state.messageList[selectedGroup ? selectedGroup : ''])
  useEffect(() => {
    console.log("1e1")
    console.log(messages?.length)
    if(selectedGroup && (messages?.length === 0|| messages===undefined)){
      console.log("hi in fecth")
      sendWs(JSON.stringify({
        kind : types.fetchMessage,
        groupid : selectedGroup,
        skip : 0
      }as data))
    }
  }, [selectedGroup])

  useEffect(()=>{
    if(ref.current){
      ref.current.scrollIntoView({behavior : "smooth"})
    }
  },[messages])

  
  return (
    <ScrollArea className="flex-grow p-4 h-full min-h-[80vh]">
      {messages && messages.map((message) => (
        <div 
          ref={ref}
          key={Math.random().toString()}
          className={`flex mb-4 ${message.authorid === userDetails.userid ? 'justify-end' : 'justify-start'}`}
        >
          {message.authorid !== userDetails.userid && (
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{message.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div className={`rounded-lg p-3 max-w-[70%] ${
            message.authorid === userDetails.userid ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {message.authorid !== userDetails.userid && (
              <p className="text-xs font-medium mb-1">{message.fullname}</p>
            )}
            <p>{message.text}</p>
            <p className="text-xs mt-1 opacity-70">
              {(new Date(message.time)).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </ScrollArea>
  )
}
export default React.memo(MessageList)