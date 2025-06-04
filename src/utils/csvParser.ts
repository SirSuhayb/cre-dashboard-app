import { Property, Client, CSVFieldMapping, defaultCSVFieldMapping } from '../types';
import { parse } from 'papaparse';

// Helper function to normalize strings for comparison
export const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Helper function to detect if a string is likely UTF-16
export const isLikelyUtf16 = (str: string): boolean => {
  return str.includes('\u0000');
};

// Helper function to clean UTF-16 strings
export const cleanUtf16String = (str: string): string => {
  return str.replace(/\u0000/g, '');
};

// Helper function to extract MLS images from description
export const extractMlsImages = (description: string): string[] => {
  const imageRegex = /(https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|gif|png))/gi;
  const matches = description.match(imageRegex) || [];
  return Array.from(new Set(matches)); // Remove duplicates
};

// Helper function to determine client type
export const determineClientType = (name: string, companyName: string): 'Company' | 'Individual' | 'LLC' => {
  const normalizedName = normalizeString(name);
  if (normalizedName.includes('llc') || normalizedName.includes('limited liability')) {
    return 'LLC';
  }
  if (companyName && companyName.trim()) {
    return 'Company';
  }
  return 'Individual';
};

// Helper function to determine property status
export const determinePropertyStatus = (mlsStatus: string, recordingDate: string): 'Available' | 'Pending' | 'Sold' | 'Off Market' => {
  if (!mlsStatus) return 'Off Market';
  
  const status = mlsStatus.toLowerCase();
  if (status.includes('active') || status.includes('new')) return 'Available';
  if (status.includes('pending')) return 'Pending';
  if (status.includes('sold') || recordingDate) return 'Sold';
  return 'Off Market';
};

// When mapping CSV fields to Property or Client, only assign if value is not null/undefined/empty string
function assignIfValid<T>(obj: T, key: keyof T, value: any) {
  if (value !== undefined && value !== null && value !== '') {
    obj[key] = value;
  }
}

// Normalize a header: lowercase, remove non-alphanumeric
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Flexible mapping dictionary: normalized header -> model field
const PROPERTY_FIELD_DICTIONARY: Record<string, keyof Property> = {
  propertyid: 'propertyId',
  apn: 'assessorsParcelNumber',
  assesorsparcelnumber: 'assessorsParcelNumber',
  address: 'situsAddress',
  situsaddress: 'situsAddress',
  unit: 'situsUnitNumber',
  situsunitnumber: 'situsUnitNumber',
  city: 'situsCity',
  situscity: 'situsCity',
  state: 'situsState',
  situsstate: 'situsState',
  zip: 'zipCode',
  zipcode: 'zipCode',
  house: 'situsHouseNo',
  houseno: 'situsHouseNo',
  street: 'situsStreetName',
  streetname: 'situsStreetName',
  ownername: 'ownerName',
  ownerfirstname: 'ownerName',
  ownerlastname: 'ownerName',
  contactname: 'contactName',
  phonenumber: 'phoneNumber',
  cell: 'cellPhone',
  cellphonenumber: 'cellPhone',
  emailaddress: 'emailAddress',
  companyname: 'companyName',
  // Add more as needed...
};

const CLIENT_FIELD_DICTIONARY: Record<string, keyof Client> = {
  name: 'name',
  ownername: 'name',
  ownerfirstname: 'ownerFirstName',
  ownerlastname: 'ownerLastName',
  companyname: 'companyName',
  contactname: 'contactName',
  phonenumber: 'phoneNumber',
  cell: 'cellPhone',
  cellphonenumber: 'cellPhone',
  fax: 'fax',
  email: 'emailAddress',
  emailaddress: 'emailAddress',
  // Add more as needed...
};

