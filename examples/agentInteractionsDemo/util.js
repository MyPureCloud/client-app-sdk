// ----- Utility Functions
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

function processImageData(images) {
    let bestImage = {
        size: 0,
        uri: null
    };
    if (images) {
        images.forEach(function(currImg) {
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
    return bestImage.size?bestImage.uri:"";
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
    return qualityApi.getQualityEvaluationsQuery(opts);
}
