using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class ChatMessageDto
    {
        public Guid RideId { get; set; }
        public string SenderId { get; set; }
        public string Content { get; set; }

        public ChatMessageDto() { }

    }
}
