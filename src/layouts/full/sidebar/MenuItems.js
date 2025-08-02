import {
  IconAperture, IconCopy, IconLayoutDashboard,IconBox, IconShoppingCart, IconTag, IconUsers, IconFolder, IconWallet, IconLogin, IconUserPlus /*IconMoodHappy, IconTypography*/
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Navigation',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },

  {
    id: uniqueId(),
    title: 'Material',
    icon: IconBox,
    href: '/Material',
  },

  {
    id: uniqueId(),
    title: 'Products',
    icon: IconTag,
    href: '/Products',
  },

  {
    id: uniqueId(),
    title: 'Customers',
    icon: IconUsers,
    href: '/Customers',
  },

  {
    id: uniqueId(),
    title: 'Orders',
    icon: IconShoppingCart,
    href: '/Orders',
  },

  {
    id: uniqueId(),
    title: 'Financial Overview',
    icon: IconWallet,
    href: '/Financial Overview',
  },

  {
    id: uniqueId(),
    title: 'Projects',
    icon: IconFolder,
    href: '/Projects',
  },
  /*{
    navlabel: true,
    subheader: 'Utilities',
  },
  {
    id: uniqueId(),
    title: 'Typography',
    icon: IconTypography,
    href: '/ui/typography',
  },
  {
    id: uniqueId(),
    title: 'Shadow',
    icon: IconCopy,
    href: '/ui/shadow',
  },*/
  {
    navlabel: true,
    subheader: 'Auth',
  },
  {
    id: uniqueId(),
    title: 'Login',
    icon: IconLogin,
    href: '/auth/login',
  },
  {
    id: uniqueId(),
    title: 'Register',
    icon: IconUserPlus,
    href: '/auth/register',
  },
 /* {
    navlabel: true,
    subheader: 'Extra',
  },
  {
    id: uniqueId(),
    title: 'Icons',
    icon: IconMoodHappy,
    href: '/icons',
  },
  {
    id: uniqueId(),
    title: 'Sample Page',
    icon: IconAperture,
    href: '/sample-page',
  },*/
];

export default Menuitems;
