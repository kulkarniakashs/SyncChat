import { PrismaClient } from "@prisma/client"
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