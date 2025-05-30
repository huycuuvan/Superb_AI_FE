import React from 'react';

const InfiniteLogoScroll: React.FC = () => {
  return (
    <div className="w-full overflow-hidden bg-white py-8">
      <div className="flex whitespace-nowrap">
        {/* First set of logos */}
        <div className="flex items-center space-x-16 animate-scroll">
          <img src="/logos/deloitte.svg" alt="Deloitte" className="h-8 w-auto" />
          <img src="/logos/microsoft.svg" alt="Microsoft" className="h-8 w-auto" />
          <img src="/logos/accenture.svg" alt="Accenture" className="h-8 w-auto" />
          <img src="/logos/hubspot.svg" alt="HubSpot" className="h-8 w-auto" />
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex items-center space-x-16 animate-scroll">
          <img src="/logos/deloitte.svg" alt="Deloitte" className="h-8 w-auto" />
          <img src="/logos/microsoft.svg" alt="Microsoft" className="h-8 w-auto" />
          <img src="/logos/accenture.svg" alt="Accenture" className="h-8 w-auto" />
          <img src="/logos/hubspot.svg" alt="HubSpot" className="h-8 w-auto" />
        </div>
      </div>
    </div>
  );
};

export default InfiniteLogoScroll; 