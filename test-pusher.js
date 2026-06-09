const Pusher = require('pusher');
require('dotenv').config();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

async function test() {
  console.log("Triggering pusher event...");
  try {
    await pusher.trigger('test-channel', 'test-event', { message: 'hello world' });
    console.log("Successfully triggered!");
  } catch (err) {
    console.error("Failed to trigger:", err);
  }
}

test();
