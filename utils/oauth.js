// Authenticate with Genesys Cloud
function authenticate(client, pcEnvironment) {
    // Allow targeting a different environment when host app is running locally
    const platformEnvironment = pcEnvironment === 'localhost' ? 'mypurecloud.com' : pcEnvironment;
    /*
    * Note: To use this app in your own org, you will need to create your own OAuth2 Client(s)
    * in your Genesys Cloud org.  After creating the Implicit grant client, map the client id(s) to
    * the specified region key(s) in the object below, deploy the page, and configure an app to point to that URL.
    */
    const pcOAuthClientIds = {'mypurecloud.com': 'implicit-oauth-client-id-here'};
    const clientId = pcOAuthClientIds[platformEnvironment];
    if (!clientId) {
        const defaultErr = platformEnvironment + ': Unknown/Unsupported Genesys Cloud Environment';
        const localErr = `
            The host app is running locally and the target platform client environment was mapped to '${platformEnvironment}'.
            Ensure that you have an oauth client specified for this environment.
        `;
        return Promise.reject(new Error(pcEnvironment === 'localhost' ? localErr : defaultErr));
    }

    client.setEnvironment(platformEnvironment);
    client.setPersistSettings(true);

    const { origin, protocol, host, pathname } = window.location;
    const redirectUrl = (origin || `${protocol}//${host}`) + pathname;

    return client.loginImplicitGrant(clientId, redirectUrl, {state: `pcEnvironment=${pcEnvironment}`})
        .then(data => {
            window.history.replaceState(null, '', `${pathname}?${data.state}`);
        });
}
