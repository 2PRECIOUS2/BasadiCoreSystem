import React from 'react';

const PowerBIReport = () => (
  <div style={{ width: '100%', height: '600px' }}>
    <iframe
      title="Final Basadi Core Reports"
      width="100%"
      height="600"
      src="https://app.powerbi.com/reportEmbed?reportId=dee67143-c29b-42bb-869d-e76160376810&autoAuth=true&ctid=4b1b908c-5582-4377-ba07-a36d65e34934&actionBarEnabled=true"
      allowFullScreen={true}
    />
  </div>
);

export default PowerBIReport;