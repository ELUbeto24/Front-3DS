namespace Implementation_Jwt.Models
{
    internal class OrderDetails
    {
        public string OrderNumber { get; set; }
        public string Amount { get; set; }
        public string CurrencyCode { get; set; }
        public string OrderDescription { get; set; }
        public string OrderChannel { get; set; }
        public string NameOnAccount { get; set; }
    }

    internal class ShippingAddress
    {
        public string Email { get; set; }
        public string MobilePhone { get; set; }
        public string Address1 { get; set; }
        public string City { get; set; }
        public string CountryCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PostalCode { get; set; }
        public string State { get; set; }
    }

    internal class Account
    {
        public int AccountNumber { get; set; }
        public int ExpirationMonth { get; set; }
        public int ExpirationYear { get; set; }
        public int CardCode { get; set; }
    }

    internal class TokenDetail
    {
        public string Token { get; set; }
    }

    internal class CCAExtension
    {
        public string MerchantId { get; set; }
        public string TransactionPwd { get; set; }
        public string MerchantName { get; set; }
        public string MerchantUrl { get; set; }
    }

}