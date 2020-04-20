var objCard = new Object();
var _url = 'http://localhost:8080/v1/api/tfaservice/';

function CheckOut() {
    var objOrder = new Object;
    var objOrderDetails = new Object;

    objOrder.referenceID = "Test-" + uuidv4().substring(0,8);

    objOrderDetails.OrderNumber = objOrder.referenceID;
    objOrderDetails.Amount = "10.00";
    objOrderDetails.CurrencyCode = "";
    objOrderDetails.OrderDescription = "";
    objOrderDetails.OrderChannel = "";
    objOrderDetails.NameOnAccount = "";

    objOrder.orderDetails = objOrderDetails;

    jQuery.ajax({
        url: _url + 'generatejwt',
        type: 'POST',
        data: JSON.stringify(objOrder),
        headers: {
            'Content-Type': 'application/json'
        },
        success: function (request) {
            if (response =! null) {
                ProceesCardinal(request, objOrder.referenceID, objOrderDetails.Amount);
            }
        }, error: function (request, status, error) {
            console.log(request);
        }
    });
};

function ProceesCardinal(jwt, referenceID, price) {

    Cardinal.configure({
        logging: {
            level: 'on'
        }
    });

    Cardinal.setup('init', {
        jwt: jwt
    });
    /* 
    Cardinal.trigger("bin.process", document.getElementById('AccountNumber').value);
    */
    Cardinal.on('payments.setupComplete', function (data) {

        objCard.merchantReferenceCode = referenceID;
        objCard.enrollServiceRun = "true";
        objCard.referenceID = referenceID /*uuidv4();*/

        objCard.cardAccountNumber = document.getElementById('AccountNumber').value;
        objCard.cardExpirationMonth = document.getElementById('ExpirationMonth').value;
        objCard.cardExpirationYear = document.getElementById('ExpirationYear').value;
        objCard.totalsCurrency = "MXN";
        objCard.price = price;
        objCard.giftCategory = "false";

        objCard.firstName = document.getElementById('FirstName').value;
        objCard.lastName = document.getElementById('LastName').value;
        objCard.street = document.getElementById('Street').value;
        objCard.city = document.getElementById('City').value;
        objCard.postalCode = document.getElementById('PostalCode').value;
        objCard.state = document.getElementById('State').value;
        objCard.country = "MX";
        objCard.email = document.getElementById('Email').value;
        objCard.phoneNumber = document.getElementById('PhoneNumber').value;

        fetch(_url + 'checkenroll', {
            method: 'POST',
            body: JSON.stringify(objCard),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(response =>
                Cardinal.continue('cca',
                    {
                        'AcsUrl': response.objectResponse.acsURL,
                        'Payload': response.objectResponse.paReq

                    },

                    {
                        'OrderDetails': {
                            'TransactionId': response.objectResponse.authenticationTransactionId
                        }
                    }

                ));
    });


    Cardinal.on('payments.validated', function (data, jwtt) {
        
        /*console.log('PARSE: ' + parseJwt(jwtt));*/
        
        var objValidate = new Object;

        objValidate.payerAuthValidateServiceRun = "true";
        objValidate.merchantReferenceCode = referenceID;
        objValidate.unitPrice = price;
        objValidate.currency = "MX"

        objValidate.cardAccountNumber = document.getElementById('AccountNumber').value;
        objValidate.cardExpirationMonth = document.getElementById('ExpirationMonth').value;
        objValidate.cardExpirationYear = document.getElementById('ExpirationYear').value;
        objValidate.cardCardType = "001";
        objValidate.authenticationTransactionID = data.Payment.ProcessorTransactionId;

        switch (data.ErrorDescription) {
            case 'Success':
                jQuery.ajax({
                    url: _url + 'validate',
                    type: 'POST',
                    data: JSON.stringify(objValidate),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    success: function (request) {
                        alert(request);
                    }, error: function (request, status, error) {
                        console.log(request);
                    }
                });
                break;

            case 'NOACTION':
                // Handle no actionable outcome
                break;

            case 'FAILURE':
                // Handle failed transaction attempt
                break;

            case 'ERROR':
                // Handle service level error
                break;
        }
    });


};

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return jsonPayload;
    /*return JSON.parse(jsonPayload);*/
};

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};


/*
.done(function (res) {
console.log(res)
});
*/

/*
function GenerateJWT() {

}

$(document).ready(function () {

});


@Configuration
@PropertySource("file:config.properties")
public class ApplicationConfiguration {

    @Value("${gMapReportUrl}")
    private String gMapReportUrl;

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigInDev() {
        return new PropertySourcesPlaceholderConfigurer();
    }

}
*/
