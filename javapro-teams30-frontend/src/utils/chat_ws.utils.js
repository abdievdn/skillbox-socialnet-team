import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { serverURL } from "../settings/axios";

let stompCLient = null
export function chatConnect({ isTyping, user_id, token, dialogId, store }) {
  const socket = new SockJS(`${serverURL}ws`);
  stompCLient = Stomp.over(socket)
  stompCLient.connect({ token }, frame => {
    stompCLient.subscribe(`/user/${dialogId}/queue/messages`, message => {
      if (!message.body) return;
      let data = JSON.parse(message.body);

      if (data.message_ids) {
        store.deleteMessages(data.message_ids);
      } else {
        const existMessage = store.getExistMessage(data.message_id);
        if (existMessage) {
          data.message_text ? store.editMessage(data) : store.recoveryMessage(data.message_id);
        } else if (data.message_text) {
          data.isSentByMe = JSON.parse(data.author_id) === user_id;
          data.sid = data.id + '';
          data.recipient_id = user_id;
          store.addMessage(data);
        } else if (typeof data.typing !== 'undefined' && JSON.parse(data.user_id) !== user_id) {
          isTyping(JSON.parse(data.typing));
        }
      }
    })
  })
}

export function editMessage(payload) {
  if (payload.message_text === '' && !payload.message_text) return;
  stompCLient.send(
    '/api/v1/dialogs/edit_message',
    payload,
    JSON.stringify(payload)
  );
}

export function deleteMessages(payload) {
  stompCLient.send(
    '/api/v1/dialogs/delete_messages',
    payload,
    JSON.stringify(payload)
  );
}

export function recoverMessage(payload) {
  stompCLient.send(
    '/api/v1/dialogs/recover_message',
    payload,
    JSON.stringify(payload)
  );
}

export function sendMessage(payload) {
  if (payload.message_text === '' && !payload.message_text) return
  stompCLient.send(
    '/api/v1/dialogs/send_message',
    { token: payload.token, dialog_id: payload.dialog_id, message_text: payload.message_text },
    JSON.stringify(payload)
  )
}

export function startTyping({ token, dialog_id, userId }) {
  stompCLient.send(
    '/api/v1/dialogs/start_typing',
    { token, dialog_id, userId },
    JSON.stringify({ typing: true, user_id: userId })
  );
}

export function stopTyping({ token, dialog_id, userId }) {
  stompCLient.send(
    '/api/v1/dialogs/stop_typing',
    { token, dialog_id, userId },
    JSON.stringify({ typing: false, user_id: userId })
  );
}

export function chatDisconnect(payload) {
  if (stompCLient !== null) {
    stompCLient.connected && stompCLient.send('/api/v1/dialogs/close_dialog',
      payload,
      JSON.stringify(payload)
    );
    stompCLient.disconnect();
  }
}
