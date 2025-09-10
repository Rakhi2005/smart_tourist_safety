import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiShield,
  FiEye,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';

const AlertsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
  font-size: 1.125rem;
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

// Enhanced form controls for Create Alert UI
const InputField = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
`;

const TextareaField = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-height: 120px;
  resize: vertical;
  &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #d1d5db; }
`;

const AlertCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid ${props => props.$severityColor};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const AlertHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AlertMessage = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    color: #3b82f6;
    border-color: #3b82f6;
  }
  
  &.danger:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
`;

const AlertFooter = styled.div`
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.color + '20'};
  color: ${props => props.color};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
`;

const SafetyAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    search: ''
  });

  const isPrivileged = user?.role === 'admin' || user?.role === 'safety_officer';
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    alertType: 'general',
    severity: 'info',
    locationId: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.search) params.append('search', filters.search);
      const { data } = await axios.get(`/api/alerts/safety?${params.toString()}`);
      const rows = Array.isArray(data.alerts) ? data.alerts : [];
      // Normalize to camelCase properties expected by the UI
      const normalized = rows.map(r => ({
        id: r.id,
        title: r.title,
        message: r.message,
        alertType: r.alert_type,
        severity: r.severity,
        locationName: r.location_name,
        isActive: r.is_active,
        expiresAt: r.expires_at,
        createdAt: r.created_at
      }));
      setAlerts(normalized);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch safety alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Admin actions
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const viewAlert = (alert) => {
    setSelectedAlert(alert);
    setShowDetails(true);
  };

  const editAlert = async (alert) => {
    try {
      // Simple prompts to quickly edit key fields
      const newTitle = window.prompt('Title', alert.title);
      if (newTitle === null) return;
      const newMessage = window.prompt('Message', alert.message);
      if (newMessage === null) return;
      const newType = window.prompt('Type (general, weather, traffic, security, medical)', alert.alertType || 'general');
      if (newType === null) return;
      const newSeverity = window.prompt('Severity (info, warning, danger)', alert.severity || 'info');
      if (newSeverity === null) return;
      const activeStr = window.prompt('Is Active? (true/false)', String(alert.isActive ?? true));
      if (activeStr === null) return;
      const newActive = activeStr.toLowerCase() === 'true';

      const payload = {
        title: newTitle,
        message: newMessage,
        alertType: newType,
        severity: newSeverity,
        isActive: newActive,
      };
      await axios.put(`/api/alerts/safety/${alert.id}`, payload);
      toast.success('Alert updated');
      fetchAlerts();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to update alert';
      toast.error(msg);
    }
  };

  const deleteAlert = async (id) => {
    try {
      if (!window.confirm('Delete this alert?')) return;
      await axios.delete(`/api/alerts/safety/${id}`);
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to delete alert';
      toast.error(msg);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger': return <FiAlertCircle />;
      case 'warning': return <FiAlertTriangle />;
      case 'info': return <FiInfo />;
      default: return <FiShield />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'weather': return '🌤️';
      case 'traffic': return '🚗';
      case 'security': return '🛡️';
      case 'medical': return '🏥';
      case 'general': return '📢';
      default: return '⚠️';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <AlertsContainer>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </AlertsContainer>
    );
  }

  return (
    <AlertsContainer>
      <Header>
        <Title>Safety Alerts</Title>
        {isPrivileged && (
          <Button onClick={() => setShowCreate(s => !s)}>
            <FiPlus />
            {showCreate ? 'Close' : 'Create Alert'}
          </Button>
        )}
      </Header>

      {isPrivileged && showCreate && (
        <FiltersSection>
          <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#1e293b' }}>Create New Alert</h3>
          <TwoCol>
            <FilterGroup>
              <Label>Title</Label>
              <InputField
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Concise alert title"
              />
            </FilterGroup>
            <FilterGroup>
              <Label>Type</Label>
              <Select
                value={form.alertType}
                onChange={e => setForm({ ...form, alertType: e.target.value })}
              >
                <option value="general">General</option>
                <option value="weather">Weather</option>
                <option value="traffic">Traffic</option>
                <option value="security">Security</option>
                <option value="medical">Medical</option>
              </Select>
            </FilterGroup>
            <FilterGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Message</Label>
              <TextareaField
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Describe the alert details, recommendations, or actions"
              />
            </FilterGroup>
            <FilterGroup>
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <Label>Location ID (optional)</Label>
              <InputField
                type="number"
                value={form.locationId}
                onChange={e => setForm({ ...form, locationId: e.target.value })}
                placeholder="e.g. 1"
              />
            </FilterGroup>
            <FilterGroup>
              <Label>Expires At (optional)</Label>
              <InputField
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              />
            </FilterGroup>
          </TwoCol>
          <FormActions>
            <SecondaryButton onClick={() => setShowCreate(false)}>Cancel</SecondaryButton>
            <Button
              onClick={async () => {
                try {
                  if (!form.title.trim() || !form.message.trim()) {
                    toast.error('Title and message are required');
                    return;
                  }
                  const payload = {
                    title: form.title.trim(),
                    message: form.message.trim(),
                    alertType: form.alertType,
                    severity: form.severity,
                    locationId: form.locationId ? Number(form.locationId) : null,
                    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
                  };
                  await axios.post('/api/alerts/safety', payload);
                  toast.success('Alert created');
                  setShowCreate(false);
                  setForm({ title: '', message: '', alertType: 'general', severity: 'info', locationId: '', expiresAt: '' });
                  fetchAlerts();
                } catch (e) {
                  const msg = e.response?.data?.message || 'Failed to create alert';
                  toast.error(msg);
                }
              }}
            >
              <FiPlus /> Create Alert
            </Button>
          </FormActions>
        </FiltersSection>
      )}

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="weather">Weather</option>
              <option value="traffic">Traffic</option>
              <option value="security">Security</option>
              <option value="medical">Medical</option>
              <option value="general">General</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Severity</Label>
            <Select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Search</Label>
            <SearchContainer>
              <SearchIcon>
                <FiSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search alerts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </SearchContainer>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <AlertsGrid>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertCard 
              key={alert.id} 
              $severityColor={getSeverityColor(alert.severity)}
            >
              <AlertHeader>
                <AlertInfo>
                  <AlertTitle>
                    {getSeverityIcon(alert.severity)}
                    {getTypeIcon(alert.alertType)} {alert.title}
                  </AlertTitle>
                  <AlertMeta>
                    <MetaItem>
                      <Badge color={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </MetaItem>
                    <MetaItem>
                      <FiShield />
                      {alert.alertType.replace('_', ' ').toUpperCase()}
                    </MetaItem>
                    {alert.locationName && (
                      <MetaItem>
                        <FiShield />
                        {alert.locationName}
                      </MetaItem>
                    )}
                    <MetaItem>
                      {alert.isActive ? <FiCheckCircle /> : <FiXCircle />}
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </MetaItem>
                  </AlertMeta>
                  <AlertMessage>
                    {alert.message}
                  </AlertMessage>
                </AlertInfo>
                <AlertActions>
                  <ActionButton title="View Details" onClick={() => viewAlert(alert)}>
                    <FiEye />
                  </ActionButton>
                  {isPrivileged && (
                    <>
                      <ActionButton title="Edit" onClick={() => editAlert(alert)}>
                        <FiEdit />
                      </ActionButton>
                      <ActionButton title="Delete" className="danger" onClick={() => deleteAlert(alert.id)}>
                        <FiTrash2 />
                      </ActionButton>
                    </>
                  )}
                </AlertActions>
              </AlertHeader>
              <AlertFooter>
                <div>
                  <MetaItem>
                    <FiClock />
                    Created: {formatDate(alert.createdAt)}
                  </MetaItem>
                </div>
                <div>
                  {alert.expiresAt && (
                    <MetaItem>
                      <FiClock />
                      {isExpired(alert.expiresAt) ? 'Expired' : 'Expires'}: {formatDate(alert.expiresAt)}
                    </MetaItem>
                  )}
                </div>
              </AlertFooter>
            </AlertCard>
          ))
        ) : (
          <EmptyState>
            <FiShield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No safety alerts found</h3>
            <p>No alerts match your current filters.</p>
          </EmptyState>
        )}
      </AlertsGrid>
      {showDetails && selectedAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowDetails(false)}>
          <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.75rem', maxWidth: 600, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{selectedAlert.title}</h3>
            <div style={{ color: '#64748b', marginBottom: '0.75rem' }}>
              <span style={{ marginRight: 12 }}>Type: {(selectedAlert.alertType || '').replace('_',' ')}</span>
              <span style={{ marginRight: 12 }}>Severity: {selectedAlert.severity}</span>
              <span>Status: {selectedAlert.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{selectedAlert.message}</div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <div>Location: {selectedAlert.locationName || 'N/A'}</div>
              <div>Expires: {selectedAlert.expiresAt || 'N/A'}</div>
              <div>Created: {selectedAlert.createdAt || 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </AlertsContainer>
  );
};

export default SafetyAlerts;
