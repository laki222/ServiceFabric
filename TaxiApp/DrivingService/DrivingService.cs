using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.Entities;
using Common.Interfaces;
using Common.Mappers;
using Common.Models;
using DrivingService.Repository;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.WindowsAzure.Storage.Table;
using static System.Net.Mime.MediaTypeNames;

namespace DrivingService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    public sealed class DrivingService : StatefulService,IDriving
    {
        public DrivingDataRepo dataRepo;
        public DrivingService(StatefulServiceContext context)
            : base(context)
        {
            dataRepo = new DrivingDataRepo("TripsTaxi");
        }

        public async Task<TripInfo> AcceptCreatedTrip(TripInfo trip)
        {
            var roadTrips = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, TripInfo>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                    if (!await CheckIfTripAlreadyExists(trip))
                    {
                        var enumerable = await roadTrips.CreateEnumerableAsync(tx);

                        using (var enumerator = enumerable.GetAsyncEnumerator())
                        {

                            await roadTrips.AddAsync(tx, trip.TripId, trip);
                            RideEntity entity = new RideEntity(trip.RiderId, trip.DriverId, trip.CurrentLocation, trip.Destination, trip.Accepted, trip.Price, trip.TripId, trip.SecondsToDriverArrive);
                            TableOperation operation = TableOperation.Insert(entity);
                            await dataRepo.Trips.ExecuteAsync(operation);

                            ConditionalValue<TripInfo> result = await roadTrips.TryGetValueAsync(tx, trip.TripId);
                            await tx.CommitAsync();
                            return result.Value;

                        }

                    }
                    else return null;

                }
            }
            catch (Exception)
            {
                throw;
            }
        }
        private async Task<bool> CheckIfTripAlreadyExists(TripInfo trip)
        {
            var roadTrips = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, TripInfo>>("Trips");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {

                    var enumerable = await roadTrips.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if ((enumerator.Current.Value.RiderId == trip.RiderId && enumerator.Current.Value.Accepted == false)) // provera da li je pokusao da posalje novi zahtev za voznju
                            {                                                                                                    // a da mu ostali svi nisu izvrseni 
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            catch (Exception)
            {
                throw;
            }
        }
        private async Task LoadTrips()
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, TripInfo>>("Trips");

            try
            {
                using (var transaction = StateManager.CreateTransaction())
                {
                    var trips = dataRepo.GetAllTrips();
                    if (trips.Count() == 0) return;
                    else
                    {
                        foreach (var trip in trips)
                        {
                            var rideEntity = TripMapper.MapRideEntityToTripInfo(trip);
                            await roadTrip.AddAsync(transaction, trip.TripId, rideEntity);  
                        }
                    }

                    await transaction.CommitAsync();

                }

            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
             => this.CreateServiceRemotingReplicaListeners();

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            var myDictionary = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, long>>("myDictionary");
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, TripInfo>>("Trips");

            await LoadTrips();

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var result = await myDictionary.TryGetValueAsync(tx, "Counter");

                    ServiceEventSource.Current.ServiceMessage(this.Context, "Current Counter Value: {0}",
                        result.HasValue ? result.Value.ToString() : "Value does not exist.");

                    await myDictionary.AddOrUpdateAsync(tx, "Counter", 0, (key, value) => ++value);

                    // If an exception is thrown before calling CommitAsync, the transaction aborts, all changes are 
                    // discarded, and nothing is saved to the secondary replicas.
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

        public async Task<TripInfo> AcceptTripDriver(Guid tripId, Guid driverId)
        {
            var roadTrip = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, TripInfo>>("Trips");
            Guid forCompare = new Guid("00000000-0000-0000-0000-000000000000");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                    ConditionalValue<TripInfo> result = await roadTrip.TryGetValueAsync(tx, tripId);

                    if (result.HasValue && result.Value.DriverId == forCompare)
                    {
                        // azuriranje polja u reliable 
                        TripInfo tripForAccept = result.Value;
                        tripForAccept.SecondsToEndTrip = 60; // ovde mozda da se zove servis za estimaciju opet 
                        tripForAccept.DriverId = driverId;
                        tripForAccept.Accepted = true;
                        await roadTrip.SetAsync(tx, tripForAccept.TripId, tripForAccept);
                        if (await dataRepo.UpdateEntity(driverId, tripId))
                        {
                            await tx.CommitAsync();
                            return tripForAccept;
                        }
                        else return null;
                    }
                    else return null;

                }
            }

            catch (Exception)
            {
                throw;
            }





        }
    }
}
