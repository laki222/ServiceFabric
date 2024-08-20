import axios from 'axios';

export async function LoginApiCall(email, password, apiEndpoint) {
    try {
        const response = await axios.post(apiEndpoint, {
            email: email,
            password: password.toString()
        });
        return response.data;
    } catch (error) {
        console.error('Error while calling API for login user:', error);
    }
}

export async function SendMessageApiCall(rideid, senderid, content, apiEndpoint) {
    console.log(apiEndpoint);
    try {
        const response = await axios.post(apiEndpoint, {
            RideId: rideid,
            SenderId: senderid,
            Content: content
        });
        return response.data;
    } catch (error) {
        console.error('Error while sending message:', error);
    }
}
