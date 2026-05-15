/**
 * sectionConfigs.js
 *
 * Defines which data-fetching keys to load for each sourceType,
 * and the order in which composite sections appear on screen.
 *
 * Keys on the outer object  → composite section keys (one card on screen)
 * Values (arrays)           → template keys that map to sectionMethods entries
 *
 * Add your own sourceType here following the same pattern.
 */
export const configSections = {

    /**
     * demo1 — Single isDynamic section
     * Shows account basic details as a collapsible field list.
     * Pass an Account Id as requestId.
     */
    demo1: {
        demo1BasicDetailsSection: ['demo1BasicDetails']
    },

    /**
     * demo2 — Composite: isDynamic + isMulti
     * Shows account summary fields alongside nested contact sub-sections.
     * Pass an Account Id as requestId.
     */
    demo2: {
        demo2AccountSection: ['demo2BasicDetails', 'demo2Contacts']
    },

    /**
     * demo3 — isTable
     * Shows related contacts as a data table with columns.
     * Pass an Account Id as requestId.
     */
    demo3: {
        demo3ContactsTableSection: ['demo3ContactsTable']
    },

    /**
     * demo4 — isDocuments
     * Shows files attached to the Account as downloadable links.
     * Pass an Account Id as requestId.
     */
    demo4: {
        demo4DocumentsSection: ['demo4Documents']
    }
};