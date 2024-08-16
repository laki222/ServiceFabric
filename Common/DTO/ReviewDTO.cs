using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class ReviewDTO
    {
        public Guid tripId { get; set; }
        public int rating { get; set; }

        public ReviewDTO()
        {
        }

    }
}
