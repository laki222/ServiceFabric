import React, { useState, useEffect } from 'react';
import {getMyRides} from '../Services/RiderService';
import '../Style/RidesRider.css';

export default function RidesRider() {
    const [rides, setRides] = useState([]);
    const token = localStorage.getItem('token');
    const apiEndpoint = process.env.REACT_APP_GET_ALL_RIDES_RIDER; 
    // Function to fetch all drivers
    const fetchDrivers = async () => {
        try {
            const data = await getMyRides(token,apiEndpoint,localStorage.getItem('userId'));
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
        <div className="centered">
        <table className="styled-table">
            <thead>
                <tr>
                    <th >Start point</th>
                    <th>Destination</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                {rides.map((ride, index) => (
                    <tr key={index}>
                        <td>{ride.currentLocation}</td>
                        <td>{ride.destination}</td>
                        <td>{ride.price}$</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
}