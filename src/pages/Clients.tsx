import React, { useState, useEffect } from 'react';
import { Users, Plus, Filter, Search, Building, Mail, Phone, MapPin, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainNavigation from '../components/MainNavigation';
import { Client, Property } from '../types';
import {
  getPropertyDisplayAddress,
  getPropertyOwnerDisplay,
  getPropertyValueDisplay,
  getPropertyDetailsDisplay,
  getPropertySqftDisplay,
  getPropertyUnitsDisplay,
} from '../utils/propertyDisplay';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clientSearch, setClientSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Load data from localStorage
    const storedClients = localStorage.getItem('clients');
    const storedProperties = localStorage.getItem('properties');
    
    if (storedClients) {
      try {
        const parsedClients = JSON.parse(storedClients);
        setClients(Array.isArray(parsedClients) ? parsedClients : []);
      } catch (error) {
        console.error('Error parsing clients from localStorage:', error);
        setClients([]);
      }
    }

    if (storedProperties) {
      try {
        const parsedProperties = JSON.parse(storedProperties);
        setProperties(Array.isArray(parsedProperties) ? parsedProperties : []);
      } catch (error) {
        console.error('Error parsing properties from localStorage:', error);
        setProperties([]);
      }
    }
  }, []);

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    if (!client) return false;
    const search = clientSearch.toLowerCase();
    const clientProperties = properties.filter(p => 
      p && client.propertyIds && Array.isArray(client.propertyIds) && client.propertyIds.includes(p.id)
    );
    
    return (
      (client.name || '').toLowerCase().includes(search) ||
      (client.contactName || '').toLowerCase().includes(search) ||
      (client.emailAddress || '').toLowerCase().includes(search) ||
      (client.phoneNumber || '').toLowerCase().includes(search) ||
      (client.type || '').toLowerCase().includes(search) ||
      (client.status || '').toLowerCase().includes(search) ||
      (client.companyName || '').toLowerCase().includes(search) ||
      clientProperties.some(p => 
        p && (
          (p.situsAddress || '').toLowerCase().includes(search) ||
          (p.propertyUse || '').toLowerCase().includes(search)
        )
      )
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get properties for a client
  const getClientProperties = (clientId: number) => {
    if (!clientId) return [];
    return properties.filter(p => 
      p && p.ownerId === clientId
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation clientsCount={clients.length} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clients Database</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search clients..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={16} />
              Add Client
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {paginatedClients.map((client) => {
            const clientProperties = getClientProperties(client.id);
            return (
              <div key={client.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link to={`/client/${client.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                      {client.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        client.type === 'Company' ? 'bg-blue-100 text-blue-800' :
                        client.type === 'LLC' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {client.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        client.status === 'Active' ? 'bg-green-100 text-green-800' :
                        client.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last Contact: {new Date(client.lastContact).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-blue-600">Next Follow-up: {new Date(client.nextFollowUp).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-gray-400" />
                        <span>{client.phoneNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        <span>{client.emailAddress || 'N/A'}</span>
                      </div>
                      {client.cellPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          <span>{client.cellPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Information */}
                  {client.type !== 'Individual' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Company Information</h3>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{client.companyName}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span>
                            {[client.companyCity, client.companyState, client.companyZip]
                              .filter(Boolean)
                              .join(', ') || 'N/A'}
                          </span>
                        </div>
                        {client.companyType && (
                          <div className="text-sm text-gray-600">{client.companyType}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Properties */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Properties ({clientProperties.length})</h3>
                    <div className="space-y-1">
                      {clientProperties.slice(0, 2).map(property => (
                        <div key={property.id} className="flex items-center gap-2 text-sm">
                          <Building size={14} className="text-gray-400" />
                          <Link to={`/property/${property.id}`} className="hover:text-blue-600">
                            {getPropertyDisplayAddress(property)}
                          </Link>
                          <span className="ml-2 text-xs text-gray-500">Owner: {getPropertyOwnerDisplay(property)}</span>
                        </div>
                      ))}
                      {clientProperties.length > 2 && (
                        <div className="text-sm text-blue-600 hover:text-blue-800">
                          +{clientProperties.length - 2} more properties
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag size={14} className="text-gray-400" />
                        {client.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Contact
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Send Properties
                    </button>
                    <Link
                      to={`/client/${client.id}`}
                      className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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

export default Clients; 