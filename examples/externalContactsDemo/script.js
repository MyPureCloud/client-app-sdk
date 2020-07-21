document.addEventListener('DOMContentLoaded', function () {
    let platformClient = window.require('platformClient');
    updateProgressBar(20);

    /*
    * The Client Apps SDK can interpolate the current PC Environment into your app's URL
    * EX: https://mypurecloud.github.io/client-app-sdk/profile.html?pcEnvironment={{pcEnvironment}}
    *
    * Reading the PC Environment from the query string or state param returned from OAuth2 response
    */
    let pcEnvironment = getEmbeddingPCEnv();
    if (!pcEnvironment) {
        setErrorState(
            "Cannot identify App Embeddding context.  Did you forget to add pcEnvironment={{pcEnvironment}} to your app's query string?"
        );
        return;
    }
    updateProgressBar(40);

    /*
    * Note: To use this app in your own org, you will need to create your own OAuth2 Client(s)
    * in your Genesys Cloud org.  After creating the Implicit grant client, map the client id(s) to
    * the specified region key(s) in the object below, deploy the page, and configure an app to point to that URL.
    */
    let pcOAuthClientIds = { 'mypurecloud.com': 'implicit-oauth-client-id-here' };
    let clientId = pcOAuthClientIds[pcEnvironment];
    if (!clientId) {
        setErrorState(
            pcEnvironment + ': Unknown/Unsupported Genesys Cloud Environment'
        );
        return;
    }
    updateProgressBar(60);

    let client = platformClient.ApiClient.instance;
    client.setEnvironment(pcEnvironment);

    let clientApp = null;
    try {
        clientApp = new window.purecloud.apps.ClientApp({
            pcEnvironment: pcEnvironment
        });
    } catch (e) {
        setErrorState(
            pcEnvironment + ': Unknown/Unsupported Genesys Cloud Embed Context'
        );
        return;
    }
    updateProgressBar(80);

    /*
    *  Set up manual tester now; no PC Auth required
    *
    *  This UI is used for testing purposes to manually navigate to an external contact by ID.
    *  It purposefully ignores the fact that a user may not be authorized to view external contacts.
    */
    document
        .querySelector('.manual-example #contactButton')
        .addEventListener('click', function () {
            let contactId = document.querySelector('#contact-id').value.trim();
            if (contactId) {
                clientApp.externalContacts.showExternalContactProfile(contactId);
            }
        });
    document
        .querySelector('.manual-example #orgButton')
        .addEventListener('click', function () {
            let externalOrganizationId = document.querySelector('#org-id').value.trim();
            if (externalOrganizationId) {
                clientApp.externalContacts.showExternalOrganizationProfile(externalOrganizationId);
            }
        });

    let redirectUrl = window.location.origin;
    if (!redirectUrl) {
        redirectUrl = window.location.protocol + '//' + window.location.host;
    }
    redirectUrl += window.location.pathname;

    // Authenticate with Genesys Cloud
    let authenticated = false;
    let userDataAcquired = false;

    client
        .loginImplicitGrant(clientId, redirectUrl, {
            state: 'pcEnvironment=' + pcEnvironment
        })
        .then(function () {
            updateProgressBar(100);
            authenticated = true;
            return new platformClient.UsersApi().getUsersMe({
                expand: ['authorization']
            });
        })
        .then(function (profileData) {
            userDataAcquired = true;
            // Check if the current user will be able to view external contacts
            let permissions = profileData.authorization.permissions;
            if (checkPermission(permissions, 'externalContacts:contact:view')) {
                requestExternalContacts().then(data => {
                    // Hide progress bar after auth is done and promise resolved
                    let authenticatingEl = document.querySelector('.authenticating');
                    authenticatingEl.classList.add('hidden');
                    let entities = data.entities;
                    // Build table with data from api call
                    for (let i = 0; i < entities.length; i++) {
                        let hasOrg = !!entities[i].externalOrganization;
                        document.getElementById('tableBody').insertAdjacentHTML('beforeend',
                            `<tr>
                                <td>
                                    <a id="entity-${i}"></a>
                                </td>
                                <td>
                                    <a id="org-${i}"></a>
                                </td>
                            </tr>`
                        );
                        // Attach listeners to entities to call sdk methods
                        let entity = document.getElementById(`entity-${i}`);
                        entity.addEventListener('click', function () {
                            clientApp.externalContacts.showExternalContactProfile(entities[i].id);
                        });
                        entity.appendChild(document.createTextNode(`${entities[i].lastName}, ${entities[i].firstName}`));
                        if (hasOrg) {
                            let org = document.getElementById(`org-${i}`);
                            let orgId = entities[i].externalOrganization.id;
                            org.addEventListener('click', function () {
                                clientApp.externalContacts.showExternalOrganizationProfile(orgId);
                            });
                            org.appendChild(document.createTextNode(orgId));
                        }
                    }
                }).catch(err => {
                    setErrorState(err);
                });
            } else {
                setErrorState('You do not have the proper permissions to view external contacts.');
            }
        })
        .catch(function () {
            if (!authenticated) {
                setErrorState('Failed to Authenticate with Genesys Cloud');
            } else if (!userDataAcquired) {
                setErrorState('Failed to locate user in Genesys Cloud');
            }
        });

    function setErrorState(errorMsg) {
        // Display error text in progress bar
        document.querySelector('.progress-label').innerText = errorMsg;
        document.querySelector('.progress-bar').className += ' progress-bar-danger';
        updateProgressBar(100);
    }

    /**
     * Parse the permissions array and check whether or not the match the specified required ones.
     *
     * @returns A boolean indicating if the user possesses the required permissions.
     */
    function checkPermission(permissions, permissionValue) {
        let isAllowed = false;

        if (!permissions) {
            permissions = [];
        }

        if (permissionValue.match(/^[a-zA-Z0-9]+:\*$/)) {
            permissionValue = permissionValue.replace('*', '*:*');
        }

        const permissionsToValidate = permissionValue.split(':');
        const targetDomain = permissionsToValidate[0];
        const targetEntity = permissionsToValidate[1];
        const targetAction = permissionsToValidate[2];

        permissions.forEach(function (permission) {
            const permissions = permission.split(':');
            const domain = permissions[0];
            const entity = permissions[1];
            const actionSet = permissions[2];

            if (targetDomain === domain) {
                const matchesEntity = isPermission(targetEntity, entity);
                const matchesAction = isPermission(targetAction, actionSet);

                if (matchesEntity && matchesAction) {
                    isAllowed = true;
                }
            }
        });

        return isAllowed;
    }

    function isPermission(item, targetItem) {
        let isItem = item === '*' || targetItem === '*';
        if (!isItem) {
            isItem = item === targetItem;
        }
        return isItem;
    }

    /**
     * Determine the embedding Genesys Cloud environment seeded on the query string or
     * being returned through the OAuth2 Implicit grant state hash param.
     *
     * @returns A string indicating the embedding PC env (e.g. mypurecloud.com, mypurecloud.jp); otherwise, null.
     */
    function getEmbeddingPCEnv() {
        let result = null;

        if (window.location.hash && window.location.hash.indexOf('access_token') >= 0) {
            let oauthParams = extractParams(window.location.hash.substring(1));
            if (oauthParams && oauthParams.access_token && oauthParams.state) {
                // OAuth2 spec dictates this encoding
                // See: https://tools.ietf.org/html/rfc6749#appendix-B
                let stateSearch = unescape(oauthParams.state);
                result = extractParams(stateSearch).pcEnvironment;
            }
        }

        if (!result && window.location.search) {
            result = extractParams(window.location.search.substring(1)).pcEnvironment || null;
        }

        return result;
    }

    function extractParams(paramStr) {
        let result = {};

        if (paramStr) {
            let params = paramStr.split('&');
            params.forEach(function (currParam) {
                if (currParam) {
                    let paramTokens = currParam.split('=');
                    let paramName = paramTokens[0];
                    let paramValue = paramTokens[1];
                    if (paramName) {
                        paramName = decodeURIComponent(paramName);
                        paramValue = paramValue ? decodeURIComponent(paramValue) : null;

                        if (!result.hasOwnProperty(paramName)) {
                            result[paramName] = paramValue;
                        } else if (Array.isArray(result[paramName])) {
                            result[paramName].push(paramValue);
                        } else {
                            result[paramName] = [result[paramName], paramValue];
                        }
                    }
                }
            });
        }

        return result;
    }

    // Request first three external contacts from the api
    function requestExternalContacts() {
        let apiInstance = new platformClient.ExternalContactsApi();
        let opts = {
            pageSize: 6,
            pageNumber: 1
        };
        return apiInstance.getExternalcontactsContacts(opts)
            .then(data => {
                return data;
            });
    }

    function updateProgressBar(percent) {
        document.querySelector('.progress-bar').style.width = `${percent}%`;
    }
});
