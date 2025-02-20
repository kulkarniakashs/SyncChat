"use client"
import React,{ useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { UserMinus, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import { data, member, types } from '@repo/types'

function RemoveUserDialog({sendWs}: {sendWs:(data:string)=>void}) {
  const SelectedGroup = useSelector((state : RootState)=>state.selectedGroup)
  const members = useSelector((state:RootState)=>state.groupList.groupList.find(group=>group.groupid === SelectedGroup.groupInfo?.groupid)?.members)
  const [users,setUser] = useState<member[]>(members||[])
  const [open, setOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setUser(members || [])
  },[members])

  const filteredUsers = (users || []).filter(user => 
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onRemoveUsers = (list :string[])=>{
    sendWs(JSON.stringify({
      kind :types.removeUser,
      groupid : SelectedGroup.groupInfo?.groupid,
      delUser : list
    }as data))
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleRemoveUsers = () => {
    onRemoveUsers(selectedUsers)
    setSelectedUsers([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <UserMinus className="mr-2 h-4 w-4" />
          Remove Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Users from Group</DialogTitle>
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
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredUsers.map(user => (
              <div key={user.userid} className="flex items-center space-x-4 rounded-md p-2 hover:bg-muted">
                <Checkbox
                  id={`user-${user.userid}`}
                  checked={selectedUsers.includes(user.userid)}
                  onCheckedChange={() => toggleUserSelection(user.userid)}
                />
                <label
                  htmlFor={`user-${user.userid}`}
                  className="flex flex-1 items-center space-x-3 cursor-pointer"
                >
                  <Avatar>
                    <AvatarFallback>{user.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullname}</p>
                  </div>
                </label>
              </div>
            ))}
          </ScrollArea>
        </div>
        <Button
          onClick={handleRemoveUsers}
          disabled={selectedUsers.length === 0}
        >
          Remove Selected Users ({selectedUsers.length})
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveUserDialog