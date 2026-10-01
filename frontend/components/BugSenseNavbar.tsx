'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';

export default function BugSenseNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  return (
    <>
      {/* Fixed Navbar Top (z-index 100) */}
      <header className="bugsense-navbar-container">
        <div className="bugsense-navbar">
          {/* Left: Our Official BugSense Logo + Typographic Identity */}
          <Link href="/" className="bugsense-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }}
            >
              <img 
                src="/bugsense-icon.png" 
                alt="BugSense Official Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.06em', color: 'var(--text)' }}>
                Bug
              </span>
              <span className="bugsense-logo-text" style={{ fontSize: '28px' }}>
                Sense
              </span>
              <sup className="bugsense-logo-reg">&reg;</sup>
            </div>
          </Link>

          {/* Right: "Menu" pill button with ChevronUp icon */}
          <button 
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="bugsense-menu-btn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={drawerOpen}
          >
            <span>Menu</span>
            <ChevronUp className={`bugsense-menu-icon ${drawerOpen ? 'open' : ''}`} />
          </button>
        </div>
      </header>

      {/* Full-screen drawer overlay on click: white bg, fade transition 0.4s */}
      <div className={`bugsense-drawer ${drawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="/bugsense-icon.png" alt="BugSense" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Autonomous Bug Triage &bull; GENAI-23
          </span>
        </div>

        <div className="bugsense-drawer-links">
          <Link 
            href="/dashboard" 
            onClick={() => setDrawerOpen(false)}
            className="bugsense-drawer-link"
          >
            Triage Dashboard
          </Link>
          <Link 
            href="/demo" 
            onClick={() => setDrawerOpen(false)}
            className="bugsense-drawer-link"
          >
            4-Scenario Demo Lab
          </Link>
          <Link 
            href="/bugs" 
            onClick={() => setDrawerOpen(false)}
            className="bugsense-drawer-link"
          >
            All Bug Tickets
          </Link>
          <Link 
            href="/bugs/new" 
            onClick={() => setDrawerOpen(false)}
            className="bugsense-drawer-link"
          >
            Submit Bug Report
          </Link>
          <Link 
            href="/admin" 
            onClick={() => setDrawerOpen(false)}
            className="bugsense-drawer-link"
          >
            Admin &amp; Team
          </Link>
          <Link 
            href="#architecture" 
            onClick={() => setDrawerOpen(false)}
            className="bugsense-drawer-link"
          >
            Multi-Agent Architecture
          </Link>
        </div>

        <div className="bugsense-drawer-footer">
          <div>&copy; {new Date().getFullYear()} BugSense &bull; Autonomous Bug Triage Engine. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="bugsense-green-dot" />
            <span>4 Autonomous AI Agents Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
