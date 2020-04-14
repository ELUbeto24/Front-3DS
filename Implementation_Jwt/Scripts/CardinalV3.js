var objCard = new Object();
var _url = 'http://localhost:9898/v1/api/tfaservice/';

function CheckOut() {
    var jwt = document.getElementById('tokenG').value;

    Cardinal.configure({
        logging: {
            level: 'on'
        }
    });

    Cardinal.setup('init', {
        jwt: jwt
    });

    //Cardinal.trigger("bin.process", document.getElementById('AccountNumber').value);

    Cardinal.on('payments.setupComplete', function (data) {
        objCard.merchantReferenceCode = 'Test13042059';
        objCard.enrollServiceRun = "true";
        objCard.referenceID = "Test13042059" 

        objCard.cardAccountNumber = document.getElementById('AccountNumber').value;
        objCard.cardExpirationMonth = document.getElementById('ExpirationMonth').value;
        objCard.cardExpirationYear = document.getElementById('ExpirationYear').value;
        objCard.totalsCurrency = "MXN";
        objCard.price = "650.00";
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

        var cardJSON = JSON.stringify(objCard);


        jQuery.ajax({
            url: _url + 'checkenroll',
            type: "POST",
            data: cardJSON,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                Cardinal.continue('cca',
                    {
                        'AcsUrl': response.objectResponse.acsURL,
                        'Payload': response.objectResponse.paReq

                    },

                    {
                        'OrderDetails': {
                            'TransactionId': response.objectResponse.authenticationTransactionID
                        }
                    }
                );
            }, error: function (request, status, error) {
                console.log(request);
            }
        });
    });

    Cardinal.on("payments.validated", function (data, jwtt) {
        console.log('PARSE: ' + parseJwt(jwtt));

        var objValidate = new Object;

        objValidate.payerAuthValidateServiceRun = "true";
        objValidate.merchantReferenceCode = "Test13042059";
        objValidate.unitPrice = "650.00";
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

function Pay() {
   

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

function GenerateJWT() {

}