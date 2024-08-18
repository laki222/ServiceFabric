import axios from "axios";
import qs from 'qs';

export function makeImage(imageFile) {
    if (imageFile.fileContent) {
        const byteCharacters = atob(imageFile.fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: imageFile.contentType });
        const url = URL.createObjectURL(blob);
        return url;
    }
}
export function convertDateTimeToDateOnly(dateTime) {
    const dateObj = new Date(dateTime);

    // Get the date components
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();

    // Format the date as 'DD-MM-YYYY'
    return `${day.toString().padStart(2, '0')}-${(month + 1).toString().padStart(2, '0')}-${year}`;
}


export async function changeUserFields(apiEndpoint, firstName, lastName, birthday, address, email, password, imageUrl, username, jwt, newPassword, newPasswordRepeat, oldPasswordRepeat,id) {
    const formData = new FormData();
    formData.append('FirstName', firstName);
    formData.append('LastName', lastName);
    formData.append('Birthday', birthday);
    formData.append('Address', address);
    formData.append('Email', email);
    formData.append('PreviousEmail',email)
    formData.append("Id",id);
    if(newPassword!='') {
        
        formData.append('Password', newPassword);
    }
    
    formData.append('ImageUrl', imageUrl);
    formData.append('Username', username);

    if(oldPasswordRepeat!='' || newPasswordRepeat!='' || newPassword!='' && checkNewPassword(password,oldPasswordRepeat,newPassword,newPasswordRepeat)){
            console.log("Succesfully entered new passwords");
            const dataOtherCall = await changeUserFieldsApiCall(apiEndpoint,formData,jwt);
            console.log("data other call",dataOtherCall);
            return dataOtherCall.changedUser;
    }else if(oldPasswordRepeat=='' && newPasswordRepeat=='' && newPassword==''){
        const data = await changeUserFieldsApiCall(apiEndpoint,formData,jwt);
        return data.changedUser;
    }

    
}


export async function getUserInfo(jwt, apiEndpoint, userId) {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            }
        };

        const queryParams = qs.stringify({ Id: userId });

        const url = `${apiEndpoint}?${queryParams}`;
        const response = await axios.get(url, config);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error('Error fetching data (async/await):', error.message);
        throw error;
    }
}



export async function changeUserFieldsApiCall(apiEndpoint,formData,jwt){
    try {
        const response = await axios.put(apiEndpoint, formData, {
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'multipart/form-data'
            }
        
        });
        return response.data;
    } catch (error) {
        console.error('Error while calling API to change user fields:', error);
    }
}


export function checkNewPassword(oldPassword,oldPasswordRepeat,newPassword,newPasswordRepeat) {
  
    if (oldPassword != oldPasswordRepeat) {
        alert("Old Password You Entered Was Incorrect");
        return false;
    }
    if (newPassword == newPasswordRepeat) return true;
    else {
        alert("New Passwords do NOT match");
        return false;
    }
}
