import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import CustomerForm from './CustomerForm';
import CustomersList from './CustomersList';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch customers from API - Direct fetch like other components
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching customers from: http://localhost:5000/api/customers');
      const response = await fetch('http://localhost:5000/api/customers');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Frontend received data:', data);
      
      if (data.success) {
        if (data.data && data.data.length > 0) {
          console.log('📥 Sample customer received by frontend:', {
            id: data.data[0].id,
            customerNumber: data.data[0].customerNumber,
            firstName: data.data[0].firstName,
            lastName: data.data[0].lastName,
            fullName: data.data[0].fullName,
            email: data.data[0].email
          });
          console.log('📥 All keys in first received customer:', Object.keys(data.data[0]));
        }
        setCustomers(data.data || []);
        console.log('Customers loaded successfully:', data.data?.length || 0);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      } else {
        setError(error.message || 'Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setOpenModal(true);
    setError('');
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setOpenModal(true);
    setError('');
  };

  const handleArchiveCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to archive this customer?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCustomers(customers.filter(customer => customer.id !== customerId));
        setError('');
      } else {
        setError(data.message || 'Failed to archive customer');
      }
    } catch (error) {
      console.error('Error archiving customer:', error);
      setError('Failed to archive customer: ' + error.message);
    }
  };

  const handleFormSubmit = async (customerData) => {
    console.log('🎯 CustomersPage received form data:', customerData);
    
    try {
      let response;
      if (editingCustomer) {
        console.log(`📡 Making PUT request to: http://localhost:5000/api/customers/${editingCustomer.id}`);
        response = await fetch(`http://localhost:5000/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
      } else {
        console.log(`📡 Making POST request to: http://localhost:5000/api/customers`);
        response = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Customer saved successfully');
        await fetchCustomers();
        setOpenModal(false);
        setError('');
      } else {
        setError(data.message || 'Failed to save customer');
      }
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      setError('Failed to save customer: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingCustomer(null);
    setError('');
  };

  const testServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/');
      if (response.ok) {
        console.log('✅ Server is reachable');
        fetchCustomers();
      } else {
        setError('Server is running but not responding correctly');
      }
    } catch (error) {
      console.error('❌ Server connection test failed:', error);
      setError('Cannot connect to server. Please start the backend server.');
    }
  };

  if (loading) {
    return (
      <PageContainer title="Customers" description="Manage your customers">
        <DashboardCard title="">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading customers...</Typography>
          </Box>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Customers" description="Manage your customers">
      <DashboardCard title="">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            CUSTOMERS
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCustomer}
            sx={{ borderRadius: 2, mt: 1 }}
          >
            Add New Customer
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setError('')}
            action={
              error.includes('server') || error.includes('connect') ? (
                <Button color="inherit" size="small" onClick={testServerConnection}>
                  Test Connection
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}

        <CustomersList
          customers={customers}
          onEdit={handleEditCustomer}
          onArchive={handleArchiveCustomer} 
        />

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="customer-modal-title"
        >
          <Paper
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '800px' },
              maxHeight: '90vh',
              overflow: 'auto',
              p: 4,
            }}
          >
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </Paper>
        </Modal>
      </DashboardCard>
    </PageContainer>
  );
};

export default CustomersPage;