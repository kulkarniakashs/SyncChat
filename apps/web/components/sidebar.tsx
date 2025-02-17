'use client'
import React,{ useState } from 'react'
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Search, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import { GroupInfo } from '@repo/types'
import { update } from '~/app/store/selectedGroup'
import CreateGroup from './create-Group'
function Sidebar({sendWs}: {sendWs : (data:string)=>void}) {
  const groups = useSelector((state : RootState)=>state.groupList.groupList)
  const selectedGroup = useSelector((state:RootState)=>state.selectedGroup.groupInfo)
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGroups = groups.filter(group => 
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGroupClick = (group:GroupInfo) => {
    // router.push(`/group/${groupId}`)
    dispatch(update({groupInfo : group}))
  }

  return (
    <div className="w-full min-w-[30vw] md:w-80 h-screen border-r bg-background flex flex-col">
      <div className="p-4 border-b flex  items-center justify-between max-h-10vh h-[10vh]">
        <h2 className="text-xl font-semibold mb-2">Chats</h2>
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search groups"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateGroup sendWs={sendWs}/>
        </div>
      </div>
      <ScrollArea className="flex-grow max-h-[90vh]">
        {filteredGroups.map((group) => (
          <div
            key={group.groupid}
            className={`flex items-center p-4 cursor-pointer  transition-colors ${(selectedGroup?.groupid === group.groupid) ? 'bg-gray-200': 'hover:bg-muted/50'}`}
            onClick={() => handleGroupClick(group)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.groupid} alt={group.groupName} />
              <AvatarFallback>{group.groupName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{group.groupName}</p>
              <p className="text-sm text-muted-foreground">{group.About}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

export default React.memo(Sidebar)