import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiAlertCircle, FiSend, FiFileText, FiLifeBuoy, FiMapPin, FiImage } from 'react-icons/fi';

const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #fff;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p => p.variant === 'danger' ? '#ef4444' : '#2563eb'};
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  min-height: 100px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
`;

const Field = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const List = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const ListItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Badge = styled.span`
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TouristDashboard = () => {
  const { user } = useAuth();
  const [sendingSOS, setSendingSOS] = useState(false);
  const [alerts, setAlerts] = useState({ incidents: [], sos: [] });
  const [incident, setIncident] = useState({ category: 'other', description: '', photo: null });
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    loadAlerts();
    getLocation();
    const interval = setInterval(loadAlerts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const loadAlerts = async () => {
    try {
      const { data } = await axios.get('/api/alerts');
      setAlerts(data);
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    }
  };

  const sendSOS = async () => {
    try {
      setSendingSOS(true);
      const { lat, lng } = coords || {};
      if (!lat || !lng) {
        await getLocation();
      }
      const body = {
        latitude: (coords?.lat) ?? 0,
        longitude: (coords?.lng) ?? 0,
      };
      const { data } = await axios.post('/api/sos', body);
      alert('SOS sent! ID: ' + data.sosId);
      loadAlerts();
    } catch (e) {
      console.error('SOS failed', e);
      const msg = e.response?.data?.message || 'Failed to send SOS';
      alert(msg);
    } finally {
      setSendingSOS(false);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submitIncident = async (e) => {
    e.preventDefault();
    try {
      if (!incident.description || incident.description.trim().length < 10) {
        alert('Description must be at least 10 characters.');
        return;
      }
      let photoBase64;
      let photoType;
      if (incident.photo) {
        photoBase64 = await toBase64(incident.photo);
        photoType = incident.photo.type;
      }
      const payload = {
        category: incident.category,
        description: incident.description,
        latitude: coords?.lat,
        longitude: coords?.lng,
        photoBase64,
        photoType,
      };
      await axios.post('/api/incident', payload);
      alert('Incident reported');
      setIncident({ category: 'other', description: '', photo: null });
      loadAlerts();
    } catch (e) {
      console.error('Report incident failed', e);
      const msg = e.response?.data?.message || 'Failed to report incident';
      alert(msg);
    }
  };

  return (
    <Container>
      <Header>
        <h2>Welcome, {user?.firstName}!</h2>
        <p>Your safety companion. Use the actions below when needed.</p>
      </Header>

      <Actions>
        <Card>
          <h3><FiLifeBuoy /> Send SOS</h3>
          <p>Sends your current location with your ID to responders.</p>
          <Button onClick={sendSOS} disabled={sendingSOS} variant="danger">
            <FiSend /> {sendingSOS ? 'Sending...' : 'Send SOS'}
          </Button>
          <div style={{ marginTop: '0.5rem', color: '#374151' }}>
            <FiMapPin /> {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Location unavailable'}
          </div>
        </Card>

        <Card>
          <h3><FiFileText /> Report Incident</h3>
          <form onSubmit={submitIncident}>
            <Field>
              <Label>Category</Label>
              <select value={incident.category} onChange={e => setIncident(i => ({ ...i, category: e.target.value }))}>
                <option value="theft">Theft</option>
                <option value="accident">Accident</option>
                <option value="medical">Medical</option>
                <option value="lost_person">Lost Person</option>
                <option value="natural_disaster">Natural Disaster</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field>
              <Label>Description</Label>
              <Textarea value={incident.description} onChange={e => setIncident(i => ({ ...i, description: e.target.value }))} placeholder="Describe the incident..." />
            </Field>
            <Field>
              <Label><FiImage /> Photo (optional)</Label>
              <Input type="file" accept="image/*" onChange={e => setIncident(i => ({ ...i, photo: e.target.files?.[0] || null }))} />
            </Field>
            <div style={{ marginTop: '0.75rem' }}>
              <Button type="submit"><FiSend /> Submit</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3><FiAlertCircle /> Safety Info</h3>
          <p>Emergency numbers, nearby police stations and hospitals.</p>
          <a href="/safety-info" style={{ textDecoration: 'none' }}><Button as="span"><FiLifeBuoy /> Open Safety Info</Button></a>
        </Card>
      </Actions>

      <Card>
        <h3>Latest Incidents</h3>
        <List>
          {alerts.incidents.map(it => (
            <ListItem key={`inc-${it.id}`}>
              <Badge>{(it.status || 'REPORTED').toUpperCase()}</Badge>
              <div>
                <div style={{ fontWeight: 600 }}>{it.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{it.location_name} • {new Date(it.created_at).toLocaleString()}</div>
              </div>
            </ListItem>
          ))}
          {alerts.incidents.length === 0 && (
            <div>No recent alerts</div>
          )}
        </List>
      </Card>
    </Container>
  );
};

export default TouristDashboard;
