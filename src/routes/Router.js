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

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: 'dashboard', exact: true, element: <Dashboard /> },
       { path: 'Material', exact: true, element: <Material /> },
      { path: 'Products', exact: true, element: <ProductPage /> },
      // --- NEW ROUTES FOR BASADI CORE ---
      {path: 'Customers', exact: true, element: <CustomersPage /> },
      { path: 'Orders', exact: true, element: <Orders /> },
      { path: 'Orders/AddOrderForm', exact: true, element: <AddOrdersForm /> },
  { path: 'Employees', exact: true, element: <Employees/> },
  { path: 'Projects', exact: true, element: <Projects /> },
      {path: 'Advertisement', exact: true, element: <Advertisement /> },
      {path: 'Timesheet', exact: true, element: <Timesheet /> },
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
