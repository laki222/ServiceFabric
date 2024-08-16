using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface IDriving:IService
    {
        Task<TripInfo> AcceptCreatedTrip(TripInfo trip);
        Task<TripInfo> AcceptTripDriver(Guid tripId, Guid driverId);
        Task<List<TripInfo>> GetRides();

        Task<List<TripInfo>> GetCompletedRidesForDriver(Guid driverId);
        Task<List<TripInfo>> GetCompletedRidesForRider(Guid riderId);
        Task<List<TripInfo>> GetCompletedRidesForAdmin();

        Task<bool> SubmitRating(Guid tripid,int rating);

    }
}
