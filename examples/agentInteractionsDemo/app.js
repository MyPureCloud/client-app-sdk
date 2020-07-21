const platformClient = require("platformClient");

Vue.prototype.$clientApp = null;
Vue.prototype.$usersApi = null;
Vue.prototype.$qualityApi = null;
Vue.prototype.$conversationsApi = null;

const authenticatingComponent = {
    props: ['errorMessage', 'authenticated'],
    template: '#authenticating-template'
}

const profileComponent = {
    props: ['profileData'],

    computed: {
        imageUri: function () {
            return processImageData(this.profileData.images);
        }
    },

    methods: {
        profileLinkListener: function(evt) {
            evt.preventDefault();

            if (this.profileData.id) {
                Vue.prototype.$clientApp.users.showProfile(this.profileData.id);
            } else {
                console.info("No user ID available to route to user profile");
            }
        }
    },

    template: '#profile-template'
};

const conversationsComponent = {
    props: ['conversationsData'],

    data: function() {
        return {
            startDate: moment('1997-01-01').toISOString(),
            endDate: moment().toISOString(),
            titles: [
                "Evaluation Id",
                "Interaction Id",
                "Critical Score",
                "Score",
                "Evaluation Form Name",
                "Evaluator",
                "Release Date/Time",
                "Reviewed By Agent"
            ],
        }
    },

    computed: {
        conversations: function() {
            let filteredConversations = [];
            let sortedConversations = _.orderBy(this.conversationsData.conversations, 'startTime', 'desc');
            if (Array.isArray(sortedConversations)) {
                filteredConversations = sortedConversations.filter((conv) => {
                    if (!this.startDate._isValid) {
                        this.startDate = moment('1970-01-01').toISOString();
                    }
                    if (!this.endDate._isValid) {
                        this.endDate = moment().toISOString();
                    }
                    return conv.id && (conv.endTime ?
                        (moment(conv.startTime).isAfter(moment(this.startDate)) &&
                        moment(conv.endTime).isBefore(moment(this.endDate))):
                        moment(conv.startTime).isBetween(
                            moment(this.startDate),
                            moment(this.endDate)
                        ));
                });
            }
            return filteredConversations;
        },
        convEvalMap: function() {
            return this.conversationsData.convEvalMap;
        }
    },

    methods: {
        filterCards: function(evt) {
            this.startDate = moment(evt.target.elements.starttime.value);
            this.endDate = moment(evt.target.elements.endtime.value);
        },
        viewInteraction: function(convId) {
            Vue.prototype.$clientApp.myConversations.showInteractionDetails(convId);
        },
        viewEvaluation: function(convId, evId) {
            Vue.prototype.$clientApp.myConversations.showEvaluationDetails(convId, evId);
        }
    },

    template: '#conversations-template'
};

const testerComponent = {
    data: function() {
        return {
            convId: "",
            evalId: ""
        }
    },

    methods: {
        viewInteraction: function(convId) {
            Vue.prototype.$clientApp.myConversations.showInteractionDetails(convId);
        },
        viewEvaluation: function(convId, evalId) {
            Vue.prototype.$clientApp.myConversations.showEvaluationDetails(convId, evalId);
        },
        getConversationOrEvaluation: function(evt) {
            if (this.convId) {
                if (this.evalId) {
                    this.viewEvaluation(this.convId, this.evalId);
                } else {
                    this.viewInteraction(this.convId);
                }
            }
        }
    },

    template: '#tester-template'
}

new Vue({
    el: '#app',

    data: {
        profileData: {
            name: "Ron Swanson",
            email: "ron@swanson.com",
            department: "Parks and Rec"
        },
        conversationsData: {
            conversations: [],
            convEvalMap: new Map()
        },
        errorMessage: "",
        authenticated: false
    },

    components: {
        'authenticating': authenticatingComponent,
        'profile': profileComponent,
        'conversations': conversationsComponent,
        'tester': testerComponent
    },

    beforeMount() {
        let pcEnvironment = getEmbeddingPCEnv();
        if (!pcEnvironment) {
            this.errorMessage = 'Cannot identify App Embeddding context.  Did you forget to add pcEnvironment={{pcEnvironment}} to your app\'s query string?';
            return;
        }

        /*
            * Note: To use this app in your own org, you will need to create your own OAuth2 Client(s)
            * in your Genesys Cloud org.  After creating the Implicit grant client, map the client id(s) to
            * the specified region key(s) in the object below, deploy the page, and configure an app to point to that URL.
            */
        let pcOAuthClientIds = {'mypurecloud.com': 'implicit-oauth-client-id-here'};

        let clientId = pcOAuthClientIds[pcEnvironment];
        if (!clientId) {
            this.errorMessage = pcEnvironment + ': Unknown/Unsupported Genesys Cloud Environment';
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
            Vue.prototype.$clientApp = clientApp;
        } catch (e) {
            console.log(e);
            this.errorMessage = pcEnvironment + ": Unknown/Unsupported Genesys Cloud Embed Context";
            return;
        }

        // Create API instance
        const usersApi = new platformClient.UsersApi();
        const qualityApi = new platformClient.QualityApi();
        const conversationsApi = new platformClient.ConversationsApi();
        Vue.prototype.$usersApi = usersApi;
        Vue.prototype.$qualityApi = qualityApi;
        Vue.prototype.$conversationsApi = conversationsApi;

        let authenticated = false;
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
            })
            .then((profileData) => {
                // Process agent's profile data
                this.profileData = profileData;
                agentUserId = profileData.id;
                this.authenticated = true;

                // Get evaluations data
                const startTime = moment('1997-01-01').toISOString();
                const endTime = moment().toISOString();

                getEvaluations(qualityApi, startTime, endTime, agentUserId)
                    .then((data) => {
                        // Process evaluations data
                        const evaluations = data.entities;
                        evaluations.forEach((eval) => {
                            conversationsApi.getConversation(eval.conversation.id)
                                .then((conv) => {
                                    let newConv = conv;
                                    newConv.customer = conv.participants.find((part) => {
                                        return part.purpose === "customer";
                                    });
                                    this.conversationsData.conversations.push(newConv);
                                    this.conversationsData.conversations = _.uniqWith(this.conversationsData.conversations, _.isEqual);
                                    if (this.conversationsData.convEvalMap.has(conv.id)) {
                                        this.conversationsData.convEvalMap.get(conv.id).push(eval);
                                    } else {
                                        this.conversationsData.convEvalMap.set(conv.id, [eval]);
                                    }
                                })
                                .catch((err) => {
                                    console.log(`Error: ${err}`);
                                });
                        });
                    })
                    .catch((err) => {
                        console.log(`Error: ${err}`);
                    });

                conversationsApi.getConversations()
                    .then((data) => {
                        data.entities.forEach((conv) => {
                            let newConv = conv;
                            newConv.customer = conv.participants.find((part) => {
                                return part.purpose === "customer";
                            });
                            this.conversationsData.conversations.push(newConv);

                        });
                        this.conversationsData.conversations = _.uniqWith(this.conversationsData.conversations, _.isEqual);
                    })
                    .catch((err) => {
                        console.log(`Error: ${err}`);
                    });
            })
            .catch((err) => {
                console.log(err);
                this.errorMessage = !authenticated ? "Failed to Authenticate with Genesys Cloud" :
                                    "Failed to fetch/display profile";
            });
    },
});
