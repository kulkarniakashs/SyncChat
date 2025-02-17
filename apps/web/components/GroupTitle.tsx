import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import AddUsersDialog from './AddUsers'
function GroupTitle({sendWs}:{sendWs: (data:string)=>void}) {
    const group = useSelector((state : RootState)=>state.selectedGroup.groupInfo)
  return (
    <div className='w-full max-h-[5vh] grid grid-cols-10'>
        <div className='col-span-7 flex justify-start items-center gap-4'>
        <div>
           <Avatar className="h-12 w-12">
              <AvatarImage src={group?.groupid} alt={group?.groupName} />
              <AvatarFallback>{group?.groupName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            </div>
            <div>
            <h1>{group?.groupName}</h1>
            <p>{group?.About}</p>
            </div>
        </div>

        <div className='col-span-1'>
            <AddUsersDialog sendWs={sendWs}/>
        </div>
    </div>
  )
}

export default React.memo(GroupTitle)