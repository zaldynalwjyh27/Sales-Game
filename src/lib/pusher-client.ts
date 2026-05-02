// Client-only Pusher instance. Only import this from 'use client' components.
import PusherClient from 'pusher-js';

export function getPusherClient(): PusherClient {
  return new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key',
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    }
  );
}
