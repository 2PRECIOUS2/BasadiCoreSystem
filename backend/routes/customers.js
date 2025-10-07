import express from 'express';

const customersRoutes = (pool) => {
  const router = express.Router();

  // Function to get country abbreviations
  const getCountryAbbreviation = (country) => {
    const countryAbbreviations = {
      'South Africa': 'SA',
      'United States': 'USA',
      'United States of America': 'USA',
      'United Kingdom': 'UK',
      'United Arab Emirates': 'UAE',
      'New Zealand': 'NZ',
      'Saudi Arabia': 'SA',
      'South Korea': 'SK',
      'North Korea': 'NK',
      'Czech Republic': 'CZ',
      'Dominican Republic': 'DR',
      'Costa Rica': 'CR',
      'Puerto Rico': 'PR',
      'Sri Lanka': 'LK',
      'El Salvador': 'SV',
      'Papua New Guinea': 'PNG',
      'Trinidad and Tobago': 'TT',
      'Bosnia and Herzegovina': 'BA',
      'Central African Republic': 'CAR',
      'Democratic Republic of the Congo': 'DRC',
      'Ivory Coast': 'CI',
      'Burkina Faso': 'BF',
      'Sierra Leone': 'SL',
      'Equatorial Guinea': 'GQ',
      'Solomon Islands': 'SB',
      'Marshall Islands': 'MH',
      'Cayman Islands': 'KY',
      'Virgin Islands': 'VI',
      'Cook Islands': 'CK',
      'Faroe Islands': 'FO',
      'Northern Mariana Islands': 'MP',
      'Turks and Caicos Islands': 'TC',
      'British Virgin Islands': 'VG',
      'American Samoa': 'AS',
      'French Polynesia': 'PF',
      'New Caledonia': 'NC',
      'Isle of Man': 'IM',
      'Hong Kong': 'HK',
      'Macau': 'MO',
      'Germany': 'DE',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Portugal': 'PT',
      'Netherlands': 'NL',
      'Belgium': 'BE',
      'Switzerland': 'CH',
      'Austria': 'AT',
      'Denmark': 'DK',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Finland': 'FI',
      'Poland': 'PL',
      'Russia': 'RU',
      'China': 'CN',
      'Japan': 'JP',
      'India': 'IN',
      'Australia': 'AU',
      'Canada': 'CA',
      'Mexico': 'MX',
      'Brazil': 'BR',
      'Argentina': 'AR',
      'Chile': 'CL',
      'Egypt': 'EG',
      'Nigeria': 'NG',
      'Kenya': 'KE',
      'Morocco': 'MA',
      'Ghana': 'GH',
      'Ethiopia': 'ET',
      'Algeria': 'DZ',
      'Tunisia': 'TN',
      'Libya': 'LY',
      'Sudan': 'SD',
      'Zimbabwe': 'ZW',
      'Botswana': 'BW',
      'Namibia': 'NA',
      'Zambia': 'ZM',
      'Mozambique': 'MZ',
      'Tanzania': 'TZ',
      'Uganda': 'UG',
      'Rwanda': 'RW',
      'Malawi': 'MW',
      'Madagascar': 'MG'
    };
    
    return countryAbbreviations[country] || country;
  };

  // GET all customers (including archived)
  router.get('/', async (req, res) => {
    try {
      console.log('🔍 Starting customer fetch...');
      // Modified SQL query - Include ALL customers (active and archived)
      const result = await pool.query(`
        SELECT 
          cust_id as "customerNumber",
          cust_fname as "firstName",
          cust_lname as "lastName",
          COALESCE(cust_fname, '') || ' ' || COALESCE(cust_lname, '') as "customerName",
          cust_email as email,
          phone_number as "phoneNumber",
          country_code as "countryCode",
          phone_prefix as "phonePrefix",
          full_phone as phone,
          street_address as "streetAddress",
          city,
          state_province as "stateProvince",
          postal_code as "postalCode",
          country,
          TO_CHAR(date_of_birth, 'YYYY-MM-DD') as "dateOfBirth",
          cust_gender as gender,
          cust_status as status,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM customers 
        ORDER BY 
          CASE WHEN cust_status = 'active' THEN 1 ELSE 2 END,
          cust_id DESC
      `);

      console.log('🔍 SQL returned rows:', result.rows.length);
      if (result.rows.length > 0) {
        console.log('🔍 First SQL row:', result.rows[0]);
        console.log('🔍 SQL row keys:', Object.keys(result.rows[0]));
        console.log('🔍 customerNumber value:', result.rows[0].customerNumber);
        console.log('🔍 firstName value:', result.rows[0].firstName);
        console.log('🔍 lastName value:', result.rows[0].lastName);
      }

      // Enhanced data transformation with order count and amount spent
      const customers = await Promise.all(result.rows.map(async (customer) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const countryAbbr = getCountryAbbreviation(customer.country);

        const locationParts = [];
        if (customer.city) locationParts.push(customer.city);
        if (customer.stateProvince) locationParts.push(customer.stateProvince);
        if (customer.country) locationParts.push(countryAbbr);

        // Better name handling
        const fullName = customer.customerName?.trim() || 
                         `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 
                         'Unknown Customer';

        const initials = `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`.toUpperCase() || 'UC';

        // Create comprehensive customer object
        const finalCustomer = {
          // Core identifiers
          id: customer.customerNumber,
          customerNumber: customer.customerNumber,
          customernumber: customer.customerNumber,

          // Names (multiple formats for compatibility)
          firstName: customer.firstName || '',
          firstname: customer.firstName || '',
          lastName: customer.lastName || '',
          lastname: customer.lastName || '',
          customerName: fullName,
          customername: fullName,
          fullName: fullName,

          // Contact information
          email: customer.email || '',
          phoneNumber: customer.phoneNumber || '',
          phonenumber: customer.phoneNumber || '',
          countryCode: customer.countryCode || '',
          countrycode: customer.countryCode || '',
          phonePrefix: customer.phonePrefix || '',
          phoneprefix: customer.phonePrefix || '',
          phone: customer.phone || '',

          // Address information
          streetAddress: customer.streetAddress || '',
          streetaddress: customer.streetAddress || '',
          city: customer.city || '',
          stateProvince: customer.stateProvince || '',
          stateprovince: customer.stateProvince || '',
          postalCode: customer.postalCode || '',
          postalcode: customer.postalCode || '',
          country: customer.country || '',

          // Personal information
          dateOfBirth: customer.dateOfBirth,
          dateofbirth: customer.dateOfBirth,
          gender: customer.gender || '',
          status: customer.status || 'active',

          // Display properties
          customerNumberDisplay: `#${customer.customerNumber}`,
          customernumberdisplay: `#${customer.customerNumber}`,
          initials: initials,
          profileColor: randomColor,
          profilecolor: randomColor,
          location: locationParts.join(', '),

          // Status colors
          statusColor: customer.status === 'active' ? '#4CAF50' : 
                      customer.status === 'archived' ? '#FF9800' : '#f44336',
          statuscolor: customer.status === 'active' ? '#4CAF50' : 
                      customer.status === 'archived' ? '#FF9800' : '#f44336',
          statusBackground: customer.status === 'active' ? '#E8F5E8' : 
                           customer.status === 'archived' ? '#FFF3E0' : '#FFEBEE',
          statusbackground: customer.status === 'active' ? '#E8F5E8' : 
                           customer.status === 'archived' ? '#FFF3E0' : '#FFEBEE',

          // Additional properties
          orders: 0, // Will be updated below
          amountSpent: 0, // Will be updated below
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        };

        // Fetch order count and amount spent for this customer
        try {
          const orderResult = await pool.query(
            'SELECT COUNT(*) AS order_count, COALESCE(SUM(totalamount), 0) AS amount_spent FROM orders WHERE customerid = $1',
            [customer.customerNumber]
          );
          finalCustomer.orders = parseInt(orderResult.rows[0].order_count, 10) || 0;
          finalCustomer.amountSpent = parseFloat(orderResult.rows[0].amount_spent) || 0;
        } catch (err) {
          console.error(`❌ Error fetching orders for customer ${customer.customerNumber}:`, err);
          finalCustomer.orders = 0;
          finalCustomer.amountSpent = 0;
        }

        console.log('🔥 Final customer object:', {
          id: finalCustomer.id,
          customerNumber: finalCustomer.customerNumber,
          fullName: finalCustomer.fullName,
          status: finalCustomer.status,
          customerNumberDisplay: finalCustomer.customerNumberDisplay,
          orders: finalCustomer.orders,
          amountSpent: finalCustomer.amountSpent
        });

        return finalCustomer;
      }));

      console.log('🚀 Total customers processed:', customers.length);
      console.log('🚀 Active customers:', customers.filter(c => c.status === 'active').length);
      console.log('🚀 Archived customers:', customers.filter(c => c.status === 'archived').length);

      // Enhanced debugging - check what's actually being sent
      if (customers.length > 0) {
        console.log('🚀 Sample customer being sent to frontend:', {
          id: customers[0].id,
          customerNumber: customers[0].customerNumber,
          firstName: customers[0].firstName,
          lastName: customers[0].lastName,
          fullName: customers[0].fullName,
          email: customers[0].email,
          orders: customers[0].orders,
          amountSpent: customers[0].amountSpent
        });
        console.log('🚀 All keys in first customer:', Object.keys(customers[0]));
      }

      res.json({
        success: true,
        data: customers,
        message: 'Fetched all customers',
        stats: {
          total: customers.length,
          active: customers.filter(c => c.status === 'active').length,
          archived: customers.filter(c => c.status === 'archived').length
        }
      });
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error.message
      });
    }
  });

  // ...existing code...



