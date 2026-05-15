/**
 * sectionHandlers.js
 *
 * Maps each template key to a handler function that wires the Apex result
 * into @track state on the host component, then removes the section if empty.
 *
 * Handler signature: (cmp, result) => void
 *   cmp    — the summaryScreenDemo LWC instance (this)
 *   result — the Map<String,Object> returned by the Apex method
 */
export const sectionHandlers = {

    // ── Demo 1: isDynamic ────────────────────────────────────────────────────
    demo1BasicDetails: (cmp, result) => {
        cmp.demo1BasicDetailsSection = {
            sectionTitle: result?.sectionTitle || '',
            fields: result?.fieldsList?.length
                ? cmp.processFieldsFromList(result.fieldsList)
                : []
        };
        cmp.removeSectionIfEmpty('demo1BasicDetails', result?.fieldsList);
    },

    // ── Demo 2: isDynamic ────────────────────────────────────────────────────
    demo2BasicDetails: (cmp, result) => {
        cmp.demo2BasicDetailsSection = {
            sectionTitle: result?.sectionTitle || '',
            fields: result?.fieldsList?.length
                ? cmp.processFieldsFromList(result.fieldsList)
                : []
        };
        cmp.removeSectionIfEmpty('demo2BasicDetails', result?.fieldsList);
    },

    // ── Demo 2: isMulti ──────────────────────────────────────────────────────
    demo2Contacts: (cmp, result) => {
        cmp.demo2ContactsSections = Array.isArray(result?.records)
            ? result.records.map((rec, idx) => ({
                id:               `demo2-contact-${idx}`,
                sectionTitle:     rec.sectionTitle,
                icon:             'utility:chevronright',
                isSectionVisible: false,
                fields:           cmp.processFieldsFromList(rec.fieldsList)
            }))
            : [];
        cmp.removeSectionIfEmpty('demo2Contacts', cmp.demo2ContactsSections);
    },

    // ── Demo 3: isTable ──────────────────────────────────────────────────────
    demo3ContactsTable: (cmp, result) => {
        const recs = Array.isArray(result?.records) ? result.records : [];
        const cols = Array.isArray(result?.columns) ? result.columns : [];
        cmp.demo3TableColumns = cols;
        cmp.demo3TableData    = recs;
        cmp.demo3TableTitle   = result?.sectionTitle || 'Contact directory';
        cmp.removeSectionIfEmpty('demo3ContactsTable', recs);
    },

    // ── Demo 4: isDocuments ──────────────────────────────────────────────────
    demo4Documents: (cmp, result) => {
        cmp.demo4DocumentsSection = {
            sectionTitle: result?.sectionTitle || 'Account documents',
            fields:       [],
            documents:    result?.documents || []
        };
        const nonEmpty = cmp.demo4DocumentsSection.documents.length ? [1] : [];
        cmp.removeSectionIfEmpty('demo4Documents', nonEmpty);
    }
};