using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Microsoft.WindowsAzure.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Entities;

namespace DrivingService.Repository
{
    public class DrivingDataRepo
    {
        private CloudStorageAccount cloudAcc;

        private CloudTableClient tableClient;
        private CloudTable _trips;

        private CloudBlobClient blobClient;

        public CloudStorageAccount CloudAcc { get => cloudAcc; set => cloudAcc = value; }
        public CloudTableClient TableClient { get => tableClient; set => tableClient = value; }
        public CloudTable Trips { get => _trips; set => _trips = value; }
        public CloudBlobClient BlobClient { get => blobClient; set => blobClient = value; }

        public DrivingDataRepo(string tableName)
        {
            try
            {

                string dataConnectionString = Environment.GetEnvironmentVariable("DataConnectionString");

                if (string.IsNullOrEmpty(dataConnectionString))
                {
                    throw new InvalidOperationException("The database connection string is not set in the environment variables.");
                }

                CloudAcc = CloudStorageAccount.Parse(dataConnectionString);

                BlobClient = CloudAcc.CreateCloudBlobClient();  // blob client 

                TableClient = CloudAcc.CreateCloudTableClient(); // table client

                Trips = TableClient.GetTableReference(tableName); // create if not exists Users table 
                Trips.CreateIfNotExistsAsync().Wait();

            }
            catch (Exception ex)
            {
                throw;
            }


        }

        public IEnumerable<RideEntity> GetAllTrips()
        {
            var q = new TableQuery<RideEntity>();
            var qRes = Trips.ExecuteQuerySegmentedAsync(q, null).GetAwaiter().GetResult();
            return qRes.Results;
        }

    }
}
