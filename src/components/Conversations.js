import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useConversations } from '../contexts/ConversationsProvider';
import axios from 'axios';

export default function Conversations({id}) {
  const { conversations, selectConversationIndex } = useConversations()
  const [ online, setOnline ] = React.useState([]);
  
  console.log("SideNav: ", conversations);
  React.useEffect(() => {
    setInterval(() => {
      // let URL = "http://localhost:8080";
      let URL = "https://pacific-bastion-46538.herokuapp.com";
      axios.get(URL + "/active_users")
        .then(res => {
          console.log("RR:", res)
          setOnline(res.data);
        })
        .catch(err => {
          console.log("ERR:", err);
        });
    }, 1000);
  }, [])

  return (
    <ListGroup variant="flush">
      {conversations.map((conversation, index) => (
        <ListGroup.Item
          key={index}
          action
          onClick={() => {
            // let URL = "http://localhost:8080";
            let URL = "https://pacific-bastion-46538.herokuapp.com";
            axios.post(URL + "/update_peer", { user_id : id, peer_id : conversation.recipients[0].id })
              .then(res => {
                console.log(res, "==>", { user_id : id, peer_id : conversation.recipients[0].id });
                selectConversationIndex(index)
              })
              .catch(err => {
                console.log("E:", err);
              })
          } }
          active={conversation.selected}
        >
          {conversation.recipients.map(r => r.name).join(', ')}
          
          {
            ( online.includes(conversation.recipients[0].id) ? <Dot color={"green"} /> : <Dot color={"red"} /> )
          }
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

const Dot = ({color}) => {
  return (
    <span style={{backgroundColor : color, height : "10px", width : "10px", marginLeft: "10px", borderRadius : "40%"}}>
      ...
    </span>
  )
}