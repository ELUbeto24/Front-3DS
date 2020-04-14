using System;
using System.Collections.Generic;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Implementation_Jwt.Models;

namespace Implementation_Jwt.Helpers
{
    public class JwtHelper
    {
        public string GenerateJwt(string apiKey, string apiIdentifier, string orgUnitId)
        {

            var algorithm = new HMACSHA256Algorithm();
            var urlEncoder = new JwtBase64UrlEncoder();
            var serializer = new JsonNetSerializer();
            var JWTencoder = new JwtEncoder(algorithm, serializer, urlEncoder);

            var payload = new Dictionary<string, object>
            {
                {"exp", DateTime.UtcNow.AddDays(365).ToUnixTime()},
                {"iat", DateTime.UtcNow.ToUnixTime()},
                {"jti", Guid.NewGuid()},
                {"iss", apiIdentifier},
                {"OrgUnitId", orgUnitId},
                {"ReferenceId", "Test14042012"},
                {
                    "Payload", new Order
                    {
                        OrderDetails = new OrderDetails
                        {
                            OrderNumber = "Test14042012" //Guid.NewGuid().ToString()
                        }   
                    }
                }

            };
            
            return JWTencoder.Encode(payload, apiKey);
        }

        public string DecodeAndValidateResponseJwt(string responseJwt, string apiKey)
        {
            string jsonPayload = string.Empty;
            try
            {
                var algorithm = new HMACSHA256Algorithm();
                var serializer = new JsonNetSerializer();
                var dateTimeProvider = new UtcDateTimeProvider();
                var validator = new JwtValidator(serializer, dateTimeProvider);
                var urlEncoder = new JwtBase64UrlEncoder();

                var JWTdecode = new JwtDecoder(serializer, validator, urlEncoder, algorithm);

                jsonPayload = JWTdecode.Decode(responseJwt, apiKey, true);
            }       
            catch (SignatureVerificationException)  
            {
                jsonPayload = "Error";
            }

            return jsonPayload;
        }

        public string GenerateJwtStart(string _jwt, string _apiKey)
        {
            var algorithm = new HMACSHA256Algorithm();
            var urlEncoder = new JwtBase64UrlEncoder();
            var serializer = new JsonNetSerializer();
            var JWTencoder = new JwtEncoder(algorithm, serializer, urlEncoder);

            var payload = new Dictionary<string, object>
            {

            };

            return JWTencoder.Encode(payload, _apiKey);
        }

    }
}
