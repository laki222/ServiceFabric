using Common.DTO;
using Common.Entities;
using Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Common.Entities.VerificationStatus;

namespace Common.Mappers
{
    public class UserMapper
    {
        public static User MapUserEntityToUser(UserEntity u, byte[] imageOfUser)
        {
            var statusString = u.Status; // Assuming 'u.Status' contains the string representation of the enum
            Status myStatus;

            if (Enum.TryParse(statusString, out myStatus))
            {
                // Successfully parsed the string to an enum
                // 'myStatus' now contains the corresponding enum value
                return new User(
                    u.Address,
                    u.AverageRating,
                    u.SumOfRatings,
                    u.NumOfRatings,
                    u.Birthday,
                    u.Email,
                    u.IsVerified,
                    u.IsBlocked,
                    u.FirstName,
                    u.LastName,
                    u.Password,
                    u.Username,
                    (UserType.Role)Enum.Parse(typeof(UserType.Role), u.PartitionKey),
                    new FileUploadDTO(imageOfUser),
                    u.ImageUrl,
                    myStatus,
                    u.Id
                );
            }
            return null;
        }

       


    }
}
