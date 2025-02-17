"use client"
import { data, GroupInfo, sendData, sendTypes, } from "@repo/types";
import { useState, useEffect, useCallback } from "react";
import { checkUser } from "../action/checkUser";
import { useDispatch } from "react-redux";
import { pushGroup, pushOneGr } from "../store/groupList";
import { detailsUpdate } from "../store/userDetails";
import { pushMessage, pushMessageList } from "../store/messageList";
import { group } from "console";
export function useSocket() : {ws : WebSocket | null,  sendWs: (data: string) => void} {
    console.log("useSocket")
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
            websocket.onmessage = (msg)=>{
                let data :sendData= JSON.parse(msg.data)
                switch (data.kind){
                    case sendTypes.groupList : {
                        dispatch(pushGroup({list : data.groupList}))
                        break;
                    }
                    case sendTypes.chat : {
                        dispatch(pushMessage({groupid : data.message.groupid, msg : data.message}))
                        break;
                    }
                    case sendTypes.sendFetchedMsg : {
                        console.log(data)
                        dispatch(pushMessageList({groupid : data.groupid , list : data.messageList}))
                        break;
                    }
                    case sendTypes.createdGroup : {
                        dispatch(pushOneGr({group : data.groupInfo}))
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

                    case sendTypes.addminNotificationAddedUser : {
                        let name : string = '';
                        data.newmember.forEach(val=>name = name+val.fullname+',')
                        console.log("name",name)
                        console.log(data)
                        if ("Notification" in window) {
                            Notification.requestPermission().then((permission) => {
                              if (permission === 'granted') {
                                  new Notification(data.groupName, {
                                    body: `Successfull Added User\n${name}`,
                                    icon: "/icon.png", // Optional icon
                                  });
                              }
                            });
                          } else {
                            console.log("Browser does not support notifications.");
                          }
                        break;
                    }

                    default : {
                        console.log(data)
                    }
                }
            }
        }
        wsConnection()
    }, [])

    const sendWs  = useCallback((data : string)=>{
        console.log("in sendWs")
        ws?.send(data)
    },[ws])
    return { ws ,sendWs}
}