using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Common.Enums;

namespace Common.DTO
{
    public class DriverViewDTO
    {
        public string Email { get; set; }

       
        public string Name { get; set; }
        
        public string LastName { get; set; }
       
        public string Username { get; set; }

       
        public bool IsBlocked { get; set; }


       
        public double AverageRating { get; set; }

      
        public Guid Id { get; set; }

        
        public VerificationStatus.Status Status { get; set; }

        public DriverViewDTO(string email, string name, string lastName, string username, bool isBlocked, double averageRating, Guid id, VerificationStatus.Status status)
        {
            Email = email;
            Name = name;
            LastName = lastName;
            Username = username;
            IsBlocked = isBlocked;
            AverageRating = averageRating;
            Status = status;
            Id = id;
        }
        public DriverViewDTO() { }  
    }
}
