import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = React.createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState()

  useEffect(() => {
    let URL = "https://pacific-bastion-46538.herokuapp.com";
    // let URL = 'http://localhost:8080',
    const newSocket = io(
      URL,
      {
        transports: ['websocket'], 
        query: { id },
        withCredentials: true 
      })
    setSocket(newSocket)

    return () => newSocket.close()
  }, [id])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
