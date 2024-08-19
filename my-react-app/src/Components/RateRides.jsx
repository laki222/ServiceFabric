import React, { useState, useEffect } from 'react';

import { getAllUnRatedTrips } from '../Services/RiderService';

import { SubmitRating } from '../Services/RiderService';
export default function RateRides({ userId }) {
    const [rides, setRides] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const token = localStorage.getItem('token');
    const apiEndpoint = process.env.REACT_APP_GET_ALL_UNRATED_TRIPS;
    const ratintEndpoint = process.env.REACT_APP_SUMBIT_RATING;
    // Function to fetch all unrated trips
    const fetchDrivers = async () => {
        try {
            const data = await getAllUnRatedTrips(token, apiEndpoint);
            console.log("Rides:", data.rides);
            setRides(data.rides);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    // Function to handle rating selection
    const handleRating = (tripId, rating) => {
        setSelectedTripId(tripId);
        setSelectedRating(rating);
    };

    // Function to submit rating to the backend
    const submitRatingToBackend = async () => {
        if (selectedTripId && selectedRating) {
            try {
                console.log("Usao");
                console.log(selectedTripId);
                console.log(selectedRating);
                //await submitRating(token, selectedTripId, selectedRating);
                const data = await SubmitRating(ratintEndpoint,token,selectedRating,selectedTripId);
                console.log(data);
                console.log("Rating submitted successfully");
                fetchDrivers(); // Refresh the list after submitting
            } catch (error) {
                console.error('Error submitting rating:', error);
            }
        }
    };

    return (
        <div className="centered" style={{ width: '100%', height: '10%' }}>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rides.filter(val => val.riderId === userId).map((ride, index) => (
                        <tr key={index}>
                            <td>{ride.currentLocation}</td>
                            <td>{ride.destination}</td>
                            <td>{ride.price}</td>
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <input 
    type="number" 
    onChange={(e) => {
        let value = parseInt(e.target.value);
        if (value >= 1 && value <= 5) {
            handleRating(ride.tripId, value);
        } else {
            alert('Rating must be between 1 and 5');
            e.target.value = 1; // Postavi vrednost na minimalno dozvoljenu (1)
        }
    }} 
    min="1" 
    max="5"
/>

                               
                               
                              
                                </div>
                            </td>
                            <td>
                                {selectedTripId === ride.tripId && (
                                    <button
                                        onClick={submitRatingToBackend}
                                        style={{
                                            borderRadius: '20px',
                                            padding: '5px 10px',
                                            color: 'red',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            background: 'green'
                                        }}
                                    >
                                        Submit
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}