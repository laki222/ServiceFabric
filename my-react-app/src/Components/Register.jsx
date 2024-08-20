import React, { useEffect, useState } from 'react';
import '../Style/Register.css';
import { gapi } from 'gapi-script';
import { Link } from 'react-router-dom';
import { RegisterApiCall } from '../Services/RegisterService.js';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode}  from 'jwt-decode';


export default function Register() {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const regularRegisterApiEndpoint = process.env.REACT_APP_REGISTER_API_URL;

    

    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState(true);

    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState(true);

    const [birthday, setBirthday] = useState('');
    const [birthdayError, setBirthdayError] = useState(true);

    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState(true);

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState(true);

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(true);

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(true);

    const [repeatPassword, setRepeatPassword] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState(true);

    const [typeOfUser, setTypeOfUser] = useState('Driver');
    const [typeOfUserError, setTypeOfUserError] = useState(false);

    const [imageUrl, setImageUrl] = useState(null);
    const [imageUrlError, setImageUrlError] = useState(true);


    const navigate = useNavigate();
    const handleRegisterClick = async (e) => {
        e.preventDefault();

        const resultOfRegister = await RegisterApiCall(
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
            regularRegisterApiEndpoint
        );
        if (resultOfRegister) {
            alert("Successfully registered!");
            navigate("/");
        }
    };
    
    const handleTypeOfUserChange = (e) => {
        const value = e.target.value;
        setTypeOfUser(value);
        if (value.trim() === '') {
            setTypeOfUserError(true);
        } else {
            setTypeOfUserError(false);
        }
    };

    const handleInputChange = (setter, errorSetter) => (e) => {
        const value = e.target.value;
        setter(value);
        errorSetter(value.trim() === '');
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmailError(!isValidEmail);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        const isValidPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(value);
        setPasswordError(!isValidPassword);
    };

    const handleRepeatPasswordChange = (e) => {
        const value = e.target.value;
        setRepeatPassword(value);
        setRepeatPasswordError(value !== password);
    };

    const handleImageUrlChange = (e) => {
        const selectedFile = e.target.files[0];
        setImageUrl(selectedFile || null);
        setImageUrlError(!selectedFile);
    };

    useEffect(() => {
        if (clientId) {
            function start() {
                gapi.client.init({
                    clientId: clientId,
                    scope: ""
                });
            }
            gapi.load('client:auth2', start);
        } else {
            console.error("Client ID is not defined in .env file");
        }
    }, [clientId]);

    const onSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode (credentialResponse.credential);
            const profile = {
                email: decoded.email,
                firstName: decoded.given_name,
                lastName: decoded.family_name
            };

            setEmail(profile.email);
            setFirstName(profile.firstName);
            setLastName(profile.lastName);
            
            setEmailError(!profile.email);
            setFirstNameError(!profile.firstName);
            setLastNameError(!profile.lastName);

            alert("Please complete other fields!");
        } catch (error) {
            console.error("Error decoding token", error);
        }
    }

    const onFailure = (res) => {
        console.log("Failed to register:", res);
    }


    return (
        <div>
            <div className='black-header'>
                <h1>TAXI</h1>
            </div>
            <div className="register-container">
                <div className="register-form">
                    <h3 className='text-4xl dark:text-white font-serif'>Registration</h3>
                    <hr />
                    <br />
                    <div className="flex flex-col md:flex-row w-max">
                        <form onSubmit={handleRegisterClick} encType="multipart/form-data" method='post'>
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: firstNameError ? '#EF4444' : '#E5E7EB' }}
                                                type="text"
                                                placeholder="First Name"
                                                value={firstName || ''}
                                                onChange={handleInputChange(setFirstName, setFirstNameError)}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: lastNameError ? '#EF4444' : '#E5E7EB' }}
                                                type="text"
                                                placeholder="Last Name"
                                                value={lastName || ''}
                                                onChange={handleInputChange(setLastName, setLastNameError)}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='font-serif font-bold'>Date of birth</td>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: birthdayError ? '#EF4444' : '#E5E7EB' }}
                                                type="date"
                                                value={birthday || ''}
                                                onChange={handleInputChange(setBirthday, setBirthdayError)}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: addressError ? '#EF4444' : '#E5E7EB' }}
                                                type="text"
                                                placeholder="Address"
                                                value={address || ''}
                                                onChange={handleInputChange(setAddress, setAddressError)}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: usernameError ? '#EF4444' : '#E5E7EB' }}
                                                type="text"
                                                placeholder="Username"
                                                value={username || ''}
                                                onChange={handleInputChange(setUsername, setUsernameError)}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: emailError ? '#EF4444' : '#E5E7EB' }}
                                                type="email"
                                                placeholder="Email"
                                                value={email || ''}
                                                onChange={handleEmailChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: passwordError ? '#EF4444' : '#E5E7EB' }}
                                                type="password"
                                                title='Password needs 8 characters, one capital letter, number, and special character'
                                                placeholder="Password"
                                                value={password || ''}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: repeatPasswordError ? '#EF4444' : '#E5E7EB' }}
                                                type="password"
                                                placeholder="Repeat Password"
                                                value={repeatPassword || ''}
                                                onChange={handleRepeatPasswordChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                    <td><label className='font-serif font-bold'>Type of user:</label></td>
                                        <td>
                                        <select className={`input-field mb-4 w-full md:ml-2`}
                                                style={{ borderColor: typeOfUserError ? '#EF4444' : '#E5E7EB' }}
                                                value={typeOfUser}
                                                onChange={handleTypeOfUserChange}

                                            >
                                                <option>Driver</option>
                                                <option>Rider</option>
                                                <option>Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className='font-serif font-bold'>Profile picture:</label></td>
                                        <td> 
                                            <input
                                                className={`input-field mb-4 w-full md:ml-2`}
                                                type="file"
                                                onChange={handleImageUrlChange}
                                                required
                                            /></td>
                                    </tr>
                                </tbody>
                            </table>
                            <button type="submit" className="btn btn-primary">Register</button>
                        </form>
                    </div>
                    <br />
                    <GoogleLogin
            onSuccess={onSuccess}
            onError={() => {
                console.log('Login Failed');
            }}
        />

                    <br />
                    <br />
                    <Link to="/" className='link-underline'>Already registered? <b>Login now!</b></Link>
                </div>
            </div>
        </div>
    );
}