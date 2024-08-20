using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.Interfaces;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Common.DTO;
using Common.Models;
using SignalRChat.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNet.SignalR.Client;


namespace ChatService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    public sealed class ChatService : StatelessService,IChat
    {
       

        public ChatService(StatelessServiceContext context)
        : base(context)
        {
            
        }


        /// <summary>
        /// Optional override to create listeners (e.g., TCP, HTTP) for this service replica to handle client or user requests.
        /// </summary>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
           => this.CreateServiceRemotingInstanceListeners();

        /// <summary>
        /// This is the main entry point for your service instance.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service instance.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            long iterations = 0;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                ServiceEventSource.Current.ServiceMessage(this.Context, "Working-{0}", ++iterations);

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

        public Task<List<Message>> GetAllMessage(Guid rideID)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> SendMessage(Guid rideId, string senderId, string message, IHubContext<ChatHub> hubContext)
        {
            await hubContext.Clients.Group(rideId.ToString()).SendAsync("ReceiveMessage", senderId, message);

            return true;

        }
    }
}
