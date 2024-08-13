﻿using Common.Models;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class UserEntity:TableEntity
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

       
        public string TypeOfUser { get; set; }

        public string ImageUrl { get; set; }
       
        public string Status { get; set; }

        public Guid Id { get; set; }
        public UserEntity()
        {
        }

        public UserEntity(User u, string imageUrl)
        {
            RowKey = u.Username; // key username of user
            PartitionKey = u.TypeOfUser.ToString(); // partition key je tip user-a
            Address = u.Address;
            AverageRating = u.AverageRating;
            SumOfRatings = u.SumOfRatings;
            NumOfRatings = u.NumOfRatings;
            Birthday = u.Birthday;
            Email = u.Email;
            IsVerified = u.IsVerified;
            IsBlocked = u.IsBlocked;
            FirstName = u.FirstName;
            LastName = u.LastName;
            Password = u.Password;
            Username = u.Username;
            TypeOfUser = u.TypeOfUser.ToString();
            Status = u.Status.ToString();
            ImageUrl = imageUrl; // location of image in blob
            Id = u.Id;

        }



        public UserEntity(User u)
        {
            RowKey = u.Username; // key username of user
            PartitionKey = u.TypeOfUser.ToString(); // partition key je tip user-a
            Address = u.Address;
            AverageRating = u.AverageRating;
            SumOfRatings = u.SumOfRatings;
            NumOfRatings = u.NumOfRatings;
            Birthday = u.Birthday;
            Email = u.Email;
            IsVerified = u.IsVerified;
            IsBlocked = u.IsBlocked;
            FirstName = u.FirstName;
            LastName = u.LastName;
            Password = u.Password;
            Username = u.Username;
            TypeOfUser = u.TypeOfUser.ToString();
            Status = u.Status.ToString();
            ImageUrl = u.ImageUrl;

        }

       


    }
}
