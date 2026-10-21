import React from 'react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
        <p><strong>Post-Operative Remote Recovery Tracker & Wound Evaluation Portal</strong> — College Mini Project</p>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Academic Prototype | Built with React, Flask, MySQL & Demo AI Assessor Module | Not for certified medical diagnosis.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
