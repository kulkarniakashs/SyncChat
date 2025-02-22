import React, { useState } from 'react'
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { data, types } from '@repo/types'
function createGroup({sendWs}: {sendWs : (data:string)=>void}) {
    const [groupName,setGroupName] = useState<string>() 
    const [About , setAbout ] = useState('')
    const [open, setOpen] = useState(false)
    const handleSubmit = ()=>{
        console.log('creating Group')
       if(groupName != '' && About !=''){
        sendWs(JSON.stringify({
            kind : types.createGroup,
            groupAbout : About,
            groupName : groupName
        } as data))
       }
       else {
        alert('Group name and About should not be empty');
       }
      setOpen(false);
    }
  return (
    <Dialog open= {open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Create a new Group to chat with friends
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name"  className="col-span-3" onChange={e=>setGroupName(e.target.value)}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              About
            </Label>
            <Input id="username"  className="col-span-3" onChange={(e)=>setAbout(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(createGroup);