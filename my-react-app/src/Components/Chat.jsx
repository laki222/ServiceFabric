import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { getCurrentRide} from '../Services/RiderService.js';
import { getUserInfo } from '../Services/ProfileService';
import { getCurrentRideDriver } from '../Services/DriverService.js';
import '../Style/Chat.css';

export default function Chat({ userId }) {
  const [connection, setConnection] = useState(null);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [trip, setTrip] = useState('');
  const [userCurrent, setUserCurrent] = useState('');
  const apiEndpointForCurrentRide = process.env.REACT_APP_CURRENT_TRIP;
  const apiForCurrentUserInfo = process.env.REACT_APP_GET_USER_INFO;
  const apiEndpointForCurrentRideDriver = process.env.REACT_APP_CURRENT_TRIP_DRIVER;
  const apiEndpointForChatHub = process.env.REACT_APP_CHAT_HUB;



  useEffect(() => {
    
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(apiEndpointForChatHub)
      .build();

    setConnection(newConnection);
    setUser(userId);
    
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
  }, [userId]); // Dodaj userId kao zavisnost ako može da se menja

  const fetchUserInfo = async () => {
    try {
        const jwt = localStorage.getItem('token');
        const userInfo = await getUserInfo(jwt, apiForCurrentUserInfo, userId);
        console.log("Fetched user info:", userInfo);
        setUserCurrent(userInfo.user);

        // Pokreni fetchRideData samo nakon što su korisničke informacije ažurirane
        // Koristimo useEffect da se izvrši kada se userCurrent ažurira
    } catch (error) {
        console.error('Error fetching user info:', error.message);
    }
};

useEffect(() => {
    if (userCurrent) {
        fetchRideData();
    }
}, [userCurrent]); // Ova useEffect će se izvršiti kada se userCurrent ažurira

const fetchRideData = async () => {
    try {
        const jwt = localStorage.getItem('token');
        console.log("Current user type:", userCurrent?.typeOfUser);

        let data;
        if (userCurrent?.typeOfUser === 1) {
            data = await getCurrentRide(jwt, apiEndpointForCurrentRide, userId);
            console.log("rider data:", data);
        } else {
            data = await getCurrentRideDriver(jwt, apiEndpointForCurrentRideDriver, userId);
            console.log("driver data:", data);
        }
        
        console.log(data);
        setTrip(data.trip.tripId);

        if (connection) {
            await connection.invoke("JoinRide", data.trip.tripId)
                .catch(err => console.error("Error joining ride:", err.toString()));
        }

    } catch (error) {
        console.log("Error fetching ride data:", error);
    }
};

  const sendMessage = (event) => {
    event.preventDefault();

    if (connection) {
      connection.invoke("SendMessage", trip, userCurrent.firstName, message)
        .catch(err => console.error(err.toString()));
    }
  };

 

  return (
    <div className="container">
      <div className="row p-1">
        <div className="col-1">User</div>
        <div className="col-5">
          <input 
            type="text" 
            value={userCurrent.firstName} 
            onChange={e => setUser(e.target.value)} 
            readOnly
          />
        </div>
      </div>
      <div className="row p-1">
        <div className="col-1">Message</div>
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
            onClick={sendMessage} 
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
            <li key={index} className={msg.user === userCurrent.firstName ? 'message-left' : 'message-right'}>
              <p><strong>{msg.user}:</strong></p>
              <p>{msg.message}</p>
            </li>
          ))}
        </ul>
        </div>
      </div>
      <div className="row p-1">
        <div className="col-6">
          
        </div>
      </div>
    </div>
  );
}
