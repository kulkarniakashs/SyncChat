import {WebSocketServer} from 'ws';
import {data,types,UserPayload,customWS, GroupInfo, sendTypes, sendData, message, member} from "@repo/types"
import { prisma } from '@repo/prisma';
import { isAdmin, listGroups, listGroupsWithInfo,isAdminAndisPrivate } from './func';
import jwt, { JsonWebTokenError } from "jsonwebtoken";
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
                console.log("creating group")
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
                            lastMessage : true,
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
                        lastMessage : response.lastMessage,
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
                    const addInMembers : member[] = [];
                    console.log("in addInGroup")
                    if(! await isAdminAndisPrivate(ws.user.userid,data.groupid,ws.user.list)){
                        ws.send(JSON.stringify({
                            kind : sendTypes.sendError,
                            msg : "You are not a admin or this is private chat."
                        } as sendData))
                        break;
                    }
                    await Promise.all(data.addUser.map(async(val)=>{
                        try{
                        let temp = await prisma.memberships.create({
                            data : {
                                groupid : data.groupid ,
                                userid : val,
                            },
                            select : {
                                joinedAt : true,
                                Group : {
                                    select : {
                                        lastMessage : true,
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
                                },
                                member : {
                                    select : {
                                        userid : true,
                                        fullname : true
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
                            isPrivate : temp.Group.isPrivate,
                            lastMessage : temp.Group.lastMessage
                        }
                        let member : member = {
                            fullname : temp.member.fullname,
                            userid : temp.member.userid
                        }
                        addInMembers.push(member)
                        console.log("temp",temp)           
                        let addws = [...wss.clients].find((ws ) => (ws as customWS).user.userid === val);
                        if(addws){
                            console.log("addws found")
                            PubSub.userSubscribe(addws as customWS,data.groupid);
                            (addws as customWS).user.list.push(groupInfo);
                            addws.send(JSON.stringify({
                                kind : sendTypes.addedInGroup,
                                groupInfo : {...groupInfo}
                            } as sendData ))
                            PubSub.getInfo();
                        }}
                        catch(e){
                            console.log(e);
                        }
                    }))
                    console.log("new member:",addInMembers)
                    ws.send(JSON.stringify({
                       kind : sendTypes.addminNotificationAddedUser,
                       groupid:  data.groupid,
                       newmember : addInMembers,
                       groupName : data.groupName            
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
                    let arrayRemoved : member[] = [];
                    let isAdmin1 : boolean = await isAdmin(ws.user.userid,data.groupid,ws.user.list);
                    console.log("isAdmin",isAdmin1)
                    let groupName = ws.user.list.find(val => val.groupid === data.groupid)?.groupName;
                    await Promise.all(data.delUser.map(async(val)=>{
                        try {
                            if(isAdmin1){
                                const deleted =await prisma.memberships.delete({
                                 where : {
                                     userid_groupid: { 
                                         userid: val,
                                         groupid: data.groupid
                                     }
                                 },
                                 select : {
                                    member : {
                                        select : {
                                            userid : true,
                                            fullname : true
                                        }
                                    }
                                 }
                                })
                            console.log("deleted",deleted)
                             let removeUser : customWS = [...wss.clients].find((x) => (x as customWS).user.userid === val) as customWS;
                             arrayRemoved.push(deleted.member);
                             removeUser?.send(JSON.stringify({kind: sendTypes.reportRemoved , groupid : data.groupid, groupName :groupName } as sendData))
                             PubSub.userUnsubscribe(removeUser,data.groupid);
                            }
                            else {
                             throw new Error("You are not admin")
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }))
                    console.log("removed user",arrayRemoved)
                    ws.send(JSON.stringify({
                        kind : sendTypes.addminNotificationRemovedUser,
                        groupid : data.groupid,
                        deletedUser : arrayRemoved,
                        groupName : groupName
                    }as sendData))
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
                    if((await isAdmin(ws.user.userid,data.groupid,ws.user.list))){
                        await prisma.groups.update({
                            where : {
                                groupid : data.groupid
                            },
                            data : {
                                adminId : data.newAdmin
                            }
                        })
                    }
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
                        lastMessage : true,
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
                    lastMessage : response.lastMessage,
                    members : response.members.map(val=>val.member)
                }
                ws.send(JSON.stringify({
                    kind : sendTypes.createdGroup,
                    groupInfo : grinfo
                } as sendData))
                ws.user.list.push(grinfo);
                let user2 = [...wss.clients].find(ws => (ws as customWS).user.userid === data.userid)
                if(user2){
                    user2.send(JSON.stringify({
                        kind : sendTypes.addedInGroup,
                        groupInfo : grinfo
                    } as sendData ));
                    (user2 as customWS).user.list.push(grinfo)
                }
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
                        time : 'asc'
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
                messageList : list,
                groupid : data.groupid
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