import React, { useState, useEffect } from 'react';
import { Upload, Mail, Building, Users, Search, Bell, Download, Plus, Eye, Calendar, Filter } from 'lucide-react';
import Papa, { ParseResult } from 'papaparse';
import { get as levenshteinGet } from 'fast-levenshtein';

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

const normalizeName = (name: string) => String(name ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Fuzzy deduplication helpers using Levenshtein distance
const LEVENSHTEIN_THRESHOLD = 3;

function dedupeLlcs(llcs: LLC[]): LLC[] {
  const result: LLC[] = [];
  for (const llc of llcs) {
    const normName = normalizeName(llc.name);
    if (!result.some(existing => levenshteinGet(normName, normalizeName(existing.name)) <= LEVENSHTEIN_THRESHOLD)) {
      result.push(llc);
    }
  }
  return result;
}

function dedupeClients(clients: Client[]): Client[] {
  const result: Client[] = [];
  for (const client of clients) {
    const normName = normalizeName(client.name) + '|' + client.llcId;
    if (!result.some(existing => levenshteinGet(normName, normalizeName(existing.name) + '|' + existing.llcId) <= LEVENSHTEIN_THRESHOLD)) {
      result.push(client);
    }
  }
  return result;
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

  // Load from localStorage on mount and deduplicate
  useEffect(() => {
    const storedLlcs = localStorage.getItem('llcs');
    const storedProperties = localStorage.getItem('properties');
    const storedClients = localStorage.getItem('clients');
    if (storedLlcs) {
      const llcsParsed = JSON.parse(storedLlcs);
      const dedupedLlcs = dedupeLlcs(llcsParsed);
      setLlcs(dedupedLlcs);
      localStorage.setItem('llcs', JSON.stringify(dedupedLlcs));
    }
    if (storedProperties) setProperties(JSON.parse(storedProperties));
    if (storedClients) {
      const clientsParsed = JSON.parse(storedClients);
      const dedupedClients = dedupeClients(clientsParsed);
      setClients(dedupedClients);
      localStorage.setItem('clients', JSON.stringify(dedupedClients));
    }
  }, []);

  // Persist to localStorage on change (deduplicate before saving)
  useEffect(() => {
    const dedupedLlcs = dedupeLlcs(llcs);
    localStorage.setItem('llcs', JSON.stringify(dedupedLlcs));
  }, [llcs]);
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);
  useEffect(() => {
    const dedupedClients = dedupeClients(clients);
    localStorage.setItem('clients', JSON.stringify(dedupedClients));
  }, [clients]);

  // Sample data to demonstrate functionality
  useEffect(() => {
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

  // Helper to process a single CSV row based on file type
  function processCSVRow(row: any, fileType: string, allLlcs: LLC[], allClients: Client[], allProperties: Property[]) {
    // Normalize row keys/values
    const cleanRow = Object.fromEntries(
      Object.entries(row)
        .filter(([_, value]) => value != null && value !== '')
        .map(([key, value]) => [
          key.replace(/\0/g, '').trim(),
          String(value).replace(/\0/g, '').trim()
        ])
    ) as Record<string, string>;

    if (fileType === 'company') {
      const companyName = cleanRow.company || '';
      if (!companyName) return;
      const normalizedCompanyName = normalizeName(companyName);
      let llc: LLC | undefined = allLlcs.find(l => normalizeName(l.name) === normalizedCompanyName);
      if (!llc) {
        const llcId = allLlcs.length > 0 ? Math.max(...allLlcs.map(l => l.id)) + 1 : 1;
        llc = {
          id: llcId,
          name: companyName,
          contact: '',
          email: '',
          phone: cleanRow.phone || '',
        };
        allLlcs.push(llc);
      } else {
        if (cleanRow.phone && !llc.phone) llc.phone = cleanRow.phone;
      }
      const existingClient = allClients.find(c => normalizeName(c.name) === normalizedCompanyName && c.llcId === llc!.id);
      if (!existingClient) {
        const clientId = allClients.length > 0 ? Math.max(...allClients.map(c => c.id)) + 1 : 1;
        const newClient: Client = {
          id: clientId,
          name: companyName,
          contact: '',
          email: '',
          phone: cleanRow.phone || '',
          llcId: llc!.id,
          propertyIds: [],
          lastContact: new Date().toISOString().split('T')[0],
          nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        allClients.push(newClient);
      }
    } else if (fileType === 'property') {
      const address = cleanRow.address || cleanRow['property name'] || '';
      const owner = cleanRow['owner.company'] || cleanRow['property name'] || '';
      if (!address || !owner) return;
      const formattedAddress = address.includes(',') ? address : `${address}, ${cleanRow.city || 'Nashville'}, TN`;
      let llc = allLlcs.find(l => l.name.toLowerCase() === owner.toLowerCase());
      let llcId: number | undefined;
      if (!llc) {
        llcId = allLlcs.length > 0 ? Math.max(...allLlcs.map(l => l.id)) + 1 : 1;
        llc = {
          id: llcId,
          name: owner,
          contact: cleanRow['owner.contact name'] || '',
          email: '',
          phone: cleanRow['owner.phone'] || cleanRow['owner (contact).mobile'] || '',
        };
        allLlcs.push(llc);
      } else {
        llcId = llc.id;
      }
      const propertyId = allProperties.length > 0 ? Math.max(...allProperties.map(p => p.id)) + 1 : 1;
      const newProperty: Property = {
        id: propertyId,
        address: formattedAddress,
        owner: owner,
        value: '',
        sqft: cleanRow['building sf'] || '',
        type: cleanRow['property type'] || '',
        status: 'Available',
        source: 'CSV Import',
        llcId: llcId!
      };
      allProperties.push(newProperty);
    } else if (fileType === 'contact') {
      const contactName = cleanRow.name || `${cleanRow['first name'] || ''} ${cleanRow['last name'] || ''}`.trim();
      const companyName = cleanRow.company || '';
      if (!contactName && !companyName) return;
      let llc = allLlcs.find(l => l.name.toLowerCase() === companyName.toLowerCase());
      if (llc) {
        llc.contact = contactName;
        llc.phone = cleanRow['direct line'] || cleanRow.mobile || llc.phone;
        llc.email = cleanRow.email || llc.email;
      } else if (companyName) {
        const llcId = allLlcs.length > 0 ? Math.max(...allLlcs.map(l => l.id)) + 1 : 1;
        llc = {
          id: llcId,
          name: companyName,
          contact: contactName,
          email: cleanRow.email || '',
          phone: cleanRow['direct line'] || cleanRow.mobile || '',
        };
        allLlcs.push(llc);
      }
    }
    // Add project logic if needed
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('CSV upload started');
    setUploadError('');
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No file selected');
      setUploadError('Please select a file to upload.');
      return;
    }

    const file = files[0];
    console.log('File selected:', file.name, 'Size:', file.size);
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      console.log('Invalid file type:', file.name);
      setUploadError('Please upload a valid CSV file.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      setUploadError('File size must be less than 10MB.');
      return;
    }

    // Show loading state
    const loadingMessage = 'Processing CSV file...';
    setUploadError(loadingMessage);
    console.log('Starting CSV parsing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => {
        // Remove null bytes and clean the header
        return header
          .replace(/\0/g, '')
          .replace(/^"|"$/g, '')
          .trim()
          .toLowerCase();
      },
      dynamicTyping: true,
      transform: (value: string) => {
        if (value === null || value === undefined) return '';
        // Clean the value by removing null bytes, extra quotes, and trimming
        return String(value)
          .replace(/\0/g, '')
          .replace(/^"|"$/g, '')
          .trim();
      },
      comments: false,
      complete: (results: ParseResult<any>) => {
        console.log('CSV parsing complete:', results);
        try {
          // Log the headers we found
          console.log('CSV Headers:', results.meta.fields);
          
          // Only treat as error if it's not a field count mismatch
          const fieldCountError = results.errors.find(e => 
            e.message.includes('Too many fields') || 
            e.message.includes('Too few fields')
          );
          if (fieldCountError) {
            console.log('Field count mismatch detected, continuing with processing...');
          } else if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            setUploadError(`Error parsing CSV: ${results.errors[0].message}`);
            return;
          }

          if (results.data.length === 0) {
            console.log('Empty CSV file');
            setUploadError('The CSV file is empty.');
            return;
          }

          // Determine file type based on headers
          const headers = results.meta.fields || [];
          let fileType: 'property' | 'company' | 'contact' | 'project' = 'property';
          
          if (headers.includes('company_key')) {
            fileType = 'company';
          } else if (headers.includes('contact_key')) {
            fileType = 'contact';
          } else if (headers.includes('project_key')) {
            fileType = 'project';
          }

          console.log('Detected file type:', fileType);

          let processedCount = 0;
          let skippedCount = 0;

          if (fileType === 'project') {
            let newLlcs = [...llcs];
            let newProperties = [...properties];
            let maxLlcId = newLlcs.length > 0 ? Math.max(...newLlcs.map(l => l.id)) : 0;
            let maxPropertyId = newProperties.length > 0 ? Math.max(...newProperties.map(p => p.id)) : 0;
            results.data.forEach((row: any, index: number) => {
              console.log(`Processing row ${index + 1}:`, row);
              
              // Use cleanRow for project and property, row for company/contact
              const cleanRow = Object.fromEntries(
                Object.entries(row)
                  .filter(([_, value]) => value != null && value !== '')
                  .map(([key, value]) => [
                    key.replace(/\0/g, '').trim(),
                    String(value).replace(/\0/g, '').trim()
                  ])
              ) as Record<string, string>;

              if (Object.keys(cleanRow).length === 0) {
                console.log(`Skipping empty row ${index + 1}`);
                skippedCount++;
                return;
              }

              const projectName = cleanRow.project || '';
              const clientCompany = cleanRow['client.company'] || '';
              const clientContact = cleanRow['client.contact name'] || '';
              const clientPhone = cleanRow['client.phone'] || '';
              const clientEmail = cleanRow['client.email'] || '';
              
              if (!projectName && !clientCompany) {
                console.log(`Skipping project row ${index + 1} - missing project name and client company`);
                skippedCount++;
                return;
              }

              if (clientCompany) {
                let llc = newLlcs.find(l => l.name.toLowerCase() === clientCompany.toLowerCase());
                if (!llc) {
                  maxLlcId++;
                  llc = {
                    id: maxLlcId,
                    name: clientCompany,
                    contact: clientContact,
                    email: clientEmail,
                    phone: clientPhone,
                  };
                  newLlcs.push(llc);
                  console.log('Created new LLC from project:', llc);
                  processedCount++;
                } else {
                  if (clientContact) llc.contact = clientContact;
                  if (clientEmail) llc.email = clientEmail;
                  if (clientPhone) llc.phone = clientPhone;
                  console.log('Updated existing LLC from project:', llc);
                  processedCount++;
                }
              }

              const propertyName = cleanRow['listing.property name'] || '';
              const propertyCity = cleanRow['listing.city'] || '';
              if (propertyName) {
                maxPropertyId++;
                const llc = newLlcs.find(l => l.name.toLowerCase() === clientCompany.toLowerCase());
                if (!llc) {
                  console.log(`Skipping property creation - no LLC found for company: ${clientCompany}`);
                  skippedCount++;
                  return;
                }
                const newProperty: Property = {
                  id: maxPropertyId,
                  address: propertyCity ? `${propertyName}, ${propertyCity}` : propertyName,
                  owner: clientCompany,
                  value: '',
                  sqft: '',
                  type: cleanRow.type || '',
                  status: cleanRow.phase || 'Active',
                  source: 'Project Import',
                  llcId: llc.id
                };
                newProperties.push(newProperty);
                console.log('Added new property from project:', newProperty);
                processedCount++;
              }
            });
            setLlcs(dedupeLlcs(newLlcs));
            setProperties(newProperties);
          } else if (fileType === 'property') {
            let newLlcs = [...llcs];
            let newProperties = [...properties];
            let maxLlcId = newLlcs.length > 0 ? Math.max(...newLlcs.map(l => l.id)) : 0;
            let maxPropertyId = newProperties.length > 0 ? Math.max(...newProperties.map(p => p.id)) : 0;
            results.data.forEach((row: any, index: number) => {
              console.log(`Processing row ${index + 1}:`, row);
              
              const cleanRow = Object.fromEntries(
                Object.entries(row)
                  .filter(([_, value]) => value != null && value !== '')
                  .map(([key, value]) => [
                    key.replace(/\0/g, '').trim(),
                    String(value).replace(/\0/g, '').trim()
                  ])
              ) as Record<string, string>;

              if (Object.keys(cleanRow).length === 0) {
                console.log(`Skipping empty row ${index + 1}`);
                skippedCount++;
                return;
              }

              const address = cleanRow.address || cleanRow['property name'] || '';
              const owner = cleanRow['owner.company'] || cleanRow['property name'] || '';
              
              if (!address || !owner) {
                console.log(`Skipping property row ${index + 1} - missing required fields`);
                skippedCount++;
                return;
              }

              // Format the address if it's missing the city
              const formattedAddress = address.includes(',') ? address : `${address}, ${cleanRow.city || 'Nashville'}, TN`;
              let llc = newLlcs.find(l => l.name.toLowerCase() === owner.toLowerCase());
              let llcId: number | undefined;

              if (!llc) {
                maxLlcId++;
                llcId = maxLlcId;
                llc = {
                  id: llcId,
                  name: owner,
                  contact: cleanRow['owner.contact name'] || '',
                  email: '',
                  phone: cleanRow['owner.phone'] || cleanRow['owner (contact).mobile'] || '',
                };
                newLlcs.push(llc);
                console.log('Created new LLC:', llc);
              } else {
                llcId = llc.id;
                console.log('Found existing LLC:', llc);
              }

              maxPropertyId++;
              const newProperty: Property = {
                id: maxPropertyId,
                address: formattedAddress,
                owner: owner,
                value: '',
                sqft: cleanRow['building sf'] || '',
                type: cleanRow['property type'] || '',
                status: 'Available',
                source: 'CSV Import',
                llcId: llcId
              };
              newProperties.push(newProperty);
              console.log('Added new property:', newProperty);
              processedCount++;
            });
            setLlcs(dedupeLlcs(newLlcs));
            setProperties(newProperties);
          } else if (fileType === 'company') {
            let newLlcs = [...llcs];
            let newClients = [...clients];
            let maxLlcId = newLlcs.length > 0 ? Math.max(...newLlcs.map(l => l.id)) : 0;
            let maxClientId = newClients.length > 0 ? Math.max(...newClients.map(c => c.id)) : 0;
            results.data.forEach((row: any) => {
              const companyName = row.company || '';
              if (!companyName) {
                skippedCount++;
                return;
              }
              const normalizedCompanyName = normalizeName(companyName);
              if (normalizedCompanyName.startsWith('(') || 
                  normalizedCompanyName.startsWith('@') || 
                  normalizedCompanyName.length < 2) {
                skippedCount++;
                return;
              }
              let llc: LLC | undefined = newLlcs.find(l => normalizeName(l.name) === normalizedCompanyName);
              if (!llc) {
                maxLlcId++;
                llc = {
                  id: maxLlcId,
                  name: companyName,
                  contact: '',
                  email: '',
                  phone: row.phone || '',
                };
                newLlcs.push(llc);
              } else {
                if (row.phone && !llc.phone) {
                  llc.phone = row.phone;
                }
              }
              const existingClient = newClients.find(c => normalizeName(c.name) === normalizedCompanyName && c.llcId === llc!.id);
              if (!existingClient) {
                maxClientId++;
                const newClient: Client = {
                  id: maxClientId,
                  name: companyName,
                  contact: '',
                  email: '',
                  phone: row.phone || '',
                  llcId: llc!.id,
                  propertyIds: [],
                  lastContact: new Date().toISOString().split('T')[0],
                  nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                };
                newClients.push(newClient);
                processedCount++;
              } else {
                let updated = false;
                if (row.phone && !existingClient.phone) { existingClient.phone = row.phone; updated = true; }
                if (updated) {
                  // Already in newClients, just update in place
                }
                skippedCount++;
              }
            });
            const dedupedLlcs = dedupeLlcs(newLlcs);
            const dedupedClients = dedupeClients(newClients);
            setLlcs(dedupedLlcs);
            setClients(dedupedClients);
          } else if (fileType === 'contact') {
            let newLlcs = [...llcs];
            let maxLlcId = newLlcs.length > 0 ? Math.max(...newLlcs.map(l => l.id)) : 0;
            results.data.forEach((row: any) => {
              const contactName = row.name || `${row['first name'] || ''} ${row['last name'] || ''}`.trim();
              const companyName = row.company || '';
              if (!contactName && !companyName) {
                skippedCount++;
                return;
              }
              let llc = newLlcs.find(l => l.name.toLowerCase() === companyName.toLowerCase());
              if (llc) {
                llc.contact = contactName;
                llc.phone = row['direct line'] || row.mobile || llc.phone;
                llc.email = row.email || llc.email;
                console.log('Updated LLC with contact info:', llc);
                processedCount++;
              } else if (companyName) {
                maxLlcId++;
                llc = {
                  id: maxLlcId,
                  name: companyName,
                  contact: contactName,
                  email: row.email || '',
                  phone: row['direct line'] || row.mobile || '',
                };
                newLlcs.push(llc);
                console.log('Created new LLC with contact:', llc);
                processedCount++;
              }
            });
            setLlcs(dedupeLlcs(newLlcs));
          }

          console.log('CSV processing complete:', { processedCount, skippedCount });
          setUploadError(`Successfully processed ${processedCount} records${skippedCount > 0 ? ` (${skippedCount} rows skipped)` : ''}`);
        } catch (error) {
          console.error('CSV processing error:', error);
          setUploadError('An error occurred while processing the CSV file.');
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setUploadError(`Error reading CSV file: ${error.message}`);
      }
    });
  };

  // Reconciliation: ensure every LLC has a client, and every property is linked to the correct client
  function reconcileClientsAndProperties(llcs: LLC[], clients: Client[], properties: Property[]): [Client[], Property[]] {
    let updatedClients = [...clients];
    // 1. Ensure every LLC has a client
    llcs.forEach(llc => {
      if (!updatedClients.some(c => c.llcId === llc.id)) {
        const clientId = updatedClients.length > 0 ? Math.max(...updatedClients.map(c => c.id)) + 1 : 1;
        updatedClients.push({
          id: clientId,
          name: llc.name,
          contact: llc.contact,
          email: llc.email,
          phone: llc.phone,
          llcId: llc.id,
          propertyIds: [],
          lastContact: '',
          nextFollowUp: ''
        });
      }
    });
    // 2. Link properties to clients
    updatedClients = updatedClients.map(client => {
      const propIds = properties.filter(p => p.llcId === client.llcId).map(p => p.id);
      return { ...client, propertyIds: propIds };
    });
    return [dedupeClients(updatedClients), properties];
  }

  // Batch CSV upload handler
  const handleBatchCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = event.target.files;
    if (!files || files.length === 0) {
      setUploadError('Please select one or more CSV files to upload.');
      return;
    }

    let filesProcessed = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;
    const allLlcs = [...llcs];
    const allClients = [...clients];
    const allProperties = [...properties];

    Array.from(files).forEach((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.replace(/\0/g, '').replace(/^"|"$/g, '').trim().toLowerCase(),
        dynamicTyping: true,
        transform: (value: string) => {
          if (value === null || value === undefined) return '';
          return String(value).replace(/\0/g, '').replace(/^"|"$/g, '').trim();
        },
        comments: false,
        complete: (results: ParseResult<any>) => {
          // Detect file type
          const headers = results.meta.fields || [];
          let fileType: 'property' | 'company' | 'contact' | 'project' = 'property';
          if (headers.includes('company_key')) fileType = 'company';
          else if (headers.includes('contact_key')) fileType = 'contact';
          else if (headers.includes('project_key')) fileType = 'project';
          // Process each row
          results.data.forEach((row: any) => {
            processCSVRow(row, fileType, allLlcs, allClients, allProperties);
          });
          filesProcessed++;
          if (filesProcessed === files.length) {
            const dedupedLlcs = dedupeLlcs(allLlcs);
            const dedupedProperties = allProperties; // Optionally dedupe properties
            let [reconciledClients, reconciledProperties] = reconcileClientsAndProperties(dedupedLlcs, allClients, dedupedProperties);
            setLlcs(dedupedLlcs);
            setClients(reconciledClients);
            setProperties(reconciledProperties);
            setUploadError(`Batch upload complete. Processed ${files.length} files.`);
          }
        },
        error: (error) => {
          setUploadError(`Error reading CSV file: ${error.message}`);
        }
      });
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
                
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                  <Upload size={24} className="text-blue-600" />
                  <div>
                    <p className="font-medium">Batch Upload CSVs</p>
                    <p className="text-sm text-gray-600">Import multiple CSV files at once</p>
                    {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                  </div>
                  <input type="file" accept=".csv" multiple onChange={handleBatchCSVUpload} className="hidden" />
                </label>
                
                <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50" onClick={scanEmails}>
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
                    String(client.name ?? '').toLowerCase().includes(search) ||
                    String(client.contact ?? '').toLowerCase().includes(search) ||
                    (llc && String(llc.name ?? '').toLowerCase().includes(search))
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