const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const fs = require('fs');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let messageQueue = [];
let messageId = 0; // Simple counter for message IDs

// list of clients
const clients = {};

let currentClientIndex = -1;

try {
    const data = fs.readFileSync('messageQueue.json', 'utf8');
    messageQueue = JSON.parse(data);
    console.log('Data loaded from file:', messageQueue);
} catch (err) {
    console.error('Initializing new message queue', err);
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  function serializeAndSave() {
    const dataToWrite = JSON.stringify(messageQueue, null, 2); // null and 2 for pretty formatting
    fs.writeFileSync('messageQueue.json', dataToWrite, 'utf8');
  }

  function updateQueue() {
    serializeAndSave();
    io.emit('updateQueue', messageQueue);
  }


    // Function to reassign clientProcessorId for items in the queue
    function reassignDisconnectedClients() {
        const connectedClientIds = Object.keys(clients);

        console.log('Reassigning disconnected clients...');

        currentClientIndex = 0;
        messageQueue.forEach(item => {
            if (!connectedClientIds.includes(item.clientProcessorId) && item.status !== "completed") {
                // Round-robin assignment to a connected client
                currentClientIndex = (currentClientIndex + 1) % connectedClientIds.length;
                const newClientKey = connectedClientIds[currentClientIndex];
                item.clientProcessorId = newClientKey;
                item.status = 'waiting'; // Optionally reset the status
//                console.log('Reassigned item:', item);
                console.log("Connected clients:", connectedClientIds);
            }
        });

        // Broadcast the updated queue
        updateQueue();
    }


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

    socket.on('clearQueue', (item) => {
        messageQueue.length = 0;
        console.log(messageQueue);
        updateQueue();
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
        updateQueue();
        console.log('Broadcasted:', urls);
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove the disconnected client from the clients list
        delete clients[socket.id];
        io.emit('clients', Object.keys(clients)); // Update the list of clients

        // Reassign any items that were being processed by the disconnected client
        reassignDisconnectedClients();
    });


    reassignDisconnectedClients();
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('>>> Ready on http://localhost:3000');
  });
});
