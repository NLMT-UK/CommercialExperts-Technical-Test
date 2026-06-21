import {
  CwukWasteDetails,
  CwukBusinessDetails,
  CwukContactDetails,
} from '../pages/CwukPages';

import {
  FcusVehicleDetails,
  FcusBusinessDetails,
  FcusContactDetails,
} from '../pages/FcusPages';

// ─────────────────────────────────────────────────────────────────────────────
// CWUK — Commercial Waste UK
// ─────────────────────────────────────────────────────────────────────────────

export const cwukWasteDetails: CwukWasteDetails = {
  wasteType: 'General',
  collectionFrequency: 'Ongoing Waste Collection',
  numberOfBins: 'Business',
};

export const cwukBusinessDetails: CwukBusinessDetails = {
  companyName: 'Test Business Ltd',
  businessType: 'Office',
  postcode: 'SK10 2XG',
};

export const cwukContactDetails: CwukContactDetails = {
  firstName: 'Nick',
  lastName: 'Taylor',
  email: 'nick.taylor@example.com',
  // Standard test numbers didn't pass the form's validation, so a real number is used here.
  phone: '07412013294',
};

// ─────────────────────────────────────────────────────────────────────────────
// FCUS — Fuel Cards US
// ─────────────────────────────────────────────────────────────────────────────

export const fcusVehicleDetails: FcusVehicleDetails = {
  fleetSize: '50+ Vehicles',
  hasExistingCard: 'No',
  cardType: 'Fleet Fuel Card',
  fuelLocation: 'Gas Stations',
  monthlySpend: '$3000+',
  vehicleType: 'Heavy Duty Trucks/Semis',
};

export const fcusBusinessDetails: FcusBusinessDetails = {
  businessType: 'Corporation',
  industry: 'Logistics',
  zipCode: '99999',
  companyName: 'Testing Inc',
};

export const fcusContactDetails: FcusContactDetails = {
  firstName: 'Nick',
  lastName: 'Taylor',
  email: 'nick.taylor@example.com',
  // Standard test numbers didn't pass validation — this is a publicly listed test number.
  phone: '14185438090',
};
