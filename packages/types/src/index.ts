import { JwtPayload } from "jsonwebtoken";
import websocket from 'ws'
export enum types {
    createAccount,
    sendMessage,
    addInGroup,
    leaveGroup,
    reportActive,
    createGroup,
    removeUser,
    createPrivateChat,
    fetchMessage
}


export type data = fetchMessage| reportActive| sendMessage| removeUser | addInGroup |  createGroup | leaveGroup | createAccount | createPrivateChat;

export interface fetchMessage{
    kind : types.fetchMessage,
    groupid : string,
    skip : number
}

export interface createPrivateChat{
    kind : types.createPrivateChat,
    userid : string,
    fullname : string
}

export interface sendMessage {
    kind : types.sendMessage
    message : message
}

export interface removeUser {
    kind: types.removeUser,
    groupid: string,
    delUser : string[]
}

export interface addInGroup {
    kind : types.addInGroup,
    groupid : string,
    groupName : string,
    addUser : string[]
}

export interface leaveGroup {
    kind : types.leaveGroup,
    groupid : string,
    newAdmin? : string
}

export interface createGroup {
    kind : types.createGroup,
    groupName : string,
    groupAbout : string
}

export interface createAccount {
    kind : types.createAccount
    fullName : string
    email : string
}

export interface message {
    text : string,
    time : Date,
    authorid : string,
    groupid : string,
    fullname : string
}

export interface reportActive {
    kind : types.reportActive
}    

export interface UserPayload extends JwtPayload{
    userid : string
    email : string
    fullname:string,
    list : GroupInfo[]
}
export interface customWS extends websocket{
    user : UserPayload
}

interface group{
    groupid : string ,
    groupAbout : string,
    groupName : string
}

export enum sendTypes {
    groupList,
    addedInGroup,
    createdGroup,
    chat,
    sendError,
    reportRemoved,
    successfullyRemoved,
    leftGroup,
    addminNotificationAddedUser,
    informActive,
    sendFetchedMsg,
    addminNotificationRemovedUser
}

export interface GroupInfo {
    groupid: string;
    groupName: string;
    About: string;
    adminid: string;
    adminname: string;
    joinedAt: Date | undefined;
    members : member[],
    lastMessage : Date
    isPrivate : boolean
}

export type sendData =addminNotificationRemovedUser| sendFetchedMsg |sendAddedinGr | sendCreatedGr | sendGroupList | chat | sendError | reportRemoved | successfullyRemoved | leftGroup | addminNotificationAddedUser 

export interface addminNotificationRemovedUser {
    kind : sendTypes.addminNotificationRemovedUser,
    groupid : string,
    groupName : string,
    deletedUser : member[]
}

export interface addminNotificationAddedUser {
    kind : sendTypes.addminNotificationAddedUser,
    groupid : string,
    groupName : string,
    newmember : member[]
}

export interface leftGroup{
    kind : sendTypes.leftGroup,
    groupid : string,
    groupName : string
}

export interface successfullyRemoved {
    kind : sendTypes.successfullyRemoved,
    groupid : string,
    deleteUser : string,
    delName : string 
}

export interface reportRemoved {
    kind : sendTypes.reportRemoved,
    groupid : string,
    groupName : string
}

export interface sendAddedinGr {
    kind : sendTypes.addedInGroup,
    groupInfo : GroupInfo
}

export interface sendCreatedGr {
    kind : sendTypes.createdGroup
    groupInfo : GroupInfo
}

export interface sendGroupList {
    kind : sendTypes.groupList,
    groupList : GroupInfo[]
}

export interface chat {
    kind : sendTypes.chat,
    message : message
}

export interface sendError {
    kind : sendTypes.sendError,
    msg : string
}

export interface member {
    userid : string,
    fullname : string
}

export interface sendFetchedMsg {
    kind : sendTypes.sendFetchedMsg,
    groupid : string
    messageList : message[]
}

export interface GroupInfoCount extends GroupInfo {
    count : number
}