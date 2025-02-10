"use server"
import { prisma } from "@repo/prisma";
import { currentUser } from "@clerk/nextjs/server";
import  jwt from "jsonwebtoken";
export async function checkUser() {
    const loggedUser = await currentUser();

    if(!loggedUser){
        return null;
    }

    try {
        const user = await prisma.users.findUnique({
            where : {
                userid : loggedUser.id
            },
            select : {
                userid : true,
                email : true
            }
        })
        if(user){
            console.log("userprinting ",user)
            let token =  jwt.sign(user,'secret');
            return token;
        } 
        const createUser = await prisma.users.create({
            data : {
                userid : loggedUser.id,
                email : loggedUser.emailAddresses[0]?.emailAddress || '',
                fullname : loggedUser.fullName || ''
            },
            select : {
                userid : true,
                email : true
            }
        })     
        if(createUser) {
            console.log("creatinguserprinting",createUser)
            let token = jwt.sign(createUser,'secret');
            return token;
        }
    } catch (error) {
        console.log(error)
    }

}