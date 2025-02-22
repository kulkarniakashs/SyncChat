import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GroupInfo, message, GroupInfoCount, member } from "@repo/types";

const initialState: { groupList: GroupInfoCount[] } = {
    groupList: []
}

const groupList = createSlice({
    name: 'groupList',
    initialState,
    reducers: {
        pushGroup: (state, action: PayloadAction<{ list: GroupInfoCount[] }>) => {
            state.groupList = action.payload.list;
        },
        pushOneGr: (state, action: PayloadAction<{ group: GroupInfoCount }>) => {
            state.groupList.push(action.payload.group)
        },
        deleteMembers: (state, action: PayloadAction<{ groupid: string, delUser: member[] }>) => {
            let group = state.groupList.find(gr => gr.groupid === action.payload.groupid)
            console.log(group?.members.length, "before")
            if (group) {
                group.members = group.members.filter(mem => !action.payload.delUser.includes(mem))
            }
            console.log(group?.members.length, "after")
        },
        deleteGroup: (state, action: PayloadAction<{ groupid: string }>) => {
            state.groupList = state.groupList.filter(gr => gr.groupid !== action.payload.groupid)
        },
        updateCount: (state, action: PayloadAction<{ groupid: string }>) => {
            let group = state.groupList.find(gr => gr.groupid === action.payload.groupid)
            if (group) {
                if (!group.count) group.count = 0
                group.count++
            }
        },
        zeroCount: (state, action: PayloadAction<{ groupid: string }>) => {
            let group = state.groupList.find(gr => gr.groupid === action.payload.groupid)
            if (group) {
                group.count = 0
            }
        },
        updateDate: (state, action: PayloadAction<{ groupid: string, time: Date }>) => {
            let group = state.groupList.find(gr => gr.groupid === action.payload.groupid)
            if (group) {
                group.lastMessage = action.payload.time
            }
        },
        addMembers: (state, action: PayloadAction<{ groupid: string, members: member[] }>) => {
            let group = state.groupList.find(gr => gr.groupid === action.payload.groupid)
            if (group) {
                group.members = group.members.concat(action.payload.members)
            }
        }
    }
})


export const { pushGroup, pushOneGr, deleteMembers, updateCount, zeroCount, updateDate, deleteGroup ,addMembers} = groupList.actions;
export default groupList.reducer;