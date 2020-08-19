// Authenticate with Genesys Cloud
function authenticate(client, pcEnvironment) {
    /*
    * Note: To use this app in your own org, you will need to create your own OAuth2 Client(s)
    * in your Genesys Cloud org.  After creating the Implicit grant client, map the client id(s) to
    * the specified region key(s) in the object below, deploy the page, and configure an app to point to that URL.
    */
    const pcOAuthClientIds = {'mypurecloud.com': 'implicit-oauth-client-id-here'};
    const clientId = pcOAuthClientIds[pcEnvironment];
    if (!clientId) {
        return Promise.reject(new Error(pcEnvironment + ': Unknown/Unsupported Genesys Cloud Environment'));
    }

    const { origin, protocol, host, pathname } = window.location;
    const redirectUrl = (origin || `${protocol}//${host}`) + pathname;

    return client.loginImplicitGrant(clientId, redirectUrl, {state: `pcEnvironment=${pcEnvironment}`})
        .then(data => {
            window.history.replaceState(null, '', `${pathname}?${data.state}`);
        });
}
