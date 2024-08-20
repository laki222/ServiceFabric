using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRChat.Hubs;
using Common.Models;
using Common.DTO;
using Common.Interfaces;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using PostmarkDotNet.Model;
using System.Fabric;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class ChatController : Controller
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }


        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto messageDto)
        {

            await _hubContext.Clients.Group(messageDto.RideId.ToString()).SendAsync("ReceiveMessage", messageDto.SenderId, messageDto.Content);
           

                var response = new
                {
                   
                    message = "Succesfuly sent message"
                };
                return Ok(response);
          
        }


    }
}
