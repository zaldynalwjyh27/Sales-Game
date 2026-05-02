// Server-only Pusher instance. Never import this from client components.
import Pusher from 'pusher';

// Lazy-init singleton to avoid instantiation errors during build
let _pusherServer: Pusher | null = null;

function getPusherInstance(): Pusher {
  if (!_pusherServer) {
    _pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID || 'mock_app_id',
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key',
      secret: process.env.PUSHER_SECRET || 'mock_secret',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
      useTLS: true,
    });
  }
  return _pusherServer;
}

/**
 * Safe wrapper around Pusher trigger that never throws.
 * If Pusher credentials are not configured (mock), it logs and continues.
 */
export async function triggerPusher(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  // Skip Pusher entirely if using mock credentials
  if (
    !process.env.PUSHER_APP_ID ||
    process.env.PUSHER_APP_ID === 'mock_app_id'
  ) {
    console.log(
      `[Pusher SKIP] No real credentials. Event: ${event} on ${channel}`
    );
    return;
  }

  try {
    await getPusherInstance().trigger(channel, event, data);
  } catch (error) {
    console.error(`[Pusher ERROR] Failed to trigger ${event}:`, error);
    // Non-fatal — the app continues, clients just won't get live updates
  }
}
