import { createClient } from "redis";
import { message } from "@repo/types";
import {prisma} from "@repo/prisma"
const redisClient = createClient();

async function pushMessage() {
    try {
        redisClient.connect();
        console.log("connected to redis client");
        try {
            while(true){
                const msg = await redisClient.brPop('msg_queue',0);
                if(msg){
                    let message : message = JSON.parse(msg.element);
                    try {
                        await prisma.messages.create({
                            data : {
                                content : message.text,
                                authorid : message.authorid,
                                groupid : message.groupid,
                                time : message.time
                            }
                        })
                    } catch (error) {
                        redisClient.lPush('msg_queue',msg.element);
                        console.log("Pushed msg again to the queue")
                    }
                }else{
                    console.log("got null value")
                }
                
            }
        } catch (error) {
            console.log(error)
        }    
    } catch (error) {
        console.log(error)
    }
}

pushMessage();