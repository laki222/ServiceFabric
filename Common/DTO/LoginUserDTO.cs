using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class LoginUserDTO
    {
        
        public string Email { get; set; }

       
        public string Password { get; set; }

        public LoginUserDTO(string email, string password)
        {
            Email = email;
            Password = password;
        }
        public LoginUserDTO()
        {
        }
    }
}
