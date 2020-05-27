var objCard = new Object();
var card = new Object();
var additionalParameter = new Object();

/* var _url = 'http://localhost:9595/V1/TwoFactorAuthenticateService/'; */

/* URL OCELOT*/
/* var _url = 'http://localhost:5000/V1/two-factor-authenticate-service/'; */

var _url = 'https://elb-pub-twofactorauth-373167251.us-east-1.elb.amazonaws.com/V1/TwoFactorAuthenticateService/';

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

    /*
     * Creacion de JWT
     */

    jQuery.ajax({
        url: _url + 'generatejwt',
        type: 'POST',
        data: JSON.stringify(objOrder),
        headers: {
            'Content-Type': 'application/json'
        },
        success: function (request) {
            if (response = ! null) {
                /*
                 * Pasamos los parametros a nuestra funcion que ara la llamada a la pila de eventos a Cardinal
                 * Parametro:
                 * JWT
                 * Reference ID
                 * Monto de la transaccion
                 */
                ProceesCardinal(request, objOrder.referenceID, objOrderDetails.Amount);
            }
        }, error: function (request, status, error) {
            console.log(request);
        }
    });
};

function ProceesCardinal(jwt, referenceID, price) {

    card.cardAccountNumber = document.getElementById('AccountNumber').value;
    card.cardExpirationMonth = document.getElementById('ExpirationMonth').value;
    card.cardExpirationYear = document.getElementById('ExpirationYear').value;
    card.currency = "MXN";

    additionalParameter.serviceMcc = '5045';
    additionalParameter.serviceAcquirerBin = '451899';
    additionalParameter.serviceLoginID = '7376961';
    additionalParameter.serviceCountryCode = 'MX';
    additionalParameter.serviceMerchantName = 'Conekta';
    additionalParameter.serviceMerchantID = '7376961';
    additionalParameter.serviceMerchantURL = 'https://conekta.com/';
    additionalParameter.serviceRequestorID = '10052155*7376961';
    additionalParameter.serviceRequestorName = 'Conekta';
    additionalParameter.serviceMobilePhone = '5569654638';
    additionalParameter.serviceProductCode = 'SVC';
    additionalParameter.overridePaymentMethod = 'CR';

/*
 * La siguiente pila de llamadas las hace en automatio Cardinal
 * El primer evento de Cardinal es la configuracion.
*/
    Cardinal.configure({
        logging: {
            level: 'on'
        }
    });

/*
 * Segundo evento en la pila es validar el JWT que creamos antes.
 */
    Cardinal.setup('init', {
        jwt: jwt
    });

/*
 * Al terminar la validación del JWT caera en el evento setupComplete.
 * Dentro de este evento de Cardinal invocaremos a nuestro endpoint donde
 * invocaremos al servicio 2FA.Service para consumir el metodo "CheckEnroll"
 */
    Cardinal.on('payments.setupComplete', function (data) {

/*
 * Creamos un objeto Card con las siguientes propiedades:
*/

        objCard.merchantReferenceCode = referenceID; /* La propiedad referenceID tiene que ser la que traemos de la creacion del JWT*/
        objCard.enrollServiceRun = "true";
        objCard.referenceID = referenceID 

        objCard.cardModel = card
        objCard.price = price;
        objCard.giftCategory = "false";

        objCard.firstName = document.getElementById('FirstName').value;
        objCard.lastName = document.getElementById('LastName').value;
        objCard.street = document.getElementById('Street').value;
        objCard.city = document.getElementById('City').value;
        objCard.postalCode = document.getElementById('PostalCode').value;
        objCard.state = document.getElementById('State').value;
        objCard.country = "US";
        objCard.email = document.getElementById('Email').value;
        objCard.phoneNumber = document.getElementById('PhoneNumber').value;

        objCard.additionalParameterModel = additionalParameter;

/*
 * Procedemos a invocar el EndPoint a CheckEnroll pasando como data el objeto Card.
*/

        fetch(_url + 'checkenroll', {
            method: 'POST',
            body: JSON.stringify(objCard),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(response =>
/*
 * Al responder el metodo CheckEnroll se lo pasamos a la funcion InvokeChalleng
*/
                InvokeChalleng(response)

                );
    });


/*
 * Una vez que le demos submit a la pagina del banco si es que tubimos challenge entrara
 * al siguiente metodo de Cardina que es el siguiente
*/
    Cardinal.on('payments.validated', function (data, jwtt) {
        var objValidate = new Object;

/* 
 * Si no ocurrio ningun error nos respondera con un Success
 * e iremos a realizar la ultima invocacion al servicio que es Validate
*/
        switch (data.ErrorDescription) {
            case 'Success':
/*
 * Creamos un objeto Validate con los siguientes parametros:
*/
                objValidate.payerAuthValidateServiceRun = "true";
                objValidate.merchantReferenceCode = referenceID; /* La propiedad referenceID tiene que ser la que traemos de la creacion del JWT*/
                objValidate.unitPrice = price;
                objValidate.cardModel = card;
                objValidate.authenticationTransactionID = data.Payment.ProcessorTransactionId;

/*
 * Procedemos a invocar el EndPoint de Validate pasando como data el objeto Validate.
*/
                jQuery.ajax({
                    url: _url + 'validate',
                    type: 'POST',
                    data: JSON.stringify(objValidate),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    success: function (request) {
/*
 * Una vez que tengamos la respuesta de Cybersource para saber si la tarjeta fue o no aceptada
 * aqui podremos continuar con el flujo comun de la transacción.
*/

                        alert("Codigo: " + request.objectResponse.reasonCode +
                            " - ECI: " + request.objectResponse.eci +
                            " - XID: " + request.objectResponse.xID +
                            " - Respuesta: " + request.objectResponse.veresEnrolled +
                            " - Version: " + request.objectResponse.specificationVersion);

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

/*
 * Esta funcion valida si el cliente se tiene que autentificar
 * con un token proporcionado por su banco.
*/
function InvokeChalleng(response) {
    if (response.objectResponse != null) {
        if (response.objectResponse.reasonCode == 475
            && response.objectResponse.acsURL != null
            && response.objectResponse.paReq != null
            && response.objectResponse.authenticationTransactionId != null
        ) {
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
            )
        } else {
            alert("Codigo: " + response.objectResponse.reasonCode +
                " - ECI: " + response.objectResponse.eci +
                " - XID: " + response.objectResponse.xID +
                " - Respuesta: " + response.objectResponse.veresEnrolled +
                " - Version: " + response.objectResponse.specificationVersion);
        }
       
    } else {
        alert(response.message);
    }
    
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
