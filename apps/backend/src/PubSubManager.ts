import {createClient, RedisClientType} from "redis"
import { message } from "@repo/types";
import websocket from "ws";
import {JwtPayload} from "jsonwebtoken";
import { writeSync } from "fs";
interface UserPayload extends JwtPayload{
    userid : string
    email : string
}
interface customWS extends websocket{
    user : UserPayload
}

export default class PubSubManager {
    private static instance : PubSubManager;
    private subscription : Map<string, customWS[]>
    private redisClient : RedisClientType;
    private constructor (){
        this.redisClient = createClient();
        this.redisClient.connect();
        this.subscription = new Map();
    }
    public static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new PubSubManager();
        return this.instance;
    }

    public userSubscribe(userws : customWS, groupid : string){
        if(!this.subscription.has(groupid)){
            this.subscription.set(groupid,[]);
        }
        this.subscription.get(groupid)?.push(userws);
        if(this.subscription.get(groupid)?.length === 1){
            this.redisClient.subscribe(groupid,(msg)=>{
                this.handleMessage(groupid,msg);
            })
            console.log("new subscription is created for groupid",groupid);
        }
    }

    public userUnsubscribe(userws : customWS,groupid : string){
        this.subscription.set(groupid,this.subscription.get(groupid) || [].filter(id => id != userws))
        if(this.subscription.get(groupid)?.length === 0){
            this.redisClient.unsubscribe(groupid);
            console.log("unsubcribed to",groupid);
        }
    }

    private handleMessage(groupid : string, message: string){
        console.log(message)
        this.subscription.get(groupid)?.forEach((ws)=>{
            ws.send(message)
        })
    }

    public getInfo(){
        this.subscription.forEach((val,key)=>{
            console.log(`groupid ${key}`)
            val.forEach(ws=>console.log(ws.user.email));
        })
    }
}
