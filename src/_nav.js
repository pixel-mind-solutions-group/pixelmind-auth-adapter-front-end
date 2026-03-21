import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilUserPlus,
  cilUser,
  cilViewModule,
  cilApplications,
  cilApplicationsSettings,
  cilPeople,
  cilSettings,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavGroup,
    name: 'User Management',
    to: '/application/permission',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User',
        to: '/application/scope',
      },
      {
        component: CNavItem,
        name: 'Priviliage',
        to: '/application/module',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'User Role',
    to: '/application/permission',
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User Role',
        to: '/application/scope',
      },
      {
        component: CNavItem,
        name: 'Map UI Permissions',
        to: '/application/module',
      },
    ],
  },
  // {
  //   component: CNavItem,
  //   name: 'User Role',
  //   to: '/settings/user-role',
  //   icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavTitle,
  //   name: 'Settings',
  // },
  {
    component: CNavGroup,
    name: 'Application',
    to: '/application/permission',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Application',
        to: '/application/scope',
      },
      {
        component: CNavItem,
        name: 'Application Modules',
        to: '/application/scope',
      },
      {
        component: CNavItem,
        name: 'Application UI Permissions',
        to: '/application/module',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Module',
    to: '/application/permission',
    icon: <CIcon icon={cilViewModule} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Module',
        to: '/application/scope',
      },
      {
        component: CNavItem,
        name: 'Module API Permissions',
        to: '/application/module',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Settings',
    to: '/application/permission',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'API Permission',
        to: '/application/module',
      },
      {
        component: CNavItem,
        name: 'UI Permission',
        to: '/application/module',
      },
    ],
  },
]

export default _nav
