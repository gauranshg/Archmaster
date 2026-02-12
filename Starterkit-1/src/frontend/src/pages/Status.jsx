import React, { useState, useEffect } from 'react';

function Status() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStatusData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching health status: {error}</div>;
  }

  // Helper to format service names from the keys
  const formatServiceName = (key) => {
    return key.replace(/_status$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const { key_vault_name, ...services } = statusData || {};

  return (
    <div>
      <h1>System Status</h1>
      {key_vault_name && key_vault_name !== "Not configured" && (
        <p><strong>Key Vault:</strong> {key_vault_name}</p>
      )}

      {services ? (
        <ul>
          {Object.entries(services).map(([key, status]) => {
            // We don't need to show the key_vault_name again in the list
            if (key === 'key_vault_name') return null;

            return (
              <li key={key}>
                <strong>{formatServiceName(key)}:</strong> {status}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No status information available.</p>
      )}
    </div>
  );
}

export default Status;
