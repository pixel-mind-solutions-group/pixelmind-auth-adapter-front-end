import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CFormSelect,
  CFormCheck,
  CButton,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { toast } from 'react-toastify'
import Pagination from '../pagination/Pagination'

// Services
import { getActiveRealms } from '../../service/realm/RealmService'
import {
  getActiveApplications,
  searchApplications,
} from '../../service/application/ApplicationService'
import { searchModules } from '../../service/module/ModuleService'
import {
  createOrUpdateUserRole,
  getUserRoleById,
  deleteUserRole,
  searchUserRoles,
  getActiveUserRoles,
} from '../../service/userRole/UserRoleService'
import {
  createUserRoleProfile,
  searchUserRoleProfiles,
  deleteUserRoleApiProfile,
  deleteUserRoleUiProfile,
  syncUserRoleProfile,
} from '../../service/userRoleProfile/UserRoleProfileService'
import { getActivePermissions as getActiveApiPermissions } from '../../service/apiPermission/ApiPermissionService'
import { getActivePermissions as getActiveUiPermissions } from '../../service/uiPermission/UiPermissionService'
import { searchModuleAssignedPermissions as searchModuleAssignedApiPermissions } from '../../service/moduleHasApiPermission/ModuleHasApiPermissionService'
import { searchModuleAssignedPermissions as searchModuleAssignedUiPermissions } from '../../service/moduleHasUiPermission/ModuleHasUiPermissionService'

