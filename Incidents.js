import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiUser
} from 'react-icons/fi';

const IncidentsContainer = styled.div`
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
  margin-bottom: 1rem;
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

const IncidentsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const IncidentCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const IncidentHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const IncidentInfo = styled.div`
  flex: 1;
`;

const IncidentTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const IncidentMeta = styled.div`
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

const IncidentDescription = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const IncidentActions = styled.div`
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

const Incidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await axios.get(`/api/incidents?${params.toString()}`);
      setIncidents(response.data.incidents || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  // Client-side details modal for viewing an incident
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const viewIncident = (inc) => {
    setSelectedIncident(inc);
    setShowDetails(true);
  };

  const markResolved = async (id) => {
    try {
      await axios.put(`/api/incidents/${id}`, { status: 'resolved' });
      toast.success('Incident marked as resolved');
      setShowDetails(false);
      fetchIncidents();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#10b981';
      case 'investigating': return '#f59e0b';
      case 'reported': return '#3b82f6';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <FiCheckCircle />;
      case 'investigating': return <FiClock />;
      case 'reported': return <FiAlertTriangle />;
      case 'closed': return <FiXCircle />;
      default: return <FiAlertTriangle />;
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

  if (loading) {
    return (
      <IncidentsContainer>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </IncidentsContainer>
    );
  }

  return (
    <div>
    <IncidentsContainer>
      <Header>
        <Title>Incidents</Title>
        {user?.role !== 'admin' && (
          <Button>
            <FiPlus />
            Report Incident
          </Button>
        )}
      </Header>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Severity</Label>
            <Select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="theft">Theft</option>
              <option value="accident">Accident</option>
              <option value="medical">Medical</option>
              <option value="lost_person">Lost Person</option>
              <option value="natural_disaster">Natural Disaster</option>
              <option value="other">Other</option>
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
                placeholder="Search incidents..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </SearchContainer>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <IncidentsGrid>
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <IncidentCard key={incident.id}>
              <IncidentHeader>
                <IncidentInfo>
                  <IncidentTitle>{incident.title}</IncidentTitle>
                  <IncidentMeta>
                    <MetaItem>
                      {getStatusIcon(incident.status)}
                      <Badge color={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </MetaItem>
                    <MetaItem>
                      <FiAlertTriangle />
                      <Badge color={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </MetaItem>
                    {incident.location_name && (
                      <MetaItem>
                        <FiMapPin />
                        {incident.location_name}
                      </MetaItem>
                    )}
                    <MetaItem>
                      <FiUser />
                      {incident.reporter_name}
                    </MetaItem>
                  </IncidentMeta>
                  <IncidentDescription>
                    {incident.description}
                  </IncidentDescription>
                </IncidentInfo>
                <IncidentActions>
                  <ActionButton title="View Details" onClick={() => viewIncident(incident)}>
                    <FiEye />
                  </ActionButton>
                  {user?.role !== 'admin' && user?.role !== 'safety_officer' && (
                    <ActionButton title="Edit">
                      <FiEdit />
                    </ActionButton>
                  )}
                </IncidentActions>
              </IncidentHeader>
            </IncidentCard>
          ))
        ) : (
          <EmptyState>
            <FiAlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No incidents found</h3>
            <p>No incidents match your current filters.</p>
          </EmptyState>
        )}
      </IncidentsGrid>
    </IncidentsContainer>
    {showDetails && selectedIncident && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDetails(false)}>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.75rem', maxWidth: 700, width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{selectedIncident.title}</h3>
          <div style={{ color: '#64748b', marginBottom: '0.75rem' }}>
            <span style={{ marginRight: 12 }}>Type: {(selectedIncident.incident_type || '').replace('_',' ')}</span>
            <span style={{ marginRight: 12 }}>Severity: {selectedIncident.severity}</span>
            <span>Status: {selectedIncident.status}</span>
          </div>
          <div style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{selectedIncident.description}</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <div>Location: {selectedIncident.location_name || 'N/A'}</div>
            <div>Reporter: {selectedIncident.reporter_name || 'N/A'}</div>
            <div>Coordinates: {(selectedIncident.latitude ?? '')}, {(selectedIncident.longitude ?? '')}</div>
            <div>Created: {selectedIncident.created_at ? new Date(selectedIncident.created_at).toLocaleString() : 'N/A'}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            {(['admin','safety_officer'].includes(user?.role)) && (
              <button
                onClick={() => markResolved(selectedIncident.id)}
                disabled={String(selectedIncident.status).toLowerCase() === 'resolved' || String(selectedIncident.status).toLowerCase() === 'closed'}
                style={{ background: '#10b981', color: '#fff', opacity: (String(selectedIncident.status).toLowerCase() === 'resolved' || String(selectedIncident.status).toLowerCase() === 'closed') ? 0.6 : 1, border: 0, borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                { (String(selectedIncident.status).toLowerCase() === 'resolved' || String(selectedIncident.status).toLowerCase() === 'closed') ? 'Already Resolved' : 'Mark Resolved' }
              </button>
            )}
            <button onClick={() => setShowDetails(false)} style={{ background: '#1d4ed8', color: '#fff', border: 0, borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Incidents;
