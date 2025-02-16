import {WebSocketServer} from 'ws';
import {data,types,UserPayload,customWS, GroupInfo, sendTypes, sendData, message} from "@repo/types"
import { prisma } from '@repo/prisma';
import { isAdmin, listGroups, listGroupsWithInfo,isAdminAndisPrivate } from './func';
import jwt from "jsonwebtoken";
import PubSubManager from './PubSubManager';
import {createClient} from "redis"

const redisClient = createClient();
redisClient.connect();
const PubSub = PubSubManager.getInstance();
const wss = new WebSocketServer({port: 8080});
wss.on('connection',async function(ws:customWS,request:any){
    console.log("new Clinet connected")
    let token = new URL(request.url!, `http://${request.headers.host}`).searchParams.get("token");

    if (!token) {
      ws.close(4001, "Token required");
      return;
    }
  
    try {
      console.log("token:",token)
      const user: UserPayload = jwt.verify(token,'secret') as UserPayload;
      console.log(user)
      ws.user = user; // ✅ TypeScript will now recognize 'user'
      console.log("User connected:", user);
      ws.user.list = await listGroupsWithInfo(ws.user.userid);
      ws.user.list.forEach(obj => {
          PubSub.userSubscribe(ws,obj.groupid);
      })
      ws.send(JSON.stringify({
        kind : sendTypes.groupList,
        groupList: ws.user.list
      } as sendData))
      PubSub.getInfo()
      ws.on('message',async function(rawDAta,isBinary){
        let rawText = rawDAta.toString();
        let data: data= JSON.parse(rawText);
        switch (data.kind){
            case types.createAccount:
                console.log("reached create account")
                try{
                await prisma.users.create({
                    data : {
                        fullname : data.fullName,
                        email : data.email, 
                    }
                })
                ws.send(JSON.stringify({
                    msg : "Account has been created"
                }),{binary : isBinary})
                }
                catch(e:any){
                    console.log(e)
                    // ws.send(e)
                    ws.send(JSON.stringify({
                        kind : sendTypes.sendError,
                        msg :`code${e.code} error at ${e.meta}`
                    } as sendData))
                }
                break;
            case types.createGroup: {
                console.log("message",data)
                try {
                    let response = await prisma.groups.create({
                        data : {
                            groupName : data.groupName ,
                            adminId : ws.user.userid,
                            About : data.groupAbout ,
                            members : {
                                create : {
                                    userid : ws.user.userid
                                }
                            }
                        },
                        select : {
                            groupid : true,
                            groupName : true,
                            About : true,
                            isPrivate : true,
                            Admin : {
                                select : {
                                    userid : true,
                                    fullname : true,
                                }
                            },
                            members : {
                                select : {
                                    joinedAt : true
                                }
                            }
                        }
                    })

                    let groupInfo : GroupInfo = {
                        About : response.About,
                        groupid : response.groupid,
                        groupName : response.groupName,
                        adminid : response.Admin.userid,
                        adminname : response.Admin.fullname,
                        joinedAt : response.members[0]?.joinedAt,
                        isPrivate : response.isPrivate,
                        members : [{userid : ws.user.userid,fullname:ws.user.fullname}],
                    }
                    ws.user.list.push(groupInfo);
                    console.log("response of group create",response)
                    ws.send(JSON.stringify({
                        kind : sendTypes.createdGroup,
                        groupInfo : {...groupInfo}
                    } as sendData))
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        kind : sendTypes.sendError,
                        msg :`code${e.code} error at ${e.meta}`
                    } as sendData),{binary: isBinary})
                } 
                break;
            }
            case types.addInGroup :{
                try {
                    console.log("in addInGroup")
                    if(! await isAdminAndisPrivate(ws.user.userid,data.groupid,ws.user.list)){
                        ws.send(JSON.stringify({
                            kind : sendTypes.sendError,
                            msg : "You are not a admin or this is private chat."
                        } as sendData))
                        break;
                    }
                    let temp = await prisma.memberships.create({
                        data : {
                            groupid : data.groupid ,
                            userid : data.addUser,
                            
                        },
                        select : {
                            joinedAt : true,
                            Group : {
                                select : {
                                    groupid : true,
                                    groupName : true,
                                    About : true,
                                    isPrivate : true,
                                    Admin : {
                                        select : {
                                            userid : true,
                                            fullname : true,   
                                        }
                                    },
                                    members : {
                                        select : {
                                            member : {
                                                select : {
                                                    userid : true,
                                                    fullname : true,
                                                }
                                            }  
                                        }
                                    }
                                }
                            }
                        }
                    })
                    let groupInfo : GroupInfo = {
                        groupid : temp.Group.groupid,
                        groupName : temp.Group.groupName,
                        About : temp.Group.About,
                        adminid : temp.Group.Admin.userid,
                        adminname : temp.Group.Admin.fullname,
                        joinedAt : temp.joinedAt,
                        members : temp.Group.members.map(mem => mem.member),
                        isPrivate : temp.Group.isPrivate
                    }
                    console.log("temp",temp)           
                    let addws = [...wss.clients].find((ws ) => (ws as customWS).user.userid === data.addUser);
                    if(addws){
                        PubSub.userSubscribe(addws as customWS,data.groupid);
                        (addws as customWS).user.list.push(groupInfo);
                        addws.send(JSON.stringify({
                            kind : sendTypes.addedInGroup,
                            groupInfo : {...groupInfo}
                        } as sendData ))
                        PubSub.getInfo();
                    }
                    ws.send(JSON.stringify({
                       kind : sendTypes.addminNotificationAddedUser,
                       groupid: groupInfo.groupid,
                       groupName : groupInfo.groupName,
                       userid :data.addUser,
                       fullname : (addws as customWS).user.fullname
                    } as sendData)) 
                }catch(e:any){
                    ws.send(JSON.stringify({
                        kind : sendTypes.sendError,
                        msg :JSON.stringify(e)
                    } as sendData),{binary: isBinary})
                }
            }   break;
            case types.removeUser :{
                try {
                    let isAdmin1 : boolean = await isAdmin(ws.user.userid,data.groupid,ws.user.list);
                    console.log("isAdmin",isAdmin1)
                    if(isAdmin1){
                       await prisma.memberships.delete({
                        where : {
                            userid_groupid: { 
                                userid: data.delUser,
                                groupid: data.groupid
                            }
                        }
                       })
                    let removeUser : customWS = [...wss.clients].find((val) => (val as customWS).user.userid === data.delUser) as customWS;
                    removeUser.send(JSON.stringify({kind: sendTypes.reportRemoved , groupid : data.groupid} as sendData))
                    PubSub.userUnsubscribe(removeUser,data.groupid);
                    ws.send(JSON.stringify({kind : sendTypes.successfullyRemoved,deleteUser: data.delUser,delName:removeUser.user.fullname,groupid:data.groupid}as sendData))
                    break;
                   }
                   else {
                    throw new Error("You are not admin")
                   }
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        kind: sendTypes.sendError,
                        msg :JSON.stringify(e)
                    }as sendData),{binary: isBinary})
                }
                break;
            }

            case types.leaveGroup : {
                try {
                    let response = await prisma.memberships.delete({
                        where : {
                            userid_groupid : {
                                userid : ws.user.userid,
                                groupid : data.groupid
                            }
                        },
                        select : {
                            Group : {
                                select : {
                                    groupid : true,
                                    groupName : true
                                }
                            }
                        }
                })
                ws.send(JSON.stringify({kind : sendTypes.leftGroup,...response.Group} as sendData))
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        kind : sendTypes.sendError,
                        msg :JSON.stringify(e)
                    } as sendData),{binary: isBinary})
                }
                break;
            }

            case types.reportActive : {
                const list = await listGroups(ws.user.userid);
                list.forEach(obj => {
                    PubSub.userSubscribe(ws,obj.groupid);
                })
                PubSub.getInfo()
                break;
            }

            case types.sendMessage : {
                let gr = ws.user.list.find(val => val.groupid === data.message.groupid)
                if(!gr){
                    ws.send(JSON.stringify({
                        kind : sendTypes.sendError,
                        msg : "You are not in group"
                    } as sendData))
                    break;
                }
                console.log("in message send")
                data.message.authorid = ws.user.userid;
                data.message.fullname = ws.user.fullname;
                console.log(data.message)
                let msg = JSON.stringify({
                   kind : sendTypes.chat,
                   message : data.message
                } as sendData)
                redisClient.publish(data.message.groupid,msg);
                redisClient.lPush('msg_queue',JSON.stringify(data.message))
                break;        
            }

            case types.createPrivateChat : {
                let response = await prisma.groups.create({
                    data : {
                        groupName : ws.user.fullname + '&' + data.fullname,
                        adminId : ws.user.userid,
                        isPrivate : true,
                        About: `${ws.user.fullname} & ${data.fullname}`,
                        members : {
                            createMany : {
                                data : [
                                    {userid : ws.user.userid},
                                    {userid : data.userid}
                                ]
                            }
                        }
                    },
                    select : {
                        groupid : true,
                        groupName : true,
                        isPrivate : true,
                        About : true,
                        Admin : {
                            select : {
                                userid : true,
                                fullname : true
                            }
                        },
                        members : {
                            select : {
                                member : {
                                    select : {
                                        userid : true,
                                        fullname : true
                                    }
                                    
                                },
                                joinedAt : true
                            }
                        }
                    }
                })
                let grinfo : GroupInfo  = {
                    About : response.About,
                    adminid : response.Admin.userid,
                    adminname : response.Admin.fullname,
                    groupid : response.groupid,
                    groupName : response.groupName,
                    isPrivate : response.isPrivate,
                    joinedAt : response.members[0]?.joinedAt,
                    members : response.members.map(val=>val.member)
                }
                ws.send(JSON.stringify({
                    kind : sendTypes.addedInGroup,
                    groupInfo : grinfo
                } as sendData))
                break;
            }

            case types.fetchMessage :{
                console.log('fetch request')
                const response = await prisma.messages.findMany({
                    where : {
                        groupid : data.groupid
                    },
                    select : {
                        content : true,
                        time : true,
                        author : {
                            select : {
                                userid : true,
                                fullname : true
                            }
                        },
                        groupid : true
                    },
                    take : 20,
                    skip : data.skip,
                    orderBy : {
                        time : 'desc'
                    }
                })

               const list : message[] = response.map(val=>{
                let r : message = {
                    time : val.time,
                    authorid : val.author.userid,
                    fullname : val.author.fullname,
                    groupid : val.groupid,
                    text : val.content
                }
                return r
               })
               ws.send(JSON.stringify({
                kind: sendTypes.sendFetchedMsg,
                messageList : list
               } as sendData))
            }
        }
    })

    ws.on('close',function(data){
        console.log("closed connection with one user")
        ws.user.list.forEach(obj => {
            PubSub.userUnsubscribe(ws,obj.groupid);
        })
        PubSub.getInfo()
    })
  
    } catch (error) {
      console.log(error);
      ws.close(4002, "Invalid token");
    }
})