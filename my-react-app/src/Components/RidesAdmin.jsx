import React, { useState, useEffect } from 'react';
import { getAllRidesAdmin } from '../Services/AdminService';

export default function RidesAdmin() {
    const [rides, setRides] = useState([]);
    const token = localStorage.getItem('token');
    const apiEndpoint = process.env.REACT_APP_GET_ALL_RIDES_ADMIN; // 
    // Function to fetch all drivers
    const fetchDrivers = async () => {
        try {
            const data = await getAllRidesAdmin(token, apiEndpoint);
            console.log("Rides:", data);
            setRides(data.rides);
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
                        <th>From</th>
                        <th>To</th>
                        <th>Price</th>
                        <th>Accepted by driver</th>
                        <th>Finished</th>
                    </tr>
                </thead>
                <tbody>
                    {rides.map((ride, index) => (
                        <tr key={index}>
                            <td>{ride.currentLocation}</td>
                            <td>{ride.destination}</td>
                            <td>{ride.price}</td>
                            <td>{ride.accepted ? "Yes" : "No"}</td>
                            <td>{ride.isFinished ? "Yes" : "No"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}