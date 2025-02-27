import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {message} from '@repo/types'
import { channel } from "diagnostics_channel";

const initialState :  {
    [id : string] : {
        isLoading : boolean,
        hasMore : boolean,
        messages : message[]
    }
} = {

}

const messageList = createSlice({
    name : 'messageList',
    initialState,
    reducers : {
        pushMessageList : (state,action: PayloadAction<{groupid : string,list : message[]}>)=>{
           if(!state[action.payload.groupid]){
            state[action.payload.groupid] = {
                hasMore : true,
                isLoading : false,
                messages : []
            }
           }
           state[action.payload.groupid]!.messages = action.payload.list.concat(state[action.payload.groupid]?.messages||[])
           state[action.payload.groupid]!.hasMore = (action.payload.list.length === 20);
           state[action.payload.groupid]!.isLoading = false
        },
        // prependMessageList : (state,action : PayloadAction<{groupid : string,list : message[]}>)=>{
        //     state[action.payload.groupid] = (action.payload.list || []).concat(state[action.payload.groupid]||[])
        // },
        pushMessage : (state,action: PayloadAction<{groupid: string,msg : message}>)=>{
            if(!state[action.payload.groupid]){
                state[action.payload.groupid] = {
                    hasMore : true,
                    isLoading : false,
                    messages : []
                }
            }
            state[action.payload.groupid]!.messages.push(action.payload.msg);
        },

        ChangeIsLoading : (state ,action :PayloadAction<{groupid : string,val : boolean}> )=>{
            if(!state[action.payload.groupid]){
                state[action.payload.groupid] = {
                    hasMore : true,
                    isLoading : false,
                    messages : []
                }
            }
            state[action.payload.groupid]!.isLoading = action.payload.val;
        }
    }
})

export default messageList.reducer;
export const {pushMessage,pushMessageList,ChangeIsLoading} = messageList.actions;