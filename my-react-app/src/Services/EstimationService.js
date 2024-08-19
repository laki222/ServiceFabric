import axios from "axios";
import qs from 'qs';

export async function getEstimation(jwt, apiEndpoint, currentLocation,Destination) {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            }
        };
      

        const queryParams = qs.stringify({ Destination: Destination,StartLocation:currentLocation });

        const url = `${apiEndpoint}?${queryParams}`;
        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching data (async/await):', error.message);
        throw error;
    }
}




export function convertTimeStringToMinutes(timeString) {
    // Split the time string into its components
    const parts = timeString.split(':');
    
    // Extract hours, minutes, and seconds
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    
    // Convert the time to total minutes
    const totalMinutes = (hours * 60) + minutes + (seconds / 60);
    
    return totalMinutes;
}