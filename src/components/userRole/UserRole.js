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
  deleteUserRoleProfile,
} from '../../service/userRoleProfile/UserRoleProfileService'

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
        defFilterApplicationId === '-1' ? null : defFilterApplicationId
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
  const fetchAssignedProfiles = useCallback(async (rId = filterRealmId, aId = filterApplicationId) => {
    try {
      const res = await searchUserRoleProfiles(
        rId === '-1' ? null : rId,
        aId === '-1' ? null : aId
      )
      if (res.status === 200) {
        setAssignedProfiles(res.data || [])
      }
    } catch (error) {
      toast.error('Failed to load assigned profiles: ' + error.message)
    }
  }, [filterRealmId, filterApplicationId])

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

  const handleRealmChange = async (rId) => {
    setRealmId(rId)
    setApplicationId('-1')
    setModulesOptions([])
    setSelectedModuleIds([])
    setSelectedRole(null)
    setRoleSearchQuery('')
    setActiveUserRoles([])

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

    if (realmId !== '-1' && appId !== '-1') {
      try {
        const modulesRes = await searchModules(0, 1000, null, realmId, appId, true)
        if (modulesRes.status === 200) {
          setModulesOptions(modulesRes.data.modules || [])
        }
        fetchActiveRoles(realmId, appId)
      } catch (error) {
        toast.error('Failed to load modules/roles: ' + error.message)
      }
    }
  }

  const handleModuleCheckboxChange = (modId) => {
    setSelectedModuleIds((prev) => {
      if (prev.includes(modId)) {
        return prev.filter((id) => id !== modId)
      } else {
        return [...prev, modId]
      }
    })
  }

  const handleModuleSelectAll = () => {
    const allModuleIds = modulesOptions.map((m) => m.moduleId)
    const allSelected = allModuleIds.every((id) => selectedModuleIds.includes(id))

    if (allSelected) {
      setSelectedModuleIds([])
    } else {
      setSelectedModuleIds(allModuleIds)
    }
  }

  const handleMappingFormSubmit = async (event) => {
    event.preventDefault()

    if (realmId === '-1' || applicationId === '-1' || !selectedRole) {
      setMappingValidated(true)
      toast.warning('Please select Realm, Application, and searchable User Role.')
      return
    }

    const payload = {
      realmId: Number(realmId),
      applicationId: Number(applicationId),
      userRoleId: Number(selectedRole.roleId),
      moduleIdList: selectedModuleIds.length > 0 ? selectedModuleIds : [null],
    }

    try {
      const res = await createUserRoleProfile(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'User Role Profile mapped successfully!')
        fetchAssignedProfiles()
        handleMappingReset()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create role profile.')
    }
  }

  const handleMappingReset = () => {
    setRealmId('-1')
    setApplicationId('-1')
    setModulesOptions([])
    setSelectedModuleIds([])
    setSelectedRole(null)
    setRoleSearchQuery('')
    setRoleDropdownOpen(false)
    setMappingValidated(false)
    setActiveUserRoles([])
  }

  const handleFilterRealmChange = async (rId) => {
    setFilterRealmId(rId)
    setFilterApplicationId('-1')

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
    fetchAssignedProfiles(rId, '-1')
  }

  const handleFilterApplicationChange = (appId) => {
    setFilterApplicationId(appId)
    fetchAssignedProfiles(filterRealmId, appId)
  }

  const handleFilterClear = () => {
    setFilterRealmId('-1')
    setFilterApplicationId('-1')
    setFilterApplicationsOptions(applicationsOptions)
    fetchAssignedProfiles('-1', '-1')
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
      const res = await deleteUserRoleProfile(profileToDelete.id)
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
      (role.description && role.description.toLowerCase().includes(roleSearchQuery.toLowerCase()))
  )

  const getGroupedProfiles = () => {
    const grouped = {}
    assignedProfiles.forEach((profile) => {
      const realmName = profile.realm?.realm || 'Unknown Realm'
      const appName = profile.application?.clientId || 'Unknown Application'
      const roleName = profile.userRole?.roleName || 'Unknown Role'

      if (!grouped[realmName]) {
        grouped[realmName] = {}
      }
      if (!grouped[realmName][appName]) {
        grouped[realmName][appName] = {}
      }
      if (!grouped[realmName][appName][roleName]) {
        grouped[realmName][appName][roleName] = []
      }
      grouped[realmName][appName][roleName].push(profile)
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
                className={`btn btn-sm rounded px-3 py-2 border-0 ${activeTab === 'definitions' ? 'btn-primary text-white shadow-sm' : ''
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
                className={`btn btn-sm rounded px-3 py-2 border-0 ${activeTab === 'profile' ? 'btn-primary text-white shadow-sm' : ''
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
                    <CFormLabel htmlFor="defRealmSelect" className="text-muted small font-weight-bold">
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
                    <CFormLabel htmlFor="defAppSelect" className="text-muted small font-weight-bold">
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
                    <CFormLabel
                      htmlFor="roleName"
                      className="text-muted small font-weight-bold"
                    >
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
                    <CFormLabel className="small font-weight-bold" style={{ visibility: 'hidden' }}>Spacer</CFormLabel>
                    <div className="d-flex gap-2 justify-content-end" style={{ height: '31px', alignItems: 'center' }}>
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
                    <CFormLabel htmlFor="defFilterRealmSelect" className="text-muted small font-weight-bold">
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
                    <CFormLabel htmlFor="defFilterAppSelect" className="text-muted small font-weight-bold">
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
                          <CTableRow
                            key={role.roleId ? `${role.roleId}-${index}` : index}
                          >
                            <CTableDataCell className="font-weight-semibold">
                              {role.realm?.realm || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {role.application?.clientId || 'N/A'}
                            </CTableDataCell>
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
                    <CFormLabel className="text-muted small font-weight-bold">
                      User Role
                    </CFormLabel>
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
                            <div className="dropdown-item text-muted disabled">No matching roles found for this Realm/Application</div>
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

                  {/* Modules Checklist */}
                  {realmId !== '-1' && applicationId !== '-1' && (
                    <CCol xs={12} className="mt-4">
                      <CCard
                        className="border-0 shadow-sm"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      >
                        <CCardHeader
                          className="bg-transparent py-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <strong className="text-dark font-weight-bold">
                              Select Modules (Optional)
                            </strong>
                            {modulesOptions.length > 0 && (
                              <CFormCheck
                                id="selectAllModules"
                                label="Select All"
                                checked={
                                  modulesOptions.length > 0 &&
                                  modulesOptions.every((m) => selectedModuleIds.includes(m.moduleId))
                                }
                                onChange={handleModuleSelectAll}
                                style={{ cursor: 'pointer' }}
                              />
                            )}
                          </div>
                          <span className="text-muted small">
                            * Leave unchecked to map the role to the entire Application level.
                          </span>
                        </CCardHeader>
                        <CCardBody className="p-3">
                          {modulesOptions.length > 0 ? (
                            <div className="row g-2">
                              {modulesOptions.map((module) => (
                                <CCol
                                  xs={12}
                                  sm={6}
                                  md={4}
                                  lg={3}
                                  key={module.moduleId}
                                  className="py-1"
                                >
                                  <div
                                    className="d-flex align-items-center rounded px-2 py-1"
                                    style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                      border: '1px solid rgba(255, 255, 255, 0.05)',
                                      minHeight: '38px',
                                    }}
                                  >
                                    <CFormCheck
                                      id={`module-${module.moduleId}`}
                                      checked={selectedModuleIds.includes(module.moduleId)}
                                      onChange={() => handleModuleCheckboxChange(module.moduleId)}
                                      style={{
                                        cursor: 'pointer',
                                        marginRight: '0.5rem',
                                        marginBottom: '0px',
                                      }}
                                    />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <label
                                        htmlFor={`module-${module.moduleId}`}
                                        className="d-block text-truncate font-weight-semibold small"
                                        style={{ cursor: 'pointer', marginBottom: 0 }}
                                        title={module.moduleName}
                                      >
                                        {module.moduleName}
                                      </label>
                                    </div>
                                  </div>
                                </CCol>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted small">
                              No active modules found for this application. Mapping will default to the Application level.
                            </div>
                          )}
                        </CCardBody>
                      </CCard>
                    </CCol>
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
                      <CCol xs={12} sm={4}>
                        <CFormLabel htmlFor="filterRealmSelect" className="text-muted small font-weight-bold">
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

                      <CCol xs={12} sm={4}>
                        <CFormLabel htmlFor="filterAppSelect" className="text-muted small font-weight-bold">
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

                      <CCol xs={12} sm={4}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary w-100"
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
                                    className="py-2 bg-transparent font-weight-semibold"
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                                  >
                                    Application: {appName}
                                  </CCardHeader>
                                  <CCardBody className="p-3">
                                    {Object.entries(rolesList).map(([roleName, mappings]) => (
                                      <div key={roleName} className="mb-3">
                                        <div className="small font-weight-bold text-info mb-1">{roleName}</div>
                                        <div className="d-flex flex-column gap-2 ps-2">
                                          {mappings.map((mapping) => (
                                            <div
                                              key={mapping.id}
                                              className="d-flex align-items-center justify-content-between"
                                            >
                                              <span className="small text-muted text-truncate" style={{ maxWidth: '180px' }}>
                                                • {mapping.module?.moduleName || 'Application Level'}
                                              </span>
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger py-0 px-2"
                                                style={{ fontSize: '0.75rem' }}
                                                onClick={() => confirmDeleteProfile(mapping)}
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </CCardBody>
                                </CCard>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted small">
                        No mappings found.
                      </div>
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
                Module/Level: <strong>{profileToDelete.module?.moduleName || 'Application Level'}</strong>
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