const UserRole = () => {
  // Navigation tabs state: 'definitions' or 'profile'
  const [activeTab, setActiveTab] = useState('definitions')

  // Shared options (Realms / Applications)
  const [realmsOptions, setRealmsOptions] = useState([])
  const [applicationsOptions, setApplicationsOptions] = useState([])

  // ==================== TAB 1 STATE (DEFINITIONS) ====================
  const [validated, setValidated] = useState(false)
  const [definitionsRealmId, setDefinitionsRealmId] = useState('-1')
  const [definitionsApplicationId, setDefinitionsApplicationId] = useState('-1')
  const [definitionsApplicationsOptions, setDefinitionsApplicationsOptions] = useState([])

  const [formData, setFormData] = useState({
    id: null,
    roleName: '',
    description: '',
    active: '-1',
  })
  const [roles, setRoles] = useState([])
  const [searchParam, setSearchParam] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const size = 5

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)

  // Def table filters
  const [defFilterRealmId, setDefFilterRealmId] = useState('-1')
  const [defFilterApplicationId, setDefFilterApplicationId] = useState('-1')
  const [defFilterApplicationsOptions, setDefFilterApplicationsOptions] = useState([])

  // ==================== TAB 2 STATE (PROFILE MAPPING) ====================
  const [mappingValidated, setMappingValidated] = useState(false)
  const [realmId, setRealmId] = useState('-1')
  const [applicationId, setApplicationId] = useState('-1')
  const [modulesOptions, setModulesOptions] = useState([])
  const [selectedModuleIds, setSelectedModuleIds] = useState([])
  const [profileLoading, setProfileLoading] = useState(false)

  // Track API and UI permissions options & selections per module (key: moduleId or 'app')
  const [modulePermissionsOptions, setModulePermissionsOptions] = useState({})
  const [modulePermissions, setModulePermissions] = useState({})

  // Searchable User Role select
  const [activeUserRoles, setActiveUserRoles] = useState([])
  const [roleSearchQuery, setRoleSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Assigned profile grid filters
  const [filterRealmId, setFilterRealmId] = useState('-1')
  const [filterApplicationId, setFilterApplicationId] = useState('-1')
  const [filterApplicationsOptions, setFilterApplicationsOptions] = useState([])
  const [filterModuleId, setFilterModuleId] = useState('-1')
  const [filterModulesOptions, setFilterModulesOptions] = useState([])
  const [filterActiveUserRoles, setFilterActiveUserRoles] = useState([])
  const [filterRoleSearchQuery, setFilterRoleSearchQuery] = useState('')
  const [filterSelectedRole, setFilterSelectedRole] = useState(null)
  const [filterRoleDropdownOpen, setFilterRoleDropdownOpen] = useState(false)
  const filterRoleDropdownRef = useRef(null)
  const [assignedProfiles, setAssignedProfiles] = useState([])

  // Profile deletion modal
  const [profileDeleteModalVisible, setProfileDeleteModalVisible] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState(null)

  // ==================== GENERAL LOGIC & CLICK OUTSIDE ====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false)
      }
      if (filterRoleDropdownRef.current && !filterRoleDropdownRef.current.contains(event.target)) {
        setFilterRoleDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load basic dropdown options globally on start
  const fetchDropdownData = useCallback(async () => {
    try {
      const realmsRes = await getActiveRealms()
      if (realmsRes.status === 200) {
        setRealmsOptions(realmsRes.data || [])
      }
      const appsRes = await getActiveApplications()
      if (appsRes.status === 200) {
        setApplicationsOptions(appsRes.data || [])
        setFilterApplicationsOptions(appsRes.data || [])
        setDefFilterApplicationsOptions(appsRes.data || [])
      }
    } catch (error) {
      toast.error('Failed to load initial dropdown filters: ' + error.message)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDropdownData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchDropdownData])

  // ==================== TAB 1 LOGIC (DEFINITIONS) ====================
  const fetchRoles = useCallback(async () => {
    try {
      const activeParam =
        formData.active === 'true' ? true : formData.active === 'false' ? false : null
      const data = await searchUserRoles(
        currentPage,
        size,
        searchParam,
        activeParam,
        defFilterRealmId === '-1' ? null : defFilterRealmId,
        defFilterApplicationId === '-1' ? null : defFilterApplicationId,
      )
      if (data.status === 200) {
        setRoles(data.data.roles || [])
        setTotalElements(data.data.total || 0)
        setTotalPages(data.data.totalPages || 0)
        setCurrentPage(data.data.page || 0)
      }
    } catch (error) {
      toast.error('Failed to load user roles: ' + error.message)
    }
  }, [currentPage, size, searchParam, formData.active, defFilterRealmId, defFilterApplicationId])

  useEffect(() => {
    if (activeTab === 'definitions') {
      const timer = setTimeout(() => {
        fetchRoles()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTab, fetchRoles])

  const handleDefinitionsRealmChange = async (rId) => {
    setDefinitionsRealmId(rId)
    setDefinitionsApplicationId('-1')
    setDefinitionsApplicationsOptions([])

    try {
      if (rId === '-1') {
        setDefinitionsApplicationsOptions([])
      } else {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
        if (searchRes.status === 200) {
          setDefinitionsApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load applications for selected Realm: ' + error.message)
    }
  }

  const handleDefFilterRealmChange = async (rId) => {
    setDefFilterRealmId(rId)
    setDefFilterApplicationId('-1')

    try {
      if (rId === '-1') {
        setDefFilterApplicationsOptions(applicationsOptions)
      } else {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
        if (searchRes.status === 200) {
          setDefFilterApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load filter applications: ' + error.message)
    }
    setCurrentPage(0)
  }

  const handleDefFilterApplicationChange = (appId) => {
    setDefFilterApplicationId(appId)
    setCurrentPage(0)
  }

  const handleDefFilterClear = () => {
    setDefFilterRealmId('-1')
    setDefFilterApplicationId('-1')
    setDefFilterApplicationsOptions(applicationsOptions)
    setCurrentPage(0)
  }

  const handleFormChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const roleFormSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (
      form.checkValidity() === false ||
      definitionsRealmId === '-1' ||
      definitionsApplicationId === '-1' ||
      formData.roleName.trim() === '' ||
      formData.active === '-1'
    ) {
      event.stopPropagation()
      setValidated(true)
      toast.warning('Please select and fill all required fields.')
      return
    }

    const payload = {
      roleId: formData.id ? Number(formData.id) : null,
      realmId: Number(definitionsRealmId),
      applicationId: Number(definitionsApplicationId),
      roleName: formData.roleName.trim(),
      description: formData.description.trim(),
      active: formData.active === 'true',
    }

    try {
      const res = await createOrUpdateUserRole(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'User role saved successfully!')
        fetchRoles()
        handleReset()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save user role.')
    }
  }

  const loadRoleIntoForm = async (roleId) => {
    try {
      const res = await getUserRoleById(roleId)
      if (res.status === 200) {
        const roleData = res.data

        if (roleData.realmId) {
          const searchRes = await searchApplications(0, 1000, null, roleData.realmId, null)
          if (searchRes.status === 200) {
            setDefinitionsApplicationsOptions(searchRes.data.applications || [])
          }
        }

        setFormData({
          id: roleData.roleId,
          roleName: roleData.roleName,
          description: roleData.description || '',
          active: String(roleData.active),
        })
        setDefinitionsRealmId(String(roleData.realmId))
        setDefinitionsApplicationId(String(roleData.applicationId))
        setValidated(false)
        toast.success('User role loaded into form.')
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to load user role for edit: ' + error.message)
    }
  }

  const confirmDelete = (role) => {
    setRoleToDelete(role)
    setDeleteModalVisible(true)
  }

  const cancelDelete = () => {
    setRoleToDelete(null)
    setDeleteModalVisible(false)
  }

  const deleteRole = async () => {
    if (!roleToDelete) return
    try {
      const res = await deleteUserRole(roleToDelete.roleId)
      if (res.status === 200) {
        toast.success(res.message || 'User role deleted successfully!')
        fetchRoles()
        if (formData.id === roleToDelete.roleId) {
          handleReset()
        }
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to delete user role: ' + error.message)
    } finally {
      cancelDelete()
    }
  }

  const handleReset = () => {
    setFormData({
      id: null,
      roleName: '',
      description: '',
      active: '-1',
    })
    setDefinitionsRealmId('-1')
    setDefinitionsApplicationId('-1')
    setDefinitionsApplicationsOptions([])
    setValidated(false)
  }

  // ==================== TAB 2 LOGIC (PROFILE MAPPING) ====================
  const fetchAssignedProfiles = useCallback(
    async (
      rId = filterRealmId,
      aId = filterApplicationId,
      mId = filterModuleId,
      roleId = filterSelectedRole ? filterSelectedRole.roleId : '-1',
    ) => {
      try {
        const res = await searchUserRoleProfiles(
          rId === '-1' ? null : rId,
          aId === '-1' ? null : aId,
          roleId === '-1' ? null : roleId,
          mId === '-1' ? null : mId,
        )
        if (res.status === 200) {
          setAssignedProfiles(res.data || [])
        }
      } catch (error) {
        toast.error('Failed to load assigned profiles: ' + error.message)
      }
    },
    [filterRealmId, filterApplicationId, filterModuleId, filterSelectedRole],
  )

  useEffect(() => {
    if (activeTab === 'profile') {
      const timer = setTimeout(() => {
        fetchAssignedProfiles()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTab, fetchAssignedProfiles])

  // Load scoped active user roles for autocomplete input
  const fetchActiveRoles = async (rId, appId) => {
    if (!rId || !appId || rId === '-1' || appId === '-1') {
      setActiveUserRoles([])
      return
    }
    try {
      const res = await getActiveUserRoles(rId, appId)
      if (res.status === 200) {
        setActiveUserRoles(res.data || [])
      }
    } catch (error) {
      toast.error('Failed to load active user roles for selection: ' + error.message)
    }
  }

  const fetchModulePermissions = async (
    mId,
    currentRealmId = realmId,
    currentAppId = applicationId,
  ) => {
    if (!currentRealmId || !currentAppId || currentRealmId === '-1' || currentAppId === '-1') {
      return
    }

    try {
      let apiOptions = []
      let uiOptions = []

      if (mId !== 'app') {
        // Fetch API permissions for the module
        const apiRes = await searchModuleAssignedApiPermissions(currentRealmId, currentAppId, mId)
        if (apiRes.status === 200 && apiRes.data && apiRes.data.length > 0) {
          apiOptions = apiRes.data.map((item) => ({
            apiPermissionId: item.apiPermissionId,
            apiPermissionName: item.apiPermission?.apiPermissionName,
            description: item.apiPermission?.description,
          }))
        } else {
          // Fallback to active app-level permissions
          const fallbackRes = await getActiveApiPermissions(currentRealmId, currentAppId)
          if (fallbackRes.status === 200) {
            apiOptions = fallbackRes.data || []
          }
        }

        // Fetch UI permissions for the module
        const uiRes = await searchModuleAssignedUiPermissions(currentRealmId, currentAppId, mId)
        if (uiRes.status === 200 && uiRes.data && uiRes.data.length > 0) {
          uiOptions = uiRes.data.map((item) => ({
            uiPermissionId: item.uiPermissionId,
            uiPermissionName: item.uiPermission?.uiPermissionName,
            description: item.uiPermission?.description,
          }))
        } else {
          // Fallback to active app-level permissions
          const fallbackRes = await getActiveUiPermissions(currentRealmId, currentAppId)
          if (fallbackRes.status === 200) {
            uiOptions = fallbackRes.data || []
          }
        }
      } else {
        // Load global/application-level permissions directly
        const apiRes = await getActiveApiPermissions(currentRealmId, currentAppId)
        if (apiRes.status === 200) {
          apiOptions = apiRes.data || []
        }

        const uiRes = await getActiveUiPermissions(currentRealmId, currentAppId)
        if (uiRes.status === 200) {
          uiOptions = uiRes.data || []
        }
      }

      setModulePermissionsOptions((prev) => ({
        ...prev,
        [mId]: { api: apiOptions, ui: uiOptions },
      }))
      return { api: apiOptions, ui: uiOptions }
    } catch (error) {
      toast.error('Failed to load permissions: ' + error.message)
      return { api: [], ui: [] }
    }
  }

  const loadExistingMappingForRole = async (
    role,
    currentRealmId = realmId,
    currentAppId = applicationId,
    currentMods = modulesOptions,
  ) => {
    if (
      !role ||
      !currentRealmId ||
      !currentAppId ||
      currentRealmId === '-1' ||
      currentAppId === '-1'
    ) {
      return
    }
    setProfileLoading(true)
    try {
      const res = await searchUserRoleProfiles(currentRealmId, currentAppId, role.roleId)
      if (res.status === 200 && res.data) {
        const apiPerms = res.data.apiPermissions || []
        const uiPerms = res.data.uiPermissions || []

        const nextPermissions = {}

        if (currentMods.length > 0) {
          const moduleIdsMapped = new Set()
          apiPerms.forEach((p) => {
            if (p.moduleId) moduleIdsMapped.add(p.moduleId)
          })
          uiPerms.forEach((p) => {
            if (p.moduleId) moduleIdsMapped.add(p.moduleId)
          })

          const moduleIdsArray = Array.from(moduleIdsMapped)
          setSelectedModuleIds(moduleIdsArray)

          // Fetch options for mapped modules in parallel
          await Promise.all(
            moduleIdsArray.map((mId) => fetchModulePermissions(mId, currentRealmId, currentAppId)),
          )

          apiPerms.forEach((p) => {
            if (p.moduleId) {
              if (!nextPermissions[p.moduleId]) {
                nextPermissions[p.moduleId] = { api: [], ui: [] }
              }
              if (!nextPermissions[p.moduleId].api.includes(p.apiPermissionId)) {
                nextPermissions[p.moduleId].api.push(p.apiPermissionId)
              }
            }
          })

          uiPerms.forEach((p) => {
            if (p.moduleId) {
              if (!nextPermissions[p.moduleId]) {
                nextPermissions[p.moduleId] = { api: [], ui: [] }
              }
              if (!nextPermissions[p.moduleId].ui.includes(p.uiPermissionId)) {
                nextPermissions[p.moduleId].ui.push(p.uiPermissionId)
              }
            }
          })
        } else {
          await fetchModulePermissions('app', currentRealmId, currentAppId)
          nextPermissions['app'] = { api: [], ui: [] }

          apiPerms.forEach((p) => {
            if (!p.moduleId) {
              if (!nextPermissions['app'].api.includes(p.apiPermissionId)) {
                nextPermissions['app'].api.push(p.apiPermissionId)
              }
            }
          })

          uiPerms.forEach((p) => {
            if (!p.moduleId) {
              if (!nextPermissions['app'].ui.includes(p.uiPermissionId)) {
                nextPermissions['app'].ui.push(p.uiPermissionId)
              }
            }
          })
        }

        setModulePermissions(nextPermissions)
      }
    } catch (error) {
      toast.error('Failed to load existing profile mappings for role: ' + error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRole && realmId !== '-1' && applicationId !== '-1') {
      loadExistingMappingForRole(selectedRole, realmId, applicationId, modulesOptions)
    } else {
      setSelectedModuleIds([])
      setModulePermissions({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, realmId, applicationId, modulesOptions])

  const handleRealmChange = async (rId) => {
    setRealmId(rId)
    setApplicationId('-1')
    setModulesOptions([])
    setSelectedModuleIds([])
    setSelectedRole(null)
    setRoleSearchQuery('')
    setActiveUserRoles([])
    setModulePermissionsOptions({})
    setModulePermissions({})

    try {
      if (rId === '-1') {
        const appsRes = await getActiveApplications()
        if (appsRes.status === 200) {
          setApplicationsOptions(appsRes.data || [])
        }
      } else {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
        if (searchRes.status === 200) {
          setApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load applications for selected Realm: ' + error.message)
    }
  }

  const handleApplicationChange = async (appId) => {
    setApplicationId(appId)
    setSelectedModuleIds([])
    setModulesOptions([])
    setSelectedRole(null)
    setRoleSearchQuery('')
    setActiveUserRoles([])
    setModulePermissionsOptions({})
    setModulePermissions({})

    if (realmId !== '-1' && appId !== '-1') {
      try {
        const modulesRes = await searchModules(0, 1000, null, realmId, appId, true)
        let hasModules = false
        if (modulesRes.status === 200) {
          const mods = modulesRes.data.modules || []
          setModulesOptions(mods)
          hasModules = mods.length > 0
        }
        fetchActiveRoles(realmId, appId)
        if (!hasModules) {
          fetchModulePermissions('app', realmId, appId)
        }
      } catch (error) {
        toast.error('Failed to load modules/roles/permissions: ' + error.message)
      }
    }
  }

  const handleModuleCheckboxChange = (modId) => {
    setSelectedModuleIds((prev) => {
      const isChecked = prev.includes(modId)
      const next = isChecked ? prev.filter((id) => id !== modId) : [...prev, modId]

      if (!isChecked) {
        fetchModulePermissions(modId)
      } else {
        setModulePermissions((prevSel) => {
          const nextSel = { ...prevSel }
          delete nextSel[modId]
          return nextSel
        })
      }
      return next
    })
  }

  const handleModuleSelectAll = async () => {
    const allModuleIds = modulesOptions.map((m) => m.moduleId)
    const allSelected = allModuleIds.every((id) => selectedModuleIds.includes(id))

    if (allSelected) {
      setSelectedModuleIds([])
      setModulePermissions({})
    } else {
      setSelectedModuleIds(allModuleIds)
      for (const mId of allModuleIds) {
        await fetchModulePermissions(mId)
      }
    }
  }

  const handleNestedApiPermissionCheckboxChange = (modId, permId) => {
    setModulePermissions((prev) => {
      const modPerms = prev[modId] || { api: [], ui: [] }
      const newApi = modPerms.api.includes(permId)
        ? modPerms.api.filter((id) => id !== permId)
        : [...modPerms.api, permId]

      return {
        ...prev,
        [modId]: {
          ...modPerms,
          api: newApi,
        },
      }
    })
  }

  const handleNestedApiSelectAll = (modId) => {
    const options = modulePermissionsOptions[modId]?.api || []
    const allIds = options.map((p) => p.apiPermissionId)
    const selectedIds = modulePermissions[modId]?.api || []
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id))

    setModulePermissions((prev) => {
      const modPerms = prev[modId] || { api: [], ui: [] }
      return {
        ...prev,
        [modId]: {
          ...modPerms,
          api: allSelected ? [] : allIds,
        },
      }
    })
  }

  const handleNestedUiPermissionCheckboxChange = (modId, permId) => {
    setModulePermissions((prev) => {
      const modPerms = prev[modId] || { api: [], ui: [] }
      const newUi = modPerms.ui.includes(permId)
        ? modPerms.ui.filter((id) => id !== permId)
        : [...modPerms.ui, permId]

      return {
        ...prev,
        [modId]: {
          ...modPerms,
          ui: newUi,
        },
      }
    })
  }

  const handleNestedUiSelectAll = (modId) => {
    const options = modulePermissionsOptions[modId]?.ui || []
    const allIds = options.map((p) => p.uiPermissionId)
    const selectedIds = modulePermissions[modId]?.ui || []
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id))

    setModulePermissions((prev) => {
      const modPerms = prev[modId] || { api: [], ui: [] }
      return {
        ...prev,
        [modId]: {
          ...modPerms,
          ui: allSelected ? [] : allIds,
        },
      }
    })
  }

  const handleMappingFormSubmit = async (event) => {
    event.preventDefault()

    if (realmId === '-1' || applicationId === '-1' || !selectedRole) {
      setMappingValidated(true)
      toast.warning('Please select Realm, Application, and searchable User Role.')
      return
    }

    const modulesList = []
    if (modulesOptions.length > 0) {
      selectedModuleIds.forEach((modId) => {
        const perms = modulePermissions[modId] || { api: [], ui: [] }
        modulesList.push({
          moduleId: Number(modId),
          apiPermissionIdList: perms.api || [],
          uiPermissionIdList: perms.ui || [],
        })
      })
    } else {
      const appPerms = modulePermissions['app'] || { api: [], ui: [] }
      modulesList.push({
        moduleId: null,
        apiPermissionIdList: appPerms.api || [],
        uiPermissionIdList: appPerms.ui || [],
      })
    }

    const payload = {
      realmId: Number(realmId),
      applicationId: Number(applicationId),
      userRoleId: Number(selectedRole.roleId),
      modules: modulesList,
    }

    try {
      const res = await syncUserRoleProfile(payload)
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || 'User Role Profile mappings synchronized successfully!')
        fetchAssignedProfiles()
        handleMappingReset()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to map user role profile.')
    }
  }

  const handleMappingReset = () => {
    setRealmId('-1')
    setApplicationId('-1')
    setModulesOptions([])
    setSelectedModuleIds([])
    setModulePermissionsOptions({})
    setModulePermissions({})
    setSelectedRole(null)
    setRoleSearchQuery('')
    setRoleDropdownOpen(false)
    setMappingValidated(false)
    setActiveUserRoles([])
  }

  const handleFilterRealmChange = async (rId) => {
    setFilterRealmId(rId)
    setFilterApplicationId('-1')
    setFilterModuleId('-1')
    setFilterModulesOptions([])
    setFilterActiveUserRoles([])
    setFilterRoleSearchQuery('')
    setFilterSelectedRole(null)

    try {
      if (rId === '-1') {
        setFilterApplicationsOptions(applicationsOptions)
      } else {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
        if (searchRes.status === 200) {
          setFilterApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load filter applications: ' + error.message)
    }
    fetchAssignedProfiles(rId, '-1', '-1', '-1')
  }

  const handleFilterApplicationChange = async (appId) => {
    setFilterApplicationId(appId)
    setFilterModuleId('-1')
    setFilterModulesOptions([])
    setFilterActiveUserRoles([])
    setFilterRoleSearchQuery('')
    setFilterSelectedRole(null)

    if (filterRealmId !== '-1' && appId !== '-1') {
      try {
        const modulesRes = await searchModules(0, 1000, null, filterRealmId, appId, true)
        if (modulesRes.status === 200) {
          setFilterModulesOptions(modulesRes.data.modules || [])
        }
        const rolesRes = await getActiveUserRoles(filterRealmId, appId)
        if (rolesRes.status === 200) {
          setFilterActiveUserRoles(rolesRes.data || [])
        }
      } catch (error) {
        toast.error('Failed to load filter modules/roles: ' + error.message)
      }
    }

    fetchAssignedProfiles(filterRealmId, appId, '-1', '-1')
  }

  const handleFilterClear = () => {
    setFilterRealmId('-1')
    setFilterApplicationId('-1')
    setFilterModuleId('-1')
    setFilterModulesOptions([])
    setFilterActiveUserRoles([])
    setFilterRoleSearchQuery('')
    setFilterSelectedRole(null)
    setFilterApplicationsOptions(applicationsOptions)
    fetchAssignedProfiles('-1', '-1', '-1', '-1')
  }

  const handleFilterModuleChange = (modId) => {
    setFilterModuleId(modId)
    fetchAssignedProfiles(
      filterRealmId,
      filterApplicationId,
      modId,
      filterSelectedRole ? filterSelectedRole.roleId : '-1',
    )
  }

  const handleFilterRoleSelect = (role) => {
    setFilterSelectedRole(role)
    setFilterRoleSearchQuery(role ? role.roleName : '')
    setFilterRoleDropdownOpen(false)
    fetchAssignedProfiles(
      filterRealmId,
      filterApplicationId,
      filterModuleId,
      role ? role.roleId : '-1',
    )
  }

  const handleFilterRoleClear = () => {
    setFilterSelectedRole(null)
    setFilterRoleSearchQuery('')
    setFilterRoleDropdownOpen(false)
    fetchAssignedProfiles(
      filterRealmId,
      filterApplicationId,
      filterModuleId,
      '-1',
    )
  }

  const handleEditProfile = async (rId, appId, role) => {
    // Set basic states
    setRealmId(rId)
    setApplicationId(appId)
    setSelectedRole(role)
    setRoleSearchQuery(role.roleName)
    setSelectedModuleIds([])
    setModulesOptions([])
    setModulePermissionsOptions({})
    setModulePermissions({})

    try {
      // 1. Fetch applications for the selected realm
      if (rId !== '-1') {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
        if (searchRes.status === 200) {
          setApplicationsOptions(searchRes.data.applications || [])
        }
      }
      
      // 2. Fetch modules and user roles for the application
      if (rId !== '-1' && appId !== '-1') {
        const modulesRes = await searchModules(0, 1000, null, rId, appId, true)
        let hasModules = false
        let mods = []
        if (modulesRes.status === 200) {
          mods = modulesRes.data.modules || []
          setModulesOptions(mods)
          hasModules = mods.length > 0
        }
        
        await fetchActiveRoles(rId, appId)
        
        if (!hasModules) {
          await fetchModulePermissions('app', rId, appId)
        }
        
        // 3. Load mapped permissions for checkbox checking
        await loadExistingMappingForRole(role, rId, appId, mods)
      }

      // 4. Scroll to mapping form and notify
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.success(`Populated fields to edit profile for role: ${role.roleName}`)
    } catch (error) {
      toast.error('Failed to load profile for editing: ' + error.message)
    }
  }

  const confirmDeleteProfile = (profile) => {
    setProfileToDelete(profile)
    setProfileDeleteModalVisible(true)
  }

  const cancelDeleteProfile = () => {
    setProfileToDelete(null)
    setProfileDeleteModalVisible(false)
  }

  const executeDeleteProfile = async () => {
    if (!profileToDelete) return
    try {
      let res
      if (profileToDelete.permissionType === 'api') {
        res = await deleteUserRoleApiProfile(profileToDelete.id)
      } else {
        res = await deleteUserRoleUiProfile(profileToDelete.id)
      }
      if (res.status === 200) {
        toast.success(res.message || 'Mapping deleted successfully!')
        fetchAssignedProfiles()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to delete profile mapping: ' + error.message)
    } finally {
      cancelDeleteProfile()
    }
  }

  const filteredRoles = activeUserRoles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(roleSearchQuery.toLowerCase())),
  )

  const filteredFilterRoles = filterActiveUserRoles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(filterRoleSearchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(filterRoleSearchQuery.toLowerCase())),
  )

  const getGroupedProfiles = () => {
    const grouped = {}
    const apiPerms = assignedProfiles?.apiPermissions || []
    const uiPerms = assignedProfiles?.uiPermissions || []

    apiPerms.forEach((profile) => {
      const realmName = profile.realm?.realm || 'Unknown Realm'
      const appName = profile.application?.clientId || 'Unknown Application'
      const roleName = profile.userRole?.roleName || 'Unknown Role'
      const moduleName = profile.module?.moduleName || 'Application Level'

      if (!grouped[realmName]) grouped[realmName] = {}
      if (!grouped[realmName][appName]) grouped[realmName][appName] = {}
      if (!grouped[realmName][appName][roleName]) {
        grouped[realmName][appName][roleName] = {}
      }
      if (!grouped[realmName][appName][roleName][moduleName]) {
        grouped[realmName][appName][roleName][moduleName] = { api: [], ui: [] }
      }
      grouped[realmName][appName][roleName][moduleName].api.push(profile)
    })

    uiPerms.forEach((profile) => {
      const realmName = profile.realm?.realm || 'Unknown Realm'
      const appName = profile.application?.clientId || 'Unknown Application'
      const roleName = profile.userRole?.roleName || 'Unknown Role'
      const moduleName = profile.module?.moduleName || 'Application Level'

      if (!grouped[realmName]) grouped[realmName] = {}
      if (!grouped[realmName][appName]) grouped[realmName][appName] = {}
      if (!grouped[realmName][appName][roleName]) {
        grouped[realmName][appName][roleName] = {}
      }
      if (!grouped[realmName][appName][roleName][moduleName]) {
        grouped[realmName][appName][roleName][moduleName] = { api: [], ui: [] }
      }
      grouped[realmName][appName][roleName][moduleName].ui.push(profile)
    })

    return grouped
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage User Roles & Profiles</strong>
          </CCardHeader>
          <CCardBody>
            {/* Custom Tab Navigation Bar */}
            <div
              className="d-flex mb-4 p-1 rounded"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxWidth: 'fit-content',
              }}
            >
              <button
                type="button"
                className={`btn btn-sm rounded px-3 py-2 border-0 ${
                  activeTab === 'definitions' ? 'btn-primary text-white shadow-sm' : ''
                }`}
                style={{
                  color: activeTab === 'definitions' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: activeTab === 'definitions' ? '' : 'transparent',
                  transition: 'all 0.25s ease',
                  fontWeight: '500',
                }}
                onClick={() => setActiveTab('definitions')}
              >
                User Role Definitions
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded px-3 py-2 border-0 ${
                  activeTab === 'profile' ? 'btn-primary text-white shadow-sm' : ''
                }`}
                style={{
                  color: activeTab === 'profile' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: activeTab === 'profile' ? '' : 'transparent',
                  transition: 'all 0.25s ease',
                  fontWeight: '500',
                }}
                onClick={() => setActiveTab('profile')}
              >
                Profile Mapping
              </button>
            </div>

            {/* TAB 1: USER ROLE DEFINITIONS */}
            {activeTab === 'definitions' && (
              <>
                <CForm
                  className="row g-3"
                  onSubmit={roleFormSubmit}
                  validated={validated}
                  noValidate
                >
                  {/* Realm Select */}
                  <CCol xs={12} md={4}>
                    <CFormLabel
                      htmlFor="defRealmSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Realm
                    </CFormLabel>
                    <CFormSelect
                      id="defRealmSelect"
                      value={definitionsRealmId}
                      onChange={(e) => handleDefinitionsRealmChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                    >
                      <option value="-1">Select a Realm</option>
                      {realmsOptions.map((realm) => (
                        <option key={realm.id} value={realm.id}>
                          {realm.realm}
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback tooltip invalid>
                      Please select a realm.
                    </CFormFeedback>
                  </CCol>

                  {/* Application Select */}
                  <CCol xs={12} md={4}>
                    <CFormLabel
                      htmlFor="defAppSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Application
                    </CFormLabel>
                    <CFormSelect
                      id="defAppSelect"
                      value={definitionsApplicationId}
                      onChange={(e) => setDefinitionsApplicationId(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                    >
                      <option value="-1">Select an Application</option>
                      {definitionsApplicationsOptions.map((app, index) => (
                        <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                          {app.clientId}
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback tooltip invalid>
                      Please select an application.
                    </CFormFeedback>
                  </CCol>

                  {/* Role Name */}
                  <CCol xs={12} md={4}>
                    <CFormLabel htmlFor="roleName" className="text-muted small font-weight-bold">
                      Role Name
                    </CFormLabel>
                    <CFormInput
                      id="roleName"
                      value={formData.roleName}
                      onChange={handleFormChange}
                      placeholder="e.g. Administrator"
                      size="sm"
                      required
                    />
                    <CFormFeedback tooltip invalid>
                      Please provide a user role name.
                    </CFormFeedback>
                  </CCol>

                  {/* Description Field */}
                  <CCol xs={12} md={4}>
                    <CFormLabel htmlFor="description" className="text-muted small font-weight-bold">
                      Description
                    </CFormLabel>
                    <CFormInput
                      id="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Short description of this role"
                      size="sm"
                    />
                  </CCol>

                  {/* Status Select */}
                  <CCol xs={12} md={4}>
                    <CFormLabel htmlFor="active" className="text-muted small font-weight-bold">
                      Status
                    </CFormLabel>
                    <CFormSelect
                      id="active"
                      value={formData.active}
                      onChange={handleFormChange}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                    >
                      <option value="-1">Select a status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </CFormSelect>
                    <CFormFeedback tooltip invalid>
                      Please select a status.
                    </CFormFeedback>
                  </CCol>

                  {/* Form Submission Buttons */}
                  <CCol xs={12} md={4} className="d-flex flex-column justify-content-end">
                    <CFormLabel className="small font-weight-bold" style={{ visibility: 'hidden' }}>
                      Spacer
                    </CFormLabel>
                    <div
                      className="d-flex gap-2 justify-content-end"
                      style={{ height: '31px', alignItems: 'center' }}
                    >
                      <CButton color="primary" type="submit" size="sm" className="px-4">
                        {formData.id ? 'Update' : 'Create'}
                      </CButton>
                      <button
                        className="btn btn-sm btn-outline-secondary px-4"
                        onClick={handleReset}
                        type="button"
                      >
                        Clear
                      </button>
                    </div>
                  </CCol>
                </CForm>

                <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                {/* Definitions Table Filters */}
                <div
                  className="row g-3 mb-4 pb-3 border-bottom align-items-end"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <CCol xs={12} sm={3}>
                    <CFormLabel
                      htmlFor="defFilterRealmSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Filter by Realm
                    </CFormLabel>
                    <CFormSelect
                      id="defFilterRealmSelect"
                      value={defFilterRealmId}
                      onChange={(e) => handleDefFilterRealmChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                    >
                      <option value="-1">All Realms</option>
                      {realmsOptions.map((realm) => (
                        <option key={realm.id} value={realm.id}>
                          {realm.realm}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol xs={12} sm={3}>
                    <CFormLabel
                      htmlFor="defFilterAppSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Filter by Application
                    </CFormLabel>
                    <CFormSelect
                      id="defFilterAppSelect"
                      value={defFilterApplicationId}
                      onChange={(e) => handleDefFilterApplicationChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                    >
                      <option value="-1">All Applications</option>
                      {defFilterApplicationsOptions.map((app, index) => (
                        <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                          {app.clientId} ({app.realm?.realm || 'N/A'})
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol xs={12} sm={3}>
                    <CFormInput
                      type="text"
                      placeholder="Search name/description..."
                      size="sm"
                      value={searchParam}
                      onChange={(e) => {
                        setSearchParam(e.target.value)
                        setCurrentPage(0)
                      }}
                    />
                  </CCol>

                  <CCol xs={12} sm={3}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary w-100"
                      onClick={handleDefFilterClear}
                    >
                      Clear Filters
                    </button>
                  </CCol>
                </div>

                <CCol xs={12}>
                  <CTable hover responsive align="middle" className="border-top">
                    <CTableHead color="dark">
                      <CTableRow>
                        <CTableHeaderCell scope="col" className="py-2">
                          Realm
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="py-2">
                          Application
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="py-2">
                          Role Name
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="py-2">
                          Description
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="py-2">
                          Status
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="py-2 text-end">
                          Action
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(roles) && roles.length > 0 ? (
                        roles.map((role, index) => (
                          <CTableRow key={role.roleId ? `${role.roleId}-${index}` : index}>
                            <CTableDataCell className="font-weight-semibold">
                              {role.realm?.realm || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>{role.application?.clientId || 'N/A'}</CTableDataCell>
                            <CTableDataCell className="font-weight-bold text-info">
                              {role.roleName}
                            </CTableDataCell>
                            <CTableDataCell className="text-muted">
                              {role.description || 'No description provided'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <span
                                className={`badge rounded-pill bg-${role.active ? 'success' : 'danger'}`}
                              >
                                {role.active ? 'Active' : 'Inactive'}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              <CButton
                                type="button"
                                color="primary"
                                size="sm"
                                className="me-1 px-3"
                                onClick={() => loadRoleIntoForm(role.roleId)}
                              >
                                Edit
                              </CButton>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger px-3"
                                onClick={() => confirmDelete(role)}
                              >
                                Delete
                              </button>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="text-center py-4">
                            <span className="text-muted">No user roles found</span>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={setCurrentPage}
                  />
                </CCol>
              </>
            )}

            {/* TAB 2: PROFILE MAPPING */}
            {activeTab === 'profile' && (
              <>
                <CForm
                  className="row g-3"
                  onSubmit={handleMappingFormSubmit}
                  validated={mappingValidated}
                  noValidate
                >
                  {/* Realm Select */}
                  <CCol xs={12} sm={6} md={4}>
                    <CFormLabel htmlFor="realmSelect" className="text-muted small font-weight-bold">
                      Realm
                    </CFormLabel>
                    <CFormSelect
                      id="realmSelect"
                      value={realmId}
                      onChange={(e) => handleRealmChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                    >
                      <option value="-1">Select a Realm</option>
                      {realmsOptions.map((realm) => (
                        <option key={realm.id} value={realm.id}>
                          {realm.realm}
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback tooltip invalid>
                      Please select a realm.
                    </CFormFeedback>
                  </CCol>

                  {/* Application Select */}
                  <CCol xs={12} sm={6} md={4}>
                    <CFormLabel htmlFor="appSelect" className="text-muted small font-weight-bold">
                      Application
                    </CFormLabel>
                    <CFormSelect
                      id="appSelect"
                      value={applicationId}
                      onChange={(e) => handleApplicationChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                    >
                      <option value="-1">Select an Application</option>
                      {applicationsOptions.map((app, index) => (
                        <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                          {app.clientId} ({app.realm?.realm || 'N/A'})
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback tooltip invalid>
                      Please select an application.
                    </CFormFeedback>
                  </CCol>

                  {/* Searchable User Role Dropdown */}
                  <CCol xs={12} sm={12} md={4}>
                    <CFormLabel className="text-muted small font-weight-bold">User Role</CFormLabel>
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                      <CFormInput
                        type="text"
                        placeholder={
                          realmId === '-1' || applicationId === '-1'
                            ? 'Please select Realm & Application first'
                            : 'Type to search and select user role...'
                        }
                        value={roleSearchQuery}
                        onFocus={() => {
                          if (realmId !== '-1' && applicationId !== '-1') {
                            setRoleDropdownOpen(true)
                          }
                        }}
                        onChange={(e) => {
                          setRoleSearchQuery(e.target.value)
                          setSelectedRole(null)
                          if (realmId !== '-1' && applicationId !== '-1') {
                            setRoleDropdownOpen(true)
                          }
                        }}
                        disabled={realmId === '-1' || applicationId === '-1'}
                        size="sm"
                        required
                      />
                      {roleDropdownOpen && (
                        <div
                          className="dropdown-menu show w-100 shadow-lg"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 1050,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backgroundColor: 'var(--cui-body-bg, #2a303d)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '0.25rem',
                          }}
                        >
                          {filteredRoles.length > 0 ? (
                            filteredRoles.map((role) => (
                              <button
                                key={role.roleId}
                                type="button"
                                className="dropdown-item text-start d-block w-100 py-2 border-0 bg-transparent text-body"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedRole(role)
                                  setRoleSearchQuery(role.roleName)
                                  setRoleDropdownOpen(false)
                                }}
                              >
                                <strong>{role.roleName}</strong>
                                {role.description ? ` - ${role.description}` : ''}
                              </button>
                            ))
                          ) : (
                            <div className="dropdown-item text-muted disabled">
                              No matching roles found for this Realm/Application
                            </div>
                          )}
                        </div>
                      )}
                      {selectedRole && (
                        <div className="text-success small mt-1">
                          ✓ Selected Role: <strong>{selectedRole.roleName}</strong>
                        </div>
                      )}
                    </div>
                  </CCol>

                  {/* Modules checklist layout when modules exist */}
                  {realmId !== '-1' && applicationId !== '-1' && (
                    <>
                      {profileLoading ? (
                        <CCol
                          xs={12}
                          className="mt-4 text-center py-5 rounded border"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <div className="spinner-border text-info spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <div className="text-muted mt-2 small">
                            Loading existing user role profile mappings...
                          </div>
                        </CCol>
                      ) : (
                        <>
                          {modulesOptions.length > 0 && (
                            <CCol xs={12} className="mt-4">
                              <CCard
                                className="border shadow-sm"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                  borderColor: 'rgba(255, 255, 255, 0.08)',
                                }}
                              >
                                <CCardHeader
                                  className="bg-transparent py-2 d-flex flex-wrap align-items-center justify-content-between gap-2"
                                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
                                >
                                  <strong className="text-light small">
                                    Modules & Nested Permissions
                                  </strong>
                                  <CFormCheck
                                    id="selectAllModules"
                                    label="Select All Modules"
                                    checked={
                                      modulesOptions.length > 0 &&
                                      modulesOptions.every((m) =>
                                        selectedModuleIds.includes(m.moduleId),
                                      )
                                    }
                                    onChange={handleModuleSelectAll}
                                    style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                  />
                                </CCardHeader>
                                <CCardBody className="p-3">
                                  {modulesOptions.map((module) => {
                                    const isChecked = selectedModuleIds.includes(module.moduleId)
                                    const options = modulePermissionsOptions[module.moduleId] || {
                                      api: [],
                                      ui: [],
                                    }
                                    const selectedPerms = modulePermissions[module.moduleId] || {
                                      api: [],
                                      ui: [],
                                    }

                                    return (
                                      <div
                                        key={module.moduleId}
                                        className="mb-3 p-3 rounded"
                                        style={{
                                          backgroundColor: isChecked
                                            ? 'rgba(255, 255, 255, 0.02)'
                                            : 'rgba(255, 255, 255, 0.005)',
                                          border: '1px solid rgba(255, 255, 255, 0.04)',
                                        }}
                                      >
                                        {/* Module Checkbox and Label */}
                                        <div className="d-flex align-items-center">
                                          <CFormCheck
                                            id={`module-${module.moduleId}`}
                                            checked={isChecked}
                                            onChange={() =>
                                              handleModuleCheckboxChange(module.moduleId)
                                            }
                                            style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                                          />
                                          <label
                                            htmlFor={`module-${module.moduleId}`}
                                            className="font-weight-semibold text-light mb-0"
                                            style={{
                                              cursor: 'pointer',
                                              userSelect: 'none',
                                              fontSize: '0.9rem',
                                            }}
                                          >
                                            {module.moduleName}
                                          </label>
                                        </div>

                                        {/* Nested API and UI Permission Checkboxes */}
                                        {isChecked && (
                                          <div
                                            className="row mt-3 ms-2 ps-3 border-start"
                                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                                          >
                                            {/* API Permissions Column */}
                                            <div className="col-12 col-md-6 mb-3 mb-md-0">
                                              <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span className="text-muted small font-weight-bold">
                                                  API Permissions
                                                </span>
                                                {options.api.length > 0 && (
                                                  <CFormCheck
                                                    id={`selectAllApi-${module.moduleId}`}
                                                    label="All"
                                                    checked={
                                                      options.api.length > 0 &&
                                                      options.api.every((p) =>
                                                        selectedPerms.api.includes(
                                                          p.apiPermissionId,
                                                        ),
                                                      )
                                                    }
                                                    onChange={() =>
                                                      handleNestedApiSelectAll(module.moduleId)
                                                    }
                                                    style={{
                                                      cursor: 'pointer',
                                                      fontSize: '0.75rem',
                                                    }}
                                                  />
                                                )}
                                              </div>
                                              <div
                                                className="p-2 border rounded"
                                                style={{
                                                  maxHeight: '180px',
                                                  overflowY: 'auto',
                                                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                  borderColor: 'rgba(255, 255, 255, 0.05)',
                                                }}
                                              >
                                                {options.api.length > 0 ? (
                                                  options.api.map((perm) => (
                                                    <div
                                                      className="d-flex align-items-center mb-1"
                                                      key={perm.apiPermissionId}
                                                    >
                                                      <CFormCheck
                                                        id={`api-perm-${module.moduleId}-${perm.apiPermissionId}`}
                                                        checked={selectedPerms.api.includes(
                                                          perm.apiPermissionId,
                                                        )}
                                                        onChange={() =>
                                                          handleNestedApiPermissionCheckboxChange(
                                                            module.moduleId,
                                                            perm.apiPermissionId,
                                                          )
                                                        }
                                                        style={{
                                                          cursor: 'pointer',
                                                          marginRight: '0.5rem',
                                                        }}
                                                      />
                                                      <label
                                                        htmlFor={`api-perm-${module.moduleId}-${perm.apiPermissionId}`}
                                                        className="text-truncate small text-muted mb-0"
                                                        style={{
                                                          cursor: 'pointer',
                                                          userSelect: 'none',
                                                          fontSize: '0.75rem',
                                                        }}
                                                        title={perm.apiPermissionName}
                                                      >
                                                        {perm.apiPermissionName}
                                                      </label>
                                                    </div>
                                                  ))
                                                ) : (
                                                  <div className="text-muted small text-center py-2">
                                                    Loading/No API permissions
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* UI Permissions Column */}
                                            <div className="col-12 col-md-6">
                                              <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span className="text-muted small font-weight-bold">
                                                  UI Permissions
                                                </span>
                                                {options.ui.length > 0 && (
                                                  <CFormCheck
                                                    id={`selectAllUi-${module.moduleId}`}
                                                    label="All"
                                                    checked={
                                                      options.ui.length > 0 &&
                                                      options.ui.every((p) =>
                                                        selectedPerms.ui.includes(p.uiPermissionId),
                                                      )
                                                    }
                                                    onChange={() =>
                                                      handleNestedUiSelectAll(module.moduleId)
                                                    }
                                                    style={{
                                                      cursor: 'pointer',
                                                      fontSize: '0.75rem',
                                                    }}
                                                  />
                                                )}
                                              </div>
                                              <div
                                                className="p-2 border rounded"
                                                style={{
                                                  maxHeight: '180px',
                                                  overflowY: 'auto',
                                                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                  borderColor: 'rgba(255, 255, 255, 0.05)',
                                                }}
                                              >
                                                {options.ui.length > 0 ? (
                                                  options.ui.map((perm) => (
                                                    <div
                                                      className="d-flex align-items-center mb-1"
                                                      key={perm.uiPermissionId}
                                                    >
                                                      <CFormCheck
                                                        id={`ui-perm-${module.moduleId}-${perm.uiPermissionId}`}
                                                        checked={selectedPerms.ui.includes(
                                                          perm.uiPermissionId,
                                                        )}
                                                        onChange={() =>
                                                          handleNestedUiPermissionCheckboxChange(
                                                            module.moduleId,
                                                            perm.uiPermissionId,
                                                          )
                                                        }
                                                        style={{
                                                          cursor: 'pointer',
                                                          marginRight: '0.5rem',
                                                        }}
                                                      />
                                                      <label
                                                        htmlFor={`ui-perm-${module.moduleId}-${perm.uiPermissionId}`}
                                                        className="text-truncate small text-muted mb-0"
                                                        style={{
                                                          cursor: 'pointer',
                                                          userSelect: 'none',
                                                          fontSize: '0.75rem',
                                                        }}
                                                        title={perm.uiPermissionName}
                                                      >
                                                        {perm.uiPermissionName}
                                                      </label>
                                                    </div>
                                                  ))
                                                ) : (
                                                  <div className="text-muted small text-center py-2">
                                                    Loading/No UI permissions
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </CCardBody>
                              </CCard>
                            </CCol>
                          )}

                          {/* API and UI Permissions side-by-side when modules do not exist */}
                          {modulesOptions.length === 0 && (
                            <>
                              {/* API Permissions Checklist */}
                              <CCol xs={12} md={6} className="mt-4">
                                <CCard
                                  className="border shadow-sm h-100"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                  }}
                                >
                                  <CCardHeader
                                    className="bg-transparent py-2 d-flex flex-wrap align-items-center justify-content-between gap-2"
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
                                  >
                                    <strong className="text-light small">API Permissions</strong>
                                    {(modulePermissionsOptions['app']?.api || []).length > 0 && (
                                      <CFormCheck
                                        id="selectAllApi"
                                        label="All"
                                        checked={
                                          (modulePermissionsOptions['app']?.api || []).length > 0 &&
                                          (modulePermissionsOptions['app']?.api || []).every((p) =>
                                            (modulePermissions['app']?.api || []).includes(
                                              p.apiPermissionId,
                                            ),
                                          )
                                        }
                                        onChange={() => handleNestedApiSelectAll('app')}
                                        style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                      />
                                    )}
                                  </CCardHeader>
                                  <CCardBody
                                    className="p-2"
                                    style={{ maxHeight: '250px', overflowY: 'auto' }}
                                  >
                                    {(modulePermissionsOptions['app']?.api || []).length > 0 ? (
                                      modulePermissionsOptions['app'].api.map((perm) => (
                                        <div
                                          className="d-flex align-items-center rounded px-2 py-1 mb-1"
                                          style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.01)',
                                            border: '1px solid rgba(255, 255, 255, 0.03)',
                                          }}
                                          key={perm.apiPermissionId}
                                        >
                                          <CFormCheck
                                            id={`api-perm-${perm.apiPermissionId}`}
                                            checked={(modulePermissions['app']?.api || []).includes(
                                              perm.apiPermissionId,
                                            )}
                                            onChange={() =>
                                              handleNestedApiPermissionCheckboxChange(
                                                'app',
                                                perm.apiPermissionId,
                                              )
                                            }
                                            style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                                          />
                                          <label
                                            htmlFor={`api-perm-${perm.apiPermissionId}`}
                                            className="text-truncate small text-muted mb-0"
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            title={perm.apiPermissionName}
                                          >
                                            {perm.apiPermissionName}
                                          </label>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-4 text-muted small">
                                        No active API permissions found.
                                      </div>
                                    )}
                                  </CCardBody>
                                </CCard>
                              </CCol>

                              {/* UI Permissions Checklist */}
                              <CCol xs={12} md={6} className="mt-4">
                                <CCard
                                  className="border shadow-sm h-100"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                  }}
                                >
                                  <CCardHeader
                                    className="bg-transparent py-2 d-flex flex-wrap align-items-center justify-content-between gap-2"
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
                                  >
                                    <strong className="text-light small">UI Permissions</strong>
                                    {(modulePermissionsOptions['app']?.ui || []).length > 0 && (
                                      <CFormCheck
                                        id="selectAllUi"
                                        label="All"
                                        checked={
                                          (modulePermissionsOptions['app']?.ui || []).length > 0 &&
                                          (modulePermissionsOptions['app']?.ui || []).every((p) =>
                                            (modulePermissions['app']?.ui || []).includes(
                                              p.uiPermissionId,
                                            ),
                                          )
                                        }
                                        onChange={() => handleNestedUiSelectAll('app')}
                                        style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                      />
                                    )}
                                  </CCardHeader>
                                  <CCardBody
                                    className="p-2"
                                    style={{ maxHeight: '250px', overflowY: 'auto' }}
                                  >
                                    {(modulePermissionsOptions['app']?.ui || []).length > 0 ? (
                                      modulePermissionsOptions['app'].ui.map((perm) => (
                                        <div
                                          className="d-flex align-items-center rounded px-2 py-1 mb-1"
                                          style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.01)',
                                            border: '1px solid rgba(255, 255, 255, 0.03)',
                                          }}
                                          key={perm.uiPermissionId}
                                        >
                                          <CFormCheck
                                            id={`ui-perm-${perm.uiPermissionId}`}
                                            checked={(modulePermissions['app']?.ui || []).includes(
                                              perm.uiPermissionId,
                                            )}
                                            onChange={() =>
                                              handleNestedUiPermissionCheckboxChange(
                                                'app',
                                                perm.uiPermissionId,
                                              )
                                            }
                                            style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                                          />
                                          <label
                                            htmlFor={`ui-perm-${perm.uiPermissionId}`}
                                            className="text-truncate small text-muted mb-0"
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            title={perm.uiPermissionName}
                                          >
                                            {perm.uiPermissionName}
                                          </label>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-4 text-muted small">
                                        No active UI permissions found.
                                      </div>
                                    )}
                                  </CCardBody>
                                </CCard>
                              </CCol>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Form Submission Buttons */}
                  <CCol xs={12} className="d-flex justify-content-end gap-2 mt-4">
                    <CButton color="primary" type="submit" size="sm" className="px-4">
                      Map Profile
                    </CButton>
                    <button
                      className="btn btn-sm btn-outline-secondary px-4"
                      onClick={handleMappingReset}
                      type="button"
                    >
                      Clear
                    </button>
                  </CCol>
                </CForm>

                {/* Grouped Assigned Profiles Section */}
                <CCard className="mt-4 border shadow-sm">
                  <CCardHeader>
                    <strong>Assigned User Role Profiles</strong>
                  </CCardHeader>
                  <CCardBody>
                    {/* Filtration Section */}
                    <div
                      className="row g-3 mb-4 pb-3 border-bottom align-items-end"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <CCol xs={12} sm={6} md={3}>
                        <CFormLabel
                          htmlFor="filterRealmSelect"
                          className="text-muted small font-weight-bold"
                        >
                          Filter by Realm
                        </CFormLabel>
                        <CFormSelect
                          id="filterRealmSelect"
                          value={filterRealmId}
                          onChange={(e) => handleFilterRealmChange(e.target.value)}
                          style={{ cursor: 'pointer' }}
                          size="sm"
                        >
                          <option value="-1">All Realms</option>
                          {realmsOptions.map((realm) => (
                            <option key={realm.id} value={realm.id}>
                              {realm.realm}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol xs={12} sm={6} md={3}>
                        <CFormLabel
                          htmlFor="filterAppSelect"
                          className="text-muted small font-weight-bold"
                        >
                          Filter by Application
                        </CFormLabel>
                        <CFormSelect
                          id="filterAppSelect"
                          value={filterApplicationId}
                          onChange={(e) => handleFilterApplicationChange(e.target.value)}
                          style={{ cursor: 'pointer' }}
                          size="sm"
                        >
                          <option value="-1">All Applications</option>
                          {filterApplicationsOptions.map((app, index) => (
                            <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                              {app.clientId} ({app.realm?.realm || 'N/A'})
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol xs={12} sm={6} md={3}>
                        <CFormLabel
                          htmlFor="filterModuleSelect"
                          className="text-muted small font-weight-bold"
                        >
                          Filter by Module
                        </CFormLabel>
                        <CFormSelect
                          id="filterModuleSelect"
                          value={filterModuleId}
                          onChange={(e) => handleFilterModuleChange(e.target.value)}
                          style={{ cursor: 'pointer' }}
                          size="sm"
                          disabled={filterRealmId === '-1' || filterApplicationId === '-1'}
                        >
                          {filterRealmId === '-1' || filterApplicationId === '-1' ? (
                            <option value="-1">Select Realm & Application first</option>
                          ) : (
                            <>
                              <option value="-1">All Modules</option>
                              <option value="0">Application Level</option>
                              {filterModulesOptions.map((module) => (
                                <option key={module.moduleId} value={module.moduleId}>
                                  {module.moduleName}
                                </option>
                              ))}
                            </>
                          )}
                        </CFormSelect>
                      </CCol>

                      <CCol xs={12} sm={6} md={3} style={{ position: 'relative' }} ref={filterRoleDropdownRef}>
                        <CFormLabel
                          htmlFor="filterUserRoleSearch"
                          className="text-muted small font-weight-bold"
                        >
                          Filter by User Role
                        </CFormLabel>
                        <div className="d-flex align-items-center gap-1 position-relative">
                          <CFormInput
                            type="text"
                            id="filterUserRoleSearch"
                            placeholder={
                              filterRealmId === '-1' || filterApplicationId === '-1'
                                ? 'Select Realm & Application first'
                                : 'Search user roles...'
                            }
                            value={filterRoleSearchQuery}
                            onClick={() => {
                              if (filterRealmId !== '-1' && filterApplicationId !== '-1') {
                                setFilterRoleDropdownOpen(true)
                              }
                            }}
                            onChange={(e) => {
                              setFilterRoleSearchQuery(e.target.value)
                              setFilterSelectedRole(null)
                              if (filterRealmId !== '-1' && filterApplicationId !== '-1') {
                                setFilterRoleDropdownOpen(true)
                              }
                            }}
                            disabled={filterRealmId === '-1' || filterApplicationId === '-1'}
                            size="sm"
                          />
                          {filterSelectedRole && (
                            <button
                              type="button"
                              className="btn btn-sm btn-close position-absolute"
                              style={{ right: '8px', zIndex: 10 }}
                              onClick={handleFilterRoleClear}
                              aria-label="Close"
                            />
                          )}
                        </div>
                        {filterRoleDropdownOpen && (
                          <div
                            className="dropdown-menu show w-100 shadow-lg"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              zIndex: 1050,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              backgroundColor: 'var(--cui-body-bg, #2a303d)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '0.25rem',
                            }}
                          >
                            {filteredFilterRoles.length > 0 ? (
                              filteredFilterRoles.map((role) => (
                                <button
                                  key={role.roleId}
                                  type="button"
                                  className="dropdown-item text-start d-block w-100 py-2 border-0 bg-transparent text-body"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleFilterRoleSelect(role)}
                                >
                                  <strong>{role.roleName}</strong>
                                  {role.description ? ` - ${role.description}` : ''}
                                </button>
                              ))
                            ) : (
                              <div className="dropdown-item text-muted disabled">
                                No matching roles found
                              </div>
                            )}
                          </div>
                        )}
                      </CCol>

                      <CCol xs={12} className="d-flex justify-content-end mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary px-4"
                          onClick={handleFilterClear}
                        >
                          Clear Filters
                        </button>
                      </CCol>
                    </div>

                    {Object.keys(getGroupedProfiles()).length > 0 ? (
                      Object.entries(getGroupedProfiles()).map(([realmName, apps]) => (
                        <div key={realmName} className="mb-4">
                          <h6
                            className="text-primary font-weight-bold mb-3 border-bottom pb-2"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                          >
                            Realm: {realmName}
                          </h6>
                          <div className="row g-3">
                            {Object.entries(apps).map(([appName, rolesList]) => (
                              <div key={appName} className="col-12 col-md-6 col-lg-4">
                                <CCard
                                  className="h-100"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderColor: 'rgba(255, 255, 255, 0.06)',
                                  }}
                                >
                                  <CCardHeader
                                    className="py-2 bg-transparent font-weight-semibold text-truncate"
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                                    title={appName}
                                  >
                                    Application: {appName}
                                  </CCardHeader>
                                  <CCardBody className="p-3">
                                    {Object.entries(rolesList).map(([roleName, modulesList]) => {
                                      const firstModuleKey = Object.keys(modulesList)[0]
                                      const sampleProfile =
                                        modulesList[firstModuleKey]?.api?.[0] ||
                                        modulesList[firstModuleKey]?.ui?.[0]

                                      return (
                                        <div
                                          key={roleName}
                                          className="mb-3 border-bottom pb-2"
                                          style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}
                                        >
                                          <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div
                                              className="small font-weight-bold text-info"
                                              style={{ fontSize: '0.85rem' }}
                                            >
                                              {roleName}
                                            </div>
                                            {sampleProfile && (
                                              <CButton
                                                color="link"
                                                size="sm"
                                                className="p-0 text-decoration-none text-warning small font-weight-semibold"
                                                style={{ fontSize: '0.75rem', outline: 'none' }}
                                                onClick={() =>
                                                  handleEditProfile(
                                                    sampleProfile.realmId,
                                                    sampleProfile.applicationId,
                                                    sampleProfile.userRole,
                                                  )
                                                }
                                              >
                                                Edit
                                              </CButton>
                                            )}
                                          </div>

                                          {Object.entries(modulesList).map(([moduleName, permObj]) => {
                                            const isAppLevel = moduleName === 'Application Level'
                                            return (
                                              <div
                                                key={moduleName}
                                                className={
                                                  isAppLevel ? 'mb-2' : 'mb-2 ms-2 ps-2 border-start'
                                                }
                                                style={
                                                  isAppLevel
                                                    ? {}
                                                    : { borderColor: 'rgba(255, 255, 255, 0.1)' }
                                                }
                                              >
                                                {!isAppLevel && (
                                                  <div
                                                    className="font-weight-bold text-light mb-1"
                                                    style={{ fontSize: '0.75rem' }}
                                                  >
                                                    📦 Module: {moduleName}
                                                  </div>
                                                )}

                                                {/* API Permissions List under Module */}
                                                {permObj.api && permObj.api.length > 0 && (
                                                  <div className="mb-1 ms-2">
                                                    <div
                                                      className="text-muted small"
                                                      style={{ fontSize: '0.68rem' }}
                                                    >
                                                      API Permissions:
                                                    </div>
                                                    {permObj.api.map((mapping) => (
                                                      <div
                                                        key={`api-${mapping.id}`}
                                                        className="d-flex align-items-center justify-content-between py-1 px-2 rounded mb-1"
                                                        style={{
                                                          backgroundColor:
                                                            'rgba(255, 255, 255, 0.01)',
                                                          border:
                                                            '1px solid rgba(255, 255, 255, 0.02)',
                                                        }}
                                                      >
                                                        <span
                                                          className="small text-muted text-truncate"
                                                          title={
                                                            mapping.apiPermission?.apiPermissionName
                                                          }
                                                          style={{ fontSize: '0.7rem' }}
                                                        >
                                                          {mapping.apiPermission?.apiPermissionName}
                                                        </span>
                                                        <button
                                                          type="button"
                                                          className="btn btn-sm btn-outline-danger py-0 px-2"
                                                          style={{
                                                            fontSize: '0.65rem',
                                                            height: '18px',
                                                            lineHeight: '16px',
                                                          }}
                                                          onClick={() =>
                                                            confirmDeleteProfile({
                                                              ...mapping,
                                                              permissionType: 'api',
                                                            })
                                                          }
                                                        >
                                                          Delete
                                                        </button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}

                                                {/* UI Permissions List under Module */}
                                                {permObj.ui && permObj.ui.length > 0 && (
                                                  <div className="ms-2">
                                                    <div
                                                      className="text-muted small"
                                                      style={{ fontSize: '0.68rem' }}
                                                    >
                                                      UI Permissions:
                                                    </div>
                                                    {permObj.ui.map((mapping) => (
                                                      <div
                                                        key={`ui-${mapping.id}`}
                                                        className="d-flex align-items-center justify-content-between py-1 px-2 rounded mb-1"
                                                        style={{
                                                          backgroundColor:
                                                            'rgba(255, 255, 255, 0.01)',
                                                          border:
                                                            '1px solid rgba(255, 255, 255, 0.02)',
                                                        }}
                                                      >
                                                        <span
                                                          className="small text-muted text-truncate"
                                                          title={
                                                            mapping.uiPermission?.uiPermissionName
                                                          }
                                                          style={{ fontSize: '0.7rem' }}
                                                        >
                                                          {mapping.uiPermission?.uiPermissionName}
                                                        </span>
                                                        <button
                                                          type="button"
                                                          className="btn btn-sm btn-outline-danger py-0 px-2"
                                                          style={{
                                                            fontSize: '0.65rem',
                                                            height: '18px',
                                                            lineHeight: '16px',
                                                          }}
                                                          onClick={() =>
                                                            confirmDeleteProfile({
                                                              ...mapping,
                                                              permissionType: 'ui',
                                                            })
                                                          }
                                                        >
                                                          Delete
                                                        </button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )
                                    })}
                                  </CCardBody>
                                </CCard>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted small">No mappings found.</div>
                    )}
                  </CCardBody>
                </CCard>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Delete User Role Modal */}
      <CModal visible={deleteModalVisible} onClose={cancelDelete} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the user role <strong>{roleToDelete?.roleName}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" size="sm" onClick={cancelDelete}>
            Cancel
          </CButton>
          <CButton color="danger" size="sm" onClick={deleteRole}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Remove Assignment Modal */}
      <CModal visible={profileDeleteModalVisible} onClose={cancelDeleteProfile} backdrop="static">
        <CModalHeader>
          <CModalTitle>Remove Role Assignment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {profileToDelete ? (
            <div>
              <p>Are you sure you want to delete this User Role profile mapping?</p>
              <p>
                Role: <strong>{profileToDelete.userRole?.roleName}</strong>
              </p>
              <p>
                Module/Level:{' '}
                <strong>{profileToDelete.module?.moduleName || 'Application Level'}</strong>
              </p>
              <p className="text-danger small">This action cannot be undone.</p>
            </div>
          ) : (
            <p>Are you sure you want to delete this User Role profile mapping?</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDeleteProfile} size="sm">
            Cancel
          </CButton>
          <button className="btn btn-sm btn-outline-danger px-3" onClick={executeDeleteProfile}>
            Delete
          </button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default UserRole
