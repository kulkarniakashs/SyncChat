import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {message} from '@repo/types'

const initialState :  {
    [id : string] : message[]
} = {

}

const messageList = createSlice({
    name : 'messageList',
    initialState,
    reducers : {
        pushMessageList : (state,action: PayloadAction<{groupid : string,list : message[]}>)=>{
           state[action.payload.groupid] = (state[action.payload.groupid] || []).concat(action.payload.list)
        },
        prependMessageList : (state,action : PayloadAction<{groupid : string,list : message[]}>)=>{
            state[action.payload.groupid] = (action.payload.list || []).concat(state[action.payload.groupid]||[])
        },
        pushMessage : (state,action: PayloadAction<{groupid: string,msg : message}>)=>{
            state[action.payload.groupid]?.push(action.payload.msg);
        }
    }
})

export default messageList.reducer;
export const {prependMessageList,pushMessage,pushMessageList} = messageList.actions;