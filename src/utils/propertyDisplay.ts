import { Property } from '../types';

export function getPropertyDisplayAddress(property: Property): string {
  // Prefer situsAddress, fallback to address
  const address = property.situsAddress || property.address || 'N/A';
  const city = property.situsCity || property.city || '';
  const state = property.situsState || property.state || '';
  if (address === 'N/A') return 'N/A';
  return `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''}`;
}

export function getPropertyOwnerDisplay(property: Property): string {
  // Prefer companyName, then ownerName, then both, then otherOwners
  const company = property.companyName || '';
  const owner = property.ownerName || '';
  let ownerDisplay = '';
  if (company && owner) {
    ownerDisplay = `${company} (${owner}`;
  } else if (company) {
    ownerDisplay = company;
  } else if (owner) {
    ownerDisplay = owner;
  }
  // Add other owners if present
  if (property.otherOwners && property.otherOwners.length > 0) {
    if (ownerDisplay) {
      ownerDisplay += ', ' + property.otherOwners.join(', ');
    } else {
      ownerDisplay = property.otherOwners.join(', ');
    }
  }
  if (ownerDisplay.endsWith('(')) ownerDisplay = ownerDisplay.slice(0, -1);
  if (ownerDisplay.endsWith('(')) ownerDisplay = ownerDisplay.slice(0, -1);
  if (ownerDisplay.endsWith(',')) ownerDisplay = ownerDisplay.slice(0, -1);
  if (ownerDisplay.endsWith('(')) ownerDisplay += ')';
  if (ownerDisplay.includes('(') && !ownerDisplay.endsWith(')')) ownerDisplay += ')';
  return ownerDisplay || 'N/A';
}

export function getPropertyValueDisplay(property: Property): string {
  return property.propertyValue || property.value || 'N/A';
}

export function getPropertyDetailsDisplay(property: Property): string {
  return property.propertyUse || property.type || 'N/A';
}

export function getPropertySqftDisplay(property: Property): string {
  return property.buildingSquareFootage?.toString() || property.sqft?.toString() || '';
}

export function getPropertyUnitsDisplay(property: Property): string {
  return property.numberOfUnits?.toString() || property.units?.toString() || '';
} 