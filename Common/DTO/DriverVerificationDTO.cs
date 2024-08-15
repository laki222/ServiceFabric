using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class DriverVerificationDTO
    {
        public Guid Id { get; set; }
        public string Email { get; set; }

        public string Action { get; set; }

        public DriverVerificationDTO() { } 



    }



}
