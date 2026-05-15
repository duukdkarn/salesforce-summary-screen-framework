import { LightningElement, api } from 'lwc';
import basePath from '@salesforce/community/basePath';

// Hoisted: icon map + shepherd path segment
const ICON_GROUPS = Object.freeze({
  'doctype:word': [
    'doc','docx','docm','dot','dotx','dotm'                // Word + templates/macros
  ],
  'doctype:excel': [
    'xls','xlsx','xlsm','xlt','xltx','xltm'                // Excel + templates/macros
  ],
  'doctype:ppt': [
    'ppt','pptx','pptm','pot','potx','potm','pps','ppsx','ppsm','sldx','sldm' // PowerPoint + shows/slides
  ],
  'doctype:image': [
    'jpg','jpeg','png','gif','bmp','tiff','webp','svg'
  ],
  'doctype:pdf':  ['pdf'],
  'doctype:csv':  ['csv'],
  'doctype:txt':  ['txt'],
  'doctype:zip':  ['zip','gz','tar','tgz','7z','rar']
});

// Build a flat extension→icon map once at module load.
const EXT_ICON_MAP = (() => {
  const tmp = {};
  for (const [icon, exts] of Object.entries(ICON_GROUPS)) {
    exts.forEach(ext => { tmp[ext] = icon; });
  }
  return Object.freeze(tmp);
})();

const DEFAULT_ICON = 'doctype:attachment';

function normalizeExt(extOrFilename) {
  if (!extOrFilename) return '';
  const s = String(extOrFilename).toLowerCase().trim();
  // handle names like "report.final.PPTX"
  const parts = s.split('.');
  return parts.length > 1 ? parts.pop() : s;
}

export function pickDocIconByExtension(extOrFilename) {
  const ext = normalizeExt(extOrFilename);
  return EXT_ICON_MAP[ext] || DEFAULT_ICON;
}
const SHEPHERD_VERSION_SEGMENT = '/sfc/servlet.shepherd/version/download/';

export default class SummaryScreenDocuments extends LightningElement {
  @api sectionTitle;
  @api fields = [];
  @api documents = [];
  @api renderAsBadge = false;

  @api titleForDoc = 'Approval document';

    _bare = false;
  @api
  get bare() { return this._bare; }
  set bare(v) { 
    this._bare = v === '' || v === true || v === 'true';
  }

  expanded = false;

  get title() { return this.sectionTitle; }
  get chevronIcon() { return this.expanded ? 'utility:chevrondown' : 'utility:chevronright'; }
  get showHeader() { return !this._bare; }
  get showBody() { return this._bare || this.expanded; }
  get headerAriaExpanded() { return String(this.expanded); }
  get computedTitleClass() { const base = 'collapseTitle'; return `${base} slds-text-heading_small`; }
  get needsMidRule() { return (this.fields?.length || 0) > 0; }
  get hasDocuments() { return (this.documents?.length || 0) > 0; }

  renderedCallback() {
    const host = this.template.host;
    if (this._bare) {
      host.classList.add('isBare');
    } else {
      host.classList.remove('isBare');
    }
  }

  toggleExpanded = () => { this.expanded = !this.expanded; };
  handleHeaderKeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggleExpanded(); } };

  buildDownloadHref(versionId) {
    if (!versionId) return null;
    const prefix = basePath || '';
    return `${prefix}${SHEPHERD_VERSION_SEGMENT}${versionId}`;
  }

  get docsUi() {
    const makeRow = (d, i) => {
      const ext = (d.extension || '').toLowerCase();
      const versionId = d.versionId;
      const hasLink = Boolean(versionId);
      const id = versionId || `doc-${i}`;
      const title = d.title || (hasLink ? 'Document' : '--');
      const label = d.label || this.titleForDoc;

      return {
        key: id,
        ruleKey: `${id}-rule`,
        label,
        title,
        iconName: hasLink ? pickDocIconByExtension(d.extension || d.title) : DEFAULT_ICON,
        href: this.buildDownloadHref(versionId),
        ariaLabel: hasLink ? `Download ${title}${ext ? ` (${ext.toUpperCase()})` : ''}` : null,
        hasLink
      };
    };

    const incoming = (this.documents || []).map(makeRow);
    const list = incoming.length ? incoming : [ makeRow({}, 0) ];

    return list.map((d, i) => ({ ...d, hrRequired: i < list.length - 1 }));
  }
}