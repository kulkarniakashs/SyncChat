import { configureStore } from '@reduxjs/toolkit';
import groupList from './groupList'
import selectedGroup from "./selectedGroup"
import userDetails from './userDetails'
import messageList from './messageList';
const store = configureStore<{
  groupList: ReturnType<typeof groupList>,
  selectedGroup: ReturnType<typeof selectedGroup>,
  userDetails: ReturnType<typeof userDetails>,
  messageList : ReturnType<typeof messageList>
}>({
  reducer: {
    groupList : groupList,
    selectedGroup : selectedGroup,
    userDetails : userDetails,
    messageList : messageList
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
