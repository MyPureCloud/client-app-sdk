document.addEventListener("DOMContentLoaded", () => {
    // Obtain a reference to the platformClient object
    const platformClient = require("platformClient");

    let pcEnvironment = getEmbeddingPCEnv();
    if (!pcEnvironment) {
        setErrorState('Cannot identify App Embeddding context.  Did you forget to add pcEnvironment={{pcEnvironment}} to your app\'s query string?');
        return;
    }

    /*
     * Note: To use this app in your own org, you will need to create your own OAuth2 Client(s)
     * in your PureCloud org.  After creating the Implicit grant client, map the client id(s) to
     * the specified region key(s) in the object below, deploy the page, and configure an app to point to that URL.
     */
    let pcOAuthClientIds = { 'mypurecloud.com': 'implicit-oauth-client-id-here' };
    let clientId = pcOAuthClientIds[pcEnvironment];
    if (!clientId) {
        setErrorState(pcEnvironment + ': Unknown/Unsupported PureCloud Environment');
        return;
    }

    let client = platformClient.ApiClient.instance;
    client.setEnvironment(pcEnvironment);
    client.setPersistSettings(true);

    let clientApp = null;
    try {
        clientApp = new window.purecloud.apps.ClientApp({
            pcEnvironment,
        });
    } catch (e) {
        setErrorState(pcEnvironment + ": Unknown/Unsupported PureCloud Embed Context");
        return;
    }

    // Create API instance
    const usersApi = new platformClient.UsersApi();
    const qualityApi = new platformClient.QualityApi();

    let authenticated = false;
    let authenticatingEl = document.querySelector(".authenticating");
    let agentUserId = "";

    let redirectUrl = window.location.origin;
    if (!redirectUrl) {
        redirectUrl = window.location.protocol + '//' + window.location.host;
    }
    redirectUrl += window.location.pathname;

    // Authentication and main flow
    client.loginImplicitGrant(clientId, redirectUrl, { state: ("pcEnvironment=" + pcEnvironment) })
        .then(() => {
            // Get userme info
            authenticated = true;
            return usersApi.getUsersMe({ "expand": ["presence"] });
            // Search form event listener
        })
        .then((profileData) => {
            // Render profile section
            setHidden(authenticatingEl, true);
            let profileEl = document.querySelector(".user-profile");
            let searchEl = document.querySelector(".search");
            renderUserProfile(profileEl, profileData);
            setHidden(profileEl, false);
            // Render search section
            renderSearch(searchEl);
            let searchFormEl = document.querySelector("#search");
            agentUserId = profileData.id;
            // Register event listener
            searchFormEl.addEventListener("click", handleDateSearch);
        })
        .catch((err) => {
            console.log(err);
            setHidden(authenticatingEl, true);
            setErrorState(!authenticated ? "Failed to Authenticate with PureCloud" :
                "Failed to fetch/display profile");
        });

    // ----- Helper Functions
    /**
     * Handler for date search
     */
    function handleDateSearch() {
        const startTime = moment(document.querySelector("#starttime").value).toISOString();
        const endTime = moment(document.querySelector("#endtime").value).toISOString();
        let evaluationListPromise = getEvaluations(qualityApi, startTime, endTime, agentUserId);
        evaluationListPromise
            .then((data) => {
                let evaluationListEl = document.querySelector(".evaluation-list");
                setHidden(evaluationListEl, false);
                const evaluations = data.entities;
                renderEvaluationList(evaluationListEl, evaluations);
            })
            .catch((err) => {
                console.log(`Error: ${err}`);
            });
    }
    /**
     * Function used to fetch evaluationListing
     */
    function getEvaluations(qualityApi, startTime, endTime, agentUserId) {
        const opts = {
            agentUserId,
            startTime,
            endTime,
            expandAnswerTotalScores: true,
            expand: ["evaluator"],
            sortOrder: "asc",
        };
        console.log(opts);
        return qualityApi.getQualityEvaluationsQuery(opts);
    }

    /**
     * Sets the base mode of the app to error and show the provided message
     */
    function setErrorState(errorMsg) {
        let failureEl = document.querySelector(".failure");
        failureEl.textContent = errorMsg;
        setHidden(failureEl, false);
    }

    let profileLinkListener = null;
    /**
     * Updates the provided User Profile element state
     * with the provided profileData
     */
    function renderUserProfile(profileRootEl, profileData) {
        let linkEl = profileRootEl.querySelector(".profile-link");

        if (profileLinkListener) {
            linkEl.removeEventListener("click", profileLinkListener);
            profileLinkListener = null;
        }

        profileLinkListener = function(evt) {
            evt.preventDefault();

            if (profileData.id) {
                console.log(profileData);
                // clientApp.users.showProfile(profileData.id);
            } else {
                console.info("No user ID available to route to user profile");
            }
        }
        linkEl.addEventListener("click", profileLinkListener);

        let bestImage = {
            size: 0,
            uri: null
        };
        if (profileData.images) {
            profileData.images.forEach(function(currImg) {
                if (!currImg.resolution || !currImg.imageUri) {
                    return;
                }
                let currRes = parseInt(currImg.resolution.substr(1), 10);
                if (currRes && !isNaN(currRes) && currRes > bestImage.size && currRes <= 400) {
                    bestImage.size = currRes;
                    bestImage.uri = currImg.imageUri;
                }
            });
        }

        let placeholderPicEl = profileRootEl.querySelector(".placeholder-pic");
        let picEl = profileRootEl.querySelector(".profile-pic");
        if (bestImage.size) {
            setHidden(placeholderPicEl, true);

            picEl.setAttribute("src", bestImage.uri);
            picEl.setAttribute("aria-label", "Profile picture for " + (profileData.name || "User"));
            setHidden(picEl, false);
        } else {
            setHidden(placeholderPicEl, false);
            setHidden(picEl, true);
        }
    }

    function renderSearch(searchEl) {
        setHidden(searchEl, false);
        let startEl = searchEl.querySelector("#starttime");
        let endEl = searchEl.querySelector("#endtime");
        const now = moment().format("YYYY-MM-DD");
        startEl.value = moment("1970-01-01").format("YYYY-MM-DD");
        endEl.value = now;
    }

    function renderEvaluationList(evalListEl, evaluations) {
        console.log(evaluations);
        let headContentEl = evalListEl.querySelector("thead tr");
        let bodyContentEl = evalListEl.querySelector("tbody");
        const titles = [
            "Interaction",
            "Evaluation",
            "Evaluation Form Name",
            "Evaluator"
        ];
        $(headContentEl).empty();
        $(bodyContentEl).empty();
        titles.forEach((title) => {
            $(headContentEl).append(`<th scope="col">${title}</th>`);
        });
        if (evaluations && evaluations.length > 0) {
            evaluations.forEach((eval) => {
                const inId = eval.conversation.id;
                const evId = eval.id;
                let trow = `<tr>
                  <td id="view-interaction-${inId}">${inId}</td>
                  <td id="view-evaluation-${evId}">${evId}</td>
                  <td>${eval.evaluationForm.name}</td>
                  <td>${eval.evaluator.name}</td>
                </tr>`;
                $(bodyContentEl).append(trow);
                let viewInteraction = document.getElementById(`view-interaction-${inId}`);
                let viewEvaluation = document.getElementById(`view-evaluation-${evId}`);
                viewInteraction.style.color = "blue";
                viewEvaluation.style.color = "blue";
                console.log(clientApp);
                viewInteraction.addEventListener("click", () => {
                    console.log("View Interaction " + inId);
                    clientApp.myConversations.showInteractionDetails(inId);
                });
                viewEvaluation.addEventListener("click", () => {
                    console.log("View Evaluation " + evId);
                    clientApp.myConversations.showEvaluationDetails(inId, evId);
                });
            });
        }
    }

    // ----- Utility Functions
    function setHidden(el, hidden) {
        if (hidden) {
            el.classList.add("hidden");
        } else {
            el.classList.remove("hidden");
        }
    }

    function extractParams(paramStr) {
        let result = {};

        if (paramStr) {
            let params = paramStr.split('&');
            params.forEach(function(currParam) {
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

    /**
     * Determine the embedding PureCloud environment seeded on the query string or
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
});
