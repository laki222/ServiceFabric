using Common.DTO;
using Common.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.ServiceFabric.Services.Remoting;
using SignalRChat.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface IChat : IService
    {
        Task <List<Message>> GetAllMessage(Guid rideID);
        Task<bool> SendMessage(Guid rideId, string senderId, string message, IHubContext<ChatHub> hubContext);

    }
}
