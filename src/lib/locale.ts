// locale/ng-NG.ts

export const ngNG = {
  // Locale identifier
  code: 'ng-NG',
  name: 'English (Nigeria)',
  
  // Currency
  currency: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    decimals: 2,
  },
  
  // Number formatting
  number: {
    decimal: '.',
    thousands: ',',
    grouping: [3], // Group by thousands
  },
  
  // Date and time
  dateTime: {
    // Time zone
    timezone: 'Africa/Lagos',
    timezoneOffset: '+01:00', // WAT (West Africa Time)
    
    // Date formats
    formats: {
      short: 'dd/MM/yyyy',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      full: 'EEEE, d MMMM yyyy',
    },
    
    // Time formats
    timeFormats: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss z',
      full: 'HH:mm:ss zzzz',
    },
    
    // DateTime formats
    dateTimeFormats: {
      short: 'dd/MM/yyyy HH:mm',
      medium: 'd MMM yyyy HH:mm:ss',
      long: 'd MMMM yyyy HH:mm:ss z',
      full: 'EEEE, d MMMM yyyy HH:mm:ss zzzz',
    },
    
    // First day of week (Monday in Nigeria)
    firstDayOfWeek: 1,
    
    // Weekend days
    weekendDays: [0, 6], // Sunday and Saturday
  },
  
  // Phone number
  phone: {
    countryCode: '+234',
    format: '0XX XXXX XXXX',
    regex: /^(070|080|090|081|091)\d{8}$/,
    placeholder: '0801 234 5678',
    masks: {
      mobile: '0### ### ####',
      landline: '01 ### ####',
    },
  },
  
  // Address format
  address: {
    format: [
      'street',
      'city',
      'state',
      'postalCode',
      'country',
    ],
    states: [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
      'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
      'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
      'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
      'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
      'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
      'FCT', // Federal Capital Territory
    ],
    defaultState: 'Lagos',
    defaultCity: 'Lagos',
    postalCodeRequired: false,
  },
  
  // Lagos ID format
  lagosId: {
    prefix: 'LAG',
    format: 'LAGXXXXXXXXXX', // LAG + 10 digits
    regex: /^LAG\d{10}$/,
    placeholder: 'LAG1234567890',
  },
  
  // Translations
  translations: {
    common: {
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      reset: 'Reset',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      close: 'Close',
    },
    
    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number. Format: 0801 234 5678',
      invalidLagosId: 'Invalid Lagos ID. Format: LAG1234567890',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be at most {max} characters',
      mustMatch: 'Fields must match',
    },
    
    currency: {
      format: '₦{amount}',
      formatWithDecimals: '₦{amount}',
    },
    
    date: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      daysAgo: '{count} days ago',
      daysFromNow: 'in {count} days',
      monthsAgo: '{count} months ago',
      monthsFromNow: 'in {count} months',
      yearsAgo: '{count} years ago',
      yearsFromNow: 'in {count} years',
    },
    
    time: {
      now: 'Just now',
      minutesAgo: '{count} minutes ago',
      hoursAgo: '{count} hours ago',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night',
    },
    
    days: {
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    
    months: {
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      long: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ],
    },
  },
} as const;

export type Locale = typeof ngNG;

export default ngNG;
