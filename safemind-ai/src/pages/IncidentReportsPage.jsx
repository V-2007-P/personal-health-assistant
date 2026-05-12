import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, MapPin, Clock, AlertTriangle,
  CheckCircle2, Filter, Trash2, Share2, X, ChevronDown,
  Flame, Activity, HeartPulse, Shield, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import './IncidentReportsPage.css';
import FacilityLock from '../components/FacilityLock';

// ────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────
const INCIDENT_TYPES = [
  { id: 'medical',   label: 'Medical Emergency',   color: '#FF3B30', icon: HeartPulse },
  { id: 'fire',      label: 'Fire / Hazard',        color: '#FF9500', icon: Flame },
  { id: 'security',  label: 'Security / Assault',   color: '#8A2BE2', icon: Shield },
  { id: 'accident',  label: 'Accident',             color: '#007AFF', icon: Activity },
  { id: 'other',     label: 'Other',                color: '#7A7E9A', icon: FileText },
];

const SEVERITY = ['Low', 'Medium', 'High', 'Critical'];

const STORAGE_KEY = 'safemind_incidents';

const loadReports = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const saveReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

const EMPTY_FORM = {
  type: 'medical',
  title: '',
  description: '',
  severity: 'Medium',
  location: '',
};

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
const IncidentReportsPage = ({ user, onLoginRequest }) => {
  const [reports, setReports]         = useState(loadReports);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [filterType, setFilterType]   = useState('all');
  const [filterSev, setFilterSev]     = useState('all');
  const [isLocating, setIsLocating]   = useState(false);
  const [expandedId, setExpandedId]   = useState(null);

  // Persist on every change
  useEffect(() => { saveReports(reports); }, [reports]);

  // ── helpers ──────────────────────────────────
  const typeObj = (id) => INCIDENT_TYPES.find(t => t.id === id) || INCIDENT_TYPES[4];

  const fetchLocation = () => {
    setIsLocating(true);
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const addr = data.address?.road
          ? `${data.address.road}, ${data.address.city || data.address.town || ''}`
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setForm(f => ({ ...f, location: addr }));
        toast.success('Location detected!');
      } catch {
        setForm(f => ({ ...f, location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
      } finally { setIsLocating(false); }
    }, () => { toast.error('Location denied.'); setIsLocating(false); });
  };

  const submitReport = () => {
    if (!form.title.trim())       { toast.error('Please enter a title.'); return; }
    if (!form.description.trim()) { toast.error('Please add a description.'); return; }

    const newReport = {
      id:          Date.now(),
      ...form,
      timestamp:   new Date().toISOString(),
      status:      'Open',
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    setShowForm(false);
    setForm(EMPTY_FORM);
    toast.success('Incident report filed!');
  };

  const resolveReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
    toast.success('Marked as resolved.');
  };

  const deleteReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.success('Report deleted.');
  };

  const shareReport = (r) => {
    const text = `📋 INCIDENT REPORT\nType: ${typeObj(r.type).label}\nSeverity: ${r.severity}\nTitle: ${r.title}\nDetails: ${r.description}\nLocation: ${r.location || 'Unknown'}\nTime: ${new Date(r.timestamp).toLocaleString()}\nStatus: ${r.status}`;
    if (navigator.share) {
      navigator.share({ title: 'SafeMind Incident Report', text });
    } else {
      window.open(`mailto:?subject=Incident Report - ${r.title}&body=${encodeURIComponent(text)}`, '_blank');
      toast.success('Opened email with report');
    }
  };

  const filtered = reports.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterSev  !== 'all' && r.severity !== filterSev) return false;
    return true;
  });

  const stats = {
    total:    reports.length,
    open:     reports.filter(r => r.status === 'Open').length,
    critical: reports.filter(r => r.severity === 'Critical').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
  };

  // ── render ────────────────────────────────────
  return (
    <div className="irp-page" style={{ position: 'relative' }}>
      {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="Incident Reporting" />}

      {/* ── Header ── */}
      <div className="irp-header">
        <div className="irp-title-row">
          <div className="irp-icon-badge"><ClipboardList size={22} /></div>
          <div>
            <h2 className="irp-title">Incident Reports</h2>
            <div className="irp-sub">{stats.total} total · {stats.open} open · {stats.critical} critical</div>
          </div>
        </div>
        <button className="irp-new-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Report
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="irp-stats-row">
        {[
          { label: 'Total',    value: stats.total,    color: '#2D3142' },
          { label: 'Open',     value: stats.open,     color: '#FF9500' },
          { label: 'Critical', value: stats.critical, color: '#FF3B30' },
          { label: 'Resolved', value: stats.resolved, color: '#34C759' },
        ].map(s => (
          <div className="irp-stat-card" key={s.label}>
            <div className="irp-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="irp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="irp-filters-row">
        <Filter size={15} color="#7A7E9A" />
        <select className="irp-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {INCIDENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select className="irp-filter-select" value={filterSev} onChange={e => setFilterSev(e.target.value)}>
          <option value="all">All Severities</option>
          {SEVERITY.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Reports List ── */}
      <div className="irp-list">
        {filtered.length === 0 ? (
          <div className="irp-empty">
            <ClipboardList size={48} color="#D0D5E8" />
            <p>No incidents found.<br />Tap <strong>+ New Report</strong> to log one.</p>
          </div>
        ) : (
          filtered.map(r => {
            const t = typeObj(r.type);
            const IconComp = t.icon;
            const expanded = expandedId === r.id;
            return (
              <div key={r.id} className={`irp-card ${r.severity.toLowerCase()} ${r.status === 'Resolved' ? 'resolved' : ''}`}
                style={{ '--accent': t.color }}>
                <div className="irp-card-top" onClick={() => setExpandedId(expanded ? null : r.id)}>
                  <div className="irp-card-icon" style={{ background: `${t.color}18`, color: t.color }}>
                    <IconComp size={18} />
                  </div>
                  <div className="irp-card-info">
                    <div className="irp-card-title">{r.title}</div>
                    <div className="irp-card-meta">
                      <span className="irp-type-tag" style={{ color: t.color, background: `${t.color}15` }}>{t.label}</span>
                      <span className={`irp-severity-tag sev-${r.severity.toLowerCase()}`}>{r.severity}</span>
                      <span className={`irp-status-tag ${r.status === 'Resolved' ? 'resolved' : 'open'}`}>
                        {r.status === 'Resolved' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} color="#A0A5C0"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }} />
                </div>

                {expanded && (
                  <div className="irp-card-expanded">
                    <p className="irp-card-desc">{r.description}</p>
                    {r.location && (
                      <div className="irp-card-location"><MapPin size={13} /> {r.location}</div>
                    )}
                    <div className="irp-card-time"><Clock size={13} /> {new Date(r.timestamp).toLocaleString()}</div>
                    <div className="irp-card-actions">
                      {r.status !== 'Resolved' && (
                        <button className="irp-action-btn resolve" onClick={() => resolveReport(r.id)}>
                          <CheckCircle2 size={13} /> Mark Resolved
                        </button>
                      )}
                      <button className="irp-action-btn share-btn" onClick={() => shareReport(r)}>
                        <Share2 size={13} /> Share
                      </button>
                      <button className="irp-action-btn delete-btn" onClick={() => deleteReport(r.id)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── New Report Modal ── */}
      {showForm && (
        <div className="irp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="irp-modal" onClick={e => e.stopPropagation()}>
            <div className="irp-modal-header">
              <div className="irp-modal-title"><Plus size={18} /> New Incident Report</div>
              <button className="irp-modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            {/* Type Selector */}
            <div className="irp-form-section">
              <label className="irp-label">Incident Type</label>
              <div className="irp-type-grid">
                {INCIDENT_TYPES.map(t => {
                  const IC = t.icon;
                  return (
                    <button key={t.id}
                      className={`irp-type-btn ${form.type === t.id ? 'selected' : ''}`}
                      style={{ '--tc': t.color }}
                      onClick={() => setForm(f => ({ ...f, type: t.id }))}>
                      <IC size={18} />
                      <span>{t.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="irp-form-section">
              <label className="irp-label">Title <span className="req">*</span></label>
              <input className="irp-input" placeholder="Brief title of the incident"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            {/* Severity */}
            <div className="irp-form-section">
              <label className="irp-label">Severity</label>
              <div className="irp-severity-row">
                {SEVERITY.map(s => (
                  <button key={s}
                    className={`irp-sev-btn ${form.severity === s ? 'selected' : ''} sev-${s.toLowerCase()}`}
                    onClick={() => setForm(f => ({ ...f, severity: s }))}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="irp-form-section">
              <label className="irp-label">Description <span className="req">*</span></label>
              <textarea className="irp-textarea" rows={3} placeholder="What happened? Provide details..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Location */}
            <div className="irp-form-section">
              <label className="irp-label">Location</label>
              <div className="irp-location-row">
                <input className="irp-input irp-loc-input" placeholder="Enter location or use GPS"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                <button className="irp-gps-btn" onClick={fetchLocation} disabled={isLocating}>
                  {isLocating ? '...' : <><MapPin size={14} /> GPS</>}
                </button>
              </div>
            </div>

            <button className="irp-submit-btn" onClick={submitReport}>
              <ClipboardList size={16} /> File Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReportsPage;
