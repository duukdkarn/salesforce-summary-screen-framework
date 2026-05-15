import { LightningElement, api, track } from 'lwc';

export default class SummaryScreenCompositeSection extends LightningElement {
    @api sectionTitle;
    @api components = [];
    
    @track isVisible = false;
    
    get iconName() { 
        return this.isVisible ? 'utility:chevrondown' : 'utility:chevronright'; 
    }
    
    toggleSection() { 
        this.isVisible = !this.isVisible; 
    }
    
    get processedComponents() {
        return this.components.map((comp, index) => ({
            ...comp,
            id: comp.key ? `${comp.key}-${index}` : `comp-${index}`
        }));
    }

    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleSection();
        }
    }
}