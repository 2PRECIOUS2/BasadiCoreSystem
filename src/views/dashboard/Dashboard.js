import React from 'react';
import { Grid, Box, Paper, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

// components
//import SalesOverview from './components/SalesOverview';
//import YearlyBreakup from './components/YearlyBreakup';
//import RecentTransactions from './components/RecentTransactions';
//import ProductPerformance from './components/ProductPerformance';
//import Blog from './components/Blog';
//import MonthlyEarnings from './components/MonthlyEarnings';
import PowerBIReports from './components/PowerBIReports';


const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <PowerBIReports />
      </Box>
    </PageContainer>
  );
};

export default Dashboard;