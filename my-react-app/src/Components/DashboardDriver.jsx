import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { getUserInfo } from '../Services/ProfileService';
import { getAllAvailableRides } from '../Services/DriverService.js'
import { AcceptDrive } from '../Services/DriverService.js';
import {getCurrentRideDriver} from '../Services/DriverService.js';
import RidesDriver from './RidesDriver.jsx'
import EditProfile from './EditProfile.jsx'
import Chat from './Chat.jsx'

export default function DashboardDriver(props) {

    const user = props.user;
    const userId = user.id;
    localStorage.setItem("userId",userId);
    const jwt = localStorage.getItem('token');
    const navigate = useNavigate();

    const apiForCurrentUserInfo = process.env.REACT_APP_GET_USER_INFO;
    const apiEndpointForCurrentRide = process.env.REACT_APP_CURRENT_TRIP_DRIVER;
    
    const apiAcceptDrive = process.env.REACT_APP_ACCEPT_RIDE_DRIVER;
    const [currentUser, setUserInfo] = useState('');


    const [isBlocked, setIsBlocked] = useState(false);
    const [isVerified, setIsVerified] = useState('');
    const [status, setStatus] = useState('');
    const [username, setUsername] = useState('');
    const [view, setView] = useState('editProfile');

    // Initial user info state
    const [initialUser, setInitialUser] = useState({});
    const [tripIsActive, setTripIsActive] = useState(false); // initial false
    //for rides 
    const [rides, setRides] = useState([]);
    const [currentRide, setCurrentRides] = useState();
    const apiToGetAllRides = process.env.REACT_APP_GET_ALL_RIDES_UNCOMPLETED;
    const [minutesToDriverArrive, setMinutesToDriverArrive] = useState(null);
    const [minutesToEndTrip, setMinutesToEndTrip] = useState(null);
    const [CurrentRide, setCurrentRide] = useState('');

    const [clockSimulation, setClockSimulation] = useState();
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getUserInfo(jwt, apiForCurrentUserInfo, userId);
                const user = userInfo.user;
                console.log(user);
                setIsBlocked(user.isBlocked)
                setIsVerified(user.isVerified)

             
            } catch (error) {
                console.error('Error fetching user info:', error.message);
            }
        };

        fetchUserInfo();
    }, [jwt, apiForCurrentUserInfo, userId]);

    

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

   

    const handleViewRides = async () => {
        try {
            fetchRides();
            setView('rides');
        } catch (error) {
            console.error("Error when I try to show profile", error);
        }
    };

    const fetchRides = async () => {
        try {
            const data = await getAllAvailableRides(jwt, apiToGetAllRides);
            console.log("Rides:", data);
            setRides(data.rides);
            console.log("Seted rides", rides);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

   

    const handleAcceptNewDrive = async (tripId) => {
        console.log(apiAcceptDrive)
        try {
            const data = await AcceptDrive(apiAcceptDrive, userId, tripId, jwt); // Drive accepted
            setCurrentRides(data.ride);
            setCurrentRide(data.ride);
            console.log(data);

            setTripIsActive(true);
            setMinutesToDriverArrive(data.ride.SecondsToDriverArrive);
            setMinutesToEndTrip(data.ride.minutesToEndTrip);
        } catch (error) {
            console.error('Error accepting drive:', error.message);
        }
    };
   

    const handleDriveHistory = () => {
        setView("driveHistory");
    }

    const handleEditProfile = () => {
        setView('editProfile');
    };

    useEffect(() => {
        const fetchRideData = async () => {
            try {
                const data = await getCurrentRideDriver(jwt, apiEndpointForCurrentRide, userId);
                console.log("Active trip:", data);

                


                if (data.error && data.error.status === 400) {
                    setClockSimulation("You don't have an active trip!");
                    return;
                }

                if (data.trip) {
                    console.log("Active trip:", data.trip);

                    if (data.trip.accepted && data.trip.secondsToDriverArrive > 0) {
                        setView('chat');
                        setClockSimulation(`You will arrive in: ${data.trip.secondsToDriverArrive} seconds`);
                    } else if (data.trip.accepted && data.trip.secondsToEndTrip > 0) {
                        setView('chat');
                        setClockSimulation(`The trip will end in: ${data.trip.secondsToEndTrip} seconds`);
                    } else if (data.trip.accepted && data.trip.secondsToDriverArrive === 0 && data.trip.secondsToEndTrip === 0) {
                        setClockSimulation("Your trip has ended");
                        setView('editProfile');
                    }
                } else {
                    setClockSimulation("You don't have an active trip!");
                }
            } catch (error) {
                console.log("Error fetching ride data:", error);
                setClockSimulation("An error occurred while fetching the trip data.");
            }
        };


        // Fetch data immediately on mount
        fetchRideData();

        // Set up an interval to fetch data every 1 second
        const intervalId = setInterval(fetchRideData, 1000);

        // Clean up the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, [jwt, apiEndpointForCurrentRide, userId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', columnGap: '10px' }}>
                    <div className="black-header-dashboard">
                        <button className="button-logout" onClick={handleSignOut}>
                            <span>Sign out</span>
                        </button>
                    </div>
                    <div>
                        <hr style={{ width: '330px' }} />
                    </div>
                    {isBlocked && (
                        <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>
                            <div style={{ width: '20%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', columnGap: '10px' }}>
                                <p style={{ color: "white", textAlign: "left", fontSize: "20px", display: "flex", alignItems: "center" }}>
                                    You are blocked!
                                </p>
                            </div>
                        </div>
                    )}
                    <div>
                        <hr style={{ width: '330px' }} />
                    </div>
                    {clockSimulation === "You don't have an active trip!" && (
                        <>
                            {!isBlocked && isVerified === true && (
                                <>
                                    <button className="button profile-button" onClick={handleEditProfile}>
                                        <span>Profile</span>
                                    </button>
                                    <button className="button new-drive-button" onClick={handleViewRides}>
                                        <span>Available Rides</span>
                                    </button>
                                    <button className="button drive-history-button" onClick={handleDriveHistory}>
                                        <span>Driving History</span>
                                    </button>
                                </>
                            )}
                        </>
                    )}
                    <p style={{ color: 'white', marginTop: '20px', marginLeft: '20px' }}>{clockSimulation}</p>
                </div>
                {!tripIsActive ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '100%', display: 'flex' }}>
                            {view === 'editProfile' ? (
                                <EditProfile userId={user.id} />
                            ) : view === 'rides' ? (
                                clockSimulation === "You don't have an active trip!" && (
                                    <div className="centered" style={{ width: '100%', height: '30%' }}>
                                        <table className="styled-table" style={{ width: '70%' }}>
                                            <thead>
                                                <tr>
                                                    <th>Location</th>
                                                    <th>Destination</th>
                                                    <th>Price</th>
                                                    <th>Confirmation</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rides.map((val) => (
                                                    <tr key={val.tripId}>
                                                        <td>{val.currentLocation}</td>
                                                        <td>{val.destination}</td>
                                                        <td>{val.price}</td>
                                                        <td>
                                                            <button
                                                                style={{
                                                                    borderRadius: '20px',
                                                                    padding: '5px 10px',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer',
                                                                    outline: 'none',
                                                                    background: 'green'
                                                                }}
                                                                onClick={() => handleAcceptNewDrive(val.tripId)}
                                                            >
                                                                Accept
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : view === 'driveHistory' ? (
                                <RidesDriver />
                            ) : null}
                        </div>
                    </div>
                ) : ( <div className="centered" style={{ width: '300%'}}>
                    <Chat userId={user.id} />
                    </div>
                )}
            </div>
        </div>
    );
}    