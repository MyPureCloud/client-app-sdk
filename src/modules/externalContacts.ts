/**
 * Utilities for interacting with External Contacts
 *
 * @since 1.4.0
 */

import { BaseApi } from './base';

/**
 * Utilities for interacting with External Contacts
 *
 * @noInheritDoc
 * @since 1.4.0
 */
export class ExternalContactsApi extends BaseApi {
    /**
     * Show an external contact by ID.
     *
     * Required Permissions:
     * * ANY Of
     *     * externalContacts:contact:view
     *
     * ```ts
     * myClientApp.externalContacts.showExternalContactProfile('b33491ce-0a84-4959-9273-848901d6db11');
     * ```
     *
     * @since 1.4.0
     */
    showExternalContactProfile(externalContactId: string) {
        super.sendMsgToPc('showExternalContactProfile', {contactId: externalContactId});
    }
    /**
     * Show an external organization by ID.
     *
     * Required Permissions:
     * * ANY Of
     *     * externalContacts:externalOrganization:view
     *
     * ```ts
     * myClientApp.externalContacts.showExternalOrganizationProfile('8a0db7c8-c4a3-4577-b41e-aa40a6408f1c');
     * ```
     *
     * @since 1.4.0
     */
    showExternalOrganizationProfile(externalOrganizationId: string) {
        super.sendMsgToPc('showExternalOrganizationProfile', {externalOrganizationId: externalOrganizationId});
    }
}
