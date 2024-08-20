import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { getCurrentRide } from '../Services/RiderService.js';
import { getUserInfo } from '../Services/ProfileService';
import { getCurrentRideDriver } from '../Services/DriverService.js';
import '../Style/Chat.css';
import axios from 'axios';
import { SendMessageApiCall } from '../Services/LoginService.js';

export default function Chat({ userId }) {
  const [connection, setConnection] = useState(null);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [trip, setTrip] = useState('');
  const [userCurrent, setUserCurrent] = useState(null);
  const apiEndpointForCurrentRide = process.env.REACT_APP_CURRENT_TRIP;
  const apiForCurrentUserInfo = process.env.REACT_APP_GET_USER_INFO;
  const apiEndpointForCurrentRideDriver = process.env.REACT_APP_CURRENT_TRIP_DRIVER;
  const apiEndpointForChatHub = process.env.REACT_APP_CHAT_HUB;
  const apiEndpointSendMessage = process.env.REACT_APP_SEND_MESSAGE;
  
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(apiEndpointForChatHub)
      .build();

    setConnection(newConnection);

    newConnection.on("ReceiveMessage", (user, message) => {
      setMessages(messages => [...messages, { user, message }]);
    });

    newConnection.start()
      .then(() => {
        console.log('Connected!');
        fetchUserInfo();
      })
      .catch(err => console.error(err.toString()));

    return () => {
      newConnection.stop();
    };
  }, [apiEndpointForChatHub]);

  const fetchUserInfo = async () => {
    try {
      const jwt = localStorage.getItem('token');
      const userInfo = await getUserInfo(jwt, apiForCurrentUserInfo, userId);
      console.log("Fetched user info:", userInfo);
      setUserCurrent(userInfo.user);
    } catch (error) {
      console.error('Error fetching user info:', error.message);
    }
  };

  useEffect(() => {
    if (userCurrent) {
      fetchRideData();
    }
  }, [userCurrent]);

  const fetchRideData = async () => {
    try {
      const jwt = localStorage.getItem('token');
      let data;

      if (userCurrent?.typeOfUser === 1) {
        data = await getCurrentRide(jwt, apiEndpointForCurrentRide, userId);
      } else {
        data = await getCurrentRideDriver(jwt, apiEndpointForCurrentRideDriver, userId);
      }

      console.log("Fetched ride data:", data);
      setTrip(data.trip.tripId);

      if (connection) {
        await connection.invoke("JoinRide", data.trip.tripId)
          .catch(err => console.error("Error joining ride:", err.toString()));
      }
    } catch (error) {
      console.error("Error fetching ride data:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    console.log(trip);
    console.log(userCurrent.lastName);
    console.log(message);
console.log(apiEndpointSendMessage);

    try {
      const response = await SendMessageApiCall(trip, userCurrent.lastName, message,"http://localhost:9055/api/Chat/SendMessage");
      console.log('Message sent:', response);
      setMessage(''); // Clear the message input
    } catch (error) {
      console.error("Error sending message:", error);
      alert('Error sending message. Please try again!');
    }
  };

  return (
    <div className="container" style={{  backgroundColor: 'black' }}>
      <div className="row p-1">
        <div className="col-1" style={{  color: 'orange' }}>User</div>
        <div className="col-5">
          <input
            type="text"
            value={userCurrent?.firstName || ''}
            readOnly
          />
        </div>
      </div>
      <div className="row p-1">
        <div className="col-1" style={{  color: 'orange' }}>Message</div>
        <div className="col-5">
          <input
            type="text"
            className="w-100"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
      </div>
      <div className="row p-1">
        <div className="col-6 text-end">
          <input
            type="button"
            value="Send Message"
            onClick={handleSendMessage}
            disabled={!connection}
          />
        </div>
      </div>
      <div className="row p-1">
        <div className="col-6">
          <hr />
        </div>
      </div>
      <div className="row p-1">
        <div className="col-6">
          <ul className="chat-list">
            {messages.map((msg, index) => (
              <li key={index} className={msg.user === userCurrent?.firstName ? 'message-right' : 'message-left'}>
                <p><strong>{msg.user}:</strong></p>
                <p>{msg.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
