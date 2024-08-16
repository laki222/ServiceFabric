using Common.DTO;
using Common.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using static Common.Enums.VerificationStatus;

namespace Common.Models
{
    
    public class UpdatedUser
    {

        
        public string Address { get; set; }

       
        public DateTime Birthday { get; set; }

       
        public string Email { get; set; }


        
        public string FirstName { get; set; }

        
        public string LastName { get; set; }

        
        public string Username { get; set; }

        
        public FileUploadDTO ImageFile { get; set; }

       
        public string Password { get; set; }

        public string PreviousEmail { get; set; }

        
        public Guid Id { get; set; }

        public UpdatedUser() { }

        public UpdatedUser(UserForUpdate user)
        {
            PreviousEmail = user.PreviousEmail;

            Id = user.Id;
            if (user.Address != null) Address = user.Address;

            
            if (user.Birthday != null) Birthday = DateTime.ParseExact(user.Birthday, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            else Birthday = DateTime.MinValue;

            if (user.Email != null) Email = user.Email;

            if (user.FirstName != null) FirstName = user.FirstName;
            if (user.LastName != null) LastName = user.LastName;

            if (user.Username != null) Username = user.Username;
            if (user.ImageUrl != null) ImageFile = makeFileOverNetwork(user.ImageUrl);

            if (user.Password != null) Password = user.Password;

        }

        public FileUploadDTO makeFileOverNetwork(IFormFile file)
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