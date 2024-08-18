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
                                            className="custom-button accept-button"
                                            onClick={() => handleAccept(val)} // Pass val to handleAccept
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="custom-button decline-button"
                                            onClick={() => handleDecline(val)}
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