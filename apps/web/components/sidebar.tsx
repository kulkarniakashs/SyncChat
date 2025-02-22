'use client'
import React,{ use, useState } from 'react'
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Input } from "./ui/input"
import { Search, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import { GroupInfo, GroupInfoCount } from '@repo/types'
import { update } from '~/app/store/selectedGroup'
import CreateGroup from './create-Group'
import { zeroCount } from '~/app/store/groupList'
import PrivateChat from './private-chat'
function Sidebar({sendWs}: {sendWs : (data:string)=>void}) {
  console.log('Sidebar')
  const groups = useSelector((state : RootState)=>state.groupList.groupList)
  const selectedGroup = useSelector((state:RootState)=>state.selectedGroup.groupInfo)
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('')
  const userDetails = useSelector((state: RootState) => state.userDetails.fullname)
  let filteredGroups = groups.filter(group => 
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  )
 
  filteredGroups = [...filteredGroups].sort((a, b) => {
    if ((b.count || 0) !== (a.count || 0)) {
      return (b.count || 0) - (a.count || 0); // Sort by unseen messages
    }
    return new Date(b.lastMessage || "").getTime() - new Date(a.lastMessage || "").getTime(); // Sort by latest message
  });

  const handleGroupClick = (group:GroupInfoCount) => {
    // router.push(`/group/${groupId}`)
    dispatch(zeroCount({groupid : group.groupid}))
    dispatch(update({groupInfo : group}))
  }

  return (
    <div className="w-full min-w-[30vw] md:w-80 h-screen border-r bg-background flex flex-col relative">
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
            className={`flex items-center justify-between p-2 cursor-pointer border-class transition-colors ${(selectedGroup?.groupid === group.groupid) ? 'bg-gray-200': 'hover:bg-muted/50'}`}
            onClick={() => handleGroupClick(group)}
          >
            <div className='flex items-center justify-start p-4'>
            <Avatar className="h-12 w-12">
              <AvatarFallback>{group.groupName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{group.isPrivate ? group.groupName.replace(userDetails||'','').replace('&','') :group.groupName}</p>
              <p className="text-sm text-muted-foreground">{group.About}</p>
            </div>
            </div>
           {
            (group.count || 0)>0 && <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-6 w-6">
              {group.count} 
            </div>
           }
          </div>
        ))}
      </ScrollArea>
      <PrivateChat sendWs={sendWs}/>
    </div>
  )
}

export default React.memo(Sidebar)