import { LightningElement, api } from 'lwc';

export default class SummaryField extends LightningElement {
    @api label;
    @api value;
    @api hrRequired = false;
    @api renderAsBadge = false;

    get isBadge()       { return this.renderAsBadge; }
    get badgeClass()    { return this.value === 'ENABLED' ? 'slds-badge badgeEnabled' : 'slds-badge badgeDisabled'; }
    get iconName() { return this.isBadge && this.value === 'ENABLED' ? 'utility:success': ''; }
}