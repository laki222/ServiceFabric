import React, { useState, useEffect } from 'react';
import {getMyRidesDriver} from '../Services/DriverService';

export default function RidesDrivers() {
    const [rides, setRides] = useState([]);
    const token = localStorage.getItem('token');
    const apiEndpoint = process.env.REACT_APP_GET_ALL_RIDES_DRIVER; 
    // Function to fetch all drivers
    const fetchDrivers = async () => {
        try {
            const data = await getMyRidesDriver(token,apiEndpoint,localStorage.getItem('userId'));
            console.log("Rides:", data.rides);
            setRides(data.rides);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    

    return (
        <div className="centered" >
            <table className="styled-table" >
                <thead>
                    <tr style={{ backgroundColor: '#4CAF50', color: 'white', textAlign: 'center' }}>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>From</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>To</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {rides.map((ride, index) => (
                        <tr key={index} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{ride.currentLocation}</td>
                            <td style={{ padding: '10px' }}>{ride.destination}</td>
                            <td style={{ padding: '10px' }}>{ride.price} &euro;</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}    