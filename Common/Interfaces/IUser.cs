using Common.DTO;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface IUser:IService
    {
        Task<bool> addUser(User user);
        Task<LoggedUserDTO> loginUser(LoginUserDTO loginUserDTO);
        Task<List<User>> GetAllUsers();
        Task<List<DriverViewDTO>> GetAllDrivers();
        Task<bool> changeDriverStatus(Guid id, bool status);

        Task<User> GetUserInfo(Guid id);
        Task<User> changeUserFields(UserForUpdateOverNetwork user);


    }
}
