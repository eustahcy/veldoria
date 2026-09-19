import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const serverUrl = import.meta.env.VITE_API_URL || '';
    socketInstance = io(serverUrl || undefined, { path: '/socket.io', withCredentials: true, autoConnect: false });
  }
  return socketInstance;
}

export function useSocket(mapId, onChatMessage) {
  const socket = getSocket();
  const mapRef = useRef(mapId);
  mapRef.current = mapId;

  useEffect(() => {
    socket.connect();
    return () => { socket.disconnect(); socketInstance = null; };
  }, []);

  useEffect(() => {
    if (mapId) socket.emit('join_map', mapId);
  }, [mapId]);

  useEffect(() => {
    if (!onChatMessage) return;
    socket.on('chat_message', onChatMessage);
    return () => socket.off('chat_message', onChatMessage);
  }, [onChatMessage]);

  return socket;
}
