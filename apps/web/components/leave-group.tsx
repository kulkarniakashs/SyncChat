'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback} from "./ui/avatar"
import { LogOut } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import { data,types } from '@repo/types'
export function LeaveGroupDialog({sendWs}:{sendWs:(data:string)=>void}) {
  const groupInfo = useSelector((state: RootState) => state.selectedGroup.groupInfo)
  const currentUserId = useSelector((state: RootState) => state.userDetails.userid)
  const [open, setOpen] = useState(false)
  const [selectedNewAdmin, setSelectedNewAdmin] = useState<string>('')
  
  const availableUsers = groupInfo?.members.filter(user => user.userid !== currentUserId)

  const handleLeaveGroup = () => {
    if ((groupInfo?.adminid === currentUserId) && !selectedNewAdmin) {
      return // Don't allow admin to leave without selecting new admin
    }
    setOpen(false)
    setSelectedNewAdmin('')
    sendWs(JSON.stringify({
        kind: types.leaveGroup,
        groupid: groupInfo?.groupid,
        newAdmin: selectedNewAdmin,
    } as data))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full">
          <Button variant="ghost" className="w-full justify-start text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Leave Group
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Group</DialogTitle>
          <DialogDescription>
            {(groupInfo?.adminid === currentUserId)
              ? "As an admin, you need to choose a new admin before leaving the group."
              : "Are you sure you want to leave this group? You won't be able to rejoin unless added by an admin."
            }
          </DialogDescription>
        </DialogHeader>
        {(groupInfo?.adminid === currentUserId) && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select New Admin</h4>
              <Select
                value={selectedNewAdmin}
                onValueChange={setSelectedNewAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new admin" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers && availableUsers.map((user) => (
                    <SelectItem key={user.userid} value={user.userid}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{user.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{user.fullname}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLeaveGroup}
            disabled={(groupInfo?.adminid === currentUserId) && !selectedNewAdmin}
          >
            {(groupInfo?.adminid === currentUserId) ? 'Transfer Admin & Leave' : 'Leave Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}