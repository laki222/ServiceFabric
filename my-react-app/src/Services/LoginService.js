import axios from "axios";


export async function LoginApiCall(email, password, apiEndpoint) {
    try {
        const response = await axios.post(apiEndpoint, {
            email: email,
            password: password.toString()
        });
        return response.data;
    } catch (error) {
        console.error('Error while calling api for login user:', error);
    }
}