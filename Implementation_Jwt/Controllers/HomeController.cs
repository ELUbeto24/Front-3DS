using System.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using Implementation_Jwt.Helpers;

namespace Implementation_Jwt.Controllers
{
    public class HomeController : Controller
    {
        private readonly JwtHelper _jwtHelper = new JwtHelper();

        public ActionResult Index()
        {
            
            var apiKey = ConfigurationManager.AppSettings["APIKey"];
            var apiIdentifier = ConfigurationManager.AppSettings["APIIdentifier"];
            var orgUnitId = ConfigurationManager.AppSettings["OrgUnitId"];

            var jwt = ""; // _jwtHelper.GenerateJwt(apiKey, apiIdentifier, orgUnitId);

            ViewData["Token"] = jwt;
            //var jwtt = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1YmQ4Y2I2ZTZmZTNkMTIxOGM1OGU4NDkiLCJpYXQiOjE1ODAxNDg5NDMsImV4cCI6MTU4MDE1NjE0MywianRpIjoiNjRiMzY1ZjUtNTFhNS00ZjQ3LTllOTgtZjVlZTg3NGI3N2UwIiwiQ29uc3VtZXJTZXNzaW9uSWQiOiIxXzZlNTU5YWY3LThiMWUtNGMwMy1iNDgzLWIwOTM5YmJmZjgxYyIsImF1ZCI6IjQ2ZDVlZGIwLTFiNzAtNDkyYy05ODVlLTU2MGExYmFhNGQyOCIsIlBheWxvYWQiOnsiUGF5bWVudCI6eyJUeXBlIjoiQ0NBIiwiUHJvY2Vzc29yVHJhbnNhY3Rpb25JZCI6InptVENVVFhLbjdUR1gzbHZlcVIxIiwiRXh0ZW5kZWREYXRhIjp7IkFtb3VudCI6IjEwMDAiLCJDdXJyZW5jeUNvZGUiOiI0ODQifX0sIkVycm9yTnVtYmVyIjo5MDAwLCJFcnJvckRlc2NyaXB0aW9uIjoiRXJyb3IgaW4gc2VydmljZSBDQ0EgbG9va3VwIn19.hYks8QQUgJYxxPtWYTNLucTth9PtFQt06TZKzzmM3Dw";

            //var isValid =  _jwtHelper.DecodeAndValidateResponseJwt(jwt, apiKey);

            ViewData["DecodeToken"] = ""; //isValid;

            return View();
        }
    }
}
