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

namespace ChatService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class ChatService : StatelessService,IChat
    {
        public ChatService(StatelessServiceContext context)
            : base(context)
        { }
        private readonly List<Message> _messages
       = new List<Message>();


        public void AddMessage(Guid rideId, Guid senderId, string message)
        {
            
            var _message = new Message() { RideId=rideId,SenderId=senderId,Content=message,Timestamp=DateTime.Now};
            
            _messages.Add(_message);
        }

        public async Task <List<Message>> GetAllMessage(Guid rideId)
        {
            await Task.Delay(1000);
            List<Message> listRet = new List<Message>();

            foreach (var item in _messages)
            {
                if (item.RideId == rideId)
                {
                    listRet.Add(item);
                }
            }
        
            return listRet;
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
    }
}
