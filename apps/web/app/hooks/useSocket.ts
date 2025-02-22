"use client"
import {  GroupInfoCount, sendData, sendTypes, } from "@repo/types";
import { useState, useEffect, useCallback, use } from "react";
import { checkUser } from "../action/checkUser";
import { useDispatch, useSelector } from "react-redux";
import { pushGroup, pushOneGr ,deleteMembers, updateCount, updateDate,deleteGroup, addMembers} from "../store/groupList";
import { detailsUpdate } from "../store/userDetails";
import { pushMessage, pushMessageList } from "../store/messageList";
import { RootState } from "../store/store";
export function useSocket() : {ws : WebSocket | null,  sendWs: (data: string) => void} {
    console.log("useSocket")
    const selectedGroup = useSelector((state: RootState)=> state.selectedGroup.groupInfo)
    const [ws,setws] = useState<WebSocket | null>(null)
    const dispatch = useDispatch()
    const sendNotification = useCallback((title: string,body : string)=>{
        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                  new Notification(title, {
                    body: body,
                    icon: "/icon.png", // Optional icon
                  });
              }
            });
          } else {
            console.log("Browser does not support notifications.");
        }
    },[])
    useEffect(() => {
        async function wsConnection() {
            console.log("useSocket-effect")
            const detail= await checkUser();
            const websocket= new WebSocket(`ws://localhost:8080?token=${detail?.token}`)
            dispatch(detailsUpdate({userid : detail?.user.userid ?? '', fullname : detail?.user.fullname ?? ''}))
            websocket.onopen =()=>{ 
                console.log("connection established")
                setws(websocket)
                // dispatch(wsUpdate({ws : websocket}));
            }
            
        }
        wsConnection()
    }, [])

    useEffect(()=>{
        if(ws){
            ws.onmessage = (msg)=>{
                let data :sendData= JSON.parse(msg.data)
                switch (data.kind){
                    case sendTypes.groupList : {
                        dispatch(pushGroup({list: data.groupList as GroupInfoCount[]}))
                        break;
                    }
                    case sendTypes.chat : {
                        console.log(selectedGroup)
                        if(!selectedGroup){
                            console.log("in updateCount !")
                            dispatch(updateCount({groupid : data.message.groupid}))
                        }
                        else if(selectedGroup?.groupid !== data.message.groupid){
                            console.log(selectedGroup?.groupid !== data.message.groupid)
                            console.log("in updateCount")
                            dispatch(updateCount({groupid : data.message.groupid})) 
                        }
                        dispatch(updateDate({groupid : data.message.groupid, time : data.message.time}))
                        dispatch(pushMessage({groupid : data.message.groupid, msg : data.message}))
                        break;
                    }
                    case sendTypes.sendFetchedMsg : {
                        console.log(data)
                        dispatch(pushMessageList({groupid : data.groupid , list : data.messageList}))
                        break;
                    }
                    case sendTypes.createdGroup : {
                        dispatch(pushOneGr({group : data.groupInfo as GroupInfoCount}))
                        sendNotification('Created New Group',`${data.groupInfo.groupName} is crated and you are admin of the group`)
                        break;
                    }
                    case sendTypes.addminNotificationRemovedUser: {
                        console.log(data)
                        let name = '';
                        data.deletedUser.forEach((user,index)=>{
                            name += user.fullname
                            if(index !== data.deletedUser.length-1){
                                name += ','
                            }
                        })
                        sendNotification("You are removed by the admin",`${name} are removed from ${data.groupName}`)                        
                        dispatch(deleteMembers({groupid : data.groupid,delUser : data.deletedUser}))
                        break;
                    }

                    case sendTypes.addminNotificationAddedUser : 
                    {
                        let name = '';
                        data.newmember.forEach((user,index)=>{
                            name += user.fullname
                            if(index !== data.newmember.length-1){
                                name += ','
                            }
                        })
                        dispatch(addMembers({groupid : data.groupid, members : data.newmember}))
                        sendNotification("You added new memebers in group",`${name} are added in ${data.groupName}`)
                        break;
                    }

                    case sendTypes.addedInGroup : {
                        dispatch(pushOneGr({group : {...data.groupInfo,count : 0}}))
                        sendNotification("Added in Group",`You are added in ${data.groupInfo.groupName}`)
                        break;
                    }
                    case sendTypes.leftGroup : {
                        dispatch(deleteGroup({groupid : data.groupid}))
                        sendNotification("Left Group",`You are left from ${data.groupName}`)
                        break;
                    }

                    case sendTypes.reportRemoved : {
                        dispatch(deleteGroup({groupid : data.groupid}))
                        sendNotification("You are removed by  the admin",`Group ${data.groupName} is removed`)
                        break;
                    }
                    case sendTypes.sendError : {
                        alert(data.msg)
                        break;
                    }
                    

                    default : {
                        console.log(data)
                    }
                }
            }
        }
    },[ws,selectedGroup])

    const sendWs  = useCallback((data : string)=>{
        console.log("in sendWs")
        ws?.send(data)
    },[ws])
    return { ws ,sendWs}
}