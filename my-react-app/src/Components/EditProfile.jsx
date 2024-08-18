import React, { useState, useEffect } from 'react';
import { getUserInfo, makeImage,convertDateTimeToDateOnly,changeUserFields } from '../Services/ProfileService.js';

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
        <div>
            <div>
            <label>First Name</label>
            <input
                type="text"
                name="firstName"
                value={user.firstName}
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
        </div>
          
        
        <div>
            <label>Last Name</label>
            <input
                type="text"
                name="lastName"
                value={user.lastName}
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
        </div>
        <div>
            <label>Address</label>
            <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
        </div>
        <div>
            <label>Birthday</label>
            <input
                type="text"
                name="birthday"
                value={birthday}
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
           
        </div>
        <div>
            <label>Email</label>
            <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
        </div>
        <div>
            <label>Password</label>
            <input
                type="password"
                name="password"
                
                placeholder='********'
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
        </div>
        <div>
            <label>Profile Image</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={imageFile || 'default-image-url'} // Use a default image if no image is selected
                    alt="User"
                    style={{ width: '100px', height: '100px', marginRight: '15px' }}
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
        <div>
            <label>Username</label>
            <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleInputChange}
                readOnly={!isEditing}
            />
        </div>
        <div>
            {isEditing ? (
                <>
                    <button type="buttom" onClick={handleSaveClick}>Save Changes</button>
                    <button type="button" onClick={handleCancelClick}>Cancel</button>
                </>
            ) : (
                <button type="button" onClick={handleEditClick}>Edit Profile</button>
            )}
        </div>
        </div>
    );
}