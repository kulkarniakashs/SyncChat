import websocket,{WebSocketServer} from 'ws';
import {data,types,createAccount} from "@repo/types"
import { prisma } from '@repo/prisma';
import { isAdmin } from './func';
import jwt, {JwtPayload} from "jsonwebtoken";
const SECRET_KEY = process.env.SECRET_KEY;
interface UserPayload extends JwtPayload{
    userid : string
    email : string
}
interface customWS extends websocket{
    user : UserPayload
}
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
                            adminId : ws.user.userid,
                            About : data.groupAbout ,
                            members : {
                                create : {
                                    userid : ws.user.userid
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
                            adminId : ws.user.userid
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
                    let isAdmin1 : boolean = await isAdmin(ws.user.userid,data.groupid)
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
                                userid : ws.user.userid,
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
  
    } catch (error) {
        console.log(error);
      ws.close(4002, "Invalid token");
    }
})