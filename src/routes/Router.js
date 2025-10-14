import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { element, exact } from 'prop-types';
import ProductPage from '../views/Products/ProductPage';
import CustomersPage from '../views/Customers/CustomersPage';
import orders from '../views/Orders/orders';
import AddOrdersForm from '../views/Orders/AddOrdersForm';
import EmployeesPage from '../views/Employees/EmployeesPage';
import { useNavigate } from 'react-router-dom';
import withRoleProtection from '../components/shared/withRoleProtection';
import DefaultRouteRedirect from '../components/shared/DefaultRouteRedirect';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));


/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')))
const Material = Loadable(lazy(() => import('../views/Material/material')))
const product = Loadable(lazy(() => import('../views/Products/ProductPage')))
const customers = Loadable(lazy(() => import('../views/Customers/CustomersPage')))
const Orders = Loadable(lazy(() => import('../views/Orders/orders')))
const Employees = Loadable(lazy(() => import('../views/Employees/EmployeesPage')))
const Projects = Loadable(lazy(() => import('../views/Projects/projects')))
//const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')))
//const Icons = Loadable(lazy(() => import('../views/icons/Icons')))
//const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')))
//const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')))
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const Advertisement = Loadable(lazy(() => import('../views/Advertisement/Advertisement')));
const Timesheet = Loadable(lazy(() => import('../views/TimeSheet/TimeSheetPage')));

// Create protected components
const ProtectedDashboard = withRoleProtection(Dashboard, 'dashboard');
const ProtectedMaterial = withRoleProtection(Material, 'materials');
const ProtectedProducts = withRoleProtection(ProductPage, 'products');
const ProtectedCustomers = withRoleProtection(CustomersPage, 'customers');
const ProtectedOrders = withRoleProtection(Orders, 'orders');
const ProtectedEmployees = withRoleProtection(Employees, 'employees');
const ProtectedProjects = withRoleProtection(Projects, 'projects');
const ProtectedAdvertisement = withRoleProtection(Advertisement, 'advertisement');
const ProtectedTimesheet = withRoleProtection(Timesheet, 'timesheets');
const ProtectedAddOrderForm = withRoleProtection(AddOrdersForm, 'orders');

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { index: true, element: <DefaultRouteRedirect /> },
      { path: 'dashboard', exact: true, element: <ProtectedDashboard /> },
       { path: 'Material', exact: true, element: <ProtectedMaterial /> },
      { path: 'Products', exact: true, element: <ProtectedProducts /> },
      // --- NEW ROUTES FOR BASADI CORE ---
      {path: 'Customers', exact: true, element: <ProtectedCustomers /> },
      { path: 'Orders', exact: true, element: <ProtectedOrders /> },
      { path: 'Orders/AddOrderForm', exact: true, element: <ProtectedAddOrderForm /> },
  { path: 'Employees', exact: true, element: <ProtectedEmployees /> },
  { path: 'Projects', exact: true, element: <ProtectedProjects /> },
      {path: 'Advertisement', exact: true, element: <ProtectedAdvertisement /> },
      {path: 'Timesheet', exact: true, element: <ProtectedTimesheet /> },
      //{ path: '/sample-page', exact: true, element: <SamplePage /> },
     // { path: '/icons', exact: true, element: <Icons /> },
      //{ path: '/ui/typography', exact: true, element: <TypographyPage /> },
      //{ path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;
