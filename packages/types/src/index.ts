export enum types {
    createAccount,
    sendMessage,
    addInGroup,
    leaveGroup,
    reportActive,
    createGroup,
    removeUser
}


export type data =sendMessage| removeUser | addInGroup |  createGroup | leaveGroup | createAccount;

export interface sendMessage {
    kind : types.sendMessage
    groupid : string;
    content : string,
    time : Date
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
