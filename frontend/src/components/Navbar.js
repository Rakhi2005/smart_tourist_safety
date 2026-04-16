import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
  FiHome,
  FiAlertTriangle,
  FiShield,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';

const NavbarContainer = styled.nav`
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 64px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  
  &:hover {
    color: #60a5fa;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1e293b;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.$active ? '#60a5fa' : '#e2e8f0'};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1001;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ef4444;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #fef2f2;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

 

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Build nav items based on role
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin
    ? [
        { path: '/', label: 'Dashboard', icon: FiHome },
        { path: '/incidents', label: 'Incidents', icon: FiAlertTriangle },
        { path: '/safety-alerts', label: 'Safety Alerts', icon: FiShield },
      ]
    : [
        { path: '/', label: 'Dashboard', icon: FiHome },
        { path: '/safety-alerts', label: 'Safety Alerts', icon: FiShield },
      ];

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">
          <FiShield />
          Smart Tourist Safety
        </Logo>

        <NavLinks $isOpen={isMenuOpen}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                $active={isActive(item.path)}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon />
                {item.label}
              </NavLink>
            );
          })}
        </NavLinks>

        <UserMenu>
          <UserInfo onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <UserAvatar>
              {getInitials(user?.firstName, user?.lastName)}
            </UserAvatar>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </UserInfo>

          <Dropdown $isOpen={isDropdownOpen}>
            <DropdownItem to="/profile" onClick={() => setIsDropdownOpen(false)}>
              <FiUser />
              Profile
            </DropdownItem>
            {user?.role === 'admin' && (
              <DropdownItem to="/admin" onClick={() => setIsDropdownOpen(false)}>
                <FiSettings />
                Admin Panel
              </DropdownItem>
            )}
            <LogoutButton onClick={handleLogout}>
              <FiLogOut />
              Logout
            </LogoutButton>
          </Dropdown>
        </UserMenu>

        <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;
