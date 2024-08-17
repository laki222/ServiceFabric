using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ChatService.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatService _chatService;
        public async Task JoinRide(Guid rideId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, rideId.ToString());
        }

        public async Task LeaveRide(Guid rideId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, rideId.ToString());
            
        }

        public async Task SendMessage(Guid rideId, Guid senderId, string message)
        {

            await Clients.Group(rideId.ToString()).SendAsync("ReceiveMessage", senderId, message);
            _chatService.AddMessage(rideId,senderId, message);

        }
    }
}
