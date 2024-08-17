import axios from "axios";

export function DropErrorForField(firstNameError, lastNameError, birthdayError, addressError, usernameError, emailError,passwordError, repeatPasswordError, imageUrlError) {
    let isValid = true;

    if (firstNameError) {
        alert("First Name is required");
        isValid = false;
    } else if (lastNameError) {
        alert("Last Name is required");
        isValid = false;
    } else if (birthdayError) {
        alert("You must be older than 18");
        isValid = false;
    } else if (addressError) {
        alert("Address is required");
        isValid = false;
    } else if (usernameError) {
        alert("Username is required");
        
        isValid = false;
    } else if (emailError) {
        alert("This is not a valid email!");
        isValid = false;
    }else if (passwordError || repeatPasswordError) {
            alert("Passwords do NOT match!");
            isValid = false;
    } else if (imageUrlError) {
        alert("Image is required");
        isValid = false;
    }

    return isValid;
}

export async function RegisterApiCall(
    firstNameError,
    lastNameError,
    birthdayError,
    addressError,
    usernameError,
    emailError,
    passwordError,
    repeatPasswordError,
    imageUrlError,
    firstName,
    lastName,
    birthday,
    address,
    email,
    password,
    repeatPassword,
    imageUrl,
    typeOfUser,
    username,
    apiEndpoint
) {

   
    const isCompleted = DropErrorForField(
        firstNameError,
        lastNameError,
        birthdayError,
        addressError,
        usernameError,
        emailError,
        passwordError,
        repeatPasswordError,
        imageUrlError
    );

    if (isCompleted) {
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('birthday', birthday);
        formData.append('address', address);
        formData.append('email', email);
        formData.append('password', password);  
        formData.append('typeOfUser', typeOfUser);
        formData.append('username', username);
        formData.append('imageUrl', imageUrl);  // Assuming imageUrl is a File object
        

        try {
            const response = await axios.post(apiEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return true;
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert(error.response.data + "\nTry another email!!!");
            } else {
                console.error("An error occurred:", error);
            }
        }
    }
    return false;
}
