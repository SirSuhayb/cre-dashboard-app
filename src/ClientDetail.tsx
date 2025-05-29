import React from 'react';
import { useParams } from 'react-router-dom';

const ClientDetail = () => {
  const { id } = useParams();
  return (
    <div style={{ padding: 32 }}>
      <h1 className="text-2xl font-bold mb-4">Client Detail</h1>
      <p>Client ID: {id}</p>
      {/* TODO: Show client details and add edit/delete functionality */}
    </div>
  );
};

export default ClientDetail; 