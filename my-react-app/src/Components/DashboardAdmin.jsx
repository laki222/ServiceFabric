import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import DriversView from './DriversView.jsx';
import VerifyDrivers from './VerifyDrivers.jsx';
import RidesAdmin from './RidesAdmin.jsx';
import EditProfile from './EditProfile.jsx'
import '../Style/DashboardRider.css';


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
                    <div>
                      
                           <>
                           <button className="button profile-button" onClick={handleEditProfile}>
                               <span>Profile</span>
                           </button>
                           <button className="button new-drive-button" onClick={handleShowAllRides}>
                               <span>All rides</span>
                           </button>
                           <button className="button drive-history-button" onClick={handleShowDriversForVerification}>
                               <span>Drivers for verify</span>
                           </button>
                           <button className="button rate-trips-button" onClick={handleShowDrivers}>
                               <span>All drivers</span>
                           </button>
                       </>
                       </div>
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
