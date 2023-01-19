document.addEventListener('DOMContentLoaded', function () {
    let platformClient = window.require('platformClient');
    updateProgressBar(20);

    /*
    * The Client Apps SDK can interpolate the current PC Environment into your app's URL
    * EX: https://mypurecloud.github.io/client-app-sdk/directoryNavigationDemo.html?gcHostOrigin={{gcHostOrigin}}&gcTargetEnv={{gcTargetEnv}}
    *
    * Reading the PC Environment from the query string or state param returned from OAuth2 response
    */
    const queryParameters = getQueryParameters();
    const state = computeState(queryParameters);
    let pcEnvironment = queryParameters.pcEnvironment;
    updateProgressBar(60);

    let client = platformClient.ApiClient.instance;
    let clientApp = null;
    try {
        if (queryParameters.gcHostOrigin && queryParameters.gcTargetEnv) {
            clientApp = new window.purecloud.apps.ClientApp({
                gcHostOrigin: queryParameters.gcHostOrigin,
                gcTargetEnv: queryParameters.gcTargetEnv
            });
            pcEnvironment = clientApp.pcEnvironment;
        } else if (pcEnvironment) {
            clientApp = new window.purecloud.apps.ClientApp({ pcEnvironment });
        } else {
            setErrorState('Cannot identify App Embedding context.  Did you forget to add gcHostOrigin={{gcHostOrigin}}&gcTargetEnv={{gcTargetEnv}} to your app\'s query string?');
            return;
        }
    } catch (e) {
        let errorStr = pcEnvironment || queryParameters.gcHostOrigin;
        setErrorState(errorStr + ': Unknown/Unsupported Genesys Cloud Embed Context');
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

    // Authenticate with Genesys Cloud
    let authenticated = false;
    let userDataAcquired = false;

    authenticate(client, pcEnvironment, state)
        .then(() => {
            updateProgressBar(100);
            authenticated = true;
            return new platformClient.UsersApi().getUsersMe({
                expand: ['authorization']
            });
        })
        .then(profileData => {
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
                    setErrorState(err.message);
                });
            } else {
                setErrorState('You do not have the proper permissions to view external contacts.');
            }
        })
        .catch(err => {
            if (!authenticated) {
                setErrorState('Failed to Authenticate with Genesys Cloud - ' + err.message);
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
