var objCard = new Object();
var _url = 'http://localhost:7878/api/cybersource/';

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

        objCard.payerAuthEnrollService_run = "true";
        objCard.card_accountNumber = document.getElementById('AccountNumber').value;
        objCard.card_expirationMonth = document.getElementById('ExpirationMonth').value;
        objCard.card_expirationYear = document.getElementById('ExpirationYear').value;
        objCard.purchaseTotals_currency = "MXN";
        objCard.item_0_unitPrice = "350.00";
        objCard.item_0_giftCategory = "false";

        objCard.billTo_firstName = document.getElementById('FirstName').value;
        objCard.billTo_lastName = document.getElementById('LastName').value;
        objCard.billTo_street1 = document.getElementById('Street').value;
        objCard.billTo_city = document.getElementById('City').value;
        objCard.billTo_postalCode = document.getElementById('PostalCode').value;
        objCard.billTo_state = document.getElementById('State').value;
        objCard.billTo_country = "MX";
        objCard.billTo_email = document.getElementById('Email').value;
        objCard.billTo_phoneNumber = document.getElementById('PhoneNumber').value;
        objCard.payerAuthEnrollService_referenceID = 'Test14042012' /*uuidv4();*/

        var cardJSON = JSON.stringify(objCard);


        jQuery.ajax({
            url: _url + 'checkenroll',
            type: "POST",
            data: cardJSON,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (request) {
                Cardinal.continue('cca',
                    {
                        "AcsUrl": request.payerAuthEnrollReply_acsURL,
                        "Payload": request.payerAuthEnrollReply_paReq

                    },

                    {
                        "OrderDetails": {
                            "TransactionId": request.payerAuthEnrollReply_authenticationTransactionID
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

        switch (data.ErrorDescription) {
            case "Success":
                jQuery.ajax({
                    url: _url + 'validate',
                    type: "POST",
                    data: { PaRes: jwtt, MD: data.Payment.ProcessorTransactionId },
                    success: function (request) {
                        alert(request);
                    }, error: function (request, status, error) {
                        console.log(request);
                    }
                });
                break;

            case "NOACTION":
                // Handle no actionable outcome
                break;

            case "FAILURE":
                // Handle failed transaction attempt
                break;

            case "ERROR":
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