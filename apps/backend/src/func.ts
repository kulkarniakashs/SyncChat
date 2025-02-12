import { PrismaClient } from "@prisma/client"
import { GroupInfo } from "@repo/types";
import { join } from "path";
const prisma = new PrismaClient();
export async function isAdmin(userid :string |undefined,groupid : string | undefined) {
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
            members :true,
            Admin : {
                select : {
                    userid : true,
                    fullname : true
                }
            },
        },
    })
    const newList: GroupInfo[] = list.map(gr => {
        let r : GroupInfo = {
            groupid: gr.groupid,
            groupName: gr.groupName,
            About: gr.About,
            joinedAt: gr.members[0]?.joinedAt,
            adminid: gr.Admin.userid,
            adminname : gr.Admin.fullname
        };
        return r;
    })
    console.log("newLIstList :",newList);
    return newList;
}