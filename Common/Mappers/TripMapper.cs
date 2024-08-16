using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Entities;
using Common.Models;

namespace Common.Mappers
{
    public class TripMapper
    {
        public TripMapper() { }

        public static TripInfo MapRideEntityToTripInfo(RideEntity rideEntity)
        {
            return new TripInfo(rideEntity.CurrentLocation, rideEntity.Destination, rideEntity.RiderId, rideEntity.DriverId, rideEntity.Price, rideEntity.Accepted, rideEntity.TripId, rideEntity.SecondsToDriverArive, rideEntity.SecondsToEndTrip, rideEntity.IsFinished, rideEntity.IsRated);
        }


    }
}
