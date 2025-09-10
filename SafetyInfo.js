import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiPhone, FiMail, FiMapPin, FiBookOpen } from 'react-icons/fi';

const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Section = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
`;

const List = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const Item = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  display: grid;
  gap: 0.25rem;
`;

const SafetyInfo = () => {
  const [contacts, setContacts] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/alerts/emergency-contacts');
        setContacts(data.contacts || []);
        setTips(data.tips || []);
      } catch (e) {
        console.error('Failed to load safety info', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Container>Loading safety info...</Container>;

  return (
    <Container>
      <Section>
        <Title>Emergency Numbers</Title>
        <List>
          {contacts.map(c => (
            <Item key={c.id}>
              <div style={{ fontWeight: 600 }}>{c.name} {c.department ? `• ${c.department}` : ''}</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#374151' }}>
                <span><FiPhone /> {c.phone}</span>
                {c.email && <span><FiMail /> {c.email}</span>}
                {c.location_id && <span><FiMapPin /> Location #{c.location_id}</span>}
              </div>
            </Item>
          ))}
          {contacts.length === 0 && <div>No emergency contacts available.</div>}
        </List>
      </Section>

      <Section>
        <Title>Safety Tips</Title>
        <List>
          {tips.map(t => (
            <Item key={t.id}>
              <div style={{ fontWeight: 600 }}><FiBookOpen /> {t.title}</div>
              <div style={{ color: '#374151' }}>{t.content}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Category: {t.category}</div>
            </Item>
          ))}
          {tips.length === 0 && <div>No tips available.</div>}
        </List>
      </Section>
    </Container>
  );
};

export default SafetyInfo;
