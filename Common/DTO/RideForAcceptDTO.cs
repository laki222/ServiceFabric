using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class RideForAcceptDTO
    {
        public Guid DriverId { get; set; }
        public Guid TripId { get; set; }
        public RideForAcceptDTO() { }

    }
}
