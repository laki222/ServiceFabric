using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Common.Enums;
using Common.Entities;
using Common.Interfaces;
using Common.Mappers;
using Common.Models;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using UserService.Repository;
using Microsoft.ServiceFabric.Data;
using static Common.Enums.VerificationStatus;

namespace UserService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    public sealed class UserService : StatefulService,IUser
    {
        public UserDataRepo dataRepo;
        public UserService(StatefulServiceContext context)
            : base(context)
        {
            dataRepo = new UserDataRepo("UsersTaxi");
        }







        public async Task<bool> addUser(User user)
        {
            var userDictionary = await StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");

            try
            {
                using (var transaction = StateManager.CreateTransaction())
                {
                    if (!await CheckIfUserAlreadyExists(user))
                    {

                        await userDictionary.AddAsync(transaction, user.Id, user); // dodaj ga prvo u reliable 

                        //insert image of user in blob
                        CloudBlockBlob blob = await dataRepo.GetBlockBlobReference("usersimages", $"image_{user.Id}");
                        blob.Properties.ContentType = user.ImageFile.ContentType;
                        await blob.UploadFromByteArrayAsync(user.ImageFile.FileContent, 0, user.ImageFile.FileContent.Length);
                        string imageUrl = blob.Uri.AbsoluteUri;

                        //insert user in database
                        UserEntity newUser = new UserEntity(user, imageUrl);
                        TableOperation operation = TableOperation.Insert(newUser);
                        await dataRepo.Users.ExecuteAsync(operation);




                        await transaction.CommitAsync();
                        return true;
                    }
                    return false;
                }

            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<bool> CheckIfUserAlreadyExists(User user)
        {
            var users = await StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            try
            {
                using (var tx = StateManager.CreateTransaction())
                {
                    var enumerable = await users.CreateEnumerableAsync(tx);

                    using (var enumerator = enumerable.GetAsyncEnumerator())
                    {
                        while (await enumerator.MoveNextAsync(default(CancellationToken)))
                        {
                            if (enumerator.Current.Value.Email == user.Email || enumerator.Current.Value.Id == user.Id || enumerator.Current.Value.Username == user.Username)
                            {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task LoadUsers()
        {
            var userDictionary = await StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            try
            {
                using (var transaction = StateManager.CreateTransaction())
                {
                    var users = dataRepo.GetAllUsers();
                    if (users.Count() == 0) return;

                    foreach (var user in users)
                    {
                        byte[] image = await dataRepo.DownloadImage(dataRepo, user, "usersimages");
                        var userEntity = UserMapper.MapUserEntityToUser(user, image);

                 
                        await userDictionary.AddAsync(transaction, user.Id, userEntity);
                    }

                    // Potvrdi transakciju
                    await transaction.CommitAsync();
                }
            }
            catch (Exception ex)
            {
               
                Console.WriteLine($"Error LoadUsers: {ex}");
                throw; 
            }
        }




        public async Task<LoggedUserDTO> loginUser(LoginUserDTO loginUserDTO)
        {
            
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");

            using (var tx = this.StateManager.CreateTransaction())
            {
                var enumerable = await users.CreateEnumerableAsync(tx);

                using (var enumerator = enumerable.GetAsyncEnumerator())
                {
                    while (await enumerator.MoveNextAsync(default(CancellationToken)))
                    {
                        if (enumerator.Current.Value.Email == loginUserDTO.Email && enumerator.Current.Value.Password == loginUserDTO.Password)
                        {
                            return new LoggedUserDTO(enumerator.Current.Value.Id, enumerator.Current.Value.TypeOfUser);
                        }
                    }
                }
            }
            return null;
        }
        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
           => this.CreateServiceRemotingReplicaListeners();

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            var myDictionary = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, long>>("myDictionary");
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            // ovde ce biti load users 
            await LoadUsers();

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var result = await myDictionary.TryGetValueAsync(tx, "Counter");

                    ServiceEventSource.Current.ServiceMessage(this.Context, "Current Counter Value: {0}",
                        result.HasValue ? result.Value.ToString() : "Value does not exist.");

                    await myDictionary.AddOrUpdateAsync(tx, "Counter", 0, (key, value) => ++value);

                    // If an exception is thrown before calling CommitAsync, the transaction aborts, all changes are 
                    // discarded, and nothing is saved to the secondary replicas.
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

        public async Task<List<User>> GetAllUsers()
        {
            using (var tx = this.StateManager.CreateTransaction())
            {
                var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
                var allUsers = new List<User>();

                var enumerable = await users.CreateEnumerableAsync(tx);
                using (var enumerator = enumerable.GetAsyncEnumerator())
                {
                    while (await enumerator.MoveNextAsync(default))
                    {
                        allUsers.Add(enumerator.Current.Value);
                    }
                }

                return allUsers;
            }



        }

        public async Task<List<DriverViewDTO>> GetAllDrivers()
        {
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            List<DriverViewDTO> drivers = new List<DriverViewDTO>();
            using (var tx = this.StateManager.CreateTransaction())
            {
                var enumerable = await users.CreateEnumerableAsync(tx);
                using (var enumerator = enumerable.GetAsyncEnumerator())
                {
                    while (await enumerator.MoveNextAsync(default(CancellationToken)))
                    {
                        if (enumerator.Current.Value.TypeOfUser == UserType.Role.Driver)
                        {
                            drivers.Add(new DriverViewDTO(enumerator.Current.Value.Email, enumerator.Current.Value.FirstName, enumerator.Current.Value.LastName, enumerator.Current.Value.Username, enumerator.Current.Value.IsBlocked, enumerator.Current.Value.AverageRating, enumerator.Current.Value.Id, enumerator.Current.Value.Status));
                        }
                    }
                }
            }

            return drivers;
        }

        public async Task<bool> changeDriverStatus(Guid id, bool status)
        {
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            using (var tx = this.StateManager.CreateTransaction())
            {
                ConditionalValue<User> result = await users.TryGetValueAsync(tx, id);
                if (result.HasValue)
                {
                    User user = result.Value;
                    user.IsBlocked = status;
                    await users.SetAsync(tx, id, user);

                    await dataRepo.UpdateEntity(id, status);

                    await tx.CommitAsync();

                    return true;
                }
                else return false;


            }


        }

        public async Task<User> GetUserInfo(Guid id)
        {
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            using (var tx = this.StateManager.CreateTransaction())
            {
                ConditionalValue<User> result = await users.TryGetValueAsync(tx, id);
                if (result.HasValue)
                {
                    User user = result.Value;
                    return user;
                }
                else return null;


            }
        }

        public async Task<User> changeUserFields(UserForUpdateOverNetwork user)
        {
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            using (var tx = this.StateManager.CreateTransaction())
            {
                ConditionalValue<User> result = await users.TryGetValueAsync(tx, user.Id);
                if (result.HasValue)
                {
                    User userFromReliable = result.Value;

                    if (!string.IsNullOrEmpty(user.Email)) userFromReliable.Email = user.Email;

                    if (!string.IsNullOrEmpty(user.FirstName)) userFromReliable.FirstName = user.FirstName;

                    if (!string.IsNullOrEmpty(user.LastName)) userFromReliable.LastName = user.LastName;

                    if (!string.IsNullOrEmpty(user.Address)) userFromReliable.Address = user.Address;

                    if (user.Birthday != DateTime.MinValue) userFromReliable.Birthday = user.Birthday;

                    if (!string.IsNullOrEmpty(user.Password)) userFromReliable.Password = user.Password;

                    if (!string.IsNullOrEmpty(user.Username)) userFromReliable.Username = user.Username;

                    if (user.ImageFile != null && user.ImageFile.FileContent != null && user.ImageFile.FileContent.Length > 0) userFromReliable.ImageFile = user.ImageFile;

                    await users.TryRemoveAsync(tx, user.Id); // ukloni ovog proslog 

                    await users.AddAsync(tx, userFromReliable.Id, userFromReliable); // dodaj ga prvo u reliable 

                    if (user.ImageFile != null && user.ImageFile.FileContent != null && user.ImageFile.FileContent.Length > 0) // ako je promenjena slika u reliable upisi je i u blob 
                    {
                        CloudBlockBlob blob = await dataRepo.GetBlockBlobReference("usersimages", $"image_{userFromReliable.Id}"); // nadji prethodni blok u blobu
                        await blob.DeleteIfExistsAsync(); // obrisi ga 

                        CloudBlockBlob newblob = await dataRepo.GetBlockBlobReference("usersimages", $"image_{userFromReliable.Id}"); // kreiraj za ovaj novi username
                        newblob.Properties.ContentType = userFromReliable.ImageFile.ContentType;
                        await newblob.UploadFromByteArrayAsync(userFromReliable.ImageFile.FileContent, 0, userFromReliable.ImageFile.FileContent.Length); // upload novu sliku 
                    }

                    await dataRepo.UpdateUser(user, userFromReliable); // sacuva ga u bazu 
                    await tx.CommitAsync();
                    return userFromReliable;

                }
                else return null;
            }

        }

        public async Task<bool> VerifyDriver(Guid id, string email, string action)
        {
            var users = await this.StateManager.GetOrAddAsync<IReliableDictionary<Guid, User>>("UserEntities");
            using (var tx = this.StateManager.CreateTransaction())
            {
                ConditionalValue<User> result = await users.TryGetValueAsync(tx, id);
                if (result.HasValue)
                {
                    User userForChange = result.Value;
                    if (action == "Accepted")
                    {
                        userForChange.IsVerified = true;
                        userForChange.Status = Status.Accepted;
                    }
                    else userForChange.Status = Status.Rejected;

                    await users.SetAsync(tx, id, userForChange);

                    await dataRepo.UpdateDriverStatus(id, action);

                    await tx.CommitAsync();
                    return true;

                }
                else return false;
            }



        }
    }
}
