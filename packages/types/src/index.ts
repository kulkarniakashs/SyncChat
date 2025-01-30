export enum types {
    createAccount,
    sendMessage,
    addInGroup,
    leaveGroup,
    reportActive,
    createGroup,
    removeUser
}


export type data = removeUser | addInGroup |  createGroup | leaveGroup | createAccount;

export interface removeUser {
    kind: types.removeUser,
    userid : string,
    groupid: string,
    delUser : string
}

export interface addInGroup {
    kind : types.addInGroup,
    groupid : string,
    adminId : string,
    addUser : string
}

export interface leaveGroup {
    kind : types.leaveGroup,
    userid : string
    groupid : string
}

export interface createGroup {
    kind : types.createGroup,
    groupName : string,
    userid : string,
    groupAbout : string
}

export interface createAccount {
    kind : types.createAccount
    fullName : string
    email : string
}


// export interface message {
//     type : types
//     userid : string
//     fullName? : string
//     email? : string
//     groupid? : string
//     content? : string,
//     groupName? : string,
//     groupAbout : string,
//     addUser? : string,
//     deletion? : deletion
// }



// export interface deletion  {
//     delUser : string
//     groupid : string
// }

// export interface leaveGroup {
//     userid : string,
//     groupid : string
// }