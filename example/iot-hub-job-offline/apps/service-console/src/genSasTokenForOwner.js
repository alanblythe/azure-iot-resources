
var generateSasToken = function (expiresInMins) {
    var policyName = 'iothubowner';
    var resourceUri = process.env.IOTHUB_NAME + '.azure-devices.net';
    resourceUri = encodeURIComponent(resourceUri);
    var crypto = require("crypto");

    // Set expiration in seconds
    var expires = (Date.now() / 1000) + expiresInMins * 60;
    expires = Math.ceil(expires);
    var toSign = resourceUri + '\n' + expires;

    // Use crypto
    var hmac = crypto.createHmac('sha256', Buffer.from(process.env.IOTHUBOWNER_SAS_KEY, 'base64'));
    hmac.update(toSign);
    var base64UriEncoded = encodeURIComponent(hmac.digest('base64'));

    // Construct authorization string
    var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
        + base64UriEncoded + "&se=" + expires;
    if (policyName) token += "&skn=" + policyName;
    return token;
};

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});

var expiresInMins = process.argv[2];

var sasToken = generateSasToken(expiresInMins);

console.log(sasToken);

module.exports = generateSasToken;


