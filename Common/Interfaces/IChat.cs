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
    public interface IChat:IService
    {
        Task <List<Message>> GetAllMessage(Guid rideID);
        void AddMessage(Guid rideId, Guid senderId, string message);

    }
}
