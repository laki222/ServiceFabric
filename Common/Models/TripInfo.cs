using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class TripInfo
    {
      
        public string CurrentLocation { get; set; }

        
        public string Destination { get; set; }

       
        public Guid RiderId { get; set; }

       
        public Guid DriverId { get; set; }

        
        public double Price { get; set; }

       
        public bool Accepted { get; set; }

        
        public Guid TripId { get; set; }

       
        public int SecondsToDriverArrive { get; set; }

       
        public int SecondsToEndTrip { get; set; }

        public DateTime StartTime { get; set; }
        public bool IsFinished { get; set; }

        
        public bool IsRated { get; set; }
        public TripInfo()
        {
        }

        public TripInfo(string currentLocation, string destination, Guid riderId, double price, bool accepted, Guid driverId)
        {
            CurrentLocation = currentLocation;
            Destination = destination;
            RiderId = riderId;
            DriverId = driverId;
            Price = price;
            Accepted = accepted;
            TripId = Guid.NewGuid();
            StartTime = DateTime.Now;
        }
        public TripInfo(string currentLocation, string destination, Guid riderId, double price, bool accepted, int minutes)
        {
            CurrentLocation = currentLocation;
            Destination = destination;
            RiderId = riderId;
            Price = price;
            Accepted = accepted; // by default is false 
            TripId = Guid.NewGuid();
            DriverId = new Guid("00000000-0000-0000-0000-000000000000"); // that say this trip dont have driver
            SecondsToDriverArrive = minutes * 60;
            IsFinished = false;
            IsRated = false;
            StartTime = DateTime.Now;
        }

        public TripInfo(string currentLocation, string destination, Guid riderId, Guid driverId, double price, bool accepted, Guid tripId, int minutesToDriverArrive, int minutesToEnd, bool isFinished, bool isRated) : this(currentLocation, destination, riderId, price, accepted, driverId)
        {
            TripId = tripId;
            SecondsToDriverArrive = minutesToDriverArrive;
            SecondsToEndTrip = minutesToEnd;
            IsFinished = isFinished;
            IsRated = isRated;
            StartTime = DateTime.Now;
        }
    }
}
