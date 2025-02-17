import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GroupInfo } from "@repo/types";

const initialState: {groupList : GroupInfo[]} = {
    groupList : []
}

const groupList = createSlice({
    name : 'groupList',
    initialState,
    reducers : {
        pushGroup : (state,action : PayloadAction<{list : GroupInfo[]}> )=>{
            state.groupList = action.payload.list;
        },
        pushOneGr : (state,action : PayloadAction<{group : GroupInfo}>)=>{
            state.groupList.push(action.payload.group)
        }
    }

})


export const {pushGroup,pushOneGr} = groupList.actions;
export default groupList.reducer;