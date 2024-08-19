import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getEstimation, convertTimeStringToMinutes } from '../Services/EstimationService.js';
import { getCurrentRide, AcceptDrive } from '../Services/RiderService.js';
import RidesRider from './RidesRider.jsx';
import Rate from './RateRides.jsx';
import EditProfile from './EditProfile.jsx'
import Chat from './Chat.jsx'

import { Link } from 'react-router-dom';



export default function RiderDashboard(props) {
    const user = props.user;
    const jwt = localStorage.getItem('token');
    const navigate = useNavigate();
    const apiEndpointEstimation = process.env.REACT_APP_GET_ESTIMATION_PRICE;
    const apiEndpointAcceptDrive = process.env.REACT_APP_ACCEPT_SUGGESTED_DRIVE;
    const apiEndpointForCurrentDrive = process.env.REACT_APP_CURRENT_TRIP;

    const [destination, setDestination] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [estimation, setEstimation] = useState('');
    const [isAccepted, setIsAccepted] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [driversArivalSeconds, setDriversArivalSeconds] = useState('');
    const [tripTicketSubmited, setTripTicketSubmited] = useState(false);
    const userId = user.id;
    localStorage.setItem("userId", userId);

    const [activeTrip, setActiveTrip] = useState();
    const [clockSimulation, setClockSimulation] = useState('');

    const handleEstimationSubmit = async () => {
        try {
            if (destination === '' || currentLocation === '') {
                alert("Please complete form!");
            } else {
                const data = await getEstimation(jwt, apiEndpointEstimation, currentLocation, destination);
                console.log("This is estimated price and time:", data.price.estimatedArrivalTime );

                const roundedPrice = parseFloat(data.price.price).toFixed(2);
                setDriversArivalSeconds(convertTimeStringToMinutes(data.price.estimatedArrivalTime));
                setEstimation(roundedPrice);
            }
        } catch (error) {
            console.error("Error when trying to show profile", error);
        }
    };

    const handleAcceptDriveSubmit = async () => {
        try {
            const data = await AcceptDrive(apiEndpointAcceptDrive, userId, jwt, currentLocation, destination, estimation, isAccepted, driversArivalSeconds);
            console.log(data);
            if (data.message && data.message === "Request failed with status code 400") {
                alert("You have already submitted a ticket!");
                setDriversArivalSeconds('');
                setEstimation('');
                setCurrentLocation('');
                setDestination('');
            }
        } catch (error) {
            console.error("Error when trying to show profile", error);
        }
    };

    const handleLocationChange = (event) => {
        setCurrentLocation(event.target.value);
    };

    const handleDestinationChange = (event) => {
        setDestination(event.target.value);
    };

    const [view, setView] = useState('editProfile');
    const [CurrentRide, setCurrentRide] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleNewDriveClick = () => {
        setView('newDrive');
    };

    const handleEditProfile = () => {
        setView('editProfile');
    };


    const handleDriveHistory = () => {
        setView('driveHistory');
    };

    const handleRateTrips = () => {
        setView('rateTrips');
    };

    useEffect(() => {
        const fetchRideData = async () => {
            try {
                const data = await getCurrentRide(jwt, apiEndpointForCurrentDrive, userId);
                console.log("Active trip:", data);
                setCurrentRide(data.tripId)
                if (data.error && data.error.status === 400) {
                    setClockSimulation("You don't have an active trip!");
                    return;
                }

                if (data.trip) {
                    if (!data.trip.accepted) {
                        setClockSimulation("Your current ticket is not accepted by any driver!");
                    } else if (data.trip.accepted && data.trip.secondsToDriverArrive > 0) {
                        setView('chat');
                        setClockSimulation(`The driver will arrive in: ${data.trip.secondsToDriverArrive} seconds`);
                    } else if (data.trip.accepted && data.trip.secondsToEndTrip > 0) {
                        setView('chat');
                        setClockSimulation(`The trip will end in: ${data.trip.secondsToEndTrip} seconds`);
                    } else if (data.trip.accepted && data.trip.secondsToDriverArrive === 0 && data.trip.secondsToEndTrip === 0) {
                        setView('editProfile');
                    
                        setClockSimulation("Your trip has ended");
                    }
                } else {
                    setClockSimulation("You don't have an active trip!");
                }
            } catch (error) {
                console.log("Error fetching ride data:", error);
                setClockSimulation("An error occurred while fetching the trip data.");
            }
        };

        fetchRideData();
        const intervalId = setInterval(fetchRideData, 1000);

        return () => clearInterval(intervalId);
    }, [jwt, apiEndpointForCurrentDrive, userId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className="black-headerDashboar flex justify-between items-center p-4">
                <button className="button-logout" onClick={handleSignOut}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>Sign out</span>
                    </div>
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', columnGap: '10px' }}>
                    <div>
                        <p style={{ color: "white", textAlign: "left", fontSize: "20px" }}>Hi, {user.username}</p>
                    </div>
                    <div>
                        <hr style={{ width: '330px' }} />
                    </div>
                    <div>
                        {clockSimulation === "Your current ticket is not accepted by any driver!" || clockSimulation === "You don't have an active trip!" ? (
                            <>
                                <button className="button" onClick={handleEditProfile}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                     
                                        <span>Profile</span>
                                    </div>
                                </button>
                                <button className="button" onClick={handleNewDriveClick}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                     
                                        <span>New drive</span>
                                    </div>
                                </button>
                                <button className="button" onClick={handleDriveHistory}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                       
                                        <span>Driving history</span>
                                    </div>
                                </button>
                                <button className='button' onClick={handleRateTrips}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      
                                        <span>Rate rides</span>
                                    </div>
                                </button>
                            </>
                        ) : null}
                        <p style={{ color: 'white', marginTop: '20px', marginLeft: '20px' }}>{clockSimulation}</p>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {view === 'editProfile' ? (
                       <EditProfile userId={user.id}/>
                    ) : view === 'newDrive' ? (
                        <div style={{
                            width: '100%',
                            height: '100vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            padding: '20px'
                        }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                <input type="text" placeholder="Current Location" value={currentLocation} onChange={handleLocationChange} />
                                <input type="text" placeholder="Destination" value={destination} onChange={handleDestinationChange} />
                                <button onClick={handleEstimationSubmit}>Get Estimation</button>
                                <p>Estimated price: {estimation}</p>
                                <p>Driver Arrival Time: {driversArivalSeconds} minutes</p>
                                <button onClick={handleAcceptDriveSubmit}>Submit Request</button>
                            </div>
                        </div>
                    ) : view === 'driveHistory' ? (
                        <RidesRider />  
                    ) : view === 'chat' ? (
                        <Chat userId={user.id} />
                    
                    ) : view === 'rateTrips' ? (
                        <Rate userId={user.id}/>
                    ) : (
                        <div>Default view or handle cases where view is not recognized</div>
                    )}
                </div>
            </div>
        </div>
    );
}
