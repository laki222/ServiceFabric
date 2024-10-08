﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using System.Collections.Generic;
using System.Fabric;
using System.Text.RegularExpressions;
using Common.DTO;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Common.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Net.Mail;
using System.Net;
using PostmarkDotNet;
using Microsoft.AspNetCore.Identity;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class UserController : ControllerBase
    {
        private IConfiguration _config;
        public UserController(IConfiguration config)
        {
            _config = config;
           
        }

        [HttpPost]

        public async Task<IActionResult> Register([FromForm] UserRegisterDTO userData)
        {
            if (string.IsNullOrEmpty(userData.Email) || !IsValidEmail(userData.Email))
                return BadRequest("Invalid email format");
            if (string.IsNullOrEmpty(userData.Password))
                return BadRequest("Password cannot be null or empty");
            if (string.IsNullOrEmpty(userData.Username))
                return BadRequest("Username cannot be null or empty");
            if (string.IsNullOrEmpty(userData.FirstName))
                return BadRequest("First name cannot be null or empty");
            if (string.IsNullOrEmpty(userData.LastName))
                return BadRequest("Last name cannot be null or empty");
            if (string.IsNullOrEmpty(userData.Address))
                return BadRequest("Address cannot be null or empty");
            if (string.IsNullOrEmpty(userData.TypeOfUser))
                return BadRequest("Type of user must be selected!");
            if (string.IsNullOrEmpty(userData.Birthday))
                return BadRequest("Birthday needs to be selected!");
            if (userData.ImageUrl.Length == 0)
                return BadRequest("You need to send an image while doing registration!");

            try
            {
                
                var passwordHasher = new PasswordHasher<UserRegisterDTO>();
                userData.Password = passwordHasher.HashPassword(userData, userData.Password);

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

                if (result)
                    return Ok($"Successfully registered new User: {userData.Username}");
                else
                    return StatusCode(409, "User already exists in database!");
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

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginUserDTO user)
        {
            if (string.IsNullOrEmpty(user.Email) || !IsValidEmail(user.Email)) return BadRequest("Invalid email format");
            if (string.IsNullOrEmpty(user.Password)) return BadRequest("Password cannot be null or empty");

            try
            {
                var fabricClient = new FabricClient();
                LoggedUserDTO result = null; // Initialize result to null

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);
                    var partitionResult = await proxy.loginUser(user);

                    if (partitionResult != null)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var passwordHasher = new PasswordHasher<LoginUserDTO>();
                    var passwordVerificationResult = passwordHasher.VerifyHashedPassword(user, result.HashedPassword, user.Password);

                    if (passwordVerificationResult == PasswordVerificationResult.Success)
                    {


                        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
                        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                        List<Claim> claims = new List<Claim>();
                        claims.Add(new Claim("MyCustomClaim", result.Role.ToString()));

                        var Sectoken = new JwtSecurityToken(_config["Jwt:Issuer"],
                            _config["Jwt:Issuer"],
                            claims,
                            expires: DateTime.Now.AddMinutes(360),
                            signingCredentials: credentials);

                        var token = new JwtSecurityTokenHandler().WriteToken(Sectoken);

                        var response = new
                        {
                            token = token,
                            user = result,
                            message = "Login successful"
                        };

                        return Ok(response);
                    }
                    else
                    {
                        return BadRequest("Incorrect email or password");
                    }
                }
                else
                {
                    return BadRequest("Incorrect email or password");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while login User");
            }
        }
        
        
        [Authorize(Policy = "Admin")]
        [HttpGet]

        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var fabricClient = new FabricClient();
                var allUsers = new List<User>();

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);

                    var users = await proxy.GetAllUsers();
                    allUsers.AddRange(users);
                }

                return Ok(allUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving users");
            }
        }

        [Authorize(Policy = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllDrivers()
        {
            try
            {
                var fabricClient = new FabricClient();
                var allDrivers = new List<DriverViewDTO>();

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);

                    // Pozivanje metode koja dobavlja sve korisnike
                    var drivers = await proxy.GetAllDrivers();
                    allDrivers.AddRange(drivers);
                }

                return Ok(allDrivers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving drivers");
            }
        }

        [Authorize(Policy = "Admin")]
        [HttpPut]
        public async Task<IActionResult> BlockUser([FromBody] DriverChangeStatusDTO driver)
        {
            try
            {

                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);
                    bool parititonResult = await proxy.BlockUser(driver.Id, driver.Status);
                    result = parititonResult;
                }

                if (result) return Ok("Succesfuly changed driver status");

                else return BadRequest("Driver status is not changed");

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while changing  new User");
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetUserInfo([FromQuery] Guid id)
        {
            try
            {
                var fabricClient = new FabricClient();
                User result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);
                    var partitionResult = await proxy.GetUserInfo(id);
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
                        user = result,
                        message = "Successfully retrieved user info"
                    };
                    return Ok(response);
                }
                else
                {
                    return BadRequest("This id does not exist");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving user info");
            }
        }

        [AllowAnonymous]
        [HttpPut]
        public async Task<IActionResult> UpdatedUser([FromForm] UserForUpdate user)
        {
            UpdatedUser userForUpdate = new UpdatedUser(user);

            try
            {
                var fabricClient = new FabricClient();
                User result = null;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);
                    var proxyResult = await proxy.updateUser(userForUpdate);
                    if (proxyResult != null)
                    {
                        result = proxyResult;
                        break;
                    }
                }

                if (result != null)
                {
                    var response = new
                    {
                        changedUser = result,
                        message = "Succesfuly changed user fields!"
                    };
                    return Ok(response);
                }
                else return StatusCode(409, "User for change is not in db!");

            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating user");
            }
        }

        [Authorize(Policy = "Admin")]
        [HttpPut]
        public async Task<IActionResult> VerifyDriver([FromBody] DriverVerificationDTO driver)
        {
            try
            {
                var fabricClient = new FabricClient();
                bool result = false;

                var partitionList = await fabricClient.QueryManager.GetPartitionListAsync(new Uri("fabric:/TaxiApp/UserService"));
                foreach (var partition in partitionList)
                {
                    var partitionKey = new ServicePartitionKey(((Int64RangePartitionInformation)partition.PartitionInformation).LowKey);
                    var proxy = ServiceProxy.Create<IUser>(new Uri("fabric:/TaxiApp/UserService"), partitionKey);
                    var partitionResult = await proxy.VerifyDriver(driver.Id, driver.Email, driver.Action);
                    if (partitionResult ==true)
                    {
                        result = partitionResult;
                        break;
                    }
                }

                if (result)
                {
                    var response = new
                    {
                        Verified = result,
                        message = $"Driver with id:{driver.Id} is now changed status of verification to:{driver.Action}"
                    };
                    if (driver.Action == "Accepted") await SendEmailAsync(driver.Email, "Account verification", "Successfuly verified on taxi app now you can drive!");

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

        private Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new PostmarkClient("7cc441a8-8816-4664-93a5-9e10833ecc0b");


            var Message = new PostmarkMessage
            {
                From = "brankovic.pr121.2020@uns.ac.rs",
                To = email,
                Subject = subject,
                TextBody = message,
            };

            return client.SendMessageAsync(Message);

           
        }






    }
}

