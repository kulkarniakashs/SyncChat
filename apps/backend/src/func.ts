import { PrismaClient } from "@prisma/client"
import { GroupInfo, member } from "@repo/types";
import { join } from "path";
const prisma = new PrismaClient();
export async function isAdmin1(userid :string |undefined,groupid : string | undefined) {
    if(userid &&  groupid){
        try {
            let response = await prisma.groups.findUnique({
                where : {
                    groupid : groupid,
                    adminId : userid
                }
            })
            if(response) return true;
        }catch(e){
            console.log(e)
        }
    }
    return false;   
}

export async function isAdmin(userid:string,groupid:string,list : GroupInfo[]) {
    let gr = list.find(g=>{
        if(g.groupid === groupid && g.adminid === userid) return true;
        else return false;
    })
    if(gr) return true;
    else return false;
}

export async function listGroups(userid : string){
    const list = await prisma.memberships.findMany({
        where : {
            userid : userid
        },
        select : {
            groupid  : true
        }
    })
    console.log(list)
    return list;
}

export async function listGroupsWithInfo(userid : string){
    const list = await prisma.groups.findMany({
        where : {
            members : {
                some : {
                    userid : userid
                }
            }
        },
        select : {
            groupid :  true,
            groupName : true,
            About : true,
            isPrivate : true,
            lastMessage : true,
            members : {
                select : {
                    joinedAt : true,
                    member : {
                        select : {
                            userid : true,
                            fullname : true
                        }
                    }
                }
            },
            Admin : {
                select : {
                    userid : true,
                    fullname : true
                }
            },
        },
    })
    console.log("list", list)
    const newList: GroupInfo[] = list.map(gr => {
        let date : Date =new Date()
        let members : member[] = [];
        gr.members.forEach(member=> {
            if(member.member.userid === userid){
                date = member.joinedAt;
            }
            members.push(member.member);
        })
        let r : GroupInfo = {
            lastMessage : gr.lastMessage,
            groupid: gr.groupid,
            groupName: gr.groupName,
            About: gr.About,
            joinedAt: date,
            adminid: gr.Admin.userid,
            adminname : gr.Admin.fullname,
            isPrivate : gr.isPrivate,
            members : members
        };
        return r;
    })
    console.log("newLIstList :",newList);
    return newList;
}

export async function isAdminAndisPrivate(userid:string,groupid:string,list : GroupInfo[]) {
    let gr = list.find(g=>{
        if(g.groupid === groupid && g.adminid === userid && g.isPrivate === false) return true;
        else return false;
    })
    if(gr) return true;
    else return false;
}