import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faChevronRight } from '@fortawesome/free-solid-svg-icons'; // faChevronRight is more direct

const SoulX3Box = () => {
  return (
    // Corresponds to .soul-x3-box
    <div
      className="group w-full max-w-[700px] mt-6 flex items-center justify-between
                 py-4 px-6 cursor-pointer rounded-[50px]
                 backdrop-blur-[var(--glass-backdrop-filter)] border border-[var(--glass-border)]
                 shadow-[var(--glass-shadow)] transition-all duration-[var(--transition-slow)]
                 hover:bg-[var(--glass-hover-bg)] hover:border-[rgba(108,92,231,0.3)]
                 hover:-translate-y-px hover:shadow-[0_12px_40px_var(--glass-shadow),inset_0_1px_0_rgba(255,255,255,0.15)]
                 mx-auto" // Added mx-auto for centering
      role="button"
      tabIndex={0}
      aria-label="Nexus X1 settings"
    >
      <span className="flex items-center">
        {/* Corresponds to .soul-x3-box .icon */}
        <FontAwesomeIcon
          icon={faCog}
          className="text-[20px] text-[var(--text-muted)] mr-3
                     transition-colors duration-[var(--transition-base)]
                     group-hover:text-[var(--primary-accent)]"
        />
        {/* Corresponds to .soul-x3-box span */}
        <span className="text-[18px] font-medium text-[var(--text-light)] flex-grow">
          Nexus X1
        </span>
      </span>
      <FontAwesomeIcon
        icon={faChevronRight}
        className="text-[20px] text-[var(--text-muted)]
                   transition-colors duration-[var(--transition-base)]
                   group-hover:text-[var(--primary-accent)]" // Apply hover to both icons
      />
    </div>
  );
};

export default SoulX3Box;