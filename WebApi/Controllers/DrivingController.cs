using Common.DTO;
using Common.Interfaces;
using Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Fabric;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class DrivingController : ControllerBase
    {

        //[Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetEstimatedPrice([FromQuery] Trip trip)
        {
            Estimation estimation = await ServiceProxy.Create<IEstimation>(new Uri("fabric:/TaxiApp/EstimationService")).GetEstimatedPrice(trip.StartLocation, trip.Destination);
            if (estimation != null)
            {

                var response = new
                {
                    price = estimation,
                    message = "Succesfuly get estimation"
                };
                return Ok(response);
            }
            else
            {
                return StatusCode(500, "An error occurred while estimating price and time");
            }

        }

        //[Authorize(Policy = "Rider")]
        [HttpPut]
        public async Task<IActionResult> AcceptSuggestedDrive([FromBody] CreatedTrip acceptedRoadTrip)
        {
            try
            {
                if (string.IsNullOrEmpty(acceptedRoadTrip.Destination)) return BadRequest("You must send destination!");
                if (string.IsNullOrEmpty(acceptedRoadTrip.CurrentLocation)) return BadRequest("You must send location!");
                if (acceptedRoadTrip.Accepted == true) return BadRequest("Ride cannot be automaticaly accepted!");
                if (acceptedRoadTrip.Price == 0.0 || acceptedRoadTrip.Price < 0.0) return BadRequest("Invalid price!");


                var fabricClient = new FabricClient();
                TripInfo result = null;
                TripInfo tripFromRider = new TripInfo(acceptedRoadTrip.CurrentLocation, acceptedRoadTrip.Destination, acceptedRoadTrip.RiderId, acceptedRoadTrip.Price, acceptedRoadTrip.Accepted, acceptedRoadTrip.MinutesToDriverArrive);
                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var partitionResult = await proxy.AcceptCreatedTrip(tripFromRider);
                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        Drive = result,
                        message = "Successfully scheduled"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("You already submited ticked!");
                }


            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while accepting new drive!");
            }
        }

        //[Authorize(Policy = "Driver")]
        [HttpPut]
        public async Task<IActionResult> AcceptNewRide([FromBody] RideForAcceptDTO ride)
        {
            try
            {
                var fabricClient = new FabricClient();
                TripInfo result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var partitionResult = await proxy.AcceptTripDriver(ride.TripId, ride.DriverId);
                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        ride = result,
                        message = "Sucessfuly accepted driver!"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("This id does not exist");
                }

            }
            catch
            {
                return BadRequest("Something went wrong!");
            }
        }


    }
}
