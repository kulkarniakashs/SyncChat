import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GroupInfo } from "@repo/types";

const initialState : { groupInfo : GroupInfo| undefined} = {
    groupInfo : undefined
}

const selectedGroup = createSlice({
    name : 'selectedGroup',
    initialState,
    reducers : {
        update : (state,action : PayloadAction<{groupInfo : GroupInfo}>)=>{
            state.groupInfo = {...action.payload.groupInfo}
        }
    }

})
export const {update} = selectedGroup.actions
export default selectedGroup.reducer