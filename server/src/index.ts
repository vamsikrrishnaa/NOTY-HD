import { createApp } from './app';
import { connectDB } from './db';
import { env } from './config';

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
