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
        <div className="centered" style={{ width: '100%', height: '90%' }}>
            <table className="styled-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', color: '#333' }}>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Start point</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Destination</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Price</th>
                        <th style={{ padding: '10px', textAlign: 'center', backgroundColor: '#ADD8E6', color: 'black' }}>Rating</th>
                        <th style={{ padding: '10px', textAlign: 'center', backgroundColor: '#4CAF50', color: 'black' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rides.filter(val => val.riderId === userId).map((ride, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{ride.currentLocation}</td>
                            <td style={{ padding: '10px' }}>{ride.destination}</td>
                            <td style={{ padding: '10px' }}>{ride.price}</td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="5" 
                                    onChange={(e) => {
                                        let value = parseInt(e.target.value);
                                        if (value >= 1 && value <= 5) {
                                            handleRating(ride.tripId, value);
                                        } else {
                                            alert('Rating must be between 1 and 5');
                                            e.target.value = 1; // Postavi vrednost na minimalno dozvoljenu (1)
                                        }
                                    }} 
                                    style={{ width: '60px', textAlign: 'center' }}
                                />
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                                {selectedTripId === ride.tripId && (
                                    <button
                                        onClick={submitRatingToBackend}
                                        style={{
                                            borderRadius: '20px',
                                            padding: '5px 10px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            background: 'green',
                                            border: 'none'
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