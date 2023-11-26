const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let messageQueue = [];
let messageId = 0; // Simple counter for message IDs

// list of clients
const clients = {};

let currentClientIndex = -1;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    clients[socket.id] = socket;
    io.emit('clients', Object.keys(clients)); // Emit the list of clients

    console.log('Client connected:', socket.id);

    // send updated queue
    socket.emit('updateQueue', messageQueue);
    
    socket.on('updateQueueItem', (item) => {
        const index = messageQueue.findIndex((queueItem) => queueItem.id === item.id);
        messageQueue[index] = item;
        io.emit('updateQueue', messageQueue); // Broadcast the updated queueItem
    });


    socket.on('newMessage', (message) => {
        // Split the message by new lines to get each URL
        const urls = message.split('\n');

        // Process each URL
        urls.forEach(url => {
            // Update the client index for each URL in a round-robin fashion
            currentClientIndex = (currentClientIndex + 1) % Object.keys(clients).length;
            const clientKeys = Object.keys(clients);
            const clientKey = clientKeys[currentClientIndex];

            // Create a new data object for each URL
            const data = {
                id: messageId++,
                inferenceSpeed: null,
                probability: null,
                label: null,
                status: 'waiting',
                clientProcessorId: clientKey,
                url: url.trim()
            };

            // Push each new data object to the messageQueue
            messageQueue.push(data);
        });

        // Broadcast the updated queue after processing all URLs
        io.emit('updateQueue', messageQueue);
        console.log('Broadcasted:', urls);
    });


    socket.on('disconnect', () => {
      delete clients[socket.id];
      io.emit('clients', Object.keys(clients)); // Update the list of clients
      console.log('Client disconnected:', socket.id);
    });

  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('>>> Ready on http://localhost:3000');
  });
});
