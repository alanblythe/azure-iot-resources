var generateSasToken = function (resourceUri, signingKey, policyName, expiresInMins) {
    resourceUri = encodeURIComponent(resourceUri);
    var crypto = require("crypto");

    // Set expiration in seconds
    var expires = (Date.now() / 1000) + expiresInMins * 60;
    expires = Math.ceil(expires);
    var toSign = resourceUri + '\n' + expires;

    // Use crypto
    var hmac = crypto.createHmac('sha256', Buffer.from(signingKey, 'base64'));
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

var resourceUri = process.argv[2];
var signingKey = process.argv[3];
var policyName = process.argv[4];
var expiresInMins = process.argv[5];

var sasToken = generateSasToken(resourceUri,signingKey,policyName,expiresInMins);

console.log(sasToken);


