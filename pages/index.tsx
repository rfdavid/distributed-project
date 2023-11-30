import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import ImageCanvas from "../components/ImageCanvas";

import { inferenceSqueezenet } from '../utils/predict';

const Home: NextPage = () => {
  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [clients, setClients] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageQueue, setMessageQueue] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    let localUpdatedQueue = [];  // Local variable to track the queue


    newSocket.on('connect', () => {
      setClientId(newSocket.id);

        newSocket.on('clients', (clientList: string[]) => {
        setClients(clientList);
        });

        newSocket.on('updateQueue', (updatedQueue) => {
            setMessageQueue(updatedQueue);

            // clear local queue
            if (localUpdatedQueue.length === 0 || localUpdatedQueue.length !== updatedQueue.length) {
                localUpdatedQueue = updatedQueue;
            }
            localUpdatedQueue.forEach((item, index) => {
                if (item.hasOwnProperty('clientProcessorId')) {
                    if (item.clientProcessorId === null) {
                        localUpdatedQueue = updatedQueue;
                        console.log('reset local queue');
                    }
                } else {
                    console.log('reset local queue');
                    localUpdatedQueue = updatedQueue;
                }
            });


//                    localUpdatedQueue = updatedQueue;
            console.log('Loca updated queue length:', localUpdatedQueue.length);
            console.log('Updated queue length:', updatedQueue.length);

            const targetJobIndex = localUpdatedQueue.findIndex(
                item => item.clientProcessorId === newSocket.id && item.status === "waiting"
            );

            let updatedTargetJob = null;

            console.log('Target job index:', localUpdatedQueue);

            if (targetJobIndex !== -1) {
                const targetJob = localUpdatedQueue[targetJobIndex];
                
                if (targetJob.status === "waiting") {  // Check to prevent duplicate processing
                    console.log('Found target item:', targetJob);

                    updatedTargetJob = { ...targetJob, status: "processing" };  // Update the specific item

                    const newQueue = localUpdatedQueue.map((item, index) =>
                            index === targetJobIndex ? updatedTargetJob : item
                    );

                    setMessageQueue(newQueue);
                    localUpdatedQueue = newQueue;
                    newSocket.emit('updateQueueItem', updatedTargetJob); // status: processing

                    const processInference = async () => {
                        let [inferenceResult, inferenceTime] = await inferenceSqueezenet(updatedTargetJob.url);

                        updatedTargetJob.status = "completed";
                        updatedTargetJob.inferenceSpeed = inferenceTime;
                        updatedTargetJob.probability = inferenceResult[0].probability;
                        updatedTargetJob.label = inferenceResult[0].name;
                        console.log("inferenceResult:", inferenceResult);
                        console.log("inferenceTime:", inferenceTime);

                        newSocket.emit('updateQueueItem', updatedTargetJob); // status: completed
                    };

                    processInference();
                }
            }
        });
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

const sendMessage = () => {
  const trimmedMessage = message.trim();

  if (trimmedMessage) {
    socket.emit('newMessage', trimmedMessage);
    setMessage(''); // Clear the textarea
  } else {
    console.log('Cannot send an empty message');
  }
};


  const clearQueue = () => {
    socket.emit('clearQueue');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Distributed Inference Server</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Distributed Inference Server</h1>
        <div>
        <h2>Client ID: {clientId}</h2>
          <h2>Connected Clients:</h2>
          <ul>
            {clients.map(client => <li key={client}>{client}</li>)}
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <textarea 
                style={{
                    width: '600px', 
                    height: '100px', 
                    padding: '10px',
                    border: '1px solid #ccc', 
                    borderRadius: '8px',
                    fontSize: '1rem',
                    marginBottom: '10px',
                    resize: 'vertical'
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />


<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <button
        style={{
            width: '150px',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#808080', /* Changed to gray */
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            marginRight: '10px' /* Added some space between the buttons */
        }}
        onClick={clearQueue}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#696969'} /* Darker gray on hover */
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#808080'}
    >
       Clear Queue
    </button>

    <button
        style={{
            width: '150px',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#0070f3',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
        }}
        onClick={sendMessage}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
    >
        Predict
    </button>
</div>

        </div>

    <h2>Image Queue:</h2>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
    {messageQueue.map((msg, index) => (
        <div 
        key={index} 
        style={{
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
        }}
        >
            <img src={msg.url} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} alt="Image" />
            <div style={{ padding: '10px' }}>
                <p><strong>Node:</strong> {msg.clientProcessorId}</p>
                <p><strong>Classification:</strong> {msg.label}</p>
                <p>
                    <strong>Status: </strong> 
                    {msg.status}
                    {msg.status === "processing" && <span style={{ color: 'orange', marginLeft: '5px' }}>⏳</span>}
                    {msg.status === "completed" && <span style={{ color: 'green', marginLeft: '5px' }}>✅</span>}
                </p>
                <p><strong>Probability:</strong> {(msg.probability * 100).toFixed(2)}%</p>
                <p><strong>Inference Speed:</strong> {msg.inferenceSpeed}s</p>
            </div>


        </div>
    ))}
    </div>


      </main>
    </div>
  )
}

export default Home;

