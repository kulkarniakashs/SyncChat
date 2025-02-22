'use client'

import { memo, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { MessageCircle, Search, MessageSquare } from 'lucide-react'
import { fetchUsers } from '~/app/action/fetchUsers'
import { data, types } from '@repo/types'

interface User {
  userid: string
  fullname: string
  email: string
}

function privateChat({sendWs}:{sendWs:(data:string)=>void}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [users,setUsers] = useState<User[]>()
  const [debounced, setDebounced] = useState('')

  useEffect(()=>{
    const timer = setTimeout(()=>{
      setDebounced(searchTerm)
    },500)
    return ()=>{
      clearTimeout(timer)
    }
  },[searchTerm])

  useEffect(()=>{
    fetchUsers(debounced).then((data)=>{
      setUsers(data)
    })
  },[debounced])

  const filteredUsers = users?.filter(user => 
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleMessageUser = (user : User) => {
    sendWs(JSON.stringify({
        kind : types.createPrivateChat,
        userid : user.userid,
        fullname : user.fullname
    }as data))
  }
  return (
    <div className="absolute bottom-4 right-4 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Open users chat</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chat with Users</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {filteredUsers?.map((user) => (
                <div
                  key={user.userid}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {user.fullname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullname}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMessageUser(user)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Message {user.fullname}</span>
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default memo(privateChat)