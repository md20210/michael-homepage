// src/components/AILogo.jsx
import './AILogo.css';

export default function AILogo({ size = 'small' }) {
  return (
    <div className={`ai-logo ${size}`}>
      <div className="orb">
        <div className="pulse"></div>
        <div className="pulse"></div>
        <div className="pulse"></div>
        <span className="ai-text">AI</span>
      </div>
      <div className="floating-nodes">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
