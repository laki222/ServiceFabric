using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Message
    {
        public Guid RideId { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; }

        public DateTime Timestamp { get; set; }
        public Message() { }

    }
}
