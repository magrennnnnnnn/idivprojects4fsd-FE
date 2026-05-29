import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export const connectMessageSocket = (profileId, onMessageReceived, onError) => {
    if (!profileId) {
        return;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 5000,

        onConnect: () => {
            stompClient.subscribe(`/topic/profile/${profileId}/messages`, (message) => {
                const body = JSON.parse(message.body);
                onMessageReceived(body);
            });
        },

        onStompError: (frame) => {
            console.error("WebSocket STOMP error:", frame);
            if (onError) {
                onError("WebSocket error");
            }
        },

        onWebSocketError: (event) => {
            console.error("WebSocket connection error:", event);
            if (onError) {
                onError("Could not connect to chat");
            }
        }
    });

    stompClient.activate();
};

export const sendSocketMessage = (receiverProfileId, messageText) => {
    if (!stompClient || !stompClient.connected) {
        throw new Error("WebSocket is not connected yet");
    }

    stompClient.publish({
        destination: "/app/messages.send",
        body: JSON.stringify({
            receiverProfileId,
            messageText
        })
    });
};

export const disconnectMessageSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
};