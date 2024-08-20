using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers
{
    public class ChatController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