router.get('/:id/order-count', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    console.log('🔎 [order-count] customerId:', customerId);
    const result = await pool.query(
      'SELECT COUNT(*) AS order_count FROM orders WHERE customerid = $1',
      [customerId]
    );
    console.log('🔎 [order-count] query result:', result.rows);
    const orderCount = parseInt(result.rows[0].order_count, 10) || 0;
    res.json({ success: true, orderCount });
  } catch (error) {
    console.error('❌ [order-count] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET amount spent by a customer
router.get('/:id/amount-spent', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    console.log('🔎 [amount-spent] customerId:', customerId);
    const result = await pool.query(
      'SELECT SUM(totalamount) AS amount_spent FROM orders WHERE customerid = $1',
      [customerId]
    );
    console.log('🔎 [amount-spent] query result:', result.rows);
    const amountSpent = parseFloat(result.rows[0].amount_spent) || 0;
    res.json({ success: true, amountSpent });
  } catch (error) {
    console.error('❌ [amount-spent] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
  // GET single customer by ID
  router.get('/:id', async (req, res) => {
    try {
      const customerId = req.params.id;
      console.log('🔍 Fetching customer:', customerId);

      const result = await pool.query(`
        SELECT 
          cust_id as customerNumber,
          cust_fname as firstName,
          cust_lname as lastName,
          COALESCE(cust_fname, '') || ' ' || COALESCE(cust_lname, '') as customerName,
          cust_email as email,
          phone_number as phoneNumber,
          country_code as countryCode,
          phone_prefix as phonePrefix,
          full_phone as phone,
          street_address as streetAddress,
          city,
          state_province as stateProvince,
          postal_code as postalCode,
          country,
          TO_CHAR(date_of_birth, 'YYYY-MM-DD') as dateOfBirth,
          cust_gender as gender,
          cust_status as status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM customers 
        WHERE cust_id = $1
      `, [customerId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customer = result.rows[0];
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const countryAbbr = getCountryAbbreviation(customer.country);
      
      const locationParts = [];
      if (customer.city) locationParts.push(customer.city);
      if (customer.stateProvince) locationParts.push(customer.stateProvince);
      if (customer.country) locationParts.push(countryAbbr);
      
      const fullName = customer.customerName?.trim() || 
                       `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 
                       'Unknown Customer';
      
      const finalCustomer = {
        id: customer.customerNumber,
        customerNumber: customer.customerNumber,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        customerName: fullName,
        fullName: fullName,
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        countryCode: customer.countryCode || '',
        phonePrefix: customer.phonePrefix || '',
        phone: customer.phone || '',
        streetAddress: customer.streetAddress || '',
        city: customer.city || '',
        stateProvince: customer.stateProvince || '',
        postalCode: customer.postalCode || '',
        country: customer.country || '',
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender || '',
        status: customer.status || 'active',
        customerNumberDisplay: `#${customer.customerNumber}`,
        initials: `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`.toUpperCase() || 'UC',
        profileColor: randomColor,
        location: locationParts.join(', '),
        statusColor: customer.status === 'active' ? '#4CAF50' : 
                    customer.status === 'archived' ? '#FF9800' : '#f44336',
        statusBackground: customer.status === 'active' ? '#E8F5E8' : 
                         customer.status === 'archived' ? '#FFF3E0' : '#FFEBEE',
        orders: 0,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      };

      res.json({
        success: true,
        data: finalCustomer,
        message: 'Customer fetched successfully'
      });

    } catch (error) {
      console.error('❌ Error fetching customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer',
        error: error.message
      });
    }
  });

  // POST new customer
  router.post('/', async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        countryCode,
        phonePrefix,
        streetAddress,
        city,
        stateProvince,
        postalCode,
        country,
        dateOfBirth,
        gender
      } = req.body;

      console.log('📝 Creating new customer:', {
        firstName,
        lastName,
        email,
        phoneNumber,
        countryCode,
        phonePrefix
      });

      // Validation
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }

      // Check if email already exists
      const emailCheck = await pool.query(
        'SELECT cust_id FROM customers WHERE cust_email = $1',
        [email]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists'
        });
      }

      // Build full phone number
      let fullPhone = '';
      if (phoneNumber) {
        if (countryCode && phonePrefix) {
          fullPhone = `+${countryCode} ${phonePrefix} ${phoneNumber}`;
        } else if (phonePrefix) {
          fullPhone = `${phonePrefix} ${phoneNumber}`;
        } else {
          fullPhone = phoneNumber;
        }
      }

      const insertQuery = `
        INSERT INTO customers (
          cust_fname, cust_lname, cust_email, phone_number, country_code, phone_prefix,
          full_phone, street_address, city, state_province, postal_code, country,
          date_of_birth, cust_gender, cust_status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        firstName,
        lastName,
        email,
        phoneNumber || null,
        countryCode || null,
        phonePrefix || null,
        fullPhone || null,
        streetAddress || null,
        city || null,
        stateProvince || null,
        postalCode || null,
        country || null,
        dateOfBirth || null,
        gender || null,
        'active'
      ];

      const result = await pool.query(insertQuery, values);
      
      console.log('✅ Customer created successfully with ID:', result.rows[0].cust_id);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create customer',
        error: error.message
      });
    }
  });

  // PUT update customer
  router.put('/:id', async (req, res) => {
    try {
      const customerId = req.params.id;
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        countryCode,
        phonePrefix,
        streetAddress,
        city,
        stateProvince,
        postalCode,
        country,
        dateOfBirth,
        gender
      } = req.body;

      console.log('📝 Updating customer:', customerId, {
        firstName,
        lastName,
        email
      });

      // Check if customer exists
      const existingCustomer = await pool.query(
        'SELECT cust_id FROM customers WHERE cust_id = $1',
        [customerId]
      );

      if (existingCustomer.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Validation
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }

      // Check if email already exists for another customer
      const emailCheck = await pool.query(
        'SELECT cust_id FROM customers WHERE cust_email = $1 AND cust_id != $2',
        [email, customerId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists'
        });
      }

      // Build full phone number
      let fullPhone = '';
      if (phoneNumber) {
        if (countryCode && phonePrefix) {
          fullPhone = `+${countryCode} ${phonePrefix} ${phoneNumber}`;
        } else if (phonePrefix) {
          fullPhone = `${phonePrefix} ${phoneNumber}`;
        } else {
          fullPhone = phoneNumber;
        }
      }

      const updateQuery = `
        UPDATE customers SET
          cust_fname = $1,
          cust_lname = $2,
          cust_email = $3,
          phone_number = $4,
          country_code = $5,
          phone_prefix = $6,
          full_phone = $7,
          street_address = $8,
          city = $9,
          state_province = $10,
          postal_code = $11,
          country = $12,
          date_of_birth = $13,
          cust_gender = $14,
          updated_at = NOW()
        WHERE cust_id = $15
        RETURNING *
      `;

      const values = [
        firstName,
        lastName,
        email,
        phoneNumber || null,
        countryCode || null,
        phonePrefix || null,
        fullPhone || null,
        streetAddress || null,
        city || null,
        stateProvince || null,
        postalCode || null,
        country || null,
        dateOfBirth || null,
        gender || null,
        customerId
      ];

      const result = await pool.query(updateQuery, values);
      
      console.log('✅ Customer updated successfully:', customerId);

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update customer',
        error: error.message
      });
    }
  });

  // PUT - Archive customer
  router.put('/:id/archive', async (req, res) => {
    try {
      const customerId = req.params.id;
      console.log('📦 Archiving customer:', customerId);
      
      // First, check if customer exists and get current status
      const checkResult = await pool.query(
        'SELECT cust_id, cust_status, cust_fname, cust_lname FROM customers WHERE cust_id = $1',
        [customerId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customer = checkResult.rows[0];
      
      if (customer.cust_status === 'archived') {
        return res.status(400).json({
          success: false,
          message: 'Customer is already archived'
        });
      }

      // TODO: Check if customer has active orders when orders system is implemented
      // const orderCheck = await pool.query('SELECT COUNT(*) FROM orders WHERE customer_id = $1 AND status = $2', [customerId, 'active']);
      // if (orderCheck.rows[0].count > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Cannot archive customer with ${orderCheck.rows[0].count} active orders`
      //   });
      // }
      
      // Update customer status to archived
      const result = await pool.query(
        'UPDATE customers SET cust_status = $1, updated_at = NOW() WHERE cust_id = $2 RETURNING *',
        ['archived', customerId]
      );

      console.log('✅ Customer archived successfully:', customerId);
      
      res.json({
        success: true,
        message: `Customer ${customer.cust_fname} ${customer.cust_lname} archived successfully`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error archiving customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive customer',
        error: error.message
      });
    }
  });

  // PUT - Restore customer
  router.put('/:id/restore', async (req, res) => {
    try {
      const customerId = req.params.id;
      console.log('🔄 Restoring customer:', customerId);
      
      // First, check if customer exists and get current status
      const checkResult = await pool.query(
        'SELECT cust_id, cust_status, cust_fname, cust_lname FROM customers WHERE cust_id = $1',
        [customerId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customer = checkResult.rows[0];
      
      if (customer.cust_status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Customer is already active'
        });
      }
      
      // Update customer status to active
      const result = await pool.query(
        'UPDATE customers SET cust_status = $1, updated_at = NOW() WHERE cust_id = $2 RETURNING *',
        ['active', customerId]
      );

      console.log('✅ Customer restored successfully:', customerId);
      
      res.json({
        success: true,
        message: `Customer ${customer.cust_fname} ${customer.cust_lname} restored successfully`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error restoring customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore customer',
        error: error.message
      });
    }
  });

  // DELETE customer (soft delete - archive)
  router.delete('/:id', async (req, res) => {
    try {
      const customerId = req.params.id;
      console.log('🗑️ Soft deleting (archiving) customer:', customerId);
      
      // Check if customer exists
      const checkResult = await pool.query(
        'SELECT cust_id, cust_fname, cust_lname FROM customers WHERE cust_id = $1',
        [customerId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customer = checkResult.rows[0];

      // Archive instead of hard delete
      const result = await pool.query(
        'UPDATE customers SET cust_status = $1, updated_at = NOW() WHERE cust_id = $2 RETURNING *',
        ['archived', customerId]
      );

      console.log('✅ Customer archived (soft deleted) successfully:', customerId);
      
      res.json({
        success: true,
        message: `Customer ${customer.cust_fname} ${customer.cust_lname} has been archived`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error archiving customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive customer',
        error: error.message
      });
    }
  });

  return router;
};

export default customersRoutes;