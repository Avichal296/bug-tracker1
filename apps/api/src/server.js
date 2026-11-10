import 'dotenv/config';
import { prisma } from './config/prisma.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 4100);

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set before starting the API.');
}

await prisma.$connect();

const app = createApp();
app.listen(port, () => {
  console.log(`Bug Tracker API listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
