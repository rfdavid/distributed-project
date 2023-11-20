const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const messageQueue = [];
let messageId = 0; // Simple counter for message IDs

// list of clients
const clients = {};

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
    
    // this event is to receive a msg from the client, when the client takes a
    // specific image url for processing
    socket.on('requestImageForProcessing', () => {
        messageQueue.push(data);
        io.emit('updateQueue', messageQueue); // Broadcast the updated queue
        console.log('Broadcasted:', message);
    });


//    socket.on('messageProcessed', (processedData) => {
//        const { messageId, clientProcessorId } = processedData;
//
//        const messageIndex = messageQueue.findIndex(msg => msg.id === messageId);
//        if (messageIndex !== -1) {
//            messageQueue[messageIndex].clientProcessorId = clientProcessorId;
//            io.emit('updateQueue', messageQueue); // Broadcast the updated queue
//            console.log(`Message ID ${messageId} processed by Client ID ${clientProcessorId}`);
//        }
//    });


    // message = url of the image
    socket.on('newMessage', (message) => {
        const data = {
            id: messageId++,
            inferenceSpeed: null,
            probability: null,
            label: null, 
            clientProcessorId: null, // the client id that processed the image
            url: message
        };

        messageQueue.push(data);
        io.emit('updateQueue', messageQueue); // Broadcast the updated queue
        console.log('Broadcasted:', message);
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
