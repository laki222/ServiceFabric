using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using System.Collections.Generic;
using System.Fabric;
using System.Text.RegularExpressions;
using Common.DTO;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Common.Interfaces;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class UserController : Controller
    {
        [HttpPost]
        public async Task<IActionResult> RegularRegister([FromForm] UserRegisterDTO userData)
        {
            if (string.IsNullOrEmpty(userData.Email) || !IsValidEmail(userData.Email)) return BadRequest("Invalid email format");
            if (string.IsNullOrEmpty(userData.Password)) return BadRequest("Password cannot be null or empty");
            if (string.IsNullOrEmpty(userData.Username)) return BadRequest("Username cannot be null or empty");
            if (string.IsNullOrEmpty(userData.FirstName)) return BadRequest("First name cannot be null or empty");
            if (string.IsNullOrEmpty(userData.LastName)) return BadRequest("Last name cannot be null or empty");
            if (string.IsNullOrEmpty(userData.Address)) return BadRequest("Address cannot be null or empty");
            if (string.IsNullOrEmpty(userData.TypeOfUser)) return BadRequest("Type of user must be selected!");
            if (string.IsNullOrEmpty(userData.Birthday)) return BadRequest("Birthday need to be selected!");
            if (userData.ImageUrl.Length == 0) return BadRequest("You need to send image while doing registration!");
            try
            {

                User userForRegister = new User(userData);

                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);
                    result = await proxy.addUser(userForRegister);
                }

                if (result) return Ok($"Successfully registered new User: {userData.Username}");
                else return StatusCode(409, "User already exists in database!");


            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering new User");
            }

            }
            private bool IsValidEmail(string email)
            {
                const string pattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
                return Regex.IsMatch(email, pattern);
            }

        }
    }

