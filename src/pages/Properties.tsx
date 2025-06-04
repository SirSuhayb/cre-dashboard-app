import React, { useState, useEffect } from 'react';
import { Building, Plus, Filter, Search, Users, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainNavigation from '../components/MainNavigation';
import { Property, Company, Agent } from '../types';

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [propertySearch, setPropertySearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Load data from localStorage
    const storedProperties = localStorage.getItem('properties');
    const storedCompanies = localStorage.getItem('clients');
    const storedAgents = localStorage.getItem('agents');

    if (storedProperties) {
      try {
        const parsedProperties = JSON.parse(storedProperties);
        setProperties(Array.isArray(parsedProperties) ? parsedProperties : []);
      } catch (error) {
        console.error('Error parsing properties from localStorage:', error);
        setProperties([]);
      }
    }

    if (storedCompanies) {
      try {
        const parsedCompanies = JSON.parse(storedCompanies);
        setCompanies(Array.isArray(parsedCompanies) ? parsedCompanies : []);
      } catch (error) {
        console.error('Error parsing companies from localStorage:', error);
        setCompanies([]);
      }
    }

    if (storedAgents) {
      try {
        const parsedAgents = JSON.parse(storedAgents);
        setAgents(Array.isArray(parsedAgents) ? parsedAgents : []);
      } catch (error) {
        console.error('Error parsing agents from localStorage:', error);
        setAgents([]);
      }
    }
  }, []);

  // Filter properties based on search
  const filteredProperties = properties.filter(property => {
    const company = companies.find(c => c.id === property.companyId);
    const agent = agents.find(a => a.properties.includes(property.id));
    const search = propertySearch.toLowerCase();
    
    return (
      (property.situsAddress || '').toLowerCase().includes(search) ||
      (property.address || '').toLowerCase().includes(search) ||
      (company?.name || '').toLowerCase().includes(search) ||
      (property.propertyUse || '').toLowerCase().includes(search) ||
      (property.status || '').toLowerCase().includes(search) ||
      (property.contactName || '').toLowerCase().includes(search) ||
      (property.phoneNumber || '').toLowerCase().includes(search) ||
      (property.emailAddress || '').toLowerCase().includes(search) ||
      (agent?.name || '').toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get company for a property
  const getPropertyCompany = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? companies.find(c => c.id === property.companyId) : null;
  };

  // Get agent for a property
  const getPropertyAgent = (propertyId: number) => {
    return agents.find(a => a.properties.includes(propertyId));
  };

  // Get other properties owned by the same company
  const getCompanyProperties = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return [];
    return properties.filter(p => p.companyId === property.companyId && p.id !== propertyId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation propertiesCount={properties.length} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Properties Database</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search properties..."
              value={propertySearch}
              onChange={e => setPropertySearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={16} />
              Add Property
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProperties.map((property) => {
                const company = getPropertyCompany(property.id);
                const agent = getPropertyAgent(property.id);
                const companyProperties = getCompanyProperties(property.id);
                
                return (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <Link to={`/property/${property.id}`} className="text-blue-600 hover:text-blue-800">
                        <div className="text-sm font-medium">{property.situsAddress || property.address}</div>
                        <div className="text-sm text-gray-500">{property.situsCity}, {property.situsState} {property.zipCode}</div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">
                          {company ? (
                            <Link to={`/client/${company.id}`} className="hover:text-blue-600">
                              {company.name}
                            </Link>
                          ) : (
                            property.ownerName || 'N/A'
                          )}
                        </div>
                        {companyProperties.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {companyProperties.length} other properties
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">{property.propertyValue || property.value}</div>
                      <div className="text-sm text-gray-500">Land: {property.landValue}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">{property.propertyUse || property.type}</div>
                      <div className="text-sm text-gray-500">
                        {property.buildingSquareFootage || property.sqft} sqft • {property.numberOfUnits} units
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'Available' ? 'bg-green-100 text-green-800' :
                        property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {property.status}
                      </span>
                      {property.mlsStatus && (
                        <div className="text-sm text-gray-500 mt-1">{property.mlsStatus}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">{property.contactName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{property.phoneNumber || property.cellPhone || ''}</div>
                      <div className="text-sm text-gray-500">{property.emailAddress || ''}</div>
                    </td>
                    <td className="p-4">
                      {agent ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                          <div className="text-sm text-gray-500">{agent.phone}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No agent assigned</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties; 