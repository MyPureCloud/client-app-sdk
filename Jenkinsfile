@Library("pipeline-library") _

node("dev_mesos_v2||dev_shared_v2") {
    build(job: "deploy-client-app-sdk-demos", parameters: [
        string(name: "SDK_JS_BRANCH", value: env.BRANCH_NAME),
        string(name: "SDK_EXAMPLES_BRANCH", value: env.BRANCH_NAME),
        string(name: "DEMO_APPS_VERSION", value: env.BRANCH_NAME == "master" ? "developmentV2" : env.BRANCH_NAME),
        string(name: "OAUTH_CLIENT", value: env.BRANCH_NAME == "master" ? "built-in" : "adhoc")
    ])
}