// Complete Status Mapping with WFH Interpreter Support
const StatusMapping = {
    // Map status to simplified group based on rules
    mapStatusToGroup: function(status, assessment, source, daysInStage) {
        if (!status) return 'Application Received';
        
        const statusStr = status.toLowerCase().trim();
        const sourceStr = (source || '').toLowerCase().trim();
        
        // Check source types
        const isXRAF = sourceStr === 'xraf';
        const isWFHxRAF = sourceStr === 'wfhxraf';
        
        // If source is not xRAF/WFHxRAF AND not empty, it's previously applied (no payment)
        if (!isXRAF && !isWFHxRAF && sourceStr !== '') {
            return 'Previously Applied (No Payment)';
        }
        
        // APPLICATION RECEIVED statuses (same for both xRAF and WFHxRAF)
        if (statusStr === 'application received' ||
            statusStr === 'contact attempt 1' ||
            statusStr === 'contact attempt 2' ||
            statusStr === 'contact attempt 3' ||
            statusStr === 'textapply' ||
            statusStr === 'external portal' ||
            statusStr === 'internal portal' ||
            statusStr === 'recruiter submitted' ||
            statusStr === 'agency submissions' ||
            statusStr === 'employee referral' ||
            statusStr === 'incomplete') {
            return 'Application Received';
        }
        
        // ASSESSMENT STAGE statuses - ONLY for regular xRAF, NOT for WFHxRAF
        if (!isWFHxRAF && (
            statusStr.includes('shl assessment') ||
            statusStr.includes('assessment stage') ||
            statusStr === 'evaluated' ||
            statusStr === 'pre-screened' ||
            statusStr === 'screened' ||
            statusStr.includes('screen:') ||
            statusStr.includes('screened:') ||
            statusStr.includes('interview scheduled') ||
            statusStr.includes('interview complete') ||
            statusStr.includes('second interview') ||
            statusStr.includes('third interview') ||
            statusStr === 'ready to offer' ||
            statusStr === 'job offer presented' ||
            statusStr === 'waha agreement (signature)' ||
            statusStr === 'moved to another requisition or talent pool' ||
            statusStr === 'class start date' ||
            statusStr === 're-assigned')) {
            return 'Assessment Stage';
        }
        
        // HIRED statuses - different handling for WFH vs regular
        if (statusStr === 'credit check initiated' ||
            statusStr === 'onboarding started' ||
            statusStr === 'contract presented' ||
            statusStr === 'background check (canada)' ||
            statusStr === 'background/drug check initiated' ||
            statusStr === 'ccms export initiated' ||
            statusStr === 'cleared to start' ||
            statusStr === 'equipment requested' ||
            statusStr === 'new starter (hired)' ||
            statusStr === 'graduate' ||
            statusStr.includes('hired')) {
            
            // WFH Interpreter path
            if (isWFHxRAF) {
                if (daysInStage !== undefined && daysInStage >= 90) {
                    return 'Hired (WFH Confirmed)';
                }
                return 'Hired (WFH Probation)';
            }
            
            // Regular xRAF path
            if (daysInStage !== undefined && daysInStage >= 90) {
                return 'Hired (Confirmed)';
            }
            return 'Hired (Probation)';
        }
        
        // NOT SELECTED statuses - all elimination and withdrawal reasons
        if (statusStr.includes('eliminated') ||
            statusStr.includes('withdrew') ||
            statusStr.includes('self-withdrew') ||
            statusStr.includes('class cancelled') ||
            statusStr.includes('legacy') ||
            statusStr.includes('no show') ||
            statusStr.includes('not selected') ||
            statusStr.includes('reject') ||
            statusStr.includes('rescinded') ||
            statusStr.includes('declined') ||
            statusStr.includes('dnq')) {
            return 'Not Selected';
        }
        
        // Default to Application Received
        return 'Application Received';
    },
    
    // Get simplified status type for styling
    getSimplifiedStatusType: function(status, assessment, source, daysInStage) {
        const group = this.mapStatusToGroup(status, assessment, source, daysInStage);
        switch (group) {
            case 'Hired (Confirmed)': 
            case 'Hired (WFH Confirmed)':
                return 'passed';
            case 'Hired (Probation)':
            case 'Hired (WFH Probation)':
                return 'probation';
            case 'Previously Applied (No Payment)': 
                return 'previously-applied';
            case 'Assessment Stage': 
                return 'assessment';
            case 'Not Selected': 
                return 'failed';
            case 'Application Received':
            default: 
                return 'received';
        }
    },
    
    // Determine stage for display
    determineStage: function(status, assessment, source, daysInStage) {
        return this.mapStatusToGroup(status, assessment, source, daysInStage);
    },
    
    // Display order for charts and lists
    displayOrder: [
        'Application Received',
        'Assessment Stage', 
        'Hired (Probation)',
        'Hired (Confirmed)',
        'Hired (WFH Probation)',
        'Hired (WFH Confirmed)',
        'Previously Applied (No Payment)',
        'Not Selected'
    ]
};

// Earnings structure with conditions
const earningsStructure = {
    assessment: {
        amount: 50,
        label: "Assessment Passed",
        condition: "Candidate passes the AI assessment (xRAF only)",
        payment: "RM50"
    },
    probation: { 
        amount: 750, 
        label: "Probation Completed",
        condition: "Candidate completes 90-day probation period (xRAF only)",
        payment: "RM750"
    },
    wfhProbation: {
        amount: 3000,
        label: "WFH Interpreter - 90 Days",
        condition: "WFH Interpreter completes 90-day probation period",
        payment: "RM3,000"
    }
};

// Status examples for guide
const statusExamples = [
    {
        status: "Application Received",
        description: "Candidate has applied but not completed assessment",
        action: "Send WhatsApp reminder"
    },
    {
        status: "Assessment Stage",
        description: "Candidate in assessment/interview process (xRAF only)",
        action: "RM50 payment is eligible if the candidate passes the AI assessment"
    },
    {
        status: "Hired (Probation)",
        description: "Candidate hired but in probation period (<90 days, xRAF)",
        action: "Monitor progress"
    },
    {
        status: "Hired (Confirmed)",
        description: "Candidate completed 90-day probation (xRAF)",
        action: "RM750 payment eligible"
    },
    {
        status: "Hired (WFH Probation)",
        description: "WFH Interpreter hired but in probation period (<90 days)",
        action: "Monitor progress"
    },
    {
        status: "Hired (WFH Confirmed)",
        description: "WFH Interpreter completed 90-day probation",
        action: "RM3,000 payment eligible"
    },
    {
        status: "Previously Applied (No Payment)",
        description: "Candidate applied through other sources (not xRAF/WFHxRAF)",
        action: "No payment eligible"
    },
    {
        status: "Not Selected",
        description: "Candidate rejected or withdrew application",
        action: "No further action needed"
    }
];
