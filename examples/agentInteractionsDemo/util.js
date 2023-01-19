// ----- Utility Functions
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
