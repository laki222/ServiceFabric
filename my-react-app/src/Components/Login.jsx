import React from 'react';
import '../Style/Login.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginApiCall } from '../Services/LoginService';
import {useNavigate} from "react-router-dom";


export default function Login() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(true);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(true);
  const loginApiEndpoint = process.env.REACT_APP_LOGIN_API_URL;


  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
  
    if (emailError) {
      alert("Please type email in correct form!");
    } else if (passwordError) {
      alert("Password needs to have 8 characters, one capital letter, one number, and one special character");
    } else {
      LoginApiCall(email, password, loginApiEndpoint)
        .then((responseOfLogin) => {
          console.log("Response from login user", responseOfLogin);
          console.log(typeof responseOfLogin);
          if("Login successful" === responseOfLogin.message){
            localStorage.setItem('token', responseOfLogin.token);
            navigate("/Dashboard", { state: { user: responseOfLogin.user } });       
          }
        })
        .catch((error) => {
          console.error("Error in login:", error);
          alert('Invalid password or email try again!');
        });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const isValidPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(value);
    if (value.trim() === '') {
      setPasswordError(true);
    
    }
    else {
      setPasswordError(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (value.trim() === '') {
      setEmailError(true);
    } else if (!isValidEmail) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };


  return (
    <div className='font-serif'>
      <div className="black-header">
        <h1>TAXI</h1>
      </div>
      <div className="login-container flex justify-center items-center h-screen">

        <div className="login-form">
          <h3 className='text-4xl dark:text-white font-serif'>LOGIN</h3>
          <hr className="mb-4"></hr>
          <br></br>
          <form onSubmit={handleLoginClick} method='post'>
            <input className="input-field" type="text" placeholder="Email" value={email} onChange={handleEmailChange} />
            <input className="input-field" type="password" placeholder="Password" value={password} onChange={handlePasswordChange} title='Passoword need 8 character one capital letter,number and special character' />
            <button className="login-button" type='submit'>Login</button>
          </form>
          <p className="signup-link">Don't have an account? &nbsp;
            {/* <a href="#" className="text-gray-800 font-bold">Sign up</a> */}
            <Link to="/Register" className="text-gray-800 font-bold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}