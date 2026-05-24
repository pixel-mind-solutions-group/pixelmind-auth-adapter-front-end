import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilUserPlus,
  cilUser,
  cilViewModule,
  cilApplications,
  cilPeople,
  cilSettings,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavGroup,
    name: 'User Management',
    to: '/user',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User',
        to: '/user/user',
      },
      {
        component: CNavItem,
        name: 'Priviliage',
        to: '/user/priviliage',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'User Role',
    to: '/user-role',
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User Role',
        to: '/user-role/user-role',
      },
      {
        component: CNavItem,
        name: 'Map UI Permissions',
        to: '/user-role/map-ui-permissions',
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
    to: '/application',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Application',
        to: '/application/application',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Module',
    to: '/module',
    icon: <CIcon icon={cilViewModule} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Module',
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
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'API Permission',
        to: '/settings/api-permissions',
      },
      {
        component: CNavItem,
        name: 'UI Permission',
        to: '/settings/ui-permissions',
      },
    ],
  },
]

export default _nav
