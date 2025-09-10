import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiActivity
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  background: ${props => props.color || '#3b82f6'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const RecentActivity = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ActivityHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const ActivityTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
`;

const ActivityList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#f1f5f9'};
  color: ${props => props.iconColor || '#64748b'};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityItemTitle = styled.div`
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
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

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [recentSOS, setRecentSOS] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch incident statistics
      const incidentsResponse = await axios.get('/api/incidents/stats/overview');

      setStats(incidentsResponse.data.overview);
      setRecentIncidents(incidentsResponse.data.recentIncidents || []);

      // Fetch latest SOS via alerts endpoint (also returns incidents but we only need sos here)
      try {
        const alertsResp = await axios.get('/api/alerts');
        setRecentSOS(alertsResp.data.sos || []);
      } catch (e) {
        console.warn('Failed to load SOS for dashboard:', e.response?.data?.message || e.message);
        setRecentSOS([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <FiCheckCircle />;
      case 'investigating': return <FiClock />;
      case 'reported': return <FiAlertTriangle />;
      case 'closed': return <FiXCircle />;
      default: return <FiActivity />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  const pieData = [
    { name: 'Low', value: stats?.low || 0, color: '#10b981' },
    { name: 'Medium', value: stats?.medium || 0, color: '#3b82f6' },
    { name: 'High', value: stats?.high || 0, color: '#f59e0b' },
    { name: 'Critical', value: stats?.critical || 0, color: '#ef4444' }
  ];

  const statusData = [
    { name: 'Reported', value: stats?.reported || 0, color: '#3b82f6' },
    { name: 'Investigating', value: stats?.investigating || 0, color: '#f59e0b' },
    { name: 'Resolved', value: stats?.resolved || 0, color: '#10b981' },
    { name: 'Closed', value: stats?.closed || 0, color: '#6b7280' }
  ];

  // Build unified recent activity: include both incidents and sos
  const recentActivity = [
    ...recentIncidents.map(i => ({
      type: 'incident',
      id: `inc-${i.id}`,
      title: i.title,
      description: `${i.location_name || 'Unknown location'} • ${i.incident_type?.replace('_',' ').toUpperCase()}`,
      severity: i.severity,
      status: i.status,
      time: i.created_at
    })),
    ...recentSOS.map(s => ({
      type: 'sos',
      id: `sos-${s.id}`,
      title: `${s.tourist_name || 'Tourist'} sent SOS`,
      description: s.location || `${s.latitude}, ${s.longitude}`,
      severity: 'critical',
      status: s.status || 'active',
      time: s.timestamp
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>
          Welcome back, {user?.firstName}!
        </WelcomeTitle>
        <WelcomeSubtitle>
          Here's what's happening with tourist safety in your area.
        </WelcomeSubtitle>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Incidents</StatTitle>
            <StatIcon color="#3b82f6">
              <FiAlertTriangle />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.total_incidents || 0}</StatValue>
          <StatChange positive>
            <FiTrendingUp />
            +12% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Active Cases</StatTitle>
            <StatIcon color="#f59e0b">
              <FiClock />
            </StatIcon>
          </StatHeader>
          <StatValue>{(stats?.reported || 0) + (stats?.investigating || 0)}</StatValue>
          <StatChange positive>
            <FiTrendingUp />
            +8% from last week
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Resolved</StatTitle>
            <StatIcon color="#10b981">
              <FiCheckCircle />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.resolved || 0}</StatValue>
          <StatChange positive>
            <FiTrendingUp />
            +15% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Critical Issues</StatTitle>
            <StatIcon color="#ef4444">
              <FiAlertTriangle />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.critical || 0}</StatValue>
          <StatChange positive={false}>
            <FiTrendingUp />
            -5% from last week
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Incidents by Severity</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Status Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <RecentActivity>
        <ActivityHeader>
          <ActivityTitle>Recent Activity</ActivityTitle>
        </ActivityHeader>
        <ActivityList>
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <ActivityItem key={item.id}>
                <ActivityIcon 
                  color={getSeverityColor(item.severity) + '20'}
                  iconColor={getSeverityColor(item.severity)}
                >
                  {getStatusIcon(item.status)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityItemTitle>
                    {item.type === 'sos' ? '🚨 ' : ''}{item.title}
                  </ActivityItemTitle>
                  <ActivityDescription>
                    {item.description}
                  </ActivityDescription>
                </ActivityContent>
                <ActivityTime>
                  {formatTimeAgo(item.time)}
                </ActivityTime>
              </ActivityItem>
            ))
          ) : (
            <ActivityItem>
              <ActivityContent>
                <ActivityItemTitle>No recent activity</ActivityItemTitle>
                <ActivityDescription>No incidents or SOS to show</ActivityDescription>
              </ActivityContent>
            </ActivityItem>
          )}
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;
