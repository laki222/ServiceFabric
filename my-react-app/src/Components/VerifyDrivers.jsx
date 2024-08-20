import React, { useState, useEffect } from 'react';
import { GetDriversForVerify, VerifyDriver } from '../Services/AdminService.js';



export default function VerifyDrivers() {
    const [drivers, setDrivers] = useState([]);
    const token = localStorage.getItem('token');
    const getAllDriversEndpoint = process.env.REACT_APP_GET_ALL_DRIVERS;
    const verifyDriversEndpoint = process.env.REACT_APP_VERIFY_DRIVER;

    // Function to fetch all drivers
    const fetchDrivers = async () => {
        try {
            const data = await GetDriversForVerify(getAllDriversEndpoint, token);
            console.log("Drivers for verify:", data);
            setDrivers(data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleAccept = async (val) => {
        const { id, email } = val;
        try {
            const data = await VerifyDriver(verifyDriversEndpoint, id, "Accepted", email, token);
            console.log("Drivers for verify:", data);
            fetchDrivers();
            //setDrivers(data.drivers);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };
    const handleDecline = async (val) => {
        const { id, email } = val;
        console.log(id);
        console.log(email);
        try {
            const data = await VerifyDriver(verifyDriversEndpoint, id, "Rejected", email, token);
            console.log("Drivers for verify:", data);
            fetchDrivers();
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    return (
        <div className="centered" style={{ width: '100%', height: '10%' }}>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Verification status</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.filter(val => val.status === 0).map((val) => (
                        <tr key={val.id}>
                            <td>{val.name}</td>
                            <td>{val.lastName}</td>
                            <td>{val.email}</td>
                            <td>{val.username}</td>
                            <td className="icon-container">
                                {val.status === 1 ? (
                                    <></>
                                ) : (
                                    <>
                                        <button
    style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'green', // Tailwind green-500
        color: 'black',
        fontWeight: 'bold',
        borderRadius: '0.375rem', // Tailwind rounded
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out',
        margin:10
    }}
    onClick={() => handleAccept(val)} // Pass val to handleAccept
    aria-label="Accept"
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#38a169'} // Tailwind green-600 on hover
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#48bb78'}
>
    Accept
</button>
<button
    style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'red', // Tailwind red-500
        color: 'black',
        fontWeight: 'bold',
        borderRadius: '0.375rem', // Tailwind rounded
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out'
    }}
    onClick={() => handleDecline(val)}
    aria-label="Decline"
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e53e3e'} // Tailwind red-600 on hover
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f56565'}
>
    Decline
</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};