import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { parse } from 'url';
import { rehydrateRoomsFromDatabase, setupSocketHandler } from '../src/server/socketHandler';
import { logger } from '../src/lib/logger';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : '*';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);

      // Lightweight HTTP health check endpoint fallback
      if (parsedUrl.pathname === '/api/health') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
          })
        );
        return;
      }

      handle(req, res, parsedUrl);
    } catch (err) {
      logger.error('Error occurred handling HTTP request', 'Server', { error: (err as Error).message });
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  setupSocketHandler(io);

  // Attempt to rehydrate rooms from MongoDB on startup
  await rehydrateRoomsFromDatabase(io);

  server.listen(port, () => {
    logger.info(`Server live on http://${hostname}:${port}`, 'ServerInit');
  });
});

