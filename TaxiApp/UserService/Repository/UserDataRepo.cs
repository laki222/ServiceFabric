using Common.Interfaces;
using Common.Models;
using Microsoft.Azure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UserService.Repository
{
    public class UserDataRepo
    {
        private CloudStorageAccount cloudAcc;

        private CloudTableClient tableClient;
        private CloudTable _users;

        private CloudBlobClient blobClient;

        public CloudStorageAccount CloudAcc { get => cloudAcc; set => cloudAcc = value; }
        public CloudTableClient TableClient { get => tableClient; set => tableClient = value; }
        public CloudTable Users { get => _users; set => _users = value; }
        public CloudBlobClient BlobClient { get => blobClient; set => blobClient = value; }

        public UserDataRepo(string tableName)
        {
            try
            {

                //string dataConnectionString = Environment.GetEnvironmentVariable("DefaultEndpointsProtocol=https;AccountName=cloudprojekat;AccountKey=vwtXRnG7VWT0L3Dl6wBIwSWbOv91HzphoDDTRn27xmJl+JB0asd/54IqXn43gDEWFyok+3cjlNaz+AStMTUDsg==;EndpointSuffix=core.windows.net");
                CloudAcc = CloudStorageAccount.Parse(CloudConfigurationManager.GetSetting("Microsoft.WindowsAzure.Plugins.Diagnostics.DataConnectionString"));  // create cloud client for making blob,table or queue 
                CloudTableClient tableClient = new CloudTableClient(new Uri(CloudAcc.TableEndpoint.AbsoluteUri), CloudAcc.Credentials);
                BlobClient = CloudAcc.CreateCloudBlobClient();  // blob client 

                //TableClient = CloudAcc.CreateCloudTableClient(); // table client

                Users = tableClient.GetTableReference(tableName); // create if not exists Users table 
                Users.CreateIfNotExistsAsync().Wait();

            }
            catch (Exception ex)
            {
                throw;
            }


        }

        public async Task<CloudBlockBlob> GetBlockBlobReference(string containerName, string blobName)
        {
            CloudBlobContainer container = blobClient.GetContainerReference(containerName);
            await container.CreateIfNotExistsAsync();
            CloudBlockBlob blob = container.GetBlockBlobReference(blobName);

            return blob;
        }

       
    }
}
