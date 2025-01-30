import websocket,{WebSocketServer} from 'ws';
import {data,types,createAccount} from "@repo/types"
import { PrismaClient } from '@prisma/client';
import { isAdmin } from './func';

const wss = new WebSocketServer({port: 8080});
const prisma = new PrismaClient()
wss.on('connection',function(ws){
    console.log("new Clinet connected")
    ws.on('message',async function(rawDAta,isBinary){
        let rawText = rawDAta.toString();
        let data: data= JSON.parse(rawText);
        console.log("types :" ,types)
        console.log(types.createAccount)
        console.log(data)
        console.log("swicthc message ,",data)
        console.log(types.createAccount == data.kind)
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
                        code : e.code,
                        meta : e.meta
                    }))
                }
                break;
            case types.createGroup: {
                console.log("message",data)
                try {
                    let response = await prisma.groups.create({
                        data : {
                            groupName : data.groupName ,
                            adminId : data.userid,
                            About : data.groupAbout ,
                            members : {
                                create : {
                                    userid : data.userid
                                }
                            }
                        }
                    })
                    console.log("response of group create",response)
                    ws.send(JSON.stringify({
                        msg : "Group has been Successfull created"
                    }))
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        msg :`code${e.code} error at ${e.meta}`
                    }),{binary: isBinary})
                } 
                break;
            }
            case types.addInGroup :{
                try {
                    console.log("in addInGroup")
                    let response =await prisma.groups.findMany({
                        where : {
                            groupid : data.groupid,
                            adminId : data.adminId
                        },
                        select: {
                            adminId : true
                        }
                    })
                    console.log("adminId is : ",response)
                    if(response.length == 0){
                        ws.send(JSON.stringify({msg : "you are not admin"}));
                        break;
                    }
                    console.log(data)
                    console.log("admin adding user")
                    let r1 = await prisma.memberships.create({
                        data : {
                            groupid : data.groupid ,
                            userid : data.addUser
                        }
                    })
                    console.log("r1",r1)
                    ws.send(JSON.stringify({
                        msg : "user successfully added in group"
                    }))
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        msg :JSON.stringify(e)
                    }),{binary: isBinary})
                }
            }   break;
            case types.removeUser :{
                try {
                    let isAdmin1 : boolean = await isAdmin(data.userid,data.groupid)
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
                       ws.send(JSON.stringify({msg : "User has been successfully deleted"}))
                   }
                   else {
                    throw new Error("You are not admin")
                   }
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        msg :JSON.stringify(e)
                    }),{binary: isBinary})
                }
                break;
            }

            case types.leaveGroup : {
                try {
                    await prisma.memberships.delete({
                        where : {
                            userid_groupid : {
                                userid : data.userid,
                                groupid : data.groupid
                            }
                        }
                    })
                    ws.send(JSON.stringify({msg : "You successfully left the group"}))
                }catch(e:any){
                    console.log(e)
                    ws.send(JSON.stringify({
                        msg :JSON.stringify(e)
                    }),{binary: isBinary})
                }
                break;
            }
        }
    })

    ws.on('close',function(data){
        console.log("closed connection with one user")
    })
})