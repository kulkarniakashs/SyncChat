"use client"
import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import { Provider } from 'react-redux'
import store from './store/store'

function Provider1({children}:{children: React.ReactNode}) {
  return (
    <>
    <ClerkProvider>
      <Provider store={store}>
        {children}
      </Provider>
    </ClerkProvider>
    </>
  )
}

export default Provider1