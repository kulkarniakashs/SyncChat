"use client"
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '~/app/store/store'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import  GroupOptionsMenu  from './group-option'
function GroupTitle({sendWs}:{sendWs: (data:string)=>void}) {
    const userDetails = useSelector((state :RootState)=>state.userDetails)
    const group = useSelector((state : RootState)=>state.selectedGroup.groupInfo)
    let groupName = group?.groupName.replace('&','').replace(userDetails.fullname||' ','')
  return (
    <div className='w-full max-h-[10vh] h-10vh flex justify-between items-center'>
        <div className='col-span-7 flex justify-start items-center gap-4'>
        <div>
           <Avatar className="">
              <AvatarFallback>{(groupName||'').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            </div>
            <div>
            <h1>{groupName}</h1>
            <p>{group?.About}</p>
            </div>
        </div>

        <div className=''>
            <GroupOptionsMenu sendWs={sendWs} isAdmin={group?.adminid === userDetails.userid}  />
        </div>
    </div>
  )
}

export default React.memo(GroupTitle)