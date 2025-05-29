import React from 'react';
import { useParams } from 'react-router-dom';

const PropertyDetail = () => {
  const { id } = useParams();
  return (
    <div style={{ padding: 32 }}>
      <h1 className="text-2xl font-bold mb-4">Property Detail</h1>
      <p>Property ID: {id}</p>
      {/* TODO: Show property details and add edit/delete functionality */}
    </div>
  );
};

export default PropertyDetail; 