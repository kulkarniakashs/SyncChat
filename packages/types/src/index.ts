export enum types {
    createAccount,
    sendMessage,
    addInGroup,
    leaveGroup,
    reportActive,
    createGroup,
    removeUser
}


export type data =  reportActive| sendMessage| removeUser | addInGroup |  createGroup | leaveGroup | createAccount;

export interface sendMessage {
    kind : types.sendMessage
    message : message
}

export interface removeUser {
    kind: types.removeUser,
    groupid: string,
    delUser : string
}

export interface addInGroup {
    kind : types.addInGroup,
    groupid : string,
    addUser : string
}

export interface leaveGroup {
    kind : types.leaveGroup,
    groupid : string
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
    groupid : string
}

export interface reportActive {
    kind : types.reportActive
}