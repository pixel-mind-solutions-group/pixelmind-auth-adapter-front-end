import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilPeople,
  cilApplications,
  cilPuzzle,
  cilShieldAlt,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Identity & Access',
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/user/user',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'User Roles',
    to: '/user-role/user-role',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'System Configuration',
  },
  {
    component: CNavItem,
    name: 'Applications',
    to: '/application/application',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Modules',
    to: '/module',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Module Definitions',
        to: '/module/module',
      },
      {
        component: CNavItem,
        name: 'Module API Permissions',
        to: '/module/api-permissions',
      },
      {
        component: CNavItem,
        name: 'Module UI Permissions',
        to: '/module/ui-permissions',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Security & Settings',
    to: '/settings',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'API Registry',
        to: '/settings/api-permissions',
      },
      {
        component: CNavItem,
        name: 'UI Registry',
        to: '/settings/ui-permissions',
      },
    ],
  },
]

export default _nav