// Main CSV parsing function
export const parseCSV = async (
  file: File,
  mapping: CSVFieldMapping = defaultCSVFieldMapping
): Promise<{ properties: Property[]; clients: Client[] }> => {
  return new Promise((resolve, reject) => {
    const properties: Property[] = [];
    const clients: Client[] = [];
    const clientMap = new Map<string, Client>();
    let currentId = 1;

    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Build normalized header map: original header -> normalized
          const headerMap: Record<string, string> = {};
          if (results.meta && Array.isArray(results.meta.fields)) {
            results.meta.fields.forEach((header: string) => {
              headerMap[header] = normalizeHeader(header);
            });
          }

          results.data.forEach((row: any) => {
            // Create property
            const property: Partial<Property> = {
              id: currentId++,
              status: determinePropertyStatus(row[mapping.property['MLS Status']], row[mapping.property['Recording Date']]),
              source: file.name,
              lastUpdated: new Date().toISOString(),
            };

            // Auto-map property fields
            Object.entries(row).forEach(([csvField, value]) => {
              const norm = headerMap[csvField] || normalizeHeader(csvField);
              const propertyField = PROPERTY_FIELD_DICTIONARY[norm];
              if (propertyField) {
                assignIfValid(property, propertyField, value);
              }
            });

            // Create or update client
            let ownerName = '';
            let companyName = '';
            let phoneNumber = '';
            Object.entries(row).forEach(([csvField, value]) => {
              const norm = headerMap[csvField] || normalizeHeader(csvField);
              if (!ownerName && (norm === 'ownername' || norm === 'name')) ownerName = value as string;
              if (!ownerName && norm === 'ownerfirstname') ownerName = value as string;
              if (!ownerName && norm === 'contactname') ownerName = value as string;
              if (!companyName && norm === 'companyname') companyName = value as string;
              if (!phoneNumber && (norm === 'phonenumber' || norm === 'cellphonenumber')) phoneNumber = value as string;
            });
            if (!ownerName) ownerName = property.ownerName || '';
            if (!companyName) companyName = property.companyName || '';
            if (!phoneNumber) phoneNumber = property.phoneNumber || '';
            const clientKey = normalizeString(ownerName + companyName);

            let client: Client | undefined = clientMap.get(clientKey);
            if (!client) {
              // Create new client with default values
              const newClient: Partial<Client> = {
                id: currentId++,
                name: ownerName,
                type: determineClientType(ownerName, companyName),
                status: 'Active',
                propertyIds: [],
                source: file.name,
                lastUpdated: new Date().toISOString(),
                tags: [],
                phoneNumber: phoneNumber,
              };
              // Auto-map client fields
              Object.entries(row).forEach(([csvField, value]) => {
                const norm = headerMap[csvField] || normalizeHeader(csvField);
                const clientField = CLIENT_FIELD_DICTIONARY[norm];
                if (clientField) {
                  assignIfValid(newClient, clientField, value);
                }
              });
              client = newClient as Client;
              clientMap.set(clientKey, client);
              clients.push(client);
            }

            // Update relationships
            if (client && property.id) {
              property.ownerId = client.id;
              if (client.type === 'Company' || client.type === 'LLC') {
                property.ownerCompanyId = client.id;
              }
              client.propertyIds.push(property.id);
            }

            if (property.id) {
              properties.push(property as Property);
            }
          });

          resolve({ properties, clients });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to merge duplicate clients
export const mergeDuplicateClients = (clients: Client[]): Client[] => {
  const mergedClients = new Map<string, Client>();
  
  clients.forEach(client => {
    const key = normalizeString(client.name + (client.companyName || ''));
    const existingClient = mergedClients.get(key);
    
    if (existingClient) {
      // Merge property IDs
      existingClient.propertyIds = Array.from(new Set([...existingClient.propertyIds, ...client.propertyIds]));
      
      // Merge contact information if missing
      if (!existingClient.phoneNumber && client.phoneNumber) existingClient.phoneNumber = client.phoneNumber;
      if (!existingClient.emailAddress && client.emailAddress) existingClient.emailAddress = client.emailAddress;
      if (!existingClient.mailingAddress && client.mailingAddress) existingClient.mailingAddress = client.mailingAddress;
      
      // Merge company information if missing
      if (!existingClient.companyName && client.companyName) existingClient.companyName = client.companyName;
      if (!existingClient.companyType && client.companyType) existingClient.companyType = client.companyType;
      
      // Merge notes
      if (client.notes) {
        existingClient.notes = existingClient.notes 
          ? `${existingClient.notes}\n---\n${client.notes}`
          : client.notes;
      }
      
      // Merge tags
      existingClient.tags = Array.from(new Set([...(existingClient.tags || []), ...(client.tags || [])]));
    } else {
      mergedClients.set(key, { ...client });
    }
  });
  
  return Array.from(mergedClients.values());
};

// Function to update property references after client merging
export const updatePropertyReferences = (properties: Property[], clients: Client[]): Property[] => {
  const clientMap = new Map<number, Client>();
  clients.forEach(client => clientMap.set(client.id, client));
  
  return properties.map(property => {
    const owner = clientMap.get(property.ownerId);
    if (owner) {
      property.ownerId = owner.id;
      if (owner.type === 'Company' || owner.type === 'LLC') {
        property.ownerCompanyId = owner.id;
      }
    }
    return property;
  });
}; 