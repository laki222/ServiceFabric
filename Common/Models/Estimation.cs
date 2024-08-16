using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Estimation
    {
       
        
            public double Price { get; set; }
            public TimeSpan EstimatedArrivalTime { get; set; }

            public Estimation() { }
            public Estimation(double price, TimeSpan estimatedArrivalTime)
            {
                Price = price;
                EstimatedArrivalTime = estimatedArrivalTime;
            }
        

    }
}
