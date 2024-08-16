using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    public interface IEstimation: IService
    {
        Task<Estimation> GetEstimatedPrice(string currentLocation, string destination);

    }
}
