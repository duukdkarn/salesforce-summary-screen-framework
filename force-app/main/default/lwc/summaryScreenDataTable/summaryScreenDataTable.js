import { LightningElement, api, track } from 'lwc';

export default class SummaryScreenDataTable extends LightningElement {
  @api tableTitle;
  @api columns = [];
  @api tableData = [];
  @api totalColumns = '';
  @api totalLabel = 'Total';
  
  _bare = false;
  @api
  get bare() { return this._bare; }
  set bare(v) {
    this._bare = v === '' || v === true || v === 'true'; 
    if (this._bare) this.template.host.classList.add('isBare');
    else this.template.host.classList.remove('isBare');
  }

  @track isVisible = false;

  get iconName() { return this.isVisible ? 'utility:chevrondown' : 'utility:chevronright'; }
  get showHeader() { return !this._bare; }
  get showBody()   { return this._bare || this.isVisible; }
  get totalColumnsArray() { return this.totalColumns ? this.totalColumns.split(',').map(col => col.trim()) : []; }
  get shouldShowTotals() { const result = this.totalColumns && this.totalColumns.trim().length > 0; return result; }

  toggleSection() { if (this._bare) return; this.isVisible = !this.isVisible; }

  get processedTableData() {
    return this.tableData.map(row => ({
        id: row.id,
        cells: this.columns.map(col => ({
            key: col.fieldName,
            value: this.formatCellValue(row[col.fieldName], col.type)
        }))
    }));
  }

  static CELL_FORMATTERS = {
      currency: (value) => {
          if (value === null || value === undefined || value === '' || isNaN(value)) return '';
          return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
          }).format(Number(value));
      },
      
      number: (value) => {
          if (value === null || value === undefined || value === '' || isNaN(value)) return '';
          return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0
          }).format(Number(value));
      },
      
      text: (value) => {
          return value === null || value === undefined ? '' : String(value);
      }
  };

  formatCellValue(value, columnType) {
      const formatter = SummaryScreenDataTable.CELL_FORMATTERS[columnType] || SummaryScreenDataTable.CELL_FORMATTERS.text;
      return formatter(value);
  }

    get totalRow() {
        if (!this.shouldShowTotals || !this.tableData.length) return null;
        
        // Calculate totals for specified columns
        const totals = this.totalColumnsArray.reduce((acc, colName) => {
            acc[colName] = this.tableData.reduce((sum, row) => 
                sum + (parseFloat(row[colName]) || 0), 0
            );
            return acc;
        }, {});
        
        // Generate cells using functional approach
        const cells = this.columns.map((col, index) => ({
            key: col.fieldName,
            value: this.getCellValue(col, index, totals),
            isTotal: index === 0 || col.fieldName in totals
        }));
        
        return { id: 'total-row', cells };
    }

    // Helper method for determining cell values
    getCellValue(column, columnIndex, totals) {
        if (columnIndex === 0) { return this.totalLabel; }
        
        // Total columns get formatted calculated values
        if (column.fieldName in totals) { return this.formatCellValue(totals[column.fieldName], column.type); }
        
        // Other columns are empty
        return '';
    }

    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleSection();
        }
    }
}