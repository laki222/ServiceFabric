using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class RideEntity:TableEntity
    {
        public Guid RiderId { get; set; }
        public Guid DriverId { get; set; }

        public string CurrentLocation { get; set; }

        public string Destination { get; set; }

        public bool Accepted { get; set; }

        public double Price { get; set; }

        public Guid TripId { get; set; }

        public int SecondsToDriverArive { get; set; }

        public int SecondsToEndTrip { get; set; }

        public bool IsFinished { get; set; }

        public bool IsRated { get; set; }
        public RideEntity()
        {
        }

        public RideEntity(Guid userId, Guid driverId, string currentLocation, string destination, bool accepted, double price, Guid triId, int minutes)
        {
            RiderId = userId;
            DriverId = driverId;
            CurrentLocation = currentLocation;
            Destination = destination;
            Accepted = accepted;
            Price = price;
            TripId = triId;
            RowKey = triId.ToString();
            PartitionKey = triId.ToString();
            SecondsToDriverArive = minutes;
            SecondsToEndTrip = 0;
            IsFinished = false;
            IsRated = false;
        }


    }
}
