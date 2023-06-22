import { createContext, useContext, useState } from 'react'

// Creates a Context object.
export const StoreContext = createContext({})

// A custom hook for consuming the Context in other components.
export const useStoreContext = () => useContext(StoreContext)

// A wrapper for the Context Provider providing access
export const StoreProvider = ({ children }) => {
  return <StoreContext.Provider value={{}}>{children}</StoreContext.Provider>
}
