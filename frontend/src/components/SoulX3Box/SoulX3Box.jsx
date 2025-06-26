import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faChevronRight } from '@fortawesome/free-solid-svg-icons'; // faChevronRight is more direct

const SoulX3Box = () => {
  return (
    <div className="soul-x3-box"> {/* This class will apply the dark-glassmorphism styling */}
      <FontAwesomeIcon icon={faCog} className="icon" />
      <span>Nexus X1</span>
      <FontAwesomeIcon icon={faChevronRight} className="icon" /> {/* Right-pointing arrow */}
    </div>
  );
};

export default SoulX3Box;