import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userDetails  {
    userid : string| undefined,
    fullname : string | undefined,
    ws : WebSocket | null
}

const initialState  : userDetails =  {
    userid: '',
    fullname: '',
    ws: null
}

const userDetails = createSlice({
    name : 'userDetails',
    initialState,
    reducers : {
        detailsUpdate : (state, action : PayloadAction<{userid: string,fullname : string}>)=> {
            state.fullname = action.payload.fullname;
            state.userid = action.payload.userid
        },
        wsUpdate : (state,action : PayloadAction<{ws : WebSocket}>)=>{
            state.ws = action.payload.ws
        }
    }
})

export const {wsUpdate,detailsUpdate} = userDetails.actions
export default userDetails.reducer;
