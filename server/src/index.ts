import { createApp } from './app.js';
import { connectDB } from './db.js';
import { env } from './config.js';

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(Number(env.PORT), () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
