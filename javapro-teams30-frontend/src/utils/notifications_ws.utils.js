import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { serverURL } from "../settings/axios";

let stompCLient = null;
export function connect({ addNotification, token, userId }) {
  const socket = new SockJS(`${serverURL}ws`);
  stompCLient = Stomp.over(socket);
  stompCLient.connect({ token }, frame => {
    stompCLient.subscribe(`/user/${userId}/queue/notifications`, message => {
        if (message.body) {
          let data = JSON.parse(message.body);
          addNotification(data);
        }
      },
      { id: userId },
    )
  })
}

export function disconnect() {
  if (stompCLient !== null) {
    stompCLient.disconnect();
  }
}
