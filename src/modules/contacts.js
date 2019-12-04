/**
 * Utilities for interacting with PureCloud conversations
 *
 * @module modules/contacts
 *
 * @since 1.4.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with PureCloud conversations
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.4.0
 */
class ContactsApi extends BaseApi {
    /**
     * Show a contact by ID.
     *
     * Required Permissions:
     * * ANY Of
     *     * externalContacts:contact:view
     *
     * @example
     * myClientApp.contacts.showExternalContactProfile('bf2ef59d-9bc5-4436-8738-77c94869c81c');
     *
     * @since 1.4.0
     */
    showExternalContactProfile(contactId) {
        super.sendMsgToPc('showExternalContactProfile', {contactId: contactId});
    }
    /**
     * Show a organization by ID.
     *
     * Required Permissions:
     * * ANY Of
     *     * externalContacts:externalOrganization:view
     *
     * @example
     * myClientApp.contacts.showExternalOrganizationProfile('bf2ef57F-9bc5-4436-8738-77c94869c81c');
     *
     * @since 1.4.0
     */
    showExternalOrganizationProfile(orgId) {
        super.sendMsgToPc('showExternalOrganizationProfile', {orgId: orgId});
    }
}

export default ContactsApi;
