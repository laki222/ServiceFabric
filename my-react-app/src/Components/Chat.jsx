import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { getCurrentRide} from '../Services/RiderService.js';
import { getUserInfo } from '../Services/ProfileService';
import { getCurrentRideDriver } from '../Services/DriverService.js';


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

  useEffect(() => {
    
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:9055/chatHub")
      .build();

    setConnection(newConnection);
    setUser(userId);
    
    newConnection.on("ReceiveMessage", (user, message) => {
      setMessages(messages => [...messages, `${user} says ${message}`]);
    });

    newConnection.start()
      .then(() => {
        console.log('Connected!');
        fetchUserInfo();
        fetchRideData(); // Premesti ovu funkciju unutar then blok
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
        console.log(userInfo);
        setUserCurrent(userInfo.user);
        console.log(user);
       

     
    } catch (error) {
        console.error('Error fetching user info:', error.message);
    }
};



  const fetchRideData = async () => {
    try {
        const jwt = localStorage.getItem('token');
      

      if (userCurrent.typeOfUser
        ===1) {

      const data = await getCurrentRide(jwt, apiEndpointForCurrentRide, userId);
      console.log("rider");
      console.log(data);
      setTrip(data.trip.tripId);
      }else{
        const data = await getCurrentRideDriver(jwt, apiEndpointForCurrentRideDriver, userId);
        console.log("driver");
        console.log(data);
        setTrip(data.trip.tripId);

      }
    
     
      
    } catch (error) {
      console.log("Error fetching ride data:", error);
    
    }
  };

  const sendMessage = (event) => {
    event.preventDefault();

    if (connection) {
      connection.invoke("SendMessage", trip, userId, message)
        .catch(err => console.error(err.toString()));
    }
  };

  const joinRide = (event) => {
    event.preventDefault();

    if (connection) {
      connection.invoke("JoinRide", trip)
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
            value={user} 
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
          <input 
            type="button" 
            value="Join Chat" 
            onClick={joinRide} 
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
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
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
