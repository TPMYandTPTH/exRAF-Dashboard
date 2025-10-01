// Main Application Script with Updated Logic
document.addEventListener('DOMContentLoaded', function() {
    // Application State
    const AppState = {
        currentLanguage: 'en',
        statusChart: null,
        currentReferralsData: [],
        isLoading: false,
        debugMode: false // Set to true for debugging
    };
    
    // Initialize application
    function initializeApp() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
        updateTranslations();
        setupEventListeners();
        document.getElementById('dashboard-phone').focus();
        
        // Test connection if in debug mode
        if (AppState.debugMode) {
            ApiService.testConnection();
        }
        
        // Check for demo mode
        checkForDemoMode();
    }
    
    // Check if demo credentials are used
    function checkForDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === 'true') {
            document.getElementById('dashboard-phone').value = '0123456789';
            document.getElementById('dashboard-email').value = 'amr@tp.com';
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
        document.getElementById('dashboard-submit').addEventListener('click', handleFormSubmit);
        
        // Phone number validation - only numbers
        document.getElementById('dashboard-phone').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        // Delegate event handling for dynamic content
        document.addEventListener('click', function(e) {
            if (e.target.closest('.remind-btn')) {
                handleReminderClick(e);
            }
            if (e.target.id === 'dashboard-back') {
                handleBackButton();
            }
        });
        
        // Enter key support
        document.getElementById('dashboard-form').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFormSubmit();
            }
        });
    }
    
    // Handle form submission
    async function handleFormSubmit() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        
        if (!validateInputs(phone, email)) return;
        
        setLoadingState(true);
        
        try {
            let apiData;
            
            // Check if demo credentials
            if (phone === '0123456789' && email === 'amr@tp.com') {
                apiData = generateMockData();
            } else {
                // Fetch real referrals from API
                apiData = await ApiService.fetchReferrals(phone, email);
            }
            
            // Process and store referrals with deduplication
            AppState.currentReferralsData = processReferrals(apiData);
            
            // Always show dashboard
            showReferralResults(AppState.currentReferralsData);
            
        } catch (error) {
            console.error('Error:', error);
            // Still show dashboard with empty data
            AppState.currentReferralsData = [];
            showReferralResults([]);
            showNonBlockingError(translations[AppState.currentLanguage].errorMessage);
        } finally {
            setLoadingState(false);
        }
    }
    
    // Generate mock data for presentation
    function generateMockData() {
        const today = new Date();
        const mockData = [
            {
                Person_system_id: 'TP020',
                First_Name: 'Tarek Ezz',
                Email: 'tarekezz@yahoo.com',
                Employee: '0123456789',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Kuala Lumpur',
                F_Nationality: 'Egypt',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
           {
                Person_system_id: 'TP021',
                First_Name: 'Loai',
                Email: 'loai@tp.com',
                Employee: '0123456789',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Penang',
                F_Nationality: 'Yamen',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
      {
                Person_system_id: 'TP022',
                First_Name: 'Micole Barrientos',
                Email: 'miki@tp.com',
                Employee: '0123456789',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Penang',
                F_Nationality: 'Philipinese',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
     {
                Person_system_id: 'TP023',
                First_Name: 'Anna Saw Yee Lin',
                Email: 'anna@tp.com',
                Employee: '0123456789',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Penang',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
         {
                Person_system_id: 'TP024',
                First_Name: 'Pourya Tohidi',
                Email: 'pourya@tp.com',
                Employee: '0123456789',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Penang',
                F_Nationality: 'Iran',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
                 {
                Person_system_id: 'TP025',
                First_Name: 'Melaine Sua',
                Email: 'melaine@tp.com',
                Employee: '0123456789',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Penang',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
    
            // Application Received (2 examples)
            {
                Person_system_id: 'TP001',
                First_Name: 'Amr Ezz',
                Email: 'amr@gmail.com',
                Employee: '0183931348',
                Status: 'Application Received',
                Source: 'xRAF',
                Location: 'Kuala Lumpur',
                F_Nationality: 'Egypt',
                CreatedDate: new Date(today - 2 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 2 * 86400000).toISOString()
            },
            {
                Person_system_id: 'TP002', 
                First_Name: 'Micole Barrientos',
                Email: 'Miki@hotmail.com',
                Employee: '0126240297',
                Status: 'Contact Attempt 1',
                Source: 'xRAF',  // Changed to xRAF
                Location: 'Penang',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 5 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 4 * 86400000).toISOString()
            },
            // Assessment Stage (2 examples)
            {
                Person_system_id: 'TP003',
                First_Name: 'Kumar Raj',
                Email: 'kumar.raj@yahoo.com',
                Employee: '0176543210',
                Status: 'SHL Assessment: Conversational Multichat ENG',
                Source: 'xRAF',
                Location: 'Johor Bahru',
                F_Nationality: 'Indian',
                CreatedDate: new Date(today - 10 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 3 * 86400000).toISOString()
            },
            {
                Person_system_id: 'TP004',
                First_Name: 'Jennifer Tan',
                Email: 'jennifer.tan@gmail.com',
                Employee: '0165432109',
                Status: 'Interview Scheduled',
                Source: 'xRAF',
                Location: 'Cyberjaya',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 15 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 1 * 86400000).toISOString()
            },
            // Hired (Probation) (2 examples)
            {
                Person_system_id: 'TP005',
                First_Name: 'Michael Wong',
                Email: 'michael.wong@outlook.com',
                Employee: '0154321098',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Kuala Lumpur',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 45 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 30 * 86400000).toISOString()
            },
            // Lisa Chen - Hired Probation (not xRAF, so won't get payment)
            {
                Person_system_id: 'TP006',
                First_Name: 'Lisa Chen',
                Email: 'lisa.chen@gmail.com',
                Employee: '0143210987',
                Status: 'Onboarding Started',
                Source: 'xRAF',  // Changed to xRAF for payment eligibility
                Location: 'Petaling Jaya',
                F_Nationality: 'Chinese',
                CreatedDate: new Date(today - 60 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 50 * 86400000).toISOString()
            },
            // Hired (Confirmed) (2 examples)
            {
                Person_system_id: 'TP007',
                First_Name: 'David Lim',
                Email: 'david.lim@gmail.com',
                Employee: '0132109876',
                Status: 'Graduate',
                Source: 'xRAF',
                Location: 'Kuala Lumpur',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 120 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 95 * 86400000).toISOString()
            },
            {
                Person_system_id: 'TP008',
                First_Name: 'Emily Ooi',
                Email: 'emily.ooi@yahoo.com',
                Employee: '0121098765',
                Status: 'New Starter (Hired)',
                Source: 'xRAF',
                Location: 'Penang',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 150 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 100 * 86400000).toISOString()
            },
            // Previously Applied (No Payment) (2 examples)
            {
                Person_system_id: 'TP009',
                First_Name: 'Jason Ng',
                Email: 'jason.ng@gmail.com',
                Employee: '0110987654',
                Status: 'Interview Complete / Offer Requested',
                Source: 'External Portal',  // Not xRAF
                Location: 'Shah Alam',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 20 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 10 * 86400000).toISOString()
            },
            {
                Person_system_id: 'TP010',
                First_Name: 'Rachel Yap',
                Email: 'rachel.yap@hotmail.com',
                Employee: '0109876543',
                Status: 'Screened',
                Source: 'Internal Portal',  // Not xRAF
                Location: 'Subang Jaya',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 25 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 15 * 86400000).toISOString()
            },
            // Not Selected (2 examples)
            {
                Person_system_id: 'TP011',
                First_Name: 'Steven Toh',
                Email: 'steven.toh@gmail.com',
                Employee: '0198765432',
                Status: 'Eliminated - Assessment Results Did Not Meet Criteria',
                Source: 'xRAF',
                Location: 'Ipoh',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 30 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 20 * 86400000).toISOString()
            },
            {
                Person_system_id: 'TP012',
                First_Name: 'Angela Low',
                Email: 'angela.low@yahoo.com',
                Employee: '0187654321',
                Status: 'Withdrew - Other Job Offer',
                Source: 'xRAF',  // Changed to xRAF
                Location: 'Melaka',
                F_Nationality: 'Malaysian',
                CreatedDate: new Date(today - 35 * 86400000).toISOString(),
                UpdatedDate: new Date(today - 25 * 86400000).toISOString()
            }
        ];
        return mockData;
    }
    
    // Process API response with deduplication and fixed status mapping
    function processReferrals(apiData) {
        if (!Array.isArray(apiData)) return [];
        
        // Create a Map to track unique referrals by email+name combination
        const uniqueReferrals = new Map();
        
        apiData.forEach(item => {
            // Create unique key using email and name (or phone as fallback)
            const email = (item.Email || item.email || '').toLowerCase().trim();
            const name = (item.First_Name || item.name || 'Unknown').trim();
            const phone = (item.Employee || item.phone || '').trim();
            
            // Use email+name as primary key, or phone+name as fallback
            const uniqueKey = email ? `${email}_${name}` : `${phone}_${name}`;
            
            // Skip if we've already processed this person
            if (uniqueReferrals.has(uniqueKey)) {
                const existing = uniqueReferrals.get(uniqueKey);
                // If duplicate found, keep the one with more recent update date
                const existingDate = new Date(existing.UpdatedDate || existing.updatedDate || 0);
                const currentDate = new Date(item.UpdatedDate || item.updatedDate || 0);
                if (currentDate <= existingDate) {
                    return; // Skip this duplicate
                }
            }
            
            // Parse dates
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date();
                // Handle various date formats
                if (dateStr.includes('/')) {
                    const [month, day, year] = dateStr.split(/[\/\s]/).filter(Boolean).map(Number);
                    return new Date(year, month - 1, day);
                }
                return new Date(dateStr);
            };
            
            const updatedDate = parseDate(item.UpdatedDate || item.updatedDate);
            const createdDate = parseDate(item.CreatedDate || item.createdDate);
            const daysInStage = Math.floor((new Date() - updatedDate) / (86400000));
            const daysSinceCreation = Math.floor((new Date() - createdDate) / (86400000));
            
            // Get status and source
            const rawStatus = (item.Status || item.status || 'Application Received').trim();
            const source = (item.Source || item.source || item.SourceName || '').trim();
            
            // Check if xRAF referral (only xRAF is accepted for payment)
            const sourceL = source.toLowerCase().trim();
            const isXRAF = sourceL === 'xraf';
            
            // Get assessment result if available
            const assessment = item.assessment || null;
            
            // Map status with all parameters including source and days
            let mappedStatus = StatusMapping.mapStatusToGroup(rawStatus, assessment, source, daysInStage);
            
            // Special case: if status indicates hired and has been more than 90 days since created date
            if (mappedStatus === 'Hired (Probation)' && daysSinceCreation >= 90) {
                mappedStatus = 'Hired (Confirmed)';
            }
            
            const statusType = StatusMapping.getSimplifiedStatusType(rawStatus, assessment, source, daysInStage);
            const stage = StatusMapping.determineStage(rawStatus, assessment, source, daysInStage);
            
            // Check if needs reminder (any Application Received status)
            const needsAction = mappedStatus === 'Application Received';
            
            const processedReferral = {
                // IDs
                id: item.Person_system_id || item.personId || item.ID || uniqueKey,
                personId: item.Person_system_id || item.personId || item.ID,
                uniqueKey: uniqueKey,
                
                // Contact info
                name: name,
                email: email,
                phone: phone,
                
                // Status info
                status: rawStatus,
                mappedStatus: mappedStatus,
                statusType: statusType,
                stage: stage,
                
                // Source and eligibility
                source: source,
                isXRAF: isXRAF,
                isPreviousCandidate: !isXRAF && source !== '',
                
                // Assessment info
                assessment: assessment,
                hasPassedAssessment: assessment && assessment.score >= 70,
                assessmentScore: assessment ? assessment.score : null,
                assessmentDate: assessment ? assessment.date : null,
                
                // Location info
                location: item.Location || item.location || '',
                nationality: item.F_Nationality || item.nationality || '',
                
                // Dates
                createdDate: createdDate,
                updatedDate: updatedDate,
                daysInStage: daysInStage,
                daysSinceCreation: daysSinceCreation,
                
                // Action flags
                needsAction: needsAction,
                
                // Payment eligibility (with proper checks)
                isEligibleForAssessmentPayment: isXRAF && (
                    mappedStatus === 'Assessment Stage' || 
                    mappedStatus === 'Hired (Probation)' || 
                    mappedStatus === 'Hired (Confirmed)'
                ) && (!assessment || assessment.score >= 70),
                isEligibleForProbationPayment: isXRAF && mappedStatus === 'Hired (Confirmed)',
                
                // Original data for debugging
                _original: item
            };
            
            // Add to unique map
            uniqueReferrals.set(uniqueKey, processedReferral);
        });
        
        // Convert Map values to array and sort by created date (newest first)
        return Array.from(uniqueReferrals.values()).sort((a, b) => {
            return b.createdDate - a.createdDate;
        });
    }
    
    // Validate form inputs
    function validateInputs(phone, email) {
        let isValid = true;
        
        if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[AppState.currentLanguage].phoneError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }
        
        if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-email'));
        }
        
        return isValid;
    }
    
    function validatePhone(phone) {
        return /^01\d{8,9}$/.test(phone);
    }
    
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showError(input, message) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        error.textContent = message;
        input.classList.add('is-invalid');
    }
    
    function clearError(input) {
        input.classList.remove('is-invalid');
    }
    
    // Set loading state
    function setLoadingState(isLoading) {
        const submitBtn = document.getElementById('dashboard-submit');
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading ? 
            `<span class="spinner-border spinner-border-sm me-2"></span>${translations[AppState.currentLanguage].connectingMessage}` :
            translations[AppState.currentLanguage].viewStatusBtn;
    }
    
    // Handle language change
    function handleLanguageChange(e) {
        AppState.currentLanguage = e.target.value;
        updateTranslations();
        if (document.getElementById('results-step').style.display !== 'none') {
            showReferralResults(AppState.currentReferralsData);
        }
    }
    
    // Show results dashboard
    function showReferralResults(referrals) {
        document.getElementById('auth-step').style.display = 'none';
        const resultsStep = document.getElementById('results-step');
        resultsStep.style.display = 'block';
        
        // Create results content
        resultsStep.innerHTML = createResultsContent(referrals);
        
        // Initialize dashboard components
        updateChart(referrals);
        updateEarningsTable(referrals);
        updateReminderSection(referrals);
        updateReferralList(referrals);
        updateStatusGuide();
        updateTranslations();
    }
    
    // Create results HTML with new sections
    function createResultsContent(referrals) {
        const hiredCount = referrals.filter(r => 
            r.mappedStatus === 'Hired (Confirmed)' || r.mappedStatus === 'Hired (Probation)'
        ).length;
        
        const inProgressCount = referrals.filter(r => 
            r.mappedStatus === 'Application Received' || 
            r.mappedStatus === 'Assessment Stage'
        ).length;
        
        // Debug logging
        console.log('Referral Status Summary:');
        referrals.forEach(r => {
            console.log(`${r.name}: ${r.status} -> ${r.mappedStatus} (Source: ${r.source})`);
        });
        console.log('In Progress Count:', inProgressCount);
        console.log('Hired Count:', hiredCount);
        
        const userName = document.getElementById('dashboard-email').value.split('@')[0];
        
        return `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3 class="user-name-display">${userName}</h3>
                    <h4 data-translate="yourReferralsTitle">Your Referrals</h4>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </button>
            </div>
            
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card stats-card total">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
                            <h3 class="text-primary">${referrals.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card stats-card hired">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
                            <h3 class="text-success">${hiredCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card stats-card in-progress">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="inProgress">In Progress</h5>
                            <h3 class="text-warning">${inProgressCount}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Status Distribution Chart -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
                    <div class="chart-container">
                        <canvas id="statusChart"></canvas>
                        <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
                    </div>
                </div>
            </div>

            <!-- Earnings Table -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
                    <div class="table-responsive">
                        <table class="earnings-table">
                            <thead>
                                <tr>
                                    <th data-translate="earningsStage">Stage</th>
                                    <th data-translate="earningsAmount">Amount (RM)</th>
                                    <th data-translate="earningsCount">Count</th>
                                    <th data-translate="earningsTotal">Total</th>
                                </tr>
                            </thead>
                            <tbody id="earnings-body"></tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="3" data-translate="earningsTotal">Total Earnings</th>
                                    <th id="total-earnings">RM 0</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#tngModal" data-translate="paymentNote">
                            Payment Terms & Conditions
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Reminder Section -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">Remind Your Friends</h5>
                    <p class="text-center" data-translate="remindFriendsText">Help your friends complete their assessments to join TP!</p>
                    <div id="friends-to-remind" class="row"></div>
                </div>
            </div>
            
            <!-- Referral List -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="mb-3">All Referrals</h5>
                    <div id="referral-list"></div>
                </div>
            </div>
            
            <!-- Status Guide moved to end -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-4" data-translate="statusGuideTitle">Status Guide & Payment Information</h5>
                    <div id="status-guide-content"></div>
                </div>
            </div>           
        `;
    }
    
    // Handle back button
    function handleBackButton() {
        document.getElementById('auth-step').style.display = 'block';
        document.getElementById('results-step').style.display = 'none';
        document.getElementById('dashboard-phone').value = '';
        document.getElementById('dashboard-email').value = '';
        document.getElementById('dashboard-phone').focus();
        AppState.currentReferralsData = [];
    }
    
    // Handle WhatsApp reminders with professional message
    function handleReminderClick(e) {
        const button = e.target.closest('.remind-btn');
        if (!button) return;
        
        const name = button.dataset.name;
        const phone = button.dataset.phone;
        const lang = button.dataset.lang || AppState.currentLanguage;
        if (!phone) return;
        
        // Format phone for WhatsApp
        const formattedPhone = phone.startsWith('0') ? '6' + phone : phone;
        
        // Professional messages in different languages
        const messages = {
            en: `Hello ${name},\n\nI hope this message finds you well. This is a friendly reminder regarding your application to TP.\n\nWe noticed that you haven't completed your assessment yet. Please check your personal email for the assessment link that was sent to you.\n\nCompleting the assessment is an important step in your application process. If you have any questions or need assistance, please don't hesitate to reach out.\n\nBest regards,\nTP Recruitment Team`,
            
            ja: `${name}様\n\nお世話になっております。テレパフォーマンスへのご応募に関するリマインダーです。\n\nまだアセスメントを完了されていないようです。個人のメールアドレスに送信されたアセスメントのリンクをご確認ください。\n\nアセスメントの完了は、応募プロセスの重要なステップです。ご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。\nTP採用チーム`,
            
            ko: `안녕하세요 ${name}님,\n\n텔레퍼포먼스 지원과 관련하여 안내 드립니다.\n\n아직 평가를 완료하지 않으신 것으로 확인됩니다. 개인 이메일로 발송된 평가 링크를 확인해 주시기 바랍니다.\n\n평가 완료는 지원 과정에서 중요한 단계입니다. 궁금한 점이 있으시면 언제든지 문의해 주세요.\n\n감사합니다.\nTP 채용팀`,
            
            "zh-CN": `${name} 您好，\n\n这是关于您申请TP的友好提醒。\n\n我们注意到您还没有完成评估。请查看您的个人邮箱中发送的评估链接。\n\n完成评估是申请过程中的重要步骤。如果您有任何问题或需要帮助，请随时与我们联系。\n\n祝好，\nTP招聘团队`,
            
            "zh-HK": `${name} 您好，\n\n這是關於您申請TP的友好提醒。\n\n我們注意到您還沒有完成評估。請查看您的個人郵箱中發送的評估鏈接。\n\n完成評估是申請過程中的重要步驟。如果您有任何問題或需要幫助，請隨時與我們聯繫。\n\n祝好，\nTP招聘團隊`
        };
        
        const message = messages[lang] || messages.en;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    // Update status chart with fixed mapping
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        
        // Destroy previous chart
        if (AppState.statusChart) {
            AppState.statusChart.destroy();
        }
        
        // Count statuses using fixed mapping
        const counts = {};
        StatusMapping.displayOrder.forEach(status => {
            counts[status] = 0;
        });
        
        // Count each referral's mapped status
        referrals.forEach(r => {
            if (counts[r.mappedStatus] !== undefined) {
                counts[r.mappedStatus]++;
            }
        });
        
        // Chart colors - updated to match status types
        const colors = [
            '#0087FF',  // Application Received - blue
            '#00d769',  // Assessment Stage - green flash
            '#f5d200',  // Hired (Probation) - yellow
            '#84c98b',  // Hired (Confirmed) - green
            '#676767',  // Previously Applied (No Payment) - gray
            '#dc3545'   // Not Selected - red
        ];
        
        // Create new chart
        AppState.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: StatusMapping.displayOrder.map(status => 
                    translations[AppState.currentLanguage][`status${status.replace(/[\s()]/g, '')}`] || status
                ),
                datasets: [{
                    data: StatusMapping.displayOrder.map(status => counts[status] || 0),
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                        return {
                                            text: `${label} (${value})`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update earnings table with new logic
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        if (!earningsBody) return;
        
        // Calculate eligible candidates
        const assessmentPassed = referrals.filter(r => r.isEligibleForAssessmentPayment).length;
        const probationCompleted = referrals.filter(r => r.isEligibleForProbationPayment).length;
        
        // Calculate earnings
        const assessmentEarnings = assessmentPassed * 50;
        const probationEarnings = probationCompleted * 750;
        const totalEarnings = assessmentEarnings + probationEarnings;
        
        earningsBody.innerHTML = `
            <tr>
                <td data-translate="statusAssessmentPassed">Assessment Passed (Score ≥ 70%)</td>
                <td>RM 50</td>
                <td>${assessmentPassed}</td>
                <td>RM ${assessmentEarnings}</td>
            </tr>
            <tr>
                <td data-translate="statusProbationPassed">Probation Completed (90 days)</td>
                <td>RM 750</td>
                <td>${probationCompleted}</td>
                <td>RM ${probationEarnings}</td>
            </tr>
        `;
        
        document.getElementById('total-earnings').textContent = `RM ${totalEarnings}`;
    }
    
    // Update reminder section
    function updateReminderSection(referrals) {
        const container = document.getElementById('friends-to-remind');
        if (!container) return;
        
        // Filter friends needing reminder (Application Received status only)
        const friendsToRemind = referrals.filter(r => 
            r.mappedStatus === 'Application Received' && r.phone
        );
        
        if (friendsToRemind.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        friendsToRemind.forEach(friend => {
            container.innerHTML += `
                <div class="col-md-6 mb-3">
                    <div class="friend-to-remind">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5>${friend.name}</h5>
                            <span class="badge bg-${friend.statusType}">${friend.mappedStatus}</span>
                        </div>
                        <p class="small mb-1">${friend.email}</p>
                        <p class="small mb-2"><span data-translate="referralDays">Days in Stage</span>: ${friend.daysInStage}</p>
                        <button class="btn btn-primary w-100 remind-btn" 
                            data-name="${friend.name}" 
                            data-phone="${friend.phone}"
                            data-lang="${AppState.currentLanguage}">
                            <i class="fab fa-whatsapp me-2"></i>
                            <span data-translate="remindBtn">Send Reminder</span>
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    // Update referral list
    function updateReferralList(referrals) {
        const container = document.getElementById('referral-list');
        if (!container) return;
        
        if (referrals.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5 empty-state">
                        <i class="fas fa-users empty-state-icon"></i>
                        <h4 data-translate="noReferrals">No referrals found yet</h4>
                        <p data-translate="startReferring">Start referring friends to see them appear here!</p>
                        <a href="https://tpmyandtpth.github.io/xRAF/" class="btn btn-primary mt-3">
                            <i class="fas fa-user-plus me-2"></i><span data-translate="referFriend">Refer a Friend</span>
                        </a>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '<h5 class="mb-3">All Referrals</h5>';
        
        // Sort referrals by status order
        const sortedReferrals = [...referrals].sort((a, b) => {
            const aIndex = StatusMapping.displayOrder.indexOf(a.mappedStatus);
            const bIndex = StatusMapping.displayOrder.indexOf(b.mappedStatus);
            return aIndex - bIndex;
        });
        
        sortedReferrals.forEach(ref => {
            const assessmentInfo = ref.assessment ? 
                `<span class="assessment-score ${ref.assessmentScore < 70 ? 'low' : ''}">
                    Score: ${ref.assessmentScore}%
                </span>` : '';
            
            container.innerHTML += `
                <div class="card referral-card status-${ref.statusType} mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${ref.name}</h5>
                                <p class="small text-muted mb-1">${ref.email}</p>
                                ${ref.personId ? `<p class="small text-muted">ID: ${ref.personId}</p>` : ''}
                            </div>
                            <div class="text-end">
                                <span class="badge bg-${ref.statusType} status-badge">
                                    ${ref.mappedStatus}
                                </span>
                                ${assessmentInfo}
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-3">
                                <small class="text-muted" data-translate="referralStage">Stage</small>
                                <p>${ref.stage}</p>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted" data-translate="location">Location</small>
                                <p>${ref.location || 'N/A'}</p>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted" data-translate="referralDays">Days in Stage</small>
                                <p>${ref.daysInStage}</p>
                            </div>
                            <div class="col-md-3">
                                ${ref.needsAction && ref.phone ? `
                                <button class="btn btn-sm btn-success w-100 remind-btn" 
                                    data-name="${ref.name}" 
                                    data-phone="${ref.phone}">
                                    <i class="fab fa-whatsapp me-2"></i>
                                    <span data-translate="remindBtn">Remind</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="mt-2">
                            <small class="text-muted">
                                <span data-translate="source">Source</span>: ${ref.source || 'N/A'} | 
                                <span data-translate="statusDetails">Status Details</span>: ${ref.status}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    // Update status guide section
    function updateStatusGuide() {
        const container = document.getElementById('status-guide-content');
        if (!container) return;
        
        const t = translations[AppState.currentLanguage];
        
        container.innerHTML = `
            <div class="row">
                <!-- Status Examples -->
                <div class="col-md-6">
                    <h6 class="mb-3" data-translate="statusExamples">Status Examples</h6>
                    <div class="status-examples">
                        ${statusExamples.map(example => {
                            // Get the correct status type for coloring
                            let statusType = StatusMapping.getSimplifiedStatusType(example.status);
                            if (example.status === "Hired (Confirmed)") statusType = 'passed';
                            if (example.status === "Previously Applied (No Payment)") statusType = 'previously-applied';
                            
                            return `
                                <div class="status-example">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <strong>${t[`status${example.status.replace(/[\s()]/g, '')}`] || example.status}</strong>
                                        <span class="badge bg-${statusType}">
                                            ${example.status}
                                        </span>
                                    </div>
                                    <p class="mb-1 mt-2 small">${example.description}</p>
                                    <small class="text-muted">${example.action}</small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Payment Conditions -->
                <div class="col-md-6">
                    <h6 class="mb-3" data-translate="paymentConditions">Payment Conditions</h6>
                    <div class="table-responsive">
                        <table class="table status-guide-table">
                            <thead>
                                <tr>
                                    <th data-translate="stage">Stage</th>
                                    <th data-translate="condition">Condition</th>
                                    <th data-translate="payment">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(earningsStructure).map(([key, value]) => `
                                    <tr>
                                        <td>${value.label}</td>
                                        <td>${value.condition}</td>
                                        <td><strong>${value.payment}</strong></td>
                                    </tr>
                                `).join('')}
                                <tr>
                                    <td>Previously Applied</td>
                                    <td data-translate="noPaymentNote">Candidate applied before referral</td>
                                    <td><strong>No Payment</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="payment-notes mt-3">
                        <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>All payments via Touch 'n Go eWallet</p>
                        <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>Payments processed within 30 days</p>
                        <p class="small"><i class="fas fa-info-circle me-2"></i>Must be active TP employee at payment time</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update translations
    function updateTranslations() {
        const lang = AppState.currentLanguage;
        const t = translations[lang] || translations.en;
        
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (t[key]) {
                el.textContent = t[key];
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (t[key]) {
                el.placeholder = t[key];
            }
        });
    }
    
    // Show non-blocking error
    function showNonBlockingError(message) {
        const alertContainer = document.getElementById('alert-container');
        const alertId = 'alert-' + Date.now();
        
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.className = 'alert alert-warning alert-dismissible fade show';
        alert.setAttribute('role', 'alert');
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alertEl = document.getElementById(alertId);
            if (alertEl) {
                alertEl.classList.remove('show');
                setTimeout(() => alertEl.remove(), 150);
            }
        }, 5000);
    }
    
    // Initialize the app
    initializeApp();
    
    // Expose state for debugging
    window.AppState = AppState;
});
