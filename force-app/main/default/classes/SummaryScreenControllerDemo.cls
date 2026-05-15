/**
 * SummaryScreenControllerDemo
 *
 * Demo Apex controller for the Summary Screen LWC framework.
 * Uses standard Account and Contact objects so it deploys to any Salesforce org
 * with zero configuration.
 *
 * Four demo sourceTypes are provided, one per section rendering pattern:
 *   demo1  — isDynamic  : a single collapsible field-list section
 *   demo2  — composite  : dynamic + multi (nested collapsible sub-sections)
 *   demo3  — isTable    : a data table section
 *   demo4  — isDocuments: a document download section
 *
 * Pass an Account Id as the requestId property on the summaryScreenDemo component.
 */
public with sharing class SummaryScreenControllerDemo {

    // ─── Shared helper: build one ordered field entry ────────────────────────
    private static Map<String, Object> field(String label, Object value, Integer order) {
        return new Map<String, Object>{
            'label'      => label,
            'value'      => value != null ? String.valueOf(value) : '--',
            'fieldOrder' => order
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEMO 1 — isDynamic: Basic account details
    // Demonstrates the simplest pattern: one collapsible section with a list
    // of label/value field pairs.
    // ════════════════════════════════════════════════════════════════════════
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getDemo1BasicDetails(String onboardingId) {
        Map<String, Object> result = new Map<String, Object>();
        if (String.isBlank(onboardingId)) return result;

        try {
            Account acc = [
                SELECT Name, Industry, Type, Phone, Website,
                       BillingCity, BillingState, BillingCountry, NumberOfEmployees
                FROM Account
                WHERE Id = :onboardingId
                LIMIT 1
            ];

            List<Map<String, Object>> fieldsList = new List<Map<String, Object>>{
                field('Account name',        acc.Name,               1),
                field('Industry',            acc.Industry,           2),
                field('Account type',        acc.Type,               3),
                field('Phone',               acc.Phone,              4),
                field('Website',             acc.Website,            5),
                field('City',                acc.BillingCity,        6),
                field('State',               acc.BillingState,       7),
                field('Country',             acc.BillingCountry,     8),
                field('Number of employees', acc.NumberOfEmployees,  9)
            };

            result.put('sectionTitle', 'Account details');
            result.put('fieldsList', fieldsList);

        } catch (Exception e) {
            System.debug(System.LoggingLevel.ERROR, 'getDemo1BasicDetails - ' + e.getMessage());
        }

        return result;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEMO 2 — Composite: dynamic + multi
    // Demonstrates combining an isDynamic section (account summary) with an
    // isMulti section (one collapsible sub-section per related Contact).
    // ════════════════════════════════════════════════════════════════════════
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getDemo2BasicDetails(String onboardingId) {
        Map<String, Object> result = new Map<String, Object>();
        if (String.isBlank(onboardingId)) return result;

        try {
            Account acc = [
                SELECT Name, Type, Industry, AnnualRevenue, Description
                FROM Account
                WHERE Id = :onboardingId
                LIMIT 1
            ];

            List<Map<String, Object>> fieldsList = new List<Map<String, Object>>{
                field('Account name',   acc.Name,          1),
                field('Type',           acc.Type,          2),
                field('Industry',       acc.Industry,      3),
                field('Annual revenue', acc.AnnualRevenue, 4),
                field('Description',    acc.Description,   5)
            };

            result.put('sectionTitle', 'Account summary');
            result.put('fieldsList', fieldsList);

        } catch (Exception e) {
            System.debug(System.LoggingLevel.ERROR, 'getDemo2BasicDetails - ' + e.getMessage());
        }

        return result;
    }

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getDemo2Contacts(String onboardingId) {
        Map<String, Object> result = new Map<String, Object>();
        if (String.isBlank(onboardingId)) return result;

        try {
            List<Contact> contacts = [
                SELECT FirstName, LastName, Title, Email, Phone, Department
                FROM Contact
                WHERE AccountId = :onboardingId
                ORDER BY LastName ASC
                LIMIT 10
            ];

            if (contacts.isEmpty()) return result;

            List<Map<String, Object>> sections = new List<Map<String, Object>>();
            for (Contact c : contacts) {
                sections.add(new Map<String, Object>{
                    'sectionTitle' => c.FirstName + ' ' + c.LastName,
                    'fieldsList'   => new List<Map<String, Object>>{
                        field('Name',       c.FirstName + ' ' + c.LastName, 1),
                        field('Title',      c.Title,                         2),
                        field('Department', c.Department,                    3),
                        field('Email',      c.Email,                         4),
                        field('Phone',      c.Phone,                         5)
                    }
                });
            }

            result.put('sectionTitle', 'Related contacts');
            result.put('records', sections);

        } catch (Exception e) {
            System.debug(System.LoggingLevel.ERROR, 'getDemo2Contacts - ' + e.getMessage());
        }

        return result;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEMO 3 — isTable: Contact list as a data table
    // Demonstrates the table rendering pattern with defined columns and rows.
    // ════════════════════════════════════════════════════════════════════════
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getDemo3ContactsTable(String onboardingId) {
        Map<String, Object> result = new Map<String, Object>();
        if (String.isBlank(onboardingId)) return result;

        try {
            List<Contact> contacts = [
                SELECT FirstName, LastName, Title, Email, Phone
                FROM Contact
                WHERE AccountId = :onboardingId
                ORDER BY LastName ASC
                LIMIT 20
            ];

            if (contacts.isEmpty()) return result;

            List<Map<String, Object>> columns = new List<Map<String, Object>>{
                new Map<String, Object>{ 'label' => 'Name',  'fieldName' => 'Name'  },
                new Map<String, Object>{ 'label' => 'Title', 'fieldName' => 'Title' },
                new Map<String, Object>{ 'label' => 'Email', 'fieldName' => 'Email' },
                new Map<String, Object>{ 'label' => 'Phone', 'fieldName' => 'Phone' }
            };

            List<Map<String, Object>> rows = new List<Map<String, Object>>();
            Integer idx = 0;
            for (Contact c : contacts) {
                rows.add(new Map<String, Object>{
                    'id'    => 'row-' + idx++,
                    'Name'  => c.FirstName + ' ' + c.LastName,
                    'Title' => c.Title  != null ? c.Title  : '--',
                    'Email' => c.Email  != null ? c.Email  : '--',
                    'Phone' => c.Phone  != null ? c.Phone  : '--'
                });
            }

            result.put('sectionTitle', 'Contact directory');
            result.put('columns', columns);
            result.put('records', rows);

        } catch (Exception e) {
            System.debug(System.LoggingLevel.ERROR, 'getDemo3ContactsTable - ' + e.getMessage());
        }

        return result;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEMO 4 — isDocuments: Files attached to the Account
    // Demonstrates the documents rendering pattern with downloadable file links.
    // ════════════════════════════════════════════════════════════════════════
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getDemo4Documents(String onboardingId) {
        Map<String, Object> result = new Map<String, Object>();
        if (String.isBlank(onboardingId)) return result;

        try {
            List<ContentDocumentLink> links = [
                SELECT
                    ContentDocument.Title,
                    ContentDocument.FileExtension,
                    ContentDocument.LatestPublishedVersionId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :onboardingId
                ORDER BY Id DESC
                LIMIT 20
            ];

            if (links.isEmpty()) return result;

            List<Map<String, Object>> documents = new List<Map<String, Object>>();
            for (ContentDocumentLink link : links) {
                documents.add(new Map<String, Object>{
                    'title'     => link.ContentDocument.Title,
                    'extension' => link.ContentDocument.FileExtension,
                    'versionId' => link.ContentDocument.LatestPublishedVersionId
                });
            }

            result.put('sectionTitle', 'Account documents');
            result.put('fieldsList', new List<Object>());
            result.put('documents', documents);

        } catch (Exception e) {
            System.debug(System.LoggingLevel.ERROR, 'getDemo4Documents - ' + e.getMessage());
        }

        return result;
    }
}