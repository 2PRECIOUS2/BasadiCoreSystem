import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  Paper
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

  // Mock data for now - you'll replace this with your API call
  const mockCustomers = [
    {
      id: '1',
      firstName: 'Esther',
      lastName: 'Howard',
      email: 'esther.howard@email.com',
      phone: '+1 (555) 123-4567',
      location: 'Great Falls, Maryland',
      dateOfBirth: '1990-05-15',
      gender: 'Female',
      status: 'Subscribed',
      orders: 2,
      amountSpent: 25000
    },
    {
      id: '2',
      firstName: 'Leslie',
      lastName: 'Alexander',
      email: 'leslie.alexander@email.com',
      phone: '+1 (555) 987-6543',
      location: 'Pasadena, Oklahoma',
      dateOfBirth: '1985-12-08',
      gender: 'Female',
      status: 'Not subscribed',
      orders: 3,
      amountSpent: 35000
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setCustomers(mockCustomers);
  }, []);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setOpenModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setOpenModal(true);
  };

const handleArchiveCustomer = (customerId) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? { ...customer, isArchived: true }
        : customer
    ));
  };

  const handleFormSubmit = (customerData) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(customers.map(customer =>
        customer.id === editingCustomer.id
          ? { ...customerData, id: editingCustomer.id }
          : customer
      ));
    } else {
      // Add new customer
      const newCustomer = {
        ...customerData,
        id: Date.now().toString(),
        status: 'Pending',
        orders: 0,
        amountSpent: 0
      };
      setCustomers([...customers, newCustomer]);
    }
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingCustomer(null);
  };

  return (
    <PageContainer title="Customers" description="Manage your customers">
      <DashboardCard title="">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
           
          
          {/* Centered CUSTOMERS title */}
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
           {/* Add Customer button on the right */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCustomer}
              sx={{ borderRadius: 2, mt: 1 }}
            >
            Add New Customer
          </Button>
        </Box>
        

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
              width: { xs: '90%', sm: '600px' },
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