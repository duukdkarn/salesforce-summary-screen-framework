/**
 * summaryScreenDemo.js
 *
 * Demo version of the Summary Screen framework host component.
 * Uses standard Account and Contact objects — deploys to any Salesforce org.
 *
 * Usage:
 *   <c-summary-screen-demo request-id="<AccountId>" source-type="demo1" />
 *
 * sourceType options: demo1 | demo2 | demo3 | demo4
 *
 * See README.md for full documentation.
 */
import { LightningElement, api, track } from 'lwc';

import getDemo1BasicDetails  from '@salesforce/apex/SummaryScreenControllerDemo.getDemo1BasicDetails';
import getDemo2BasicDetails  from '@salesforce/apex/SummaryScreenControllerDemo.getDemo2BasicDetails';
import getDemo2Contacts      from '@salesforce/apex/SummaryScreenControllerDemo.getDemo2Contacts';
import getDemo3ContactsTable from '@salesforce/apex/SummaryScreenControllerDemo.getDemo3ContactsTable';
import getDemo4Documents     from '@salesforce/apex/SummaryScreenControllerDemo.getDemo4Documents';

import { configSections } from './config/sectionConfigs';
import { sectionHandlers } from './config/sectionHandlers';
import { SECTION_BUILDERS } from './config/sectionBuilders';

// ── Section method registry ──────────────────────────────────────────────────
// Maps each template key to its Apex method (and optional param override).
const sectionMethods = {
    demo1BasicDetails:  { fn: getDemo1BasicDetails  },
    demo2BasicDetails:  { fn: getDemo2BasicDetails  },
    demo2Contacts:      { fn: getDemo2Contacts      },
    demo3ContactsTable: { fn: getDemo3ContactsTable },
    demo4Documents:     { fn: getDemo4Documents     }
};

// ── Composite sections that split into individual top-level cards ────────────
// Add a key here with value 'multiComposite' if you want each sub-section
// to render as its own card rather than nested inside one card.
const MULTI_SECTION_CONFIGS = {};

export default class SummaryScreenDemo extends LightningElement {

    // ── Public API ───────────────────────────────────────────────────────────
    @api requestId;       // Account Id to load data for
    @api sourceType;      // One of: demo1 | demo2 | demo3 | demo4
    @api showOBRName  = false;
    @api hideDescription = false;

    // ── Internal state ───────────────────────────────────────────────────────
    @track loading        = false;
    @track orderedSections = [];
    @track activeSections  = {};

    // ── Demo 1 state ─────────────────────────────────────────────────────────
    @track demo1BasicDetailsSection = null;

    // ── Demo 2 state ─────────────────────────────────────────────────────────
    @track demo2BasicDetailsSection = null;
    @track demo2ContactsSections    = [];

    // ── Demo 3 state ─────────────────────────────────────────────────────────
    @track demo3TableColumns = [];
    @track demo3TableData    = [];
    @track demo3TableTitle   = '';

    // ── Demo 4 state ─────────────────────────────────────────────────────────
    @track demo4DocumentsSection = null;

    // ── Lifecycle ────────────────────────────────────────────────────────────
    async connectedCallback() {
        const key = (this.sourceType || '').toLowerCase();
        this.activeSections = configSections[key] || {};
        await this.loadAllConfiguredSections();
    }

    // ── Data loading ─────────────────────────────────────────────────────────
    async loadAllConfiguredSections() {
        this.loading = true;
        try {
            const promises = Object.keys(this.activeSections).flatMap(sectionKey =>
                this.activeSections[sectionKey].map(templateKey =>
                    this.loadSingleSection(templateKey)
                )
            );
            await Promise.all(promises);
        } finally {
            this.loading = false;
            this.orderedSections = this.buildOrderedSections();
        }
    }

    async loadSingleSection(sectionKey) {
        const def = sectionMethods[sectionKey];
        if (!def) return;

        const args = { [def.param || 'onboardingId']: this.requestId };

        try {
            const result = await def.fn(args);
            sectionHandlers[sectionKey]?.(this, result);
            this.orderedSections = this.buildOrderedSections();
        } catch (err) {
            console.error(`Error loading ${sectionKey}:`, err);
        }
    }

    // ── Section building ─────────────────────────────────────────────────────
    buildOrderedSections() {
        const out = [];
        Object.keys(this.activeSections).forEach(sectionKey => {
            const templates   = this.activeSections[sectionKey];
            const sectionType = MULTI_SECTION_CONFIGS[sectionKey];
            if (sectionType === 'multiComposite') {
                this.buildMultiCompositeSection(templates, out);
            } else {
                this.buildCompositeSection(sectionKey, templates, out);
            }
        });
        return out;
    }

    buildCompositeSection(compositeKey, subSections, out) {
        const allComponents = subSections
            .map(subKey => this.getComponentsForSection(subKey))
            .flat();
        if (allComponents.length === 0) return;
        const title = allComponents[0]?.title || compositeKey;
        out.push({ isComposite: true, key: compositeKey, title, components: allComponents });
    }

    buildMultiCompositeSection(subSections, out) {
        subSections
            .map(subKey => this.getComponentsForSection(subKey))
            .flat()
            .forEach(component => {
                out.push({
                    isComposite: true,
                    key:         component.key,
                    title:       component.title,
                    components:  [component]
                });
            });
    }

    getComponentsForSection(sectionKey) {
        const builder = SECTION_BUILDERS[sectionKey];
        return builder ? builder(this) : [];
    }

    // ── Section removal ──────────────────────────────────────────────────────
    removeSectionIfEmpty(sectionKey, dataList) {
        if (!Array.isArray(dataList) || dataList.length === 0) {
            const sections = this.activeSections;
            Object.keys(sections).forEach(compositeKey => {
                const filtered = sections[compositeKey].filter(k => k !== sectionKey);
                if (filtered.length > 0) {
                    sections[compositeKey] = filtered;
                } else {
                    delete sections[compositeKey];
                }
            });
        }
    }

    // ── Field processing helpers ─────────────────────────────────────────────
    processFieldsFromList(list) {
        return [...list]
            .sort((a, b) => a.fieldOrder - b.fieldOrder)
            .map((f, i, arr) => ({
                label:      f.label,
                value:      f.value ?? '--',
                fieldOrder: f.fieldOrder,
                hrRequired: i !== arr.length - 1
            }));
    }

    formatContactSections(contactSections) {
        if (!Array.isArray(contactSections)) return [];
        return contactSections.map((section, idx) => ({
            id:               `${section.sectionTitle}-${idx}`,
            icon:             'utility:chevronright',
            isSectionVisible: false,
            sectionTitle:     section.sectionTitle,
            fields:           section.fieldsList.map((f, i, arr) => ({
                ...f,
                hrRequired: i !== arr.length - 1
            }))
        }));
    }
}