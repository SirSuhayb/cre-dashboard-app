import React, { useState, useEffect } from 'react';
import { Upload, Mail, Building, Users, Search, Bell, Download, Plus, Eye, Calendar, Filter } from 'lucide-react';
import Papa, { ParseResult } from 'papaparse';

// TypeScript interfaces
interface LLC {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

interface Property {
  id: number;
  address: string;
  owner: string;
  value: string;
  sqft: string;
  type: string;
  status: string;
  source: string;
  llcId: number;
}

interface Client {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  llcId: number;
  propertyIds: number[];
  lastContact: string;
  nextFollowUp: string;
}

interface EmailLead {
  id: number;
  subject: string;
  sender: string;
  extractedInfo: string;
  priority: string;
  date: string;
  status: string;
}

interface FollowUp {
  id: number;
  client: string;
  type: string;
  dueDate: string;
  priority: string;
  notes: string;
}

const CREDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [emailLeads, setEmailLeads] = useState<EmailLead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [llcs, setLlcs] = useState<LLC[]>([]);
  const [propertySearch, setPropertySearch] = useState<string>('');
  const [clientSearch, setClientSearch] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  // Sample data to demonstrate functionality
  useEffect(() => {
    // Sample LLC data
    setLlcs([
      {
        id: 1,
        name: 'Broadway Holdings LLC',
        contact: 'Sarah Johnson',
        email: 'sarah@nashtech.com',
        phone: '(615) 555-0123',
      },
      {
        id: 2,
        name: 'Music City Properties',
        contact: 'Mike Wilson',
        email: 'mike@musicrow.com',
        phone: '(615) 555-0456',
      },
      {
        id: 3,
        name: 'MRV Properties LLC',
        contact: 'Mike Wilson',
        email: 'mike@musicrow.com',
        phone: '(615) 555-0456',
      }
    ]);

    // Sample CSV-imported property data (now with llcId)
    setProperties([
      {
        id: 1,
        address: '123 Broadway, Nashville, TN',
        owner: 'Broadway Holdings LLC',
        value: '$2,500,000',
        sqft: '15,000',
        type: 'Office',
        status: 'Available',
        source: 'CSV Import',
        llcId: 1
      },
      {
        id: 2,
        address: '456 Music Row, Nashville, TN',
        owner: 'Music City Properties',
        value: '$1,800,000',
        sqft: '8,500',
        type: 'Retail',
        status: 'Pending',
        source: 'Nashville.gov',
        llcId: 2
      }
    ]);

    // Sample email-extracted leads
    setEmailLeads([
      {
        id: 1,
        subject: 'Looking for office space downtown',
        sender: 'john@techstartup.com',
        extractedInfo: 'Office space, 5000-10000 sqft, downtown Nashville',
        priority: 'High',
        date: '2025-05-20',
        status: 'New'
      },
      {
        id: 2,
        subject: 'Warehouse availability inquiry',
        sender: 'logistics@shipping.com',
        extractedInfo: 'Warehouse, 25000+ sqft, near I-40',
        priority: 'Medium',
        date: '2025-05-19',
        status: 'Contacted'
      }
    ]);

    // Sample client data (now with llcId and propertyIds)
    setClients([
      {
        id: 1,
        name: 'Nashville Tech Corp',
        contact: 'Sarah Johnson',
        email: 'sarah@nashtech.com',
        phone: '(615) 555-0123',
        llcId: 1,
        propertyIds: [1],
        lastContact: '2025-05-15',
        nextFollowUp: '2025-05-25'
      },
      {
        id: 2,
        name: 'Music Row Ventures',
        contact: 'Mike Wilson',
        email: 'mike@musicrow.com',
        phone: '(615) 555-0456',
        llcId: 3,
        propertyIds: [2],
        lastContact: '2025-05-10',
        nextFollowUp: '2025-05-22'
      }
    ]);

    // Sample follow-ups
    setFollowUps([
      {
        id: 1,
        client: 'Nashville Tech Corp',
        type: 'Follow-up Call',
        dueDate: '2025-05-22',
        priority: 'High',
        notes: 'Discuss downtown office expansion'
      },
      {
        id: 2,
        client: 'Music Row Ventures',
        type: 'Email Campaign',
        dueDate: '2025-05-23',
        priority: 'Medium',
        notes: 'Send retail property listings'
      }
    ]);
  }, []);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file.');
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        try {
          const newLlcs: LLC[] = [...llcs];
          const newProperties: Property[] = [...properties];
          results.data.forEach((row: any) => {
            // Required fields: address, owner, value, sqft, type, status, source
            if (!row.address || !row.owner) return;
            let llc = newLlcs.find(l => l.name === row.owner);
            let llcId: number | undefined;
            if (!llc) {
              llcId = newLlcs.length > 0 ? Math.max(...newLlcs.map(l => l.id)) + 1 : 1;
              llc = {
                id: llcId,
                name: row.owner,
                contact: row.contact || '',
                email: row.email || '',
                phone: row.phone || '',
              };
              newLlcs.push(llc);
            } else {
              llcId = llc.id;
            }
            // Assertion: llcId must exist
            if (typeof llcId !== 'number' || !newLlcs.find(l => l.id === llcId)) {
              throw new Error('LLC ID does not exist for new property.');
            }
            const propertyId = newProperties.length > 0 ? Math.max(...newProperties.map(p => p.id)) + 1 : 1;
            newProperties.push({
              id: propertyId,
              address: row.address,
              owner: row.owner,
              value: row.value || '',
              sqft: row.sqft || '',
              type: row.type || '',
              status: row.status || '',
              source: row.source || 'CSV Import',
              llcId: llcId
            });
          });
          setLlcs(newLlcs);
          setProperties(newProperties);
        } catch (error) {
          setUploadError('An error occurred while processing the CSV file.');
        }
      },
      error: () => {
        setUploadError('An error occurred while reading the CSV file.');
      }
    });
  };

  // Placeholder for email scanning integration
  const scanEmails = () => {
    // TODO: Integrate with email API and parse leads
    // Simulate extraction for now
    console.log('Scanning emails for new leads...');
  };

  // Placeholder for Nashville.gov sync integration
  const syncNashvilleData = () => {
    // TODO: Integrate with Nashville.gov API
    // Simulate sync for now
    console.log('Syncing with Nashville.gov...');
  };

  const TabButton = (props: { tab: string; label: string; icon: React.ElementType; count?: number }) => {
    const { tab, label, icon: Icon, count } = props;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeTab === tab 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Icon size={18} />
        {label}
        {count && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{count}</span>}
      </button>
    );
  };

  const StatCard = (props: { title: string; value: number; icon: React.ElementType; color?: string }) => {
    const { title, value, icon: Icon, color = 'blue' } = props;
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">CRE Agent Dashboard</h1>
            <div className="flex items-center gap-4">
              <Bell className="text-gray-500 cursor-pointer hover:text-gray-700" size={20} />
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton tab="overview" label="Overview" icon={Building} />
          <TabButton tab="properties" label="Properties" icon={Building} count={properties.length} />
          <TabButton tab="leads" label="Email Leads" icon={Mail} count={emailLeads.filter(l => l.status === 'New').length} />
          <TabButton tab="clients" label="Clients" icon={Users} count={clients.length} />
          <TabButton tab="followups" label="Follow-ups" icon={Calendar} count={followUps.length} />
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Properties" value={properties.length} icon={Building} />
              <StatCard title="Active Leads" value={emailLeads.filter(l => l.status === 'New').length} icon={Mail} color="green" />
              <StatCard title="Total Clients" value={clients.length} icon={Users} color="purple" />
              <StatCard title="Pending Follow-ups" value={followUps.length} icon={Calendar} color="orange" />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                  <Upload size={24} className="text-blue-600" />
                  <div>
                    <p className="font-medium">Upload CSV Data</p>
                    <p className="text-sm text-gray-600">Import property or client data</p>
                    {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                  </div>
                  <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </label>
                
                <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50" onClick={scanEmails}>
                  <Mail size={24} className="text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Scan Emails</p>
                    <p className="text-sm text-gray-600">Extract new leads from inbox</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50" onClick={syncNashvilleData}>
                  <Search size={24} className="text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">Sync Nashville Data</p>
                    <p className="text-sm text-gray-600">Update from Nashville.gov</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Mail size={16} className="text-blue-600" />
                  <p className="text-sm">New lead extracted from email: "Looking for office space downtown"</p>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Building size={16} className="text-green-600" />
                  <p className="text-sm">Property data updated from Nashville.gov: 456 Music Row</p>
                  <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Users size={16} className="text-purple-600" />
                  <p className="text-sm">New client onboarded: Nashville Tech Corp</p>
                  <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Properties Database</h2>
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

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Address</th>
                      <th className="text-left p-4 font-medium text-gray-700">Owner/LLC</th>
                      <th className="text-left p-4 font-medium text-gray-700">Value</th>
                      <th className="text-left p-4 font-medium text-gray-700">Sq Ft</th>
                      <th className="text-left p-4 font-medium text-gray-700">Type</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Source</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties
                      .filter(property => {
                        const llc = llcs.find(l => l.id === property.llcId);
                        const search = propertySearch.toLowerCase();
                        return (
                          property.address.toLowerCase().includes(search) ||
                          (llc && llc.name.toLowerCase().includes(search)) ||
                          property.type.toLowerCase().includes(search) ||
                          property.status.toLowerCase().includes(search)
                        );
                      })
                      .map((property) => {
                        const llc = llcs.find(l => l.id === property.llcId);
                        return (
                          <tr key={property.id} className="border-t hover:bg-gray-50">
                            <td className="p-4">{property.address}</td>
                            <td className="p-4">{llc ? llc.name : 'N/A'}</td>
                            <td className="p-4 font-medium">{property.value}</td>
                            <td className="p-4">{property.sqft}</td>
                            <td className="p-4">{property.type}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                property.status === 'Available' ? 'bg-green-100 text-green-800' :
                                property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {property.status}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{property.source}</td>
                            <td className="p-4">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Email Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Email-Extracted Leads</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" onClick={scanEmails}>
                <Mail size={16} />
                Scan New Emails
              </button>
            </div>

            <div className="grid gap-4">
              {emailLeads.map((lead) => (
                <div key={lead.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{lead.subject}</h3>
                      <p className="text-sm text-gray-600">From: {lead.sender}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.priority === 'High' ? 'bg-red-100 text-red-800' :
                        lead.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {lead.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{lead.extractedInfo}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{lead.date}</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Contact
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                        Match Properties
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Client Database</h2>
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
              </div>
            </div>

            <div className="grid gap-6">
              {clients
                .filter(client => {
                  const llc = llcs.find(l => l.id === client.llcId);
                  const search = clientSearch.toLowerCase();
                  return (
                    client.name.toLowerCase().includes(search) ||
                    client.contact.toLowerCase().includes(search) ||
                    (llc && llc.name.toLowerCase().includes(search))
                  );
                })
                .map((client) => {
                  const llc = llcs.find(l => l.id === client.llcId);
                  const clientProperties = properties.filter(p => client.propertyIds.includes(p.id));
                  return (
                    <div key={client.id} className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-gray-600">{client.contact}</p>
                          <p className="text-sm text-gray-500">{client.email} • {client.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Last Contact: {client.lastContact}</p>
                          <p className="text-sm font-medium text-blue-600">Next Follow-up: {client.nextFollowUp}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Associated LLC</p>
                          <p className="text-sm text-gray-600">{llc ? llc.name : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Properties</p>
                          <p className="text-sm text-gray-600">{clientProperties.map(p => p.address).join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Contact
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Send Properties
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Follow-ups Tab */}
        {activeTab === 'followups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Follow-up Schedule</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={16} />
                Add Follow-up
              </button>
            </div>

            <div className="space-y-4">
              {followUps.map((followUp) => (
                <div key={followUp.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{followUp.client}</h3>
                      <p className="text-sm text-gray-600">{followUp.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        followUp.priority === 'High' ? 'bg-red-100 text-red-800' :
                        followUp.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {followUp.priority}
                      </span>
                      <span className="text-sm font-medium text-blue-600">{followUp.dueDate}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{followUp.notes}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Complete
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Reschedule
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CREDashboard;

// TEST COVERAGE NOTE:
// Add tests for:
// - CSV parsing and error handling
// - Relational linking between properties, clients, and LLCs
// - UI state updates and search/filter logic
// Use a framework like Jest and React Testing Library for component and logic tests.