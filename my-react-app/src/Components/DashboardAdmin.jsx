import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import DriversView from './DriversView.jsx';
import VerifyDrivers from './VerifyDrivers.jsx';
import RidesAdmin from './RidesAdmin.jsx';
import EditProfile from './EditProfile.jsx'

export default function DashboardAdmin(props) {
    const user = props.user;
    const userId = user.id;
    const jwt = localStorage.getItem('token');
    const navigate = useNavigate();

   
    const [username, setUsername] = useState('');

    const [view, setView] = useState('editProfile');


    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleShowDrivers = () => {
        setView('drivers');
    };

    const handleShowDriversForVerification = () => {
        setView('verify');
    };

    const handleShowAllRides = () => {
        setView('rides');
    };

    const handleEditProfile = () => {
        setView('editProfile');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className="black-headerDashboard flex justify-between items-center p-4">
                <button className="button-logout" onClick={handleSignOut}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                       
                        <span>Sign out</span>
                    </div>
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', columnGap: '10px' }}>
                    <div>
                        <p style={{ color: "white", textAlign: "left", fontSize: "20px" }}>Hi, {username}</p>
                    </div>
                    <div>
                        <hr style={{ width: '330px' }} />
                    </div>
                    <button className="button" onClick={handleShowDriversForVerification}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Verify drivers</span>
                        </div>
                    </button>
                    <button className="button" onClick={handleShowDrivers}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Drivers</span>
                        </div>
                    </button>
                    <button className="button" onClick={handleShowAllRides}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Rides</span>
                        </div>
                    </button>
                    <button className="button" onClick={handleEditProfile}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Profile</span>
                        </div>
                    </button>
                </div>

                <div style={{ flex: 1, padding: '20px' }}>
                    {view === 'drivers' ? (
                        <DriversView />
                      ) : view === 'verify' ? (
                        <VerifyDrivers />
                    ) : view === 'rides' ? (
                        <RidesAdmin /> 
                    ) : view === 'editProfile' ? (
                        <EditProfile userId={userId} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
