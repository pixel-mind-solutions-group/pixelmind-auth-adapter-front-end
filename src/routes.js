/**
 * Application Routes Configuration
 *
 * Defines all protected routes in the application using React lazy loading
 * for code splitting and performance optimization.
 *
 * Each route object contains:
 * - path: URL path for the route
 * - name: Human-readable name for breadcrumbs
 * - element: Lazy-loaded React component
 * - exact: (optional) Requires exact path match
 *
 * @module routes
 */

import React from 'react'

// Dashboard
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const User = React.lazy(() => import('./components/user/User'))
const UserRole = React.lazy(() => import('./components/userRole/UserRole'))
const Application = React.lazy(() => import('./components/application/Application'))
const Module = React.lazy(() => import('./components/masterModule/module/Module'))
const APIPermission = React.lazy(() => import('./components/apiPermission/APIPermission'))
const UIPermission = React.lazy(() => import('./components/uiPermission/UIPermission'))
const ModuleAPIPermission = React.lazy(
  () => import('./components/masterModule/moduleAPIPermission/ModuleAPIPermission'),
)
const ModuleUIPermission = React.lazy(
  () => import('./components/masterModule/moduleUIPermission/ModuleUIPermission'),
)

/**
 * Array of route configuration objects
 *
 * @type {Array<Object>}
 * @property {string} path - URL path pattern
 * @property {string} name - Display name for breadcrumbs and navigation
 * @property {React.LazyExoticComponent} element - Lazy-loaded component
 * @property {boolean} [exact] - Whether to match path exactly
 *
 * @example
 * // Route renders when URL matches '/dashboard'
 * { path: '/dashboard', name: 'Dashboard', element: Dashboard }
 *
 * @example
 * // Route with exact match required
 * { path: '/base', name: 'Base', element: Cards, exact: true }
 */
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/user/user', name: 'User', element: User },
  { path: '/user-role/user-role', name: 'User Role', element: UserRole },
  { path: '/application/application', name: 'Application', element: Application },
  { path: '/module/module', name: 'Module', element: Module },
  { path: '/settings/api-permissions', name: 'API Permission', element: APIPermission },
  { path: '/settings/ui-permissions', name: 'UI Permission', element: UIPermission },
  { path: '/module/api-permissions', name: 'Module API Permission', element: ModuleAPIPermission },
  { path: '/module/ui-permissions', name: 'Module UI Permission', element: ModuleUIPermission },
]

export default routes
