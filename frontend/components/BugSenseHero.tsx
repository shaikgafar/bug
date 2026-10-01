'use client';

import React from 'react';
import Link from 'next/link';

export default function BugSenseHero() {
  // 20 lines left, 20 lines right
  // widths from 60px increasing by 10px per line
  // animationDelay: i * 0.25s
  const lineCount = 20;
  const lines = Array.from({ length: lineCount }, (_, i) => ({
    id: i,
    width: `${60 + i * 10}px`,
    delay: `${(i * 0.25).toFixed(2)}s`,
  }));

  // Top horizontal lines for mobile (<810px)
  const mobileTopLines = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    height: `${40 + i * 16}px`,
    delay: `${(i * 0.3).toFixed(2)}s`,
  }));

  // Ticker marquee items (4x duplicated for seamless infinite loop)
  const tickerItems = [
    'Autonomous Triage',
    'ChromaDB Vectors',
    'Selenium Repro',
    'Git Blame Routing',
    'Defect Intelligence',
    'Zero Bottlenecks',
    'Headless Verification',
    'Deterministic Contracts',
  ];

  // Engineering tools with distinct font typography
  const trustedTools = [
    { name: 'GitHub', className: 'brand-shopify' },
    { name: 'Jira', className: 'brand-linear' },
    { name: 'Slack', className: 'brand-slack' },
    { name: 'Linear', className: 'brand-linear' },
    { name: 'Chrome', className: 'brand-figma' },
    { name: 'Selenium', className: 'brand-framer' },
    { name: 'Sentry', className: 'brand-webflow' },
    { name: 'Stripe', className: 'brand-stripe' },
    { name: 'Docker', className: 'brand-shopify' },
    { name: 'Vercel', className: 'brand-vercel' },
  ];

  return (
    <>
      {/* Hero Section Container */}
      <section className="bugsense-hero">
        {/* Curved Line Animations (Left: 20 lines) */}
        <div className="bugsense-lines-left" aria-hidden="true">
          {lines.map((line) => (
            <div
              key={`left-${line.id}`}
              className="bugsense-curved-line left"
              style={{
                width: line.width,
                animationDelay: line.delay,
              }}
            />
          ))}
        </div>

        {/* Curved Line Animations (Right: 20 lines) */}
        <div className="bugsense-lines-right" aria-hidden="true">
          {lines.map((line) => (
            <div
              key={`right-${line.id}`}
              className="bugsense-curved-line right"
              style={{
                width: line.width,
                animationDelay: line.delay,
              }}
            />
          ))}
        </div>

        {/* Mobile (<810px) Top Horizontal Lines */}
        <div className="bugsense-lines-top" aria-hidden="true">
          {mobileTopLines.map((line) => (
            <div
              key={`top-${line.id}`}
              className="bugsense-curved-line-h"
              style={{
                height: line.height,
                animationDelay: line.delay,
              }}
            />
          ))}
        </div>

        {/* Central Content Stack */}
        <div className="bugsense-hero-content">
          {/* Ticker Row with Edge Fade Mask */}
          <div className="bugsense-ticker-wrapper" style={{ maxWidth: '540px' }}>
            <div className="bugsense-ticker-track">
              {/* 4x duplicated rows for seamless infinite marquee */}
              {[...Array(4)].map((_, repIdx) => (
                <React.Fragment key={`rep-${repIdx}`}>
                  {tickerItems.map((item, itemIdx) => (
                    <span key={`ticker-${repIdx}-${itemIdx}`} className="bugsense-ticker-item">
                      {item}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="bugsense-title" style={{ maxWidth: '620px' }}>
            Autonomous bug triage <span className="bugsense-title-serif">bugsense</span>
            <sup className="bugsense-title-reg">&reg;</sup> on demand.
          </h1>

          {/* Subtitle */}
          <p className="bugsense-subtitle" style={{ maxWidth: '520px' }}>
            A flexible multi-agent intelligence partnership for engineering teams who want production defects triaged, reproduced, and routed on their timeline.
          </p>

          {/* CTA Row */}
          <div className="bugsense-cta-row">
            {/* Primary Button */}
            <Link href="/dashboard" className="bugsense-btn-primary">
              Open Triage Dashboard
            </Link>

            {/* Book/Demo Button with Our Official Robot Avatar */}
            <Link href="/demo" className="bugsense-btn-book">
              <img
                src="/bugsense-icon.png"
                alt="BugSense AI Agent"
                className="bugsense-book-avatar"
                style={{ backgroundColor: '#0a0a0a', padding: '4px' }}
              />
              <div className="bugsense-book-text">
                <span className="bugsense-book-primary">Launch 4-Scenario Demo</span>
                <span className="bugsense-book-secondary">
                  <span className="bugsense-green-dot" />
                  <span>4 AI Agents Online</span>
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Progressive Blur Layer at bottom of hero */}
        <div className="bugsense-progressive-blur" aria-hidden="true" />
      </section>

      {/* TrustedBy Section */}
      <section className="bugsense-trusted-section">
        <div className="bugsense-trusted-label">
          Integrated with top-tier engineering tools globally
        </div>

        <div className="bugsense-trusted-marquee-wrapper">
          <div className="bugsense-trusted-track">
            {/* Duplicated 2x for seamless continuous loop */}
            {[...trustedTools, ...trustedTools].map((tool, idx) => (
              <span key={`tool-${idx}`} className={`bugsense-trusted-item ${tool.className}`}>
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
