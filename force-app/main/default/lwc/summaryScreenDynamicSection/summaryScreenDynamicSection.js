import { LightningElement, api } from 'lwc';

export default class SummaryScreenDynamicSection extends LightningElement {
  @api title;
  @api headerClass = '';
  @api headerColor = '';
  @api renderAsBadge = false;
  
  // ADD: bare mode property
  _bare = false;
  @api
  get bare() { return this._bare; }
  set bare(v) { 
    this._bare = v === '' || v === true || v === 'true';
  }
  
  @api
  set fields(value = []) { this._fields = Array.isArray(value) ? [...value] : []; }
  get fields() { return this._fields; }
  _fields = [];
  
  expanded = false;
  
  get chevronIcon() { return this.expanded ? 'utility:chevrondown' : 'utility:chevronright'; }
  
  toggleExpanded() {
    if (this._bare) return; // Don't toggle in bare mode
    this.expanded = !this.expanded;
  }
  
  // ADD: computed properties for bare mode
  get showHeader() { return !this._bare; }
  get showBody() { return this._bare || this.expanded; }
  
  renderedCallback() {
    const token = (this.headerColor || '').trim();
    const host  = this.template.host;
    if (token) { host.style.setProperty('--headerColor', `var(${token})`); }
    else       { host.style.removeProperty('--headerColor'); }
    
    // ADD: bare mode styling
    if (this._bare) {
      host.classList.add('isBare');
    } else {
      host.classList.remove('isBare');
    }
  }
  
  get computedTitleClass() {
    const base = 'collapseTitle';
    return this.headerClass ? `${base} ${this.headerClass}` : `${base} slds-text-heading_small`;
  }

  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleExpanded();
    }
  }
}