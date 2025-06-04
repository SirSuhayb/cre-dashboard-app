export interface Company {
  id: number;
  name: string;
  type: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  notes: string;
  properties: number[]; // Array of property IDs
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: number;
  // Property Identification
  propertyId: string;
  assessorsParcelNumber: string;
  situsAddress: string;
  situsUnitNumber: string;
  situsCity: string;
  situsState: string;
  zipCode: string;
  situsHouseNo: string;
  situsStreetName: string;
  
  // Legacy fields for backward compatibility
  address?: string;
  value?: string;
  sqft?: string;
  type?: string;
  ownerName?: string;
  contactName?: string;
  phoneNumber?: string;
  cellPhone?: string;
  emailAddress?: string;
  companyId?: number;
  
  // Property Details
  propertyUse: string;
  numberOfUnits: string;
  buildingSquareFootage: string;
  lotSize: string;
  yearBuilt: string;
  numberOfStories: string;
  numberOfRooms: string;
  numberOfBedrooms: string;
  numberOfBaths: string;
  numberOfCarGarage: string;
  garageType: string;
  pool: string;
  exterior: string;
  constructionQuality: string;
  hvac: string;
  heatingDetails: string;
  fireplace: string;
  garage: string;
  roof: string;
  buildingShape: string;
  architecture: string;
  structure: string;
  zoning: string;
  ownerOccupied: string;
  
  // Property Values
  propertyValue: string;
  landValue: string;
  improvementValue: string;
  totalAssessedValue: string;
  
  // MLS Information
  mlsId: string;
  mlsStatus: string;
  mlsCalculatedDaysOnMarket: string;
  mlsOriginalListingDate: string;
  mlsRentalIndicator: string;
  mlsCurrentListingPrice: string;
  mlsSoldPrice: string;
  mlsSoldDate: string;
  mlsImages: string[];
  mlsDescription: string;
  
  // GIS Data
  latitude: string;
  longitude: string;
  countyName: string;
  propertyLink: string;
  
  // Transaction Information
  recordingDate: string;
  salesPrice: string;
  buyer: string;
  seller: string;
  ltv: string;
  totalDebtAmount: string;
  recentLoanDate: string;
  documentType: string;
  recordType: string;
  sellerCarryBack: string;
  
  // Loan Information
  loanAmount1: string;
  loanAmount2: string;
  loanAmount3: string;
  approxLoanInterest1: string;
  approxLoanInterest2: string;
  approxLoanInterest3: string;
  lenderFirstName1: string;
  lenderLastName1: string;
  lenderFirstName2: string;
  lenderLastName2: string;
  lenderFirstName3: string;
  lenderLastName3: string;
  creditLine1: string;
  creditLine2: string;
  creditLine3: string;
  interestRateType1: string;
  interestRateType2: string;
  interestRateType3: string;
  loanType1: string;
  loanType2: string;
  loanType3: string;
  loanDate1: string;
  loanDate2: string;
  loanDate3: string;
  
  // Legal Information
  legalDescription: string;
  noticeOfDefaultDate: string;
  noticeOfSaleDate: string;
  
  // Additional Information
  titleCompany: string;
  sellerScore: string;
  refinanceScore: string;
  notes: string;
  
  // Relationships
  ownerId: number; // Reference to the primary owner (Client)
  ownerCompanyId: number; // Reference to the owning company (Client)
  agentId?: number; // Reference to the listing agent
  status: 'Available' | 'Pending' | 'Sold' | 'Off Market';
  source: string;
  lastUpdated: string;
  city?: string;
  state?: string;
  companyName?: string;
  otherOwners?: string[];
  units?: number;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  properties: number[]; // Array of property IDs
  clients: number[]; // Array of client IDs
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Client interface focuses on companies and owners
export interface Client {
  id: number;
  // Basic Information
  name: string;
  type: 'Company' | 'Individual' | 'LLC';
  status: 'Active' | 'Inactive' | 'Prospect';
  
  // Contact Information
  contactName: string;
  phoneNumber: string;
  cellPhone: string;
  fax: string;
  otherPhone1: string;
  otherPhone2: string;
  additionalNumbers: string;
  emailAddress: string;
  
  // Additional Contacts
  contact1Name: string;
  contact1Phone: string;
  contact1Email: string;
  contact2Name: string;
  contact2Phone: string;
  contact2Email: string;
  contact3Name: string;
  contact3Phone: string;
  contact3Email: string;
  
  // Mailing Address
  mailingAddress: string;
  mailingUnitNumber: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  
  // Company Information (if applicable)
  companyName: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyType: string;
  companyWebsite: string;
  companyDescription: string;
  annualRevenue: string;
  numberOfEmployees: string;
  
  // Agent Information
  agentName: string;
  agentAddress1: string;
  agentAddress2: string;
  agentCity: string;
  agentState: string;
  agentZip: string;
  
  // Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  ownerMiddleName: string;
  ownerType: string;
  ownershipStatus: string;
  careOfName: string;
  dncStatus: string;
  
  // Partner Information
  partner1Name: string;
  partner1Phone: string;
  partner1MailingAddress: string;
  partner1City: string;
  partner1State: string;
  partner1Zip: string;
  partner2Name: string;
  partner2Phone: string;
  partner2MailingAddress: string;
  partner2City: string;
  partner2State: string;
  partner2Zip: string;
  partner3Name: string;
  partner3Phone: string;
  partner3MailingAddress: string;
  partner3City: string;
  partner3State: string;
  partner3Zip: string;
  
  // Follow-up Information
  lastContact: string;
  nextFollowUp: string;
  followUpNotes: string;
  preferredContactMethod: string;
  preferredContactTime: string;
  communicationPreferences: string;
  
  // Relationships
  propertyIds: number[]; // References to owned properties
  parentCompanyId?: number; // Reference to parent company if this is a subsidiary
  subsidiaries?: number[]; // References to subsidiary companies
  agentId?: number; // Reference to assigned agent
  
  // Additional Information
  notes: string;
  tags: string[];
  source: string;
  lastUpdated: string;
  city?: string;
  state?: string;
  otherOwners?: string[];
  units?: number;
}

// CSV Field Mapping
export interface CSVFieldMapping {
  property: {
    [key: string]: keyof Property;
  };
  client: {
    [key: string]: keyof Client;
  };
}

// Default CSV field mappings
export const defaultCSVFieldMapping: CSVFieldMapping = {
  property: {
    // Property Identification
    'Property ID': 'propertyId',
    'APN': 'assessorsParcelNumber',
    'Address': 'situsAddress',
    'Unit': 'situsUnitNumber',
    'City': 'situsCity',
    'State': 'situsState',
    'Zip': 'zipCode',
    'House No': 'situsHouseNo',
    'Street': 'situsStreetName',
    
    // Property Details
    'Use': 'propertyUse',
    'Units': 'numberOfUnits',
    'Square Feet': 'buildingSquareFootage',
    'Lot Size': 'lotSize',
    'Year Built': 'yearBuilt',
    'Stories': 'numberOfStories',
    'Rooms': 'numberOfRooms',
    'Bedrooms': 'numberOfBedrooms',
    'Baths': 'numberOfBaths',
    'Garage': 'numberOfCarGarage',
    'Garage Type': 'garageType',
    'Pool': 'pool',
    'Exterior': 'exterior',
    'Construction': 'constructionQuality',
    'HVAC': 'hvac',
    'Heating': 'heatingDetails',
    'Fireplace': 'fireplace',
    'Roof': 'roof',
    'Shape': 'buildingShape',
    'Architecture': 'architecture',
    'Structure': 'structure',
    'Zoning': 'zoning',
    'Owner Occupied': 'ownerOccupied',
    
    // Values
    'Value': 'propertyValue',
    'Land Value': 'landValue',
    'Improvement Value': 'improvementValue',
    'Assessed Value': 'totalAssessedValue',
    
    // MLS
    'MLS ID': 'mlsId',
    'MLS Status': 'mlsStatus',
    'Days on Market': 'mlsCalculatedDaysOnMarket',
    'List Date': 'mlsOriginalListingDate',
    'Rental': 'mlsRentalIndicator',
    'List Price': 'mlsCurrentListingPrice',
    'Sold Price': 'mlsSoldPrice',
    'Sold Date': 'mlsSoldDate',
    
    // Location
    'Latitude': 'latitude',
    'Longitude': 'longitude',
    'County': 'countyName',
    'Property Link': 'propertyLink',
    
    // Transaction
    'Recording Date': 'recordingDate',
    'Sales Price': 'salesPrice',
    'Buyer': 'buyer',
    'Seller': 'seller',
    'LTV': 'ltv',
    'Debt': 'totalDebtAmount',
    'Loan Date': 'recentLoanDate',
    'Document Type': 'documentType',
    'Record Type': 'recordType',
    'Carry Back': 'sellerCarryBack',
    
    // Legal
    'Legal Description': 'legalDescription',
    'Default Date': 'noticeOfDefaultDate',
    'Sale Date': 'noticeOfSaleDate',
    
    // Additional
    'Title Company': 'titleCompany',
    'Seller Score': 'sellerScore',
    'Refinance Score': 'refinanceScore',
    'Notes': 'notes',
  },
  client: {
    // Basic
    'Name': 'name',
    'Type': 'type',
    'Status': 'status',
    
    // Contact
    'Contact': 'contactName',
    'Phone': 'phoneNumber',
    'Cell': 'cellPhone',
    'Fax': 'fax',
    'Other Phone 1': 'otherPhone1',
    'Other Phone 2': 'otherPhone2',
    'Additional Numbers': 'additionalNumbers',
    'Email': 'emailAddress',
    
    // Additional Contacts
    'Contact 1': 'contact1Name',
    'Contact 1 Phone': 'contact1Phone',
    'Contact 1 Email': 'contact1Email',
    'Contact 2': 'contact2Name',
    'Contact 2 Phone': 'contact2Phone',
    'Contact 2 Email': 'contact2Email',
    'Contact 3': 'contact3Name',
    'Contact 3 Phone': 'contact3Phone',
    'Contact 3 Email': 'contact3Email',
    
    // Address
    'Mailing Address': 'mailingAddress',
    'Mailing Unit': 'mailingUnitNumber',
    'Mailing City': 'mailingCity',
    'Mailing State': 'mailingState',
    'Mailing Zip': 'mailingZip',
    
    // Company
    'Company': 'companyName',
    'Company City': 'companyCity',
    'Company State': 'companyState',
    'Company Zip': 'companyZip',
    'Company Type': 'companyType',
    'Website': 'companyWebsite',
    'Description': 'companyDescription',
    'Revenue': 'annualRevenue',
    'Employees': 'numberOfEmployees',
    
    // Owner
    'First Name': 'ownerFirstName',
    'Last Name': 'ownerLastName',
    'Middle Name': 'ownerMiddleName',
    'Owner Type': 'ownerType',
    'Ownership Status': 'ownershipStatus',
    'Care Of': 'careOfName',
    'DNC': 'dncStatus',
    
    // Follow-up
    'Last Contact': 'lastContact',
    'Next Follow-up': 'nextFollowUp',
    'Follow-up Notes': 'followUpNotes',
    'Preferred Contact': 'preferredContactMethod',
    'Preferred Time': 'preferredContactTime',
    'Communication Prefs': 'communicationPreferences',
    
    // Additional
    'Notes': 'notes',
    'Tags': 'tags',
    'Source': 'source',
  }
}; 