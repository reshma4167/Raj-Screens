import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    // Customer and Print Details
    customerName: '',
    printDetails: '',
    
    // Media Details
    mediaType: '',
    size: '',
    quantity: 0,
    sides: 'single',
    color: 'color',
    
    // Payment Details
    paymentMode: 'cash',
    wastage: 0,
    
    // Finishing Details
    cutting: false,
    cuttingAmount: 0,
    digitalDye: false,
    digitalDyeSheets: 0,
    digitalDyeAmount: 0,
    lamination: false,
    laminationType: 'gloss',
    laminationFoil: 'gold',
    laminationSheets: 0,
    laminationSides: 'front',
    laminationAmount: 0,
    
    // Payment Summary
    advanceAmount: 0,
    discountedAmount: 0
  });

  // Pricing data structure
  const pricingData = {
    tier1: { // 6+ quantity
      art_board: { "12x18": { single: 12, both: 18 }, "13x19": { single: 13, both: 19 } },
      art_paper_130: { "12x18": { single: 11, both: 17 }, "13x19": { single: 12, both: 18 } },
      art_paper_170: { "12x18": { single: 11, both: 17 }, "13x19": { single: 12, both: 18 } },
      sticker: { "12x18": 13, "13x19": 14 },
      pvc_white: { "13x19": 35 },
      transparent_sticker: { "13x19": 35 },
      metallic_sticker: { "13x19": 35 },
      trump_board: { "13x19": { single: 40, both: 50 } },
      "100_ex_board": { "a3": 10 },
      special_board: { "13x19": { single: 25, both: 35 } }
    },
    tier2: { // 2-5 quantity
      art_board: { "12x18": { single: 15, both: 20 }, "13x19": { single: 15, both: 20 } },
      art_paper_130: { "12x18": { single: 15, both: 20 }, "13x19": { single: 15, both: 20 } },
      art_paper_170: { "12x18": { single: 15, both: 20 }, "13x19": { single: 15, both: 20 } },
      sticker: { "12x18": 20, "13x19": 20 },
      pvc_white: { "13x19": 40 },
      transparent_sticker: { "13x19": 40 },
      metallic_sticker: { "13x19": 40 },
      trump_board: { "13x19": { single: 40, both: 50 } },
      "100_ex_board": { "a3": 20 },
      special_board: { "13x19": { single: 40, both: 50 } }
    },
    tier3: { // 1 quantity
      art_board: { "12x18": { single: 20, both: 30 }, "13x19": { single: 20, both: 30 } },
      art_paper_130: { "12x18": { single: 20, both: 30 }, "13x19": { single: 20, both: 30 } },
      art_paper_170: { "12x18": { single: 20, both: 30 }, "13x19": { single: 20, both: 30 } },
      sticker: { "12x18": 20, "13x19": 20 },
      pvc_white: { "13x19": 40 },
      transparent_sticker: { "13x19": 40 },
      metallic_sticker: { "13x19": 40 },
      trump_board: { "13x19": { single: 40, both: 50 } },
      "100_ex_board": { "a3": 20 },
      special_board: { "13x19": { single: 40, both: 50 } }
    }
  };

  // Media options
  const mediaOptions = [
    { value: 'art_board', label: 'Art Board' },
    { value: 'art_paper_130', label: 'Art Paper 130' },
    { value: 'art_paper_170', label: 'Art Paper 170' },
    { value: 'sticker', label: 'Sticker' },
    { value: 'pvc_white', label: 'PVC White' },
    { value: 'transparent_sticker', label: 'Transparent Sticker' },
    { value: 'metallic_sticker', label: 'Metallic Sticker' },
    { value: 'trump_board', label: 'Trump Board' },
    { value: '100_ex_board', label: '100 Ex. Board' },
    { value: 'special_board', label: 'Special Board' }
  ];

  // Calculate pricing tier
  const getPricingTier = (quantity) => {
    if (quantity >= 6) return 'tier1';
    if (quantity >= 2) return 'tier2';
    return 'tier3';
  };

  // Calculate price
  const calculatePrice = (mediaType, size, quantity, sides) => {
    if (!mediaType || !size || !quantity) return 0;
    
    const tier = getPricingTier(quantity);
    const mediaData = pricingData[tier][mediaType];
    if (!mediaData) return 0;
    
    const sizeData = mediaData[size];
    if (!sizeData) return 0;
    
    let unitPrice;
    if (typeof sizeData === 'number') {
      unitPrice = sizeData;
    } else {
      unitPrice = sides === 'both' ? sizeData.both : sizeData.single;
    }
    
    return unitPrice * quantity;
  };

  // Get size options based on media type
  const getSizeOptions = (mediaType) => {
    if (mediaType === '100_ex_board') {
      return [{ value: 'a3', label: 'A3' }];
    }
    return [
      { value: '12x18', label: '12x18' },
      { value: '13x19', label: '13x19' }
    ];
  };

  // Calculated values
  const totalPrints = formData.quantity ? 
    (formData.sides === 'both' ? formData.quantity * 2 : formData.quantity) : 0;
  
  const totalAmount = calculatePrice(
    formData.mediaType, 
    formData.size, 
    formData.quantity, 
    formData.sides
  );
  
  const finishingTotal = 
    (formData.cutting ? formData.cuttingAmount : 0) +
    (formData.digitalDye ? formData.digitalDyeAmount : 0) +
    (formData.lamination ? formData.laminationAmount : 0);
  
  const grandTotal = totalAmount + finishingTotal + formData.wastage;
  const finalAmount = formData.discountedAmount || grandTotal;
  const remainingAmount = finalAmount - formData.advanceAmount;

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ==================== GOOGLE SHEETS INTEGRATION SETUP ====================
  // 
  // TO CONNECT TO GOOGLE SHEETS API, FOLLOW THESE STEPS:
  // 
  // 1. Go to https://console.cloud.google.com/
  // 2. Create a new project or select existing one
  // 3. Enable Google Sheets API in "APIs & Services" > "Library"
  // 4. Create Service Account in "APIs & Services" > "Credentials"
  // 5. Download the JSON key file
  // 6. Extract your CLIENT_EMAIL and PRIVATE_KEY from the JSON file
  // 7. Create a Google Sheet and share it with the CLIENT_EMAIL
  // 8. Get your SPREADSHEET_ID from the Google Sheets URL
  // 9. Replace the values below with your actual credentials
  // 
  // ========================================================================
  
  // Your Google Sheets Configuration (Replace these with your actual values)
  const GOOGLE_SHEETS_CONFIG = {
    CLIENT_EMAIL: "raj-digital-print@raj-digital-print.iam.gserviceaccount.com",
    PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCVAKfCpGL/ROc2\nMeqD3EepsyqDp1jRoWtT5So7QYT9axBPTQc044g1biuB1+CYdBJD5ZmWaXFurGth\nMU2VnUiU3tmt3whIUQ/zRVjsLVD0UCou4ZgRO9f8Lkpa5AxYyjk4SkwA/aLgJSoh\nHVmS8gHxa8xS3nRiCdDQ9sfP3ngmnApdbqJbZVNva3V7LCqs8Rk9l/mGcdJ0LhIB\nlQwc1VW6KI44hSDskq5OHDMjdrCK/T9yyD8KIEfV5yL0azUd/JFnlYOd1QClTt3e\n5JwMtLa6N7FLVDnXA2svtpWkWyx9bl8FREbTyMCAhN0KQPniVHs+ppmVXNU1+8mg\nn+FWkeApAgMBAAECggEAPbN8RL8y2XcscYZBESJuMIknUUZCoug/nAmZL9mFWzVz\nFwuUMOQJuuporMd601a5W5FfxOfcF5LhkmlKsepkLHWN2ZCyitO6kagFVyO60rjB\nhxFXGcfYvC5lDvdBX6E6CaPGjmB5im0JYZYYSh/aCyFzBlvlANYEuQuAGYWL5px0\nZH/y/4SPW67Mmp6SzEyRoe6trrSWfLoUjclpOfOgQ8y20OXkLrlEGs+m/w8G8NsK\nxBHLgXEKm6o5+hDtwpISYQZdx4fUXfvIRrHeCHPMZBcIqafsfkTA7E3l12tUw1ey\nZ12PdikSKWGMZ+JYXgRQiO1KP+/lGm1Vs2vj8sGSawKBgQDIo7YremMzhOoTsfr7\n3dqcm7ha8DxMLREbZrwvNR6n34fK8vfqfEMJLg8sNFpITllSDpFQTMNcaVW39B+/\nM8xQrYxv1T+XpELfIC35rmot11SVL6FHGFoTJ1GvtEHgriTaPBAMWUFOxSs4lKXK\nFMAXC4s5TKYA30WKhu4DWQ7DcwKBgQC+HYnQIpsA1h+r2cFE9+3+9b1+gre/Hl73\n/ieC3hfdwYbW7KqU8qJudHmCbOV1nAEdnfpA5R5Ijhl6xUEBcvmCI7sfwU4SyFyr\nTzof7KvPbFxtKjwOjAghaPBWOMKjJiqV04T6Mw8Wz7lCHYW28pMUaFSBh2GuZobt\ny0uli8W+8wKBgQChxi6aO+JEpgS+wKDn9+fOolgxKsbTfPrwJxPQ1HnVTYyF/QYc\nUPkUK8kcEVJCProSSaCtKFfU6TGuUu5OEovI+UXk3gKaWF163s1zJkiCkb6nU3Is\nitwF2YwpqaP8by1TsV4XNthLlPrWcjSDDdwcOLiXCNBIn73IhibfGC2pNQKBgQCW\n4MRdbQlMqaJq9R7gCE9V11qyyzTeNVEzSP28a1vPfuXvLdXW7ZShSkigjKGyK8Pq\n6FQSKoNVG4j3GRKU/tUrRgYcloHKgD6jKfY8HczgieP0Mt+Ev/c35JtQIi294u1L\nCJnxIpJoDSS+ZsWWwn6dZIskXPfVu8J7d6qqT/n4pwKBgCs9ZrchAXxymeeox5Dc\nk7SP/Lt3G97gHe+75Q3lG1AMDD4MqbaLOAr2M5eXHFiPbpSjxlGXe32kCa2E5fqX\nf3iCOhSLl21laMPCHev6cy8UxyZYRc6kNhekuSVeE4zN6WeyKxozKzu+y0tqlLUj\nw7rrbT/K6NroL0XMPPOy2D3a\n-----END PRIVATE KEY-----",
    SPREADSHEET_ID: "1LkMyD9lq236S3fq-Ca3ql98jzlIPYcRAsbI-ixrXV08",
    SHEET_NAME: "Sheet1"
  };

  // JWT Helper Functions
  const base64urlEscape = (str) => {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const base64urlEncode = (str) => {
    return base64urlEscape(btoa(str));
  };

  const createJWT = async (clientEmail, privateKey) => {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    try {
      // Import the private key
      const pemHeader = '-----BEGIN PRIVATE KEY-----';
      const pemFooter = '-----END PRIVATE KEY-----';
      const pemContents = privateKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
      
      // Convert PEM to ArrayBuffer
      const binaryDer = atob(pemContents);
      const binaryArray = new Uint8Array(binaryDer.length);
      for (let i = 0; i < binaryDer.length; i++) {
        binaryArray[i] = binaryDer.charCodeAt(i);
      }

      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryArray.buffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );

      // Sign the token
      const encoder = new TextEncoder();
      const data = encoder.encode(unsignedToken);
      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, data);
      
      // Convert signature to base64url
      const signatureArray = new Uint8Array(signature);
      const signatureBase64 = btoa(String.fromCharCode.apply(null, signatureArray));
      const signatureBase64url = base64urlEscape(signatureBase64);

      return `${unsignedToken}.${signatureBase64url}`;
    } catch (error) {
      console.error('JWT Creation Error:', error);
      throw new Error('Failed to create JWT token');
    }
  };

  const getAccessToken = async (jwt) => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Access Token Error:', error);
      throw new Error('Failed to get access token');
    }
  };

  const saveToGoogleSheets = async (invoiceData) => {
    // Prepare data for Google Sheets
    const sheetsRowData = [
      'Invoice-' + Date.now(), // Invoice ID
      invoiceData.customerName,
      invoiceData.printDetails,
      invoiceData.mediaType,
      invoiceData.size,
      invoiceData.quantity,
      invoiceData.sides,
      totalPrints,
      invoiceData.color,
      invoiceData.paymentMode,
      invoiceData.wastage,
      totalAmount.toFixed(2),
      finalAmount.toFixed(2),
      
      // Finishing details
      invoiceData.cutting ? 'Yes' : 'No',
      invoiceData.cuttingAmount,
      invoiceData.digitalDye ? 'Yes' : 'No',
      invoiceData.digitalDyeSheets,
      invoiceData.digitalDyeAmount,
      invoiceData.lamination ? 'Yes' : 'No',
      invoiceData.laminationType,
      invoiceData.laminationFoil,
      invoiceData.laminationSheets,
      invoiceData.laminationSides,
      invoiceData.laminationAmount,
      
      // Summary
      finishingTotal.toFixed(2),
      invoiceData.discountedAmount || '',
      invoiceData.advanceAmount,
      remainingAmount.toFixed(2),
      new Date().toISOString().split('T')[0] // Date
    ];
    
    try {
      // Check if configuration is set up
      if (GOOGLE_SHEETS_CONFIG.CLIENT_EMAIL.includes('your-service-account')) {
        console.log('📊 Google Sheets Data Ready:', sheetsRowData);
        alert('⚠️ Google Sheets Configuration Required!\n\nTo save invoices to Google Sheets:\n\n1. Go to https://console.cloud.google.com/\n2. Create a service account\n3. Download the JSON key\n4. Replace GOOGLE_SHEETS_CONFIG in the code\n5. Share your Google Sheet with the service account email\n\nData structure logged to console.');
        return;
      }

      console.log('🚀 Connecting to Google Sheets...');
      
      // Step 1: Create JWT token
      const jwt = await createJWT(GOOGLE_SHEETS_CONFIG.CLIENT_EMAIL, GOOGLE_SHEETS_CONFIG.PRIVATE_KEY);
      
      // Step 2: Get access token
      const accessToken = await getAccessToken(jwt);
      
      // Step 2.5: First, let's get the list of sheets to debug the issue
      const spreadsheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}`;
      const spreadsheetResponse = await fetch(spreadsheetUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      
      if (spreadsheetResponse.ok) {
        const spreadsheetData = await spreadsheetResponse.json();
        console.log('📋 Available sheets in your spreadsheet:');
        const availableSheets = spreadsheetData.sheets.map(sheet => sheet.properties.title);
        console.log(availableSheets);
        
        // Check if our target sheet exists
        const targetSheet = GOOGLE_SHEETS_CONFIG.SHEET_NAME;
        const sheetExists = availableSheets.includes(targetSheet);
        
        if (!sheetExists) {
          throw new Error(`Sheet "${targetSheet}" not found. Available sheets: ${availableSheets.join(', ')}\n\nPlease either:\n1. Rename one of your sheets to "${targetSheet}"\n2. Update SHEET_NAME in the code to match an existing sheet`);
        }
        
        console.log(`✅ Found target sheet: "${targetSheet}"`);
      }
      
      // Step 3: Append data to Google Sheets
      // Properly encode sheet name for URL (handles spaces and special characters)
      const encodedSheetName = encodeURIComponent(GOOGLE_SHEETS_CONFIG.SHEET_NAME);
      const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${encodedSheetName}!A:Z:append?valueInputOption=USER_ENTERED`;
      
      console.log('📤 Attempting to save to:', sheetsUrl);
      
      const response = await fetch(sheetsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [sheetsRowData]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        
        // Parse error for better user feedback
        let errorMessage = `Google Sheets API Error: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error && errorJson.error.message) {
            errorMessage = errorJson.error.message;
            
            // Specific handling for range/sheet name errors
            if (errorMessage.includes('Unable to parse range') || errorMessage.includes('unable to parse range')) {
              errorMessage = `Sheet name "${GOOGLE_SHEETS_CONFIG.SHEET_NAME}" not found. Please check:\n• Sheet name is correct (case-sensitive)\n• Sheet exists in your spreadsheet\n• No typos in sheet name`;
            }
          }
        } catch (e) {
          // If error parsing fails, use original error
          errorMessage += ` - ${errorData}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Successfully saved to Google Sheets:', result);
      alert('✅ Invoice saved to Google Sheets successfully!\n\n' + 
            `Invoice: ${sheetsRowData[0]}\n` +
            `Customer: ${invoiceData.customerName}\n` +
            `Amount: ₹${finalAmount.toFixed(2)}`);
      
    } catch (error) {
      console.error('❌ Google Sheets Error:', error);
      
      if (error.message.includes('JWT')) {
        alert('❌ Authentication Error!\n\nPlease check your Google Sheets credentials:\n• CLIENT_EMAIL\n• PRIVATE_KEY\n\nMake sure the private key is properly formatted.');
      } else if (error.message.includes('404')) {
        alert('❌ Spreadsheet Not Found!\n\nPlease check:\n• SPREADSHEET_ID is correct\n• Sheet is shared with service account email\n• SHEET_NAME exists');
      } else {
        alert('❌ Failed to save to Google Sheets:\n\n' + error.message);
      }
    }
  };

  // PDF Generation Function
  const generatePDF = (invoiceData) => {
    const invoiceId = 'INV-' + Date.now();
    const currentDate = new Date().toLocaleDateString('en-IN');
    
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${invoiceData.customerName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            padding: 20px;
            background: white;
          }
          .invoice-header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .company-logo {
            display: inline-block;
            margin-bottom: 10px;
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #2563eb; 
            margin: 10px 0;
          }
          .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
          }
          .customer-details h3, .invoice-details h3 { 
            color: #2563eb; 
            margin-bottom: 10px; 
            font-size: 16px;
          }
          .invoice-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          .invoice-table th, .invoice-table td { 
            border: 1px solid #e2e8f0; 
            padding: 12px; 
            text-align: left; 
          }
          .invoice-table th { 
            background: #2563eb; 
            color: white; 
            font-weight: 600;
          }
          .invoice-table tr:nth-child(even) { 
            background: #f8fafc; 
          }
          .totals-section { 
            margin-top: 30px; 
            display: flex; 
            justify-content: flex-end; 
          }
          .totals-table { 
            width: 300px; 
            border-collapse: collapse; 
          }
          .totals-table td { 
            padding: 8px 12px; 
            border: 1px solid #e2e8f0; 
          }
          .totals-table .label { 
            background: #f8fafc; 
            font-weight: 600; 
          }
          .total-amount { 
            background: #2563eb !important; 
            color: white !important; 
            font-weight: bold; 
            font-size: 16px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
            .invoice-header { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-logo">
            <img src="./logo.jpg" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;" />
          </div>
          <div class="company-name">Raj Digital Print</div>
          <div style="color: #64748b; font-size: 14px;">Professional Printing Services</div>
        </div>

        <div class="invoice-info">
          <div class="customer-details">
            <h3>Bill To:</h3>
            <strong>${invoiceData.customerName}</strong><br>
            <div style="margin-top: 10px; color: #64748b;">
              <strong>Print Details:</strong><br>
              ${invoiceData.printDetails.split('\n').join('<br>')}
            </div>
          </div>
          <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <strong>Invoice #:</strong> ${invoiceId}<br>
            <strong>Date:</strong> ${currentDate}<br>
            <strong>Payment Mode:</strong> ${invoiceData.paymentMode.toUpperCase()}<br>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Specifications</th>
              <th>Quantity</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Print Job</strong></td>
              <td>
                Media: ${invoiceData.mediaType}<br>
                Size: ${invoiceData.size}<br>
                Sides: ${invoiceData.sides}<br>
                Color: ${invoiceData.color}
                ${invoiceData.wastage > 0 ? `<br>Wastage: ${invoiceData.wastage}%` : ''}
              </td>
              <td>${invoiceData.quantity} (Total: ${totalPrints})</td>
              <td>₹${totalAmount.toFixed(2)}</td>
            </tr>
            ${invoiceData.cutting ? `
            <tr>
              <td><strong>Cutting Service</strong></td>
              <td>Professional cutting service</td>
              <td>1</td>
              <td>₹${invoiceData.cuttingAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${invoiceData.digitalDye ? `
            <tr>
              <td><strong>Digital Die Cutting</strong></td>
              <td>Digital die cutting service</td>
              <td>${invoiceData.digitalDyeSheets} sheets</td>
              <td>₹${invoiceData.digitalDyeAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${invoiceData.lamination ? `
            <tr>
              <td><strong>Lamination</strong></td>
              <td>
                Type: ${invoiceData.laminationType}<br>
                Foil: ${invoiceData.laminationFoil}<br>
                Sides: ${invoiceData.laminationSides}
              </td>
              <td>${invoiceData.laminationSheets} sheets</td>
              <td>₹${invoiceData.laminationAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td class="label">Subtotal:</td>
              <td>₹${(totalAmount + finishingTotal).toFixed(2)}</td>
            </tr>
            ${invoiceData.discountedAmount > 0 ? `
            <tr>
              <td class="label">Discount:</td>
              <td>-₹${invoiceData.discountedAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="total-amount">
              <td class="label">Total Amount:</td>
              <td>₹${finalAmount.toFixed(2)}</td>
            </tr>
            ${invoiceData.advanceAmount > 0 ? `
            <tr>
              <td class="label">Advance Paid:</td>
              <td>₹${invoiceData.advanceAmount.toFixed(2)}</td>
            </tr>
            <tr style="background: #fef3c7; color: #92400e; font-weight: bold;">
              <td class="label">Balance Due:</td>
              <td>₹${remainingAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>This invoice was generated on ${currentDate}</p>
          <p>For any queries, please contact Raj Digital Print</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Auto-print after a short delay to allow content to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.customerName || !formData.printDetails) {
      alert('Please fill in customer name and print details');
      return;
    }
    
    const invoiceData = {
      ...formData,
      totalPrints,
      totalAmount,
      finishingTotal,
      grandTotal,
      finalAmount,
      remainingAmount,
      createdAt: new Date().toISOString()
    };
    
    // Generate PDF instead of just logging to console
    generatePDF(invoiceData);
    console.log('Invoice Data:', invoiceData);
  };

  const handleSaveToSheets = () => {
    if (!formData.customerName || !formData.printDetails) {
      alert('Please fill in customer name and print details');
      return;
    }
    
    const invoiceData = {
      ...formData,
      totalPrints,
      totalAmount,
      finishingTotal,
      grandTotal,
      finalAmount,
      remainingAmount
    };
    
    saveToGoogleSheets(invoiceData);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.jpg" alt="" className="company-logo" />
          </div>
          <h1>Raj Digital Print</h1>
        </div>
      </header>

      <div className="container">
        <div className="form-section">
          {/* Customer Name and Print Details - First Line */}
          <div className="billing-section">
            <h2>Billing Details</h2>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="form-group full-width">
                <label>Print Details (Manual Entry)</label>
                <textarea
                  value={formData.printDetails}
                  onChange={(e) => handleInputChange('printDetails', e.target.value)}
                  placeholder="Enter print specifications and requirements"
                  rows="3"
                />
              </div>
            </div>

            {/* Media, Size, Quantity, Sides, Color - Second Line */}
            <div className="form-row">
              <div className="form-group">
                <label>Media</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => handleInputChange('mediaType', e.target.value)}
                >
                  <option value="">Select Media</option>
                  {mediaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                >
                  <option value="">Select Size</option>
                  {getSizeOptions(formData.mediaType).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Sides</label>
                <select
                  value={formData.sides}
                  onChange={(e) => handleInputChange('sides', e.target.value)}
                >
                  <option value="single">Single</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="form-group">
                <label>Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                >
                  <option value="color">Color</option>
                  <option value="bw">Black and White</option>
                </select>
              </div>
            </div>

            {/* Payment Mode, Wastage - Third Line */}
            <div className="form-row">
              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                >
                  <option value="phone_pe">Phone Pe</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Wastage Prints</label>
                <input
                  type="number"
                  value={formData.wastage}
                  onChange={(e) => handleInputChange('wastage', parseFloat(e.target.value) || 0)}
                  placeholder="Enter wastage amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Total Amount, Amount After Discount - Fourth Line */}
            <div className="form-row">
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="number"
                  value={totalAmount.toFixed(2)}
                  readOnly
                  className="auto-calculated"
                />
                <small>Auto-calculated from pricing tiers</small>
              </div>
              <div className="form-group">
                <label>Amount After Discount</label>
                <input
                  type="number"
                  value={formData.discountedAmount}
                  onChange={(e) => handleInputChange('discountedAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Enter discounted amount (optional)"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Finishing Details */}
          <div className="finishing-section">
            <h2>Finishing Details</h2>
            
            {/* Cutting - One Line */}
            <div className="finishing-item">
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.cutting}
                      onChange={(e) => handleInputChange('cutting', e.target.checked)}
                    />
                    Cutting Required
                  </label>
                </div>
                {formData.cutting && (
                  <div className="form-group">
                    <label>Cutting Amount</label>
                    <input
                      type="number"
                      value={formData.cuttingAmount}
                      onChange={(e) => handleInputChange('cuttingAmount', parseFloat(e.target.value) || 0)}
                      placeholder="Enter cutting cost"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Digital Dye - Next Line */}
            <div className="finishing-item">
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.digitalDye}
                      onChange={(e) => handleInputChange('digitalDye', e.target.checked)}
                    />
                    Digital Dye Cutting
                  </label>
                </div>
                {formData.digitalDye && (
                  <>
                    <div className="form-group">
                      <label>No. of Sheets</label>
                      <input
                        type="number"
                        value={formData.digitalDyeSheets}
                        onChange={(e) => handleInputChange('digitalDyeSheets', parseInt(e.target.value) || 0)}
                        placeholder="Enter sheet count"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Digital Dye Amount</label>
                      <input
                        type="number"
                        value={formData.digitalDyeAmount}
                        onChange={(e) => handleInputChange('digitalDyeAmount', parseFloat(e.target.value) || 0)}
                        placeholder="Enter cost"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Lamination - Next Line */}
            <div className="finishing-item">
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.lamination}
                      onChange={(e) => handleInputChange('lamination', e.target.checked)}
                    />
                    Lamination Required
                  </label>
                </div>
              </div>
              
              {formData.lamination && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Lamination Type</label>
                      <select
                        value={formData.laminationType}
                        onChange={(e) => handleInputChange('laminationType', e.target.value)}
                      >
                        <option value="gloss">Gloss</option>
                        <option value="matte">Matte</option>
                        <option value="velvet">Velvet</option>
                        <option value="grainy">Grainy</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Foil</label>
                      <select
                        value={formData.laminationFoil}
                        onChange={(e) => handleInputChange('laminationFoil', e.target.value)}
                      >
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>No. of Sheets</label>
                      <input
                        type="number"
                        value={formData.laminationSheets}
                        onChange={(e) => handleInputChange('laminationSheets', parseInt(e.target.value) || 0)}
                        placeholder="Enter sheet count"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Sides</label>
                      <select
                        value={formData.laminationSides}
                        onChange={(e) => handleInputChange('laminationSides', e.target.value)}
                      >
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                        <option value="both">Front and Back</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Lamination Amount</label>
                      <input
                        type="number"
                        value={formData.laminationAmount}
                        onChange={(e) => handleInputChange('laminationAmount', parseFloat(e.target.value) || 0)}
                        placeholder="Enter cost"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary Block */}
        <div className="summary-section">
          <h2>Invoice Summary</h2>
          <div className="summary-content">
            <div className="summary-row">
              <span>Total Prints:</span>
              <span>{totalPrints}</span>
            </div>
            <div className="summary-row">
              <span>Print Amount:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Finishing Total:</span>
              <span>₹{finishingTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Wastage:</span>
              <span>₹{formData.wastage.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Total Amount After Discount:</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Payment Type:</span>
              <span>{formData.paymentMode.replace('_', ' ').toUpperCase()}</span>
            </div>
            
            <div className="payment-section">
              <div className="form-group">
                <label>Advance Amount Paid</label>
                <input
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) => handleInputChange('advanceAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Enter advance paid"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="summary-row remaining">
              <span>Amount Needed to be Paid:</span>
              <span>₹{remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="actions">
            <button onClick={handleSubmit} className="btn-primary">
              Generate Invoice
            </button>
            <button onClick={handleSaveToSheets} className="btn-secondary">
              Save to Google Sheets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;