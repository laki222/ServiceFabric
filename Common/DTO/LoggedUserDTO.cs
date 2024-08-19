using Common.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Common.Enums;

namespace Common.DTO
{
    public class LoggedUserDTO
    {

        public Guid Id { get; set; }

       
        public UserType.Role Role { get; set; }

        public string HashedPassword { get; set; } 

        public LoggedUserDTO(Guid id, UserType.Role role, string hashedPassword)
        {
            Id = id;
            Role = role;
            HashedPassword = hashedPassword;
        }

        public LoggedUserDTO()
        {
        }

    }
}
