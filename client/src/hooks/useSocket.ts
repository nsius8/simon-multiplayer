import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/game.types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const newSocket: TypedSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      reconnectAttempts.current++;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Unable to connect to server. Please try again later.');
      } else {
        setError(`Connection error: ${err.message}`);
      }
    });

    newSocket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const emit = useCallback(
    <E extends keyof ClientToServerEvents>(
      event: E,
      ...args: Parameters<ClientToServerEvents[E]>
    ) => {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        (socket.emit as (event: E, ...args: Parameters<ClientToServerEvents[E]>) => void)(event, ...args);
      }
    },
    []
  );

  const on = useCallback(
    <E extends keyof ServerToClientEvents>(
      event: E,
      callback: ServerToClientEvents[E]
    ) => {
      const socket = socketRef.current;
      if (socket) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.on(event, callback as any);
        return () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          socket.off(event, callback as any);
        };
      }
      return () => {};
    },
    []
  );

  const off = useCallback(
    <E extends keyof ServerToClientEvents>(
      event: E,
      callback?: ServerToClientEvents[E]
    ) => {
      const socket = socketRef.current;
      if (socket) {
        if (callback) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          socket.off(event, callback as any);
        } else {
          socket.off(event);
        }
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off,
    clearError,
  };
}

export default useSocket;
