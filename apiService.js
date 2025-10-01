// apiService.js — Power Automate Integration + Demo Dataset
// Ensures a global `ApiService` for script.js to call

const ApiService = (function () {
  const POWER_AUTOMATE_URL =
    'https://prod-64.southeastasia.logic.azure.com:443/workflows/e1583b4aa1f140df8402c75d18538409/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=B88bcWT3wuQyxyEyMr8uYhIqTzJmq6t3rHsvsSJ32YY';

  // Field mappings for SharePoint data
  const FIELD_MAPPINGS = {
    id: ['ID', 'Id', 'PersonId', 'Person_system_id'],
    name: [
      'Person_x0020_Full_x0020_Name',
      'Person_Full_Name',
      'FullName',
      'First_Name',
      'Name',
      'Title'
    ],
    email: ['Person_x0020_Email', 'Person_Email', 'Email', 'CandidateEmail'],
    phone: [
      'Default_x0020_Phone',
      'Default_Phone',
      'Phone',
      'Employee',
      'EmployeePhone'
    ],
    status: ['Recent_x0020_Status', 'Recent_Status', 'Status', 'CurrentStatus'],
    location: ['Location', 'Office', 'Site'],
    nationality: ['Nationality', 'F_Nationality', 'Country'],
    source: ['Source_x0020_Name', 'Source_Name', 'Source', 'SourceName'],
    referrerPhone: [
      'Referrer_x0020_Phone',
      'Referrer_Phone',
      'ReferrerPhone'
    ],
    referrerEmail: [
      'Referrer_x0020_Email',
      'Referrer_Email',
      'ReferrerEmail'
    ],
    created: ['Created', 'CreatedDate', 'ApplicationDate'],
    modified: ['Modified', 'UpdatedDate', 'LastModified']
  };

  // --- DEMO DATA SWITCH ---
  const DEMO_PHONE = '0123456789';
  const DEMO_EMAIL = 'amr@tp.com';

  // Helpers for demo matching / URL override
  function normalizeEmail(e) {
    return (e || '').toString().trim().toLowerCase();
  }
  function normalizePhoneLocal(p) {
    // Keep only digits; allow "0123456789" or "60123456789" to match the same local number
    const digits = (p || '').toString().replace(/\D+/g, '');
    if (!digits) return '';
    if (digits.startsWith('60')) return digits.slice(2);
    return digits;
  }
  function urlForcesDemo() {
    try {
      return /(?:^|[?&])demo=1(?:&|$)/.test(window.location.search);
    } catch {
      return false;
    }
  }

  // ---------------- Mock dataset (2 examples for each of the 6 groups) ----------------
  function getMockReferrals() {
    return [
      // 1) Application Received (x2)
      {
        ID: 1001,
        Person_x0020_Full_x0020_Name: 'Tarek Ezz',
        Person_x0020_Email: 'tarek@tp.com',
        Default_x0020_Phone: '0182708243',
        Recent_x0020_Status: 'Application Received',
        Source_x0020_Name: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysia',
        Created: '2025-08-18T09:00:00Z',
        Modified: '2025-08-25T09:00:00Z'
      },
      {
        ID: 1002,
        Person_x0020_Full_x0020_Name: 'Loai',
        Person_x0020_Email: 'loai@tp.com',
        Default_x0020_Phone: '0174669871',
        Recent_x0020_Status: 'SHL Assessment: Typing ENG',
        Source_x0020_Name: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Malaysia',
        Created: '2025-08-12T09:00:00Z',
        Modified: '2025-08-20T09:00:00Z'
      },

      // 2) Assessment Stage (x2)
      {
        ID: 1003,
        Person_x0020_Full_x0020_Name: 'Micole Barrientos',
        Person_x0020_Email: 'miki@tp.com',
        Default_x0020_Phone: '0177862292',
        Recent_x0020_Status: 'Interview Scheduled',
        Source_x0020_Name: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysia',
        Created: '2025-08-10T09:00:00Z',
        Modified: '2025-08-26T09:00:00Z'
      },
      {
        ID: 1004,
        Person_x0020_Full_x0020_Name: 'Pourya Tohidi',
        Person_x0020_Email: 'pourya@tp.com',
        Default_x0020_Phone: '0198899001',
        Recent_x0020_Status: 'Screened: Green Candidate',
        Source_x0020_Name: 'xRAF',
        Location: 'Johor Bahru',
        F_Nationality: 'Malaysia',
        Created: '2025-08-01T09:00:00Z',
        Modified: '2025-08-21T09:00:00Z'
      },

      // 3) Hired (Probation) — < 90 days (x2)
      {
        ID: 1005,
        Person_x0020_Full_x0020_Name: 'Melaine Sua',
        Person_x0020_Email: 'melaine@tp.com',
        Default_x0020_Phone: '0109988776',
        Recent_x0020_Status: 'Onboarding Started',
        Source_x0020_Name: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysia',
        Created: '2025-08-05T09:00:00Z',
        Modified: '2025-08-15T09:00:00Z'
      },
      {
        ID: 1006,
        Person_x0020_Full_x0020_Name: 'Anna Saw Yee Lin',
        Person_x0020_Email: 'anna@tp.com',
        Default_x0020_Phone: '0185566778',
        Recent_x0020_Status: 'Contract Presented',
        Source_x0020_Name: 'xRAF',
        Location: 'Cyberjaya',
        F_Nationality: 'Malaysia',
        Created: '2025-07-20T09:00:00Z',
        Modified: '2025-08-10T09:00:00Z'
      },

      // 4) Hired (Confirmed) — ≥ 90 days (x2)
      {
        ID: 1007,
        Person_x0020_Full_x0020_Name: 'Maho Yoriguchi',
        Person_x0020_Email: 'maho@tp.com',
        Default_x0020_Phone: '0161122334',
        Recent_x0020_Status: 'New Starter (Hired)',
        Source_x0020_Name: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysia',
        Created: '2025-04-10T09:00:00Z',
        Modified: '2025-04-20T09:00:00Z'
      },
      {
        ID: 1008,
        Person_x0020_Full_x0020_Name: 'Sieon Lee',
        Person_x0020_Email: 'maya@tp.com',
        Default_x0020_Phone: '0136677889',
        Recent_x0020_Status: 'Cleared to Start',
        Source_x0020_Name: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Malaysia',
        Created: '2025-05-01T09:00:00Z',
        Modified: '2025-05-15T09:00:00Z'
      },

      // 5) Previously Applied (No Payment) — non-xRAF source (x2)
      {
        ID: 1009,
        Person_x0020_Full_x0020_Name: 'David Ong',
        Person_x0020_Email: 'david@tp.com',
        Default_x0020_Phone: '0114455667',
        Recent_x0020_Status: 'Application Received',
        Source_x0020_Name: 'LinkedIn',
        Location: 'Kuching',
        F_Nationality: 'Malaysia',
        Created: '2025-08-17T09:00:00Z',
        Modified: '2025-08-22T09:00:00Z'
      },
      {
        ID: 1010,
        Person_x0020_Full_x0020_Name: 'Chloe',
        Person_x0020_Email: 'chloe@tp.com',
        Default_x0020_Phone: '0173344556',
        Recent_x0020_Status: 'Screened',
        Source_x0020_Name: 'JobStreet',
        Location: 'Kota Kinabalu',
        F_Nationality: 'Malaysia',
        Created: '2025-08-02T09:00:00Z',
        Modified: '2025-08-19T09:00:00Z'
      },

      // 6) Not Selected (x2)
      {
        ID: 1011,
        Person_x0020_Full_x0020_Name: 'Nurul Lydia Adini',
        Person_x0020_Email: 'lydia@tp.com',
        Default_x0020_Phone: '0125566778',
        Recent_x0020_Status: 'Eliminated - Incomplete Assessment',
        Source_x0020_Name: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysia',
        Created: '2025-08-10T09:00:00Z',
        Modified: '2025-08-16T09:00:00Z'
      },
      {
        ID: 1012,
        Person_x0020_Full_x0020_Name: 'Hanna Wong',
        Person_x0020_Email: 'hanna@tp.com',
        Default_x0020_Phone: '0197788990',
        Recent_x0020_Status: 'Withdrew - Salary (Post Offer)',
        Source_x0020_Name: 'xRAF',
        Location: 'Ipoh',
        F_Nationality: 'Malaysia',
        Created: '2025-06-15T09:00:00Z',
        Modified: '2025-07-01T09:00:00Z'
      }
    ];
  }

  // ---------------- Core helpers ----------------
  function getFieldValue(item, fieldMappings) {
    for (const fieldName of fieldMappings) {
      if (item[fieldName] !== undefined && item[fieldName] !== null && item[fieldName] !== '') {
        return item[fieldName];
      }
    }
    return '';
  }

  function processReferralData(item) {
    const id = getFieldValue(item, FIELD_MAPPINGS.id);
    const name = getFieldValue(item, FIELD_MAPPINGS.name) || 'Unknown';
    const email = getFieldValue(item, FIELD_MAPPINGS.email);
    const phone = getFieldValue(item, FIELD_MAPPINGS.phone);
    const status = getFieldValue(item, FIELD_MAPPINGS.status) || 'Application Received';
    const location = getFieldValue(item, FIELD_MAPPINGS.location);
    const nationality = getFieldValue(item, FIELD_MAPPINGS.nationality);
    const source = getFieldValue(item, FIELD_MAPPINGS.source) || '';
    const referrerPhone = getFieldValue(item, FIELD_MAPPINGS.referrerPhone);
    const referrerEmail = getFieldValue(item, FIELD_MAPPINGS.referrerEmail);
    const created = getFieldValue(item, FIELD_MAPPINGS.created) || new Date().toISOString();
    const modified = getFieldValue(item, FIELD_MAPPINGS.modified) || created;

    return {
      // IDs
      Person_system_id: (id !== undefined && id !== null) ? id.toString() : '',
      personId: (id !== undefined && id !== null) ? id.toString() : '',

      // Names and contact
      First_Name: name,
      name: name,
      Email: email,
      email: email,
      Employee: phone,
      employee: phone,
      phone: phone,

      // Status fields
      Status: status,
      status: status,

      // Location fields
      Location: location,
      location: location,
      F_Nationality: nationality,
      nationality: nationality,

      // Source fields
      Source: source,
      source: source,
      SourceName: source,
      sourceName: source,

      // Referrer fields
      referrerPhone: referrerPhone,
      referrerEmail: referrerEmail,

      // Date fields
      CreatedDate: created,
      createdDate: created,
      UpdatedDate: modified,
      updatedDate: modified,
      applicationDate: created,

      // Assessment data (if your SharePoint includes it)
      assessment: null,

      // Keep original
      _original: item
    };
  }

  function extractReferralsFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.referrals)) return data.referrals;
    if (data && Array.isArray(data.value)) return data.value;
    if (data && data.d && Array.isArray(data.d.results)) return data.d.results;
    if (data && typeof data === 'object') return [data];
    return [];
  }

  // ---------------- Public functions ----------------
  async function fetchReferrals(phone, email) {
    // DEMO gate (typed demo creds OR ?demo=1)
    const phoneNorm = normalizePhoneLocal(phone);
    const emailNorm = normalizeEmail(email);
    const demoPhoneNorm = normalizePhoneLocal(DEMO_PHONE);
    const demoEmailNorm = normalizeEmail(DEMO_EMAIL);
    const demoMatch =
      (phoneNorm === demoPhoneNorm && emailNorm === demoEmailNorm) || urlForcesDemo();

    console.log('[DEMO CHECK]', {
      phoneNorm,
      emailNorm,
      demoPhoneNorm,
      demoEmailNorm,
      demoMatch
    });

    if (demoMatch) {
      console.log('DEMO MODE ACTIVE — returning mock referrals');
      const mock = getMockReferrals().map(processReferralData);
      console.log('DEMO records:', mock.length);
      return mock;
    }

    // LIVE path
    console.log('=== Starting fetchReferrals (LIVE) ===', { phone, email });

    try {
      const response = await fetch(POWER_AUTOMATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ phone, email })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Power Automate Error: ${response.status} - ${errorText}`);
        throw new Error(`Power Automate Error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response (first 200):', responseText.substring(0, 200) + '...');

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid JSON response from Power Automate');
      }

      let referrals = extractReferralsFromResponse(data);
      console.log(`Found ${referrals.length} referrals (raw)`);

      const processedReferrals = referrals.map((item, index) => {
        const row = processReferralData(item);
        if (index < 3) console.log('Sample processed row', index + 1, row);
        return row;
      });

      console.log('Processing complete. Returning referrals:', processedReferrals.length);

      // Safety net for demos: if user typed demo creds but API returned 0, fall back to mock
      const typedDemoCreds = phoneNorm === demoPhoneNorm && emailNorm === demoEmailNorm;
      if (typedDemoCreds && processedReferrals.length === 0) {
        console.warn(
          'Live returned 0 for demo creds — falling back to mock dataset for presentation.'
        );
        return getMockReferrals().map(processReferralData);
      }

      return processedReferrals;
    } catch (error) {
      console.error('Error fetching referrals:', error);

      // Safety net: if this was a demo attempt and live failed, serve mock
      const typedDemoCreds = phoneNorm === demoPhoneNorm && emailNorm === demoEmailNorm;
      if (typedDemoCreds) {
        console.warn('Live call failed for demo creds — returning mock dataset.');
        return getMockReferrals().map(processReferralData);
      }

      // Otherwise return empty array
      return [];
    }
  }

  async function testConnection() {
    console.log('=== Testing Power Automate Connection ===');
    console.log('URL:', POWER_AUTOMATE_URL);

    try {
      const testData = { phone: 'test', email: 'test@test.com' };
      console.log('Sending test request with:', testData);

      const response = await fetch(POWER_AUTOMATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log('Test response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✓ Power Automate connection successful');
      console.log('Response structure:', data);

      return { success: true, data };
    } catch (error) {
      console.error('✗ Power Automate connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Public API
  return {
    fetchReferrals,
    testConnection
  };
})();

// Ensure the service is globally accessible for script.js
if (typeof window !== 'undefined') window.ApiService = ApiService;
// (Optional, if you ever import this in Node tests)
// if (typeof module !== 'undefined' && module.exports) module.exports = ApiService;
