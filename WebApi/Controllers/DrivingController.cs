using Common.DTO;
using Common.Interfaces;
using Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.SignalR;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using SignalRChat.Hubs;
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
        public async Task<IActionResult> AcceptSuggestedDrive([FromBody] CreatedTrip createdtrip)
        {
            try
            {
                if (string.IsNullOrEmpty(createdtrip.Destination)) return BadRequest("You must send destination!");
                if (string.IsNullOrEmpty(createdtrip.CurrentLocation)) return BadRequest("You must send location!");
                if (createdtrip.Accepted == true) return BadRequest("Ride cannot be automaticaly accepted!");
                if (createdtrip.Price == 0.0 || createdtrip.Price < 0.0) return BadRequest("Invalid price!");


                var fabricClient = new FabricClient();
                TripInfo result = null;
                TripInfo tripFromRider = new TripInfo(createdtrip.CurrentLocation, createdtrip.Destination, createdtrip.RiderId, createdtrip.Price, createdtrip.Accepted, createdtrip.MinutesToDriverArrive);
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


        //[Authorize(Policy = "Driver")]
        [HttpGet]
        public async Task<IActionResult> GetAllUncompletedRides()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<TripInfo> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetRides();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list of not completed rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }
        }
        //[Authorize(Policy = "Driver")]
        [HttpGet]
        public async Task<IActionResult> GetCompletedRidesForDriver([FromQuery] Guid id)
        {
            try
            {

                var fabricClient = new FabricClient();
                List<TripInfo> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetCompletedRidesForDriver(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list completed rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        //[Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetCompletedRidesForRider([FromQuery] Guid id)
        {
            try
            {

                var fabricClient = new FabricClient();
                List<TripInfo> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetCompletedRidesForRider(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list completed rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        //[Authorize(Policy = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetCompletedRidesForAdmin()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<TripInfo> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetCompletedRidesForAdmin();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get list completed rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //[Authorize(Policy = "Rider")]
        [HttpPut]
        public async Task<IActionResult> SubmitRating([FromBody] ReviewDTO reviewdto)
        {
            try
            {

                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.SubmitRating(reviewdto.tripId, reviewdto.rating);
                    if (parititonResult != false)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != false)
                {
                    return Ok("Sucessfuly submited rating");
                }
                else
                {
                    return BadRequest("Rating is not submited");
                }

            }
            catch (Exception ex)
            {
                throw;
            }

        }

        [Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetCurrentTrip(Guid id)
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
                    var parititonResult = await proxy.GetCurrentTrip(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        trip = result,
                        message = "Succesfuly get current ride"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest();
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [Authorize(Policy = "Driver")]
        [HttpGet]
        public async Task<IActionResult> GetCurrentTripDriver(Guid id)
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
                    var parititonResult = await proxy.GetCurrentTripDriver(id);
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        trip = result,
                        message = "Succesfuly get current ride"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest();
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [Authorize(Policy = "Rider")]
        [HttpGet]
        public async Task<IActionResult> GetAllNotRatedTrips()
        {
            try
            {

                var fabricClient = new FabricClient();
                List<TripInfo> result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/DrivingService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IDriving>(new Uri("fabric:/TaxiApp/DrivingService"), partitionKey);
                    var parititonResult = await proxy.GetAllNotRatedTrips();
                    if (parititonResult != null)
                    {
                        result = parititonResult;
                        break;
                    }

                }

                if (result != null)
                {

                    var response = new
                    {
                        rides = result,
                        message = "Succesfuly get unrated rides"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest();
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }



    }
}
