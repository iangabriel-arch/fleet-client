export const API_BASE_URL = 'http://localhost:5000/api';

export const ROLES = {
  ADMIN: 'admin',
  FINANCE: 'finance',
  RENTAL_AGENT: 'rental_agent',
  MAINTENANCE: 'maintenance',
};

export const VEHICLE_STATUSES = {
  available:         { label: 'Available',         color: 'green'  },
  reserved:          { label: 'Reserved',           color: 'yellow' },
  rented:            { label: 'Rented',             color: 'blue'   },
  under_maintenance: { label: 'Under Maintenance',  color: 'orange' },
  sold:              { label: 'Sold',               color: 'gray'   },
  hire_purchase:     { label: 'Hire Purchase',      color: 'purple' },
  repossessed:       { label: 'Repossessed',        color: 'red'    },
};

export const RENTAL_STATUSES = {
  reserved:  { label: 'Reserved',  color: 'yellow' },
  active:    { label: 'Active',    color: 'green'  },
  completed: { label: 'Completed', color: 'gray'   },
  cancelled: { label: 'Cancelled', color: 'red'    },
};
