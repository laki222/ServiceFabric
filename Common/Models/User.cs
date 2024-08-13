﻿using Common.DTO;
using Common.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class User
    {

        public string Address { get; set; }


        public double AverageRating { get; set; }


        public int SumOfRatings { get; set; }


        public int NumOfRatings { get; set; }


        public DateTime Birthday { get; set; }


        public string Email { get; set; }


        public bool IsVerified { get; set; }


        public bool IsBlocked { get; set; }


        public string FirstName { get; set; }


        public string LastName { get; set; }


        public string Password { get; set; }


        public string Username { get; set; }

        public UserType.Role TypeOfUser { get; set; }


        [DataMember]
        public FileUploadDTO ImageFile { get; set; }

        [DataMember]
        public VerificationStatus.Status Status { get; set; }

        [DataMember]
        public Guid Id { get; set; }

        public string ImageUrl { get; set; }


        public User(UserRegisterDTO userRegister)
        {
            FirstName = userRegister.FirstName;
            LastName = userRegister.LastName;
            Birthday = DateTime.ParseExact(userRegister.Birthday, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            Address = userRegister.Address;
            Email = userRegister.Email;
            Password = userRegister.Password;
            TypeOfUser = Enum.TryParse<UserType.Role>(userRegister.TypeOfUser, true, out var role) ? role : UserType.Role.Rider;
            Username = userRegister.Username;
            Id = Guid.NewGuid();
            switch (TypeOfUser)
            {
                case UserType.Role.Admin:
                    IsVerified = true;
                    break;
                case UserType.Role.Rider:
                    IsVerified = true;
                    break;
                case UserType.Role.Driver:
                    AverageRating = 0.0;
                    IsVerified = false;
                    NumOfRatings = 0;
                    SumOfRatings = 0;
                    IsBlocked = false;
                    Status = VerificationStatus.Status.Processing;
                    break;

            }
            ImageFile = makeFileOverNetwork(userRegister.ImageUrl);
        }



        public User()
        {
        }

        public User(string address, double averageRating, int sumOfRatings, int numOfRatings, DateTime birthday, string email, bool isVerified, bool isBlocked, string firstName, string lastName, string password, string username, UserType.Role typeOfUser, FileUploadDTO imageFile, Guid id)
        {
            Address = address;
            AverageRating = averageRating;
            SumOfRatings = sumOfRatings;
            NumOfRatings = numOfRatings;
            Birthday = birthday;
            Email = email;
            IsVerified = isVerified;
            IsBlocked = isBlocked;
            FirstName = firstName;
            LastName = lastName;
            Password = password;
            Username = username;
            TypeOfUser = typeOfUser;
            ImageFile = imageFile;
            Id = id;
        }

        public User(string address, double averageRating, int sumOfRatings, int numOfRatings, DateTime birthday, string email, bool isVerified, bool isBlocked, string firstName, string lastName, string password, string username, UserType.Role typeOfUser, FileUploadDTO imageFile, string imageUrl, VerificationStatus.Status s, Guid id) : this(address, averageRating, sumOfRatings, numOfRatings, birthday, email, isVerified, isBlocked, firstName, lastName, password, username, typeOfUser, imageFile, id)
        {
            Address = address;
            AverageRating = averageRating;
            SumOfRatings = sumOfRatings;
            NumOfRatings = numOfRatings;
            Birthday = birthday;
            Email = email;
            IsVerified = isVerified;
            IsBlocked = isBlocked;
            FirstName = firstName;
            LastName = lastName;
            Password = password;
            Username = username;
            TypeOfUser = typeOfUser;
            ImageFile = imageFile;
            ImageUrl = imageUrl;
            Status = s;
            Id = id;
        }

        public static FileUploadDTO makeFileOverNetwork(IFormFile file)
        {
            FileUploadDTO fileOverNetwork;

            using (var stream = file.OpenReadStream())
            {
                byte[] fileContent;
                using (var memoryStream = new MemoryStream())
                {
                    stream.CopyTo(memoryStream);
                    fileContent = memoryStream.ToArray();
                }

                fileOverNetwork = new FileUploadDTO(file.FileName, file.ContentType, fileContent);
            }

            return fileOverNetwork;
        }

    }
}
