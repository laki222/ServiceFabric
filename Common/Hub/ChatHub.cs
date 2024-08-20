using Microsoft.AspNetCore.SignalR;
using System.Fabric;

namespace SignalRChat.Hubs
{
    public class ChatHub : Hub
    {

        public async Task JoinRide(Guid rideId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, rideId.ToString());
        }

        public async Task LeaveRide(Guid rideId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, rideId.ToString());
        }

        public async Task SendMessage(Guid rideId, string senderId, string message)
        {
          
            await Clients.Group(rideId.ToString()).SendAsync("ReceiveMessage", senderId.ToString(), message);
        }
    }
}