import React, { useState, useEffect } from 'react';
import { getUserInfo, makeImage,convertDateTimeToDateOnly,changeUserFields } from '../Services/ProfileService.js';
import '../Style/Profile.css';


export default function EditProfile({ userId }) {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        birthday: '',
        address: '',
        email: '',
        password: '',
        imageUrl: null,
        username: '',
    });

    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [imageFile, setImageFile] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const token = localStorage.getItem('token');

    const getUserInfoEndpoint = process.env.REACT_APP_GET_USER_INFO;
    const apiEndpoint = process.env.REACT_APP_GET_USER_UPDATE;

    const fetchUserInfo = async () => {
        try {
            const data = await getUserInfo(token,getUserInfoEndpoint, userId);
            console.log(data.user);
            setPassword(data.user.password);
            console.log(data.user.password);
            setUser({
                firstName: data.user.firstName || '',
                lastName:  data.user.lastName || '',
                birthday:  convertDateTimeToDateOnly(data.user.birthday) || '',
                address:  data.user.address || '',
                email:  data.user.email || '',
                password: data.user.password || '', // Assuming you don't pre-fill the password
               // Assuming you will handle file upload separately
                username:  data.user.username || '',
            });
            
            setImageFile(makeImage(data.user.imageFile));
            setBirthday(convertDateTimeToDateOnly(data.user.birthday))
          

        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    useEffect(() => {
        console.log('isEditing has changed:', isEditing);
        console.log(password);
        fetchUserInfo();
    }, [userId]);

   
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
        console.log(user.firstName);
    };

    const handleFileChange = (e) => {
        setUser({ ...user, imageUrl: e.target.files[0] });
    };

    const handleEditClick = () => {
        console.log('Edit button clicked');
        setIsEditing(true); // Enable editing mode
       
    };
    const handleCancelClick = async () => {
        setIsEditing(false); // Disable editing mode
        await fetchUserInfo(); // Reload user info
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageFile(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };


    const handleSaveClick = async () => {
        const ChangedUser = await changeUserFields(apiEndpoint, user.firstName, user.lastName, user.birthday, user.address, user.email, user.password, selectedFile, user.username, token, user.password, user.repeatNewPassword, user.oldPassword, userId);
        console.log("Changed user:", ChangedUser);

       
        setIsEditing(false);
    }

    return (
        <div className="profile-form">
          <h2>{isEditing ? 'Edit Profile' : 'Profile'}</h2>
          
          <div className="form-group profile-image">
           
            <div>
              <img
                src={imageFile || 'default-image-url'}
                alt="User"
              />
              {isEditing && (
                <input
                  type="file"
                  name="imageUrl"
                  onChange={handleImageChange}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={user.firstName}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
    
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={user.lastName}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
    
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={user.address}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
    
          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              type="text"
              name="birthday"
              id="birthday"
              value={birthday}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
    
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={user.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
    
          <div className="form-group">
        
            <label  htmlFor="password">Password</label>
            <div>
            <span><i aria-hidden="true" class="fa fa-envelope"></i></span>
            <input
              type="password"
              name="password"
              id="password"
              placeholder='********'
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
            </div>
          </div>
    
         
    
          <div className="buttons">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  className="save-button"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditClick}
                className="edit-button"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      );
    }