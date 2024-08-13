using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class FileUploadDTO
    {
        public string FileName { get; set; }


        public string ContentType { get; set; }


        public byte[] FileContent { get; set; }

        public FileUploadDTO()
        {
        }
        public FileUploadDTO(byte[] fileContent)
        {
            FileContent = fileContent;
        }

        public FileUploadDTO(string fileName, string contentType, byte[] fileContent)
        {
            FileName = fileName;
            ContentType = contentType;
            FileContent = fileContent;
        }
    }
}
