// Client-only Pusher instance. Only import this from 'use client' components.
import PusherClient from 'pusher-js';

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === 'undefined') {
    return {} as any; // return dummy on server side if called
  }
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
      }
    );
  }
  return pusherClientInstance;
}
