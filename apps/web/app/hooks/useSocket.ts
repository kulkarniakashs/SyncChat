"use client"
import {  GroupInfoCount, sendData, sendTypes, } from "@repo/types";
import { useState, useEffect, useCallback } from "react";
import { checkUser } from "../action/checkUser";
import { useDispatch, useSelector } from "react-redux";
import { pushGroup, pushOneGr ,deleteMembers, updateCount, updateDate} from "../store/groupList";
import { detailsUpdate } from "../store/userDetails";
import { pushMessage, pushMessageList } from "../store/messageList";
import { RootState } from "../store/store";
export function useSocket() : {ws : WebSocket | null,  sendWs: (data: string) => void} {
    console.log("useSocket")
    const selectedGroup = useSelector((state: RootState)=> state.selectedGroup.groupInfo)
    const [ws,setws] = useState<WebSocket | null>(null)
    const dispatch = useDispatch()
    useEffect(() => {
        async function wsConnection() {
            console.log("useSocket-effect")
            const detail= await checkUser();
            const websocket= new WebSocket(`ws://localhost:8080?token=${detail?.token}`)
            dispatch(detailsUpdate({userid : detail?.user.userid ?? '', fullname : detail?.user.fullname ?? ''}))
            websocket.onopen =()=>{ 
                console.log("connection established")
                setws(websocket)
                const sendNotification = () => {
                    if ("Notification" in window) {
                      Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                            new Notification("Hello!", {
                              body: "This is your Windows notification.",
                              icon: "/icon.png", // Optional icon
                            });
                        }
                      });
                    } else {
                      console.log("Browser does not support notifications.");
                    }
                  };

                sendNotification()
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
                        if ("Notification" in window) {
                            Notification.requestPermission().then((permission) => {
                              if (permission === "granted") {
                                  new Notification(data.groupInfo.groupName, {
                                    body: "Group is Successfully Created.",
                                    icon: "/icon.png", // Optional icon
                                  });
                              }
                            });
                          } else {
                            console.log("Browser does not support notifications.");
                        }
                        break;
                    }
                    case sendTypes.addminNotificationRemovedUser: {
                        console.log(data)
                        dispatch(deleteMembers({groupid : data.groupid,delUser : data.deletedUser}))
                        break;
                    }

                    case sendTypes.addminNotificationAddedUser : {
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