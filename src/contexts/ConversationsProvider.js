import React, { useContext, useState, useEffect, useCallback } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';
import { useContacts } from './ContactsProvider';
import { useSocket } from './SocketProvider';
import axios from 'axios';

const ConversationsContext = React.createContext()

export function useConversations() {
  return useContext(ConversationsContext)
}

export function ConversationsProvider({ id, children }) {
  const [conversations, setConversations] = useLocalStorage('conversations', [])
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const { contacts } = useContacts()
  const socket = useSocket()

  function createConversation(recipients) {
    setConversations(prevConversations => {
      return [...prevConversations, { recipients, messages: [] }]
    })
  }

  const addMessageToConversation = useCallback(({ recipients, text, sender }) => {
    // console.log("======>>>> called ", recipients, text, sender);
    // let URL = "http://localhost:8080";
    let URL = "https://pacific-bastion-46538.herokuapp.com";
    let convo = []

    let rcp = recipients[0];
    if(recipients[0] === sender){ // jugaad
      rcp = id;
    }  
    // console.log("======>>>> called ", rcp, text, sender);

    axios.post(URL + "/chats", { user_id : sender, peer_id : rcp })
      .then( res => {
        console.log(res);
        let chats = res.data;
        for(let i=0; i<chats.length; i++){
          convo.push({sender : chats[i].sender, text : chats[i].text, status : chats[i].status});
        }
        console.log("Convo: ", convo);
        
        setConversations(prevConversations => {
          console.log("Conv Prev : ", prevConversations, " New: ", { recipients, text, sender });
          let madeChange = false
          const newMessage = { sender, text }
          const newConversations = prevConversations.map(conversation => {
            if (arrayEquality(conversation.recipients, recipients)) {
              madeChange = true
              return {
                ...conversation,
                messages: convo
              }
            }
            return conversation
          })
          if (madeChange) {
            return newConversations
          } else {
            return [
              ...prevConversations,
              { recipients, messages: convo }
            ]
          }
        })

      })
      .catch( err => {
        console.log("FF " , err);
      })
  }, [setConversations])

  useEffect(() => {
    if (socket == null) return

    socket.on('receive-message', addMessageToConversation)

    return () => socket.off('receive-message')
  }, [socket, addMessageToConversation])

  function sendMessage(recipients, text) {
    socket.emit('send-message', { recipients, text ,id})

    addMessageToConversation({ recipients, text, sender: id })
  }

  const formattedConversations = conversations.map((conversation, index) => {
    // console.log("Formatted : ", conversation);
    const recipients = conversation.recipients.map(recipient => {
      const contact = contacts.find(contact => {
        return contact.id === recipient
      })
      const name = (contact && contact.name) || recipient
      return { id: recipient, name }
    })

    const messages = conversation.messages.map(message => {
      const contact = contacts.find(contact => {
        return contact.id === message.sender
      })
      const name = (contact && contact.name) || message.sender
      const fromMe = id === message.sender
      return { ...message, senderName: name, fromMe }
    })
    
    const selected = index === selectedConversationIndex
    return { ...conversation, messages, recipients, selected }
  })

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectConversationIndex: setSelectedConversationIndex,
    createConversation
  }

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  )
}

function arrayEquality(a, b) {
  if (a.length !== b.length) return false

  a.sort()
  b.sort()

  return a.every((element, index) => {
    return element === b[index]
  })
}