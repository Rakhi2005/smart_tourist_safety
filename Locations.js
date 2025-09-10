import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiMapPin,
  FiShield,
  FiEye,
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const LocationsContainer = styled.div`
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

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const LocationCard = styled.div`
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

const LocationHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
`;

const LocationTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LocationAddress = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const LocationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const LocationDescription = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const LocationActions = styled.div`
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
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
  grid-column: 1 / -1;
`;

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    safetyLevel: '',
    search: ''
  });

  useEffect(() => {
    fetchLocations();
  }, [filters]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await axios.get(`/api/locations?${params.toString()}`);
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
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

  const getSafetyLevelColor = (level) => {
    switch (level) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'beach': return '🏖️';
      case 'mountain': return '🏔️';
      case 'city': return '🏙️';
      case 'monument': return '🏛️';
      case 'park': return '🌳';
      default: return '📍';
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await axios.delete(`/api/locations/${id}`);
        toast.success('Location deleted successfully');
        fetchLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
        toast.error('Failed to delete location');
      }
    }
  };

  if (loading) {
    return (
      <LocationsContainer>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </LocationsContainer>
    );
  }

  return (
    <LocationsContainer>
      <Header>
        <Title>Locations</Title>
        <Button>
          <FiPlus />
          Add Location
        </Button>
      </Header>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="beach">Beach</option>
              <option value="mountain">Mountain</option>
              <option value="city">City</option>
              <option value="monument">Monument</option>
              <option value="park">Park</option>
              <option value="other">Other</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Safety Level</Label>
            <Select
              value={filters.safetyLevel}
              onChange={(e) => handleFilterChange('safetyLevel', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
                placeholder="Search locations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </SearchContainer>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <LocationsGrid>
        {locations.length > 0 ? (
          locations.map((location) => (
            <LocationCard key={location.id}>
              <LocationHeader>
                <LocationTitle>
                  {getTypeIcon(location.location_type)} {location.name}
                </LocationTitle>
                <LocationAddress>{location.address}</LocationAddress>
                <LocationMeta>
                  <MetaItem>
                    <FiShield />
                    <Badge color={getSafetyLevelColor(location.safety_level)}>
                      {location.safety_level} safety
                    </Badge>
                  </MetaItem>
                  <MetaItem>
                    <FiMapPin />
                    {location.location_type.replace('_', ' ').toUpperCase()}
                  </MetaItem>
                </LocationMeta>
                {location.description && (
                  <LocationDescription>
                    {location.description}
                  </LocationDescription>
                )}
              </LocationHeader>
              <LocationActions>
                <div>
                  {location.latitude && location.longitude && (
                    <MetaItem>
                      <FiMapPin />
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </MetaItem>
                  )}
                </div>
                <ActionButtons>
                  <ActionButton title="View Details">
                    <FiEye />
                  </ActionButton>
                  <ActionButton title="Edit">
                    <FiEdit />
                  </ActionButton>
                  <ActionButton 
                    title="Delete" 
                    className="danger"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <FiTrash2 />
                  </ActionButton>
                </ActionButtons>
              </LocationActions>
            </LocationCard>
          ))
        ) : (
          <EmptyState>
            <FiMapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No locations found</h3>
            <p>No locations match your current filters.</p>
          </EmptyState>
        )}
      </LocationsGrid>
    </LocationsContainer>
  );
};

export default Locations;
