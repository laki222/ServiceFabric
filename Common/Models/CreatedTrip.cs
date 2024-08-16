using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class CreatedTrip
    {
        public string Destination { get; set; } 
        public string CurrentLocation { get; set; } 
        public Guid RiderId { get; set; } 
        public double Price { get; set; } 
        public bool Accepted { get; set; } 

        public int MinutesToDriverArrive { get; set; }
        public CreatedTrip() { }

    }
}
