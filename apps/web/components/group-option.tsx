"use client"
import  React,{ useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { MoreVertical } from 'lucide-react'
import RemoveUserDialog  from './remove-user-dialog'
import { LeaveGroupDialog } from './leave-group'
import AddUsers from './AddUsers'

interface User {
  id: string
  name: string
  avatar: string
}

interface GroupOptionsMenuProps {
  isAdmin: boolean
  groupUsers: User[]
  onRemoveUser: (userId: string) => void
  onLeaveGroup: () => void,
  sendWs : (data:string)=>void
}

function GroupOptionsMenu({ isAdmin, groupUsers, onRemoveUser, onLeaveGroup ,sendWs}: GroupOptionsMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isAdmin && (
          <DropdownMenuItem onSelect={(e : any ) => e.preventDefault()}>
            <RemoveUserDialog sendWs={sendWs}/>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem onSelect={(e : any ) => e.preventDefault()}>
            <AddUsers sendWs={sendWs}/>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={(e: any) => e.preventDefault()}> 
          <LeaveGroupDialog sendWs={sendWs} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default React.memo(GroupOptionsMenu)