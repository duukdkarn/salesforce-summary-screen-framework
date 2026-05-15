import { LightningElement, api, track } from 'lwc';

export default class SummaryScreenMultiSection extends LightningElement {
    @api sectionTitle;
    @track localSections = [];
    @track isVisible = false;
    @api subHeaderClass = 'slds-text-heading_small';

    get showHeader() { return !this._bare; }
    get showBody() { return this._bare || this.isVisible; }
    get subSectionTitleClass() { const sizeClass = this.subHeaderClass; return `collapseTitle ${sizeClass}`; }
    get containerIcon() { return this.isVisible ? 'utility:chevrondown' : 'utility:chevronright'; }
    get sectionList() { return this.localSections; }


    // ADD: bare mode property
    _bare = false;
    @api
    get bare() { return this._bare; }
    set bare(v) { 
        this._bare = v === '' || v === true || v === 'true';
    }
    
    @api
    set sectionList(value) {
        if (Array.isArray(value)) {
            this.localSections = value.map((item, index) => ({
                ...item,
                id: item.id || `section-${index}`,
                icon: 'utility:chevronright',
                isSectionVisible: false
            }));
        }
    }
    
    toggleContainer() {
        if (this._bare) return; // Don't toggle in bare mode
        this.isVisible = !this.isVisible;
    }
    
    toggleSubSection(event) {
        const sectionId = event.currentTarget.dataset.id;
        this.localSections = this.localSections.map(section => {
            if (section.id === sectionId) {
                const visible = !section.isSectionVisible;
                return {
                    ...section,
                    isSectionVisible: visible,
                    icon: visible ? 'utility:chevrondown' : 'utility:chevronright'
                };
            }
            return section;
        });
    }

    renderedCallback() {
        // ADD: bare mode styling
        if (this._bare) {
            this.template.host.classList.add('isBare');
        } else {
            this.template.host.classList.remove('isBare');
        }
    }

    handleContainerKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleContainer();
        }
    }
    handleSubKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleSubSection(event);
        }
    }
}