var objCard = new Object();
var _url = 'http://localhost:9595/v1/api/tfaservice/';

/*
 * Comenzamos con el flujo para 3DS invocando al EndPoint
 * para crear el JWT.
*/
function CheckOut() {
/*
 * Creamos un objeto order
 * y dentro de el un orderDetails
 */
    var objOrder = new Object;
    var objOrderDetails = new Object;

    /*
     * en referenceID podemos colocar el id de link de pago para que sea dinamico
    */ 
    objOrder.referenceID = "Test-1234567890º"

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

        objCard.cardAccountNumber = "4000000000001091";
        objCard.cardExpirationMonth = "02";
        objCard.cardExpirationYear = "2024";
        objCard.totalsCurrency = "MXN";
        objCard.price = price;
        objCard.giftCategory = "false";

        objCard.firstName = "";
        objCard.lastName = "";
        objCard.street = "1295 Charleston Road";
        objCard.city = "Mountain View";
        objCard.postalCode = "94043";
        objCard.state = "CA";
        objCard.country = "US";
        objCard.email = "";
        objCard.phoneNumber = "";

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
                objValidate.currency = "MXN"

                objValidate.cardAccountNumber = "4000000000001091";
                objValidate.cardExpirationMonth = "02";
                objValidate.cardExpirationYear = "2024";

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
            alert("Codigo: " + response.objectResponse.reasonCode + " - Decision: " + response.objectResponse.decision + " - Enrolled: " + response.objectResponse.veresEnrolled );
        }
       
    } else {
        alert(response.message);
    }
    
};
