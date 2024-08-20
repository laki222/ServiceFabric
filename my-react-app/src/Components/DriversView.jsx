import React, { useState, useEffect } from 'react';
import { ChangeDriverStatus, GetAllDrivers } from '../Services/AdminService.js';
import '../Style/DriversAdmin.css';

export default function DriversView() {
    const [drivers, setDrivers] = useState([]);
    const token = localStorage.getItem('token');
    
    const apiEndpoint = process.env.REACT_APP_CHANGE_DRIVER_STATUS;
    const getAllDriversEndpoint = process.env.REACT_APP_GET_ALL_DRIVERS;

    // Function to fetch all drivers
    const fetchDrivers = async () => {
        try {
            const data = await GetAllDrivers(getAllDriversEndpoint, token);
            console.log("Drivers:",data);
            setDrivers(data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleChangeStatus = async (id, isBlocked) => {
        try {
            await ChangeDriverStatus(apiEndpoint, id, !isBlocked, token); // Toggle the isBlocked value
            await fetchDrivers(); // Refresh the list of drivers
        } catch (error) {
            console.error('Error changing driver status:', error);
        }
    };

    return (
        <div >
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Average Rating</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((val) => (
                        <tr key={val.id}>
                            <td>{val.name}</td>
                            <td>{val.lastName}</td>
                            <td>{val.email}</td>
                            <td>{val.username}</td>
                            <td>{val.averageRating}</td>
                            <td>
                                {val.isBlocked ? (
                                    <button className="green-button" onClick={() => handleChangeStatus(val.id, val.isBlocked)}>Unblock</button>
                                ) : (
                                    <button className="red-button" onClick={() => handleChangeStatus(val.id, val.isBlocked)}>Block</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}