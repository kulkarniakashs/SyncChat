import  React,{ useState } from 'react'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Send } from 'lucide-react'
import { data, types } from '@repo/types'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'

interface MessageInputProps {
  onSendMessage: (content: string) => void
}
function MessageInput({sendWs}:{sendWs :(data : string)=>void}) {
  const [newMessage, setNewMessage] = useState('')
  const groupid = useSelector((state : RootState)=> state.selectedGroup.groupInfo?.groupid)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && groupid) {
      sendWs(JSON.stringify({
        kind : types.sendMessage,
        message : {
          groupid : groupid,
          time : new Date()  ,
          text : newMessage
         }
      }as data))
      setNewMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t max-h-[20vh]">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  )
}

export default React.memo(MessageInput)