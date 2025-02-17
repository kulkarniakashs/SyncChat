"use server"
import { prisma } from "@repo/prisma";

export async function fetchUsers(search :string){
    const list = await prisma.users.findMany({
        where : {
            OR:[
                {
                    userid : {startsWith : search,mode : 'insensitive'}
                },
                {
                    email : {startsWith : search,mode : 'insensitive'}
                }
            ]
        },
        select : {
            email : true,
            userid : true,
            fullname : true
        }

    })
    return list || []
}