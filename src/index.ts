/**
 * SDK to work with Genesys Cloud Client Apps
 *
 * {@link https://developer.mypurecloud.com/api/client-apps/index.html}
 *
 * @author Genesys Telecommunications Laboratories, Inc.
 * @copyright Copyright (C) 2018 Genesys Telecommunications Laboratories, Inc.
 * @license MIT
 * @since 1.0.0
 */

import type { Environment } from 'genesys-cloud-service-discovery-web';
import * as queryString from 'query-string';
import { lookupPcEnv, lookupGcEnv, PcEnv, DEFAULT_PC_ENV } from './utils/env';
import AlertingApi from './modules/alerting';
import LifecycleApi from './modules/lifecycle';
import CoreUiApi from './modules/ui';
import UsersApi from './modules/users';
import DirectoryApi from './modules/directory';
import ConversationsApi from './modules/conversations';
import MyConversationsApi from './modules/myConversations';
import ExternalContactsApi from './modules/externalContacts';

/**
 * Provides bi-directional communication and integration between this instance of a Genesys Cloud Client Application
 * and the Genesys Cloud host application
 */
class ClientApp {
    /**
     * The private reference to the known PC environment which is set, inferred, or defaulted by the config provided to the instance.
     */
    private _pcEnv: PcEnv | null = null;

    /**
     * The private reference to the custom origin, if provided.
     */
    private _customPcOrigin: string | null = null;

    /**
     * The AlertingApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.alerting.someMethod(...);
     * ```
     */
    alerting: AlertingApi;

    /**
     * The LifecycleApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.lifecycle.someMethod(...);
     * ```
     */
    lifecycle: LifecycleApi;

    /**
     * The CoreUIApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.coreUi.someMethod(...);
     * ```
     */
    coreUi: CoreUiApi;

    /**
     * The UsersApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.users.someMethod(...);
     * ```
     *
     * @deprecated Use {@link directory} property instead. (Since 2.3.0)
     */
    users: UsersApi;

    /**
     * The DirectoryApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.directory.someMethod(...);
     * ```
     * @since 2.3.0
     */
    directory: DirectoryApi;

    /**
     * The ConversationsApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.conversations.someMethod(...);
     * ```
     */
    conversations: ConversationsApi;

    /**
     * The MyConversationsApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.myConversations.someMethod(...);
     * ```
     *
     * @since 1.3.0
     */
    myConversations: MyConversationsApi;

    /**
     * The External Contacts instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     *
     * clientApp.externalContacts.someMethod(...);
     * ```
     *
     * @since 1.4.0
     */
    externalContacts: ExternalContactsApi;

    /**
     * Constructs an instance of a Genesys Cloud Client Application to communicate with Genesys Cloud
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   gcHostOriginQueryParam: 'gcHostOrigin',
     *   gcTargetEnvQueryParam: 'gcTargetEnv'
     * });
     * ```
     *
     * @param cfg - Runtime config of the client
     */
    constructor(cfg: {
        /** Name of a query param to auto parse into the pcEnvironment; Must be valid and a single param. */
        pcEnvironmentQueryParam?: string;
        /** The PC top-level domain (e.g. mypurecloud.com, mypurecloud.au); Must be a valid PC Env tld; Preferred over pcOrigin. */
        pcEnvironment?: string;
        /** The full origin (protocol, host, port) of the Genesys Cloud host environment (e.g. https://apps.mypurecloud.com).  Prefer using pcEnvironment[QueryParam] over this property. */
        pcOrigin?: string;
        /**
         * Name of a query param to auto parse into the gcHostOrigin.
         * Must be valid and used with gcTargetEnvQueryParam.
         * Best Practice.
         */
        gcHostOriginQueryParam?: string;
        /**
         * Name of a query param to auto parse into the gcTargetEnv.
         * Must be valid and used with gcHostOriginQueryParam.
         * Best Practice.
         */
        gcTargetEnvQueryParam?: string;
        /**
         * The GC host origin (e.g. https://apps.mypurecloud.com, https://apps.mypurecloud.au).
         * Must be a valid origin and used with gcTargetEnv.
         */
        gcHostOrigin?: string;
        /**
         * The GC env target (e.g. prod, prod-euw2).
         * Must be a valid environment name and used with gcHostOrigin.
         */
        gcTargetEnv?: string;
    } = {}) {
        if (cfg) {
            const parsedQueryString = queryString.parse(ClientApp._getQueryString() || '');
            if ('gcHostOriginQueryParam' in cfg || 'gcTargetEnvQueryParam' in cfg) {
                this.assertNonEmptyString(cfg.gcHostOriginQueryParam, 'host origin query param name');
                this.assertNonEmptyString(cfg.gcTargetEnvQueryParam, 'target env query param name');
                const parsedGcHostOrigin = parsedQueryString[cfg.gcHostOriginQueryParam];
                const parsedGcTargetEnv = parsedQueryString[cfg.gcTargetEnvQueryParam];
                this.assertNonEmptyString(parsedGcHostOrigin, 'host origin parsed query param');
                this.assertNonEmptyString(parsedGcTargetEnv, 'target env parsed query param');
                this._pcEnv = this.lookupGcEnv(parsedGcHostOrigin, parsedGcTargetEnv);
            } else if ('gcHostOrigin' in cfg || 'gcTargetEnv' in cfg) {
                this.assertNonEmptyString(cfg.gcHostOrigin, 'gcHostOrigin');
                this.assertNonEmptyString(cfg.gcTargetEnv, 'gcTargetEnv');
                this._pcEnv = this.lookupGcEnv(cfg.gcHostOrigin, cfg.gcTargetEnv);
            } else if ('pcEnvironmentQueryParam' in cfg) {
                const paramName = cfg.pcEnvironmentQueryParam;
                this.assertNonEmptyString(paramName, 'query param name');
                const paramValue = parsedQueryString[paramName];
                this.assertNonEmptyString(paramValue, `value for query param '${paramName}'`);
                this._pcEnv = this.lookupEnv(paramValue);
            } else if ('pcEnvironment' in cfg) {
                this.assertNonEmptyString(cfg.pcEnvironment, 'pcEnvironment');
                this._pcEnv = this.lookupEnv(cfg.pcEnvironment);
            } else if ('pcOrigin' in cfg) {
                this.assertNonEmptyString(cfg.pcOrigin, 'pcOrigin');
                this._customPcOrigin = cfg.pcOrigin;
            }
        }

        if (!this._pcEnv && !this._customPcOrigin) {
            // Use the default PC environment
            this._pcEnv = DEFAULT_PC_ENV;
        }

        const apiCfg = {
            targetPcOrigin: (this._pcEnv ? this._pcEnv.pcAppOrigin : this._customPcOrigin)
        };

        this.alerting = new AlertingApi(apiCfg);
        this.lifecycle = new LifecycleApi(apiCfg);
        this.coreUi = new CoreUiApi(apiCfg);
        this.users = new UsersApi(apiCfg);
        this.directory = new DirectoryApi(apiCfg);
        this.conversations = new ConversationsApi(apiCfg);
        this.myConversations = new MyConversationsApi(apiCfg);
        this.externalContacts = new ExternalContactsApi(apiCfg);
    }

    private assertNonEmptyString(value: unknown, name: string): asserts value is string {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`Invalid ${name} provided.  Must be a non-null, non-empty string`);
        }
    }

    protected lookupEnv(env: string, envTlds?: string[], hostAppDevOrigin?: string) {
        const pcEnv = lookupPcEnv(env, true, envTlds, hostAppDevOrigin);
        if (!pcEnv) throw new Error(`Could not parse '${env}' into a known PureCloud environment`);
        return pcEnv;
    }
    protected lookupGcEnv(hostOrigin: string, targetEnv: string, envs?: Environment[]) {
        const pcEnv = lookupGcEnv(hostOrigin, targetEnv, envs);
        if (!pcEnv) throw new Error(`Could not parse ${hostOrigin} (${targetEnv}) into a known GenesysCloud environment`);
        return pcEnv;
    }

    /**
     * Returns the pcEnvironment (e.g. mypurecloud.com, mypurecloud.jp) if known; null otherwise.
     * This value will be available if a valid Genesys Cloud Environment is provided, inferred, or
     * defaulted from the config passed to this instance.
     *
     * @returns the valid Genesys Cloud environment; null if unknown.
     *
     * @since 1.0.0
     */
    get pcEnvironment() {
        return this.gcEnvironment;
    }
    /**
     * Returns the gcEnvironment (e.g. mypurecloud.com, mypurecloud.jp) if known; null otherwise.
     * This value will be available if a valid Genesys Cloud Environment is provided, inferred, or
     * defaulted from the config passed to this instance.
     *
     * @returns the valid Genesys Cloud environment; null if unknown.
     *
     * @since 2.6.3
     */
    get gcEnvironment() {
        return (this._pcEnv ? this._pcEnv.pcEnvTld : null);
    }

    /**
     * Displays the version of the PureClound Client App SDK.
     *
     * ```ts
     * ClientApp.version
     * ```
     *
     * @returns The version of the Genesys Cloud Client App SDK
     *
     * @since 1.0.0
     */
    static get version() {
        return __PACKAGE_VERSION__;
    }

    /**
     * Displays information about this version of the PureClound Client App SDK.
     *
     * ```ts
     * ClientApp.about(); // SDK details returned as a string
     * ```
     *
     * @returns A string of information describing this library
     *
     * @since 1.0.0
     */
    static about() {
        return `${__PACKAGE_NAME__}v${__PACKAGE_VERSION__}`;
    }

    /**
     * A private utility method
     *
     * @ignore
     */
    static _getQueryString() {
        return ((window && window.location) ? window.location.search : null);
    }
}

export default ClientApp;
