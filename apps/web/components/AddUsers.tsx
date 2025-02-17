'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Check, Search as SearchIcon, UserPlus } from 'lucide-react'
import { fetchUsers } from '~/app/action/fetchUsers'
import { data, types } from '@repo/types'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'

interface User {
  userid: string
  fullname: string
  email: string
}

 function AddUsersDialog({sendWs}: {sendWs:(data:string)=>void}) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [Search,setSearch] = useState('')
  const [filteredUsers,setfilteredUsers]= useState<User[]>([])
  const group = useSelector((state:RootState)=>state.selectedGroup.groupInfo)
  useEffect(() => {
    const handler = setTimeout(() => {
        setSearch(searchTerm)
    }, 300);
    return ()=>{
        clearInterval(handler)
    }
  }, [searchTerm])
  
  useEffect(() => {
    fetchUsers(Search).then((list)=>{
        setfilteredUsers(list)
    })
  }, [Search])
  

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => 
      prev.some(u => u.userid === user.userid)
        ? prev.filter(u => u.userid !== user.userid)
        : [...prev, user]
    )
  }

  const handleAddUsers = () => {
    // Here you would typically send the selected users to your backend or parent component
    console.log('Selected users:', selectedUsers)
    let temp = selectedUsers.map(val=>val.userid)
    if(selectedUsers.length>0){
        sendWs(JSON.stringify({
            kind : types.addInGroup,
            groupid : group?.groupid,
            groupName : group?.groupName,
            addUser : temp
        }as data))
    }
    // Reset selection after adding
    setSelectedUsers([])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Users</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredUsers.map(user => (
              <div
                key={user.userid}
                className="flex items-center space-x-4 rounded-md p-2 hover:bg-muted cursor-pointer"
                onClick={() => toggleUserSelection(user)}
              >
                <Avatar>
                  <AvatarImage src={user.fullname} alt={user.fullname} />
                  <AvatarFallback>{user.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullname}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                {selectedUsers.some(u => u.userid === user.userid) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        <Button onClick={handleAddUsers} disabled={selectedUsers.length === 0}>
          Add Selected Users ({selectedUsers.length})
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(AddUsersDialog)