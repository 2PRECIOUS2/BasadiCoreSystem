import React from 'react';

const PowerBIReports = () => (
  <div style={{ width: '100%', height: '600px' }}>
    <iframe
      title="Final Basadi Core Reports"
      width="1140"
      height="541.25"
      src="https://app.powerbi.com/reportEmbed?reportId=df8ae8f0-6fe3-4043-8d84-7ebae46c4a03&autoAuth=true&ctid=4b1b908c-5582-4377-ba07-a36d65e34934"
      frameBorder="0"
      allowFullScreen={true}
    />
  </div>
);

export default PowerBIReports;