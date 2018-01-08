/**
 * SDK to work with PureCloud Client Apps
 *
 * {@link https://developer.mypurecloud.com/api/client-apps/index.html}
 *
 * @module pcClientAppSdk
 * @author Genesys Telecommunications Laboratories, Inc.
 * @copyright Copyright (C) 2018 Genesys Telecommunications Laboratories, Inc.
 * @license MIT
 * @since 1.0.0
 */

import queryString from 'query-string';
import {name as pkgName, version as pkgVersion} from '../package.json';
import envUtils from './utils/env';
import AlertingApi from './modules/alerting';
import LifecycleApi from './modules/lifecycle';
import CoreUiApi from './modules/ui';
import UsersApi from './modules/users';

/**
 * Provides bi-directional communication and integration between this instance of a PureCloud Client Application
 * and the PureCloud host application
 */
class ClientApp {
    /**
     * Constructs an instance of a PureCloud Client Application to communicate with purecloud
     *
     * @param {object} cfg - Runtime config of the client
     * @param {string} cfg.pcEnvironmentQueryParam - Name of a query param to auto parse into the pcEnvironment; Must be valid and a single param.  Best Practice.
     * @param {string} cfg.pcEnvironment - The PC top-level domain (e.g. mypurecloud.com, mypurecloud.au); Must be a valid PC Env tld; Prefered over pcOrigin.
     * @param {string} cfg.pcOrigin - The full origin (protocol, host, port) of the PureCloud host environment (e.g. https://apps.mypurecloud.com).  Prefer using pcEnvironment[QueryParam] over this property.
     *
     * @example
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     */
    constructor(cfg) {
        /**
         * The private reference to the known PC environment which is set, inferred, or defaulted by the config provided to the instance.
         *
         * @private
         */
        this._pcEnv = null;

        /**
         * The private reference to the custom origin, if provided.
         *
         * @private
         */
        this._customPcOrigin = null;

        if (cfg) {
            if (cfg.hasOwnProperty('pcEnvironmentQueryParam')) {
                let paramName = cfg.pcEnvironmentQueryParam;

                if (typeof paramName !== 'string' || paramName.trim().length === 0) {
                    throw new Error('Invalid query param name provided.  Must be non-null, non-empty string');
                }

                let parsedQueryString = queryString.parse(ClientApp._getQueryString());
                if (parsedQueryString[paramName] && typeof parsedQueryString[paramName] === 'string') {
                    let paramValue = parsedQueryString[paramName];

                    this._pcEnv = envUtils.lookupPcEnv(paramValue, true);
                    if (!this._pcEnv) {
                        throw new Error(`Could not parse '${paramValue}' into a known PureCloud environment`);
                    }
                } else {
                    throw new Error(`Could not find unique value for ${paramName} parameter on Query String`);
                }
            } else if (cfg.hasOwnProperty('pcEnvironment')) {
                this._pcEnv = envUtils.lookupPcEnv(cfg.pcEnvironment, true);
                if (!this._pcEnv) {
                    throw new Error(`Could not parse '${cfg.pcEnvironment}' into a known PureCloud environment`);
                }
            } else if (cfg.hasOwnProperty('pcOrigin')) {
                if (typeof cfg.pcOrigin !== 'string' || cfg.pcOrigin.trim().length === 0) {
                    throw new Error('Invalid pcOrigin provided.  Must be a non-null, non-empty string');
                }

                this._customPcOrigin = cfg.pcOrigin;
            }
        }

        if (!this._pcEnv && !this._customPcOrigin) {
            // Use the default PC environment
            this._pcEnv = envUtils.DEFAULT_PC_ENV;
        }

        let apiCfg = {
            targetPcOrigin: (this._pcEnv ? this._pcEnv.pcAppOrigin : this._customPcOrigin)
        };

        /**
         * The AlertingApi instance.
         *
         * @type {module:modules/alerting~AlertingApi}
         *
         * @example
         * let clientApp = new ClientApp({
         *   pcEnvironmentQueryParam: 'pcEnvironment'
         * });
         *
         * clientApp.alerting.someMethod(...);
         */
        this.alerting = new AlertingApi(apiCfg);

        /**
         * The LifecycleApi instance.
         *
         * @type {module:modules/lifecycle~LifecycleApi}
         *
         * @example
         * let clientApp = new ClientApp({
         *   pcEnvironmentQueryParam: 'pcEnvironment'
         * });
         *
         * clientApp.lifecycle.someMethod(...);
         */
        this.lifecycle = new LifecycleApi(apiCfg);

        /**
         * The CoreUIApi instance.
         *
         * @type {module:modules/core-ui~CoreUiApi}
         *
         * @example
         * let clientApp = new ClientApp({
         *   pcEnvironmentQueryParam: 'pcEnvironment'
         * });
         *
         * clientApp.coreUi.someMethod(...);
         */
        this.coreUi = new CoreUiApi(apiCfg);

        /**
         * The UsersApi instance.
         *
         * @type {module:modules/users~UsersApi}
         *
         * @example
         * let clientApp = new ClientApp({
         *   pcEnvironmentQueryParam: 'pcEnvironment'
         * });
         *
         * clientApp.users.someMethod(...);
         */
        this.users = new UsersApi(apiCfg);
    }

    /**
     * Returns the pcEnvironment (e.g. mypurecloud.com, mypurecloud.jp) if known; null otherwise.
     * This value will be available if a valid PureCloud Environment is provided, inferred, or
     * defaulted from the config passed to this instance.
     *
     * @returns {string} the valid PureCloud environment; null if unknown.
     *
     * @since 1.0.0
     */
    get pcEnvironment() {
        return (this._pcEnv ? this._pcEnv.pcEnvTld : null);
    }

    /**
     * Displays the version of the PureClound Client App SDK.
     *
     * @returns {string} The version of the PureCloud Client App SDK
     *
     * @example
     * ClientApp.version
     *
     * @since 1.0.0
     */
    static get version() {
        return pkgVersion;
    }

    /**
     * Displays information about this version of the PureClound Client App SDK.
     *
     * @returns A string of information describing this library
     *
     * @example
     * ClientApp.about(); // SDK details returned as a string
     *
     * @since 1.0.0
     */
    static about() {
        return `${pkgName}v${pkgVersion}`;
    }

    /**
     * A private utility method exported for mocking and testing
     *
     * @private
     */
    static _getQueryString() {
        return ((window && window.location) ? window.location.search : null);
    }
}

export default ClientApp;
