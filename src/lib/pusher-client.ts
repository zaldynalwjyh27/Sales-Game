// Client-only Pusher instance. Only import this from 'use client' components.
import PusherClient, { Channel } from 'pusher-js';

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

/**
 * Safely bind a set of event handlers to a Pusher channel.
 * Returns a cleanup function that ONLY unbinds these specific handlers —
 * it never calls `channel.unsubscribe()`, so other components sharing
 * the same channel are not affected.
 *
 * Usage inside useEffect:
 *   return bindChannel(`room-${id}`, { 'player-joined': handler });
 */
export function bindChannel(
  channelName: string,
  handlers: Record<string, (data: any) => void>
): () => void {
  const client = getPusherClient();

  // Subscribe is idempotent — Pusher returns the existing channel if already subscribed
  const channel: Channel = client.subscribe(channelName);

  for (const [event, handler] of Object.entries(handlers)) {
    channel.bind(event, handler);
  }

  // Return a cleanup that only removes our specific bindings, never unsubscribes
  return () => {
    for (const [event, handler] of Object.entries(handlers)) {
      channel.unbind(event, handler);
    }
  };
}
