import React, { useEffect, useState, useCallback } from 'react'
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
  CFormCheck,
} from '@coreui/react'
import { toast } from 'react-toastify'
import Pagination from '../pagination/Pagination'
import { getActiveRealms } from '../../service/realm/RealmService'
import {
  getActiveApplications,
  searchApplications,
} from '../../service/application/ApplicationService'
import {
  createOrUpdatePermission,
  getPermissionById,
  deletePermissionById,
  searchPermissions,
  getActivePermissions,
} from '../../service/uiPermission/UiPermissionService'
import {
  createApplicationHasUiPermission,
  searchAssignedPermissions,
  deleteApplicationHasUiPermission,
} from '../../service/applicationHasUiPermission/ApplicationHasUiPermissionService'

const UIPermission = () => {
  // Navigation tabs state: 'definitions' (Tab 1) or 'profile' (Tab 2)
  const [activeTab, setActiveTab] = useState('definitions')

  // --- TAB 1 STATE (DEFINITIONS) ---
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    uiPermissionName: '',
    description: '',
    active: '-1',
  })
  const [permissions, setPermissions] = useState([])
  const [searchParam, setSearchParam] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const size = 5
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState(null)

  // --- TAB 2 STATE (PROFILE MAPPING) ---
  const [mappingValidated, setMappingValidated] = useState(false)
  const [mappingRealmId, setMappingRealmId] = useState('-1')
  const [mappingApplicationId, setMappingApplicationId] = useState('-1')
  const [realmsOptions, setRealmsOptions] = useState([])
  const [applicationsOptions, setApplicationsOptions] = useState([])
  const [activePermissions, setActivePermissions] = useState([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [mappingSearchParam, setMappingSearchParam] = useState('')
  const [assignedMappings, setAssignedMappings] = useState([])

  // Filtration section state
  const [filterRealmId, setFilterRealmId] = useState('-1')
  const [filterApplicationId, setFilterApplicationId] = useState('-1')
  const [filterApplicationsOptions, setFilterApplicationsOptions] = useState([])

  // Fetch UI Permissions for definitions tab
  const fetchPermissions = useCallback(async () => {
    try {
      const activeParam =
        formData.active === 'true' ? true : formData.active === 'false' ? false : null
      const data = await searchPermissions(currentPage, size, searchParam, activeParam)
      if (data.status === 200) {
        setPermissions(data.data.permissions || [])
        setTotalElements(data.data.total || 0)
        setTotalPages(data.data.totalPages || 0)
        setCurrentPage(data.data.page || 0)
      }
    } catch (error) {
      toast.error('Failed to load permissions: ' + error.message)
    }
  }, [currentPage, size, searchParam, formData.active])

  useEffect(() => {
    if (activeTab === 'definitions') {
      const timer = setTimeout(() => {
        fetchPermissions()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTab, fetchPermissions])

  // Fetch dropdown data and active permissions for profile mapping tab
  const fetchActivePermissionsList = useCallback(async (realmId, appId) => {
    try {
      if (!realmId || !appId || realmId === '-1' || appId === '-1') {
        setActivePermissions([])
        return
      }
      const permsRes = await getActivePermissions(realmId, appId)
      if (permsRes.status === 200) {
        setActivePermissions(permsRes.data || [])
      }
    } catch (error) {
      toast.error('Failed to load active permissions: ' + error.message)
    }
  }, [])

  const fetchAssignedMappings = useCallback(
    async (realmId = filterRealmId, appId = filterApplicationId) => {
      try {
        const res = await searchAssignedPermissions(
          realmId === '-1' ? null : realmId,
          appId === '-1' ? null : appId,
        )
        if (res.status === 200) {
          setAssignedMappings(res.data || [])
        }
      } catch (error) {
        toast.error('Failed to load assigned mappings: ' + error.message)
      }
    },
    [filterRealmId, filterApplicationId],
  )

  const fetchDropdownData = useCallback(async () => {
    try {
      const realmsRes = await getActiveRealms()
      if (realmsRes.status === 200) {
        setRealmsOptions(realmsRes.data || [])
      }
      setApplicationsOptions([])
      setFilterApplicationsOptions([])
    } catch (error) {
      toast.error('Failed to load dropdown filters: ' + error.message)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'profile') {
      const timer = setTimeout(() => {
        fetchDropdownData()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTab, fetchDropdownData])

  useEffect(() => {
    if (activeTab === 'profile') {
      const timer = setTimeout(() => {
        fetchAssignedMappings(filterRealmId, filterApplicationId)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTab, fetchAssignedMappings, filterRealmId, filterApplicationId])

  // Handle form changes for input text fields in Tab 1
  const handleFormChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Submit handler for Tab 1 (Definitions)
  const permissionFormSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (
      form.checkValidity() === false ||
      formData.uiPermissionName.trim() === '' ||
      formData.active === '-1'
    ) {
      event.stopPropagation()
      setValidated(true)
      toast.warning('Please select and fill all required fields.')
      return
    }

    const payload = {
      uiPermissionId: formData.id ? Number(formData.id) : null,
      uiPermissionName: formData.uiPermissionName.trim(),
      description: formData.description.trim(),
      active: formData.active === 'true',
    }

    try {
      const res = await createOrUpdatePermission(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'Permission saved successfully!')
        fetchPermissions()
        handleReset()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save permission.')
    }
  }

  // Get by ID for editing
  const loadPermissionIntoForm = async (permId) => {
    try {
      const res = await getPermissionById(permId)
      if (res.status === 200) {
        const permData = res.data
        setFormData({
          id: permData.uiPermissionId,
          uiPermissionName: permData.uiPermissionName,
          description: permData.description || '',
          active: String(permData.active),
        })
        setValidated(false)
        toast.success('Permission loaded into form.')
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to load permission for edit: ' + error.message)
    }
  }

  // Delete action triggers
  const confirmDelete = (permission) => {
    setPermissionToDelete(permission)
    setDeleteModalVisible(true)
  }

  const cancelDelete = () => {
    setPermissionToDelete(null)
    setDeleteModalVisible(false)
  }

  const deletePermission = async () => {
    if (!permissionToDelete) return
    try {
      const res = await deletePermissionById(permissionToDelete.uiPermissionId)
      if (res.status === 200) {
        toast.success(res.message || 'Permission deleted successfully!')
        fetchPermissions()
        if (formData.id === permissionToDelete.uiPermissionId) {
          handleReset()
        }
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to delete permission: ' + error.message)
    } finally {
      cancelDelete()
    }
  }

  // Reset form inputs in Tab 1
  const handleReset = () => {
    setFormData({
      id: null,
      uiPermissionName: '',
      description: '',
      active: '-1',
    })
    setValidated(false)
  }

  // --- TAB 2 LOGIC (PROFILE MAPPING) ---
  const handleMappingRealmChange = async (realmId) => {
    setMappingRealmId(realmId)
    setMappingApplicationId('-1')
    setActivePermissions([])
    setSelectedPermissionIds([])

    try {
      if (realmId === '-1') {
        setApplicationsOptions([])
      } else {
        const searchRes = await searchApplications(0, 1000, null, realmId, null)
        if (searchRes.status === 200) {
          setApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load applications for dropdown: ' + error.message)
    }
  }

  const handleMappingApplicationChange = (appId) => {
    setMappingApplicationId(appId)
    setSelectedPermissionIds([])
    if (mappingRealmId !== '-1' && appId !== '-1') {
      fetchActivePermissionsList(mappingRealmId, appId)
    } else {
      setActivePermissions([])
    }
  }

  const handleCheckboxChange = (permissionId) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const handleCheckboxSelectAll = () => {
    const filteredIds = filteredActivePermissions.map((p) => p.uiPermissionId)
    const allSelected = filteredIds.every((id) => selectedPermissionIds.includes(id))

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      setSelectedPermissionIds((prev) => {
        const combined = [...prev, ...filteredIds]
        return [...new Set(combined)]
      })
    }
  }

  const mappingFormSubmit = async (event) => {
    event.preventDefault()

    if (mappingRealmId === '-1' || mappingApplicationId === '-1') {
      setMappingValidated(true)
      toast.warning('Please select Realm and Application.')
      return
    }

    if (selectedPermissionIds.length === 0) {
      toast.warning('Please select at least one UI permission to map.')
      return
    }

    const payload = {
      realmId: Number(mappingRealmId),
      applicationId: Number(mappingApplicationId),
      uiPermissionIdList: selectedPermissionIds,
    }

    try {
      const res = await createApplicationHasUiPermission(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'Mapping created successfully!')
        // Refresh checklist from active UI permissions
        fetchActivePermissionsList(mappingRealmId, mappingApplicationId)
        // Refresh assigned mappings list
        fetchAssignedMappings()
        // Reset checklist selections
        setSelectedPermissionIds([])
        setMappingValidated(false)
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create mapping.')
    }
  }

  const handleDeleteMapping = async (mappingId) => {
    try {
      const res = await deleteApplicationHasUiPermission(mappingId)
      if (res.status === 200) {
        toast.success(res.message || 'Mapping deleted successfully!')
        // Reload assigned mappings
        fetchAssignedMappings()
        // Also reload active checklist in case the dropdowns are selected for that application
        if (mappingRealmId !== '-1' && mappingApplicationId !== '-1') {
          fetchActivePermissionsList(mappingRealmId, mappingApplicationId)
        }
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to delete mapping: ' + error.message)
    }
  }

  const handleMappingReset = () => {
    setMappingRealmId('-1')
    setMappingApplicationId('-1')
    setSelectedPermissionIds([])
    setActivePermissions([])
    setMappingValidated(false)
    setMappingSearchParam('')
    setApplicationsOptions([])
  }

  const handleFilterRealmChange = async (realmId) => {
    setFilterRealmId(realmId)
    setFilterApplicationId('-1')

    try {
      if (realmId === '-1') {
        setFilterApplicationsOptions([])
      } else {
        const searchRes = await searchApplications(0, 1000, null, realmId, null)
        if (searchRes.status === 200) {
          setFilterApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load filter applications: ' + error.message)
    }
  }

  const handleFilterApplicationChange = (appId) => {
    setFilterApplicationId(appId)
  }

  const handleFilterClear = () => {
    setFilterRealmId('-1')
    setFilterApplicationId('-1')
    setFilterApplicationsOptions([])
  }

  const getGroupedMappings = () => {
    const grouped = {}
    assignedMappings.forEach((mapping) => {
      const realmName = mapping.realm?.realm || 'Unknown Realm'
      const appName = mapping.application?.clientId || 'Unknown Application'

      if (!grouped[realmName]) {
        grouped[realmName] = {}
      }
      if (!grouped[realmName][appName]) {
        grouped[realmName][appName] = []
      }
      grouped[realmName][appName].push(mapping)
    })
    return grouped
  }

  // Filter active permissions checklist by search param
  const filteredActivePermissions = activePermissions.filter(
    (perm) =>
      perm.uiPermissionName.toLowerCase().includes(mappingSearchParam.toLowerCase()) ||
      (perm.description &&
        perm.description.toLowerCase().includes(mappingSearchParam.toLowerCase())),
  )

  const isAllChecked =
    filteredActivePermissions.length > 0 &&
    filteredActivePermissions
      .map((p) => p.uiPermissionId)
      .every((id) => selectedPermissionIds.includes(id))

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage UI Permissions</strong>
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
                UI Permission Definitions
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

            {/* TAB 1: UI PERMISSION DEFINITIONS */}
            {activeTab === 'definitions' && (
              <>
                {/* Input Form */}
                <CForm
                  className="row g-3"
                  onSubmit={permissionFormSubmit}
                  validated={validated}
                  noValidate
                >
                  {/* Permission Name Field */}
                  <CCol xs={12} md={4}>
                    <CFormLabel
                      htmlFor="uiPermissionName"
                      className="text-muted small font-weight-bold"
                    >
                      UI Permission Name
                    </CFormLabel>
                    <CFormInput
                      id="uiPermissionName"
                      value={formData.uiPermissionName}
                      onChange={handleFormChange}
                      placeholder="e.g. view_dashboard"
                      size="sm"
                      required
                    />
                    <CFormFeedback tooltip invalid>
                      Please provide a UI permission name.
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
                      placeholder="Short description of this permission"
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

                  {/* Form Buttons */}
                  <CCol xs={12} className="d-flex justify-content-end gap-2 mt-4">
                    <CButton color="primary" type="submit" size="sm" className="px-3">
                      {formData.id ? 'Update' : 'Create'}
                    </CButton>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      onClick={handleReset}
                      type="button"
                    >
                      Clear
                    </button>
                  </CCol>
                </CForm>

                <hr className="my-4" style={{ borderColor: '#f1f1f1' }} />

                {/* Filter / Search Section */}
                <CRow className="mb-3 align-items-center">
                  <CCol xs={12} md={6}></CCol>
                  <CCol xs={12} md={6} className="d-flex justify-content-md-end">
                    <CFormInput
                      type="text"
                      placeholder="Search permission name or description..."
                      size="sm"
                      style={{ maxWidth: '350px' }}
                      value={searchParam}
                      onChange={(e) => {
                        setSearchParam(e.target.value)
                        setCurrentPage(0)
                      }}
                    />
                  </CCol>
                </CRow>

                {/* Table Component */}
                <CCol xs={12}>
                  <CTable hover responsive align="middle" className="border-top">
                    <CTableHead color="dark">
                      <CTableRow>
                        <CTableHeaderCell scope="col" className="py-2">
                          Permission Name
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
                      {Array.isArray(permissions) && permissions.length > 0 ? (
                        permissions.map((perm, index) => (
                          <CTableRow
                            key={perm.uiPermissionId ? `${perm.uiPermissionId}-${index}` : index}
                          >
                            <CTableDataCell className="font-weight-semibold">
                              {perm.uiPermissionName}
                            </CTableDataCell>
                            <CTableDataCell className="text-muted">
                              {perm.description || 'No description provided'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <span
                                className={`badge rounded-pill bg-${perm.active ? 'success' : 'danger'}`}
                              >
                                {perm.active ? 'Active' : 'Inactive'}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              <CButton
                                type="button"
                                color="primary"
                                size="sm"
                                className="me-1 px-3"
                                onClick={() => loadPermissionIntoForm(perm.uiPermissionId)}
                              >
                                Edit
                              </CButton>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger px-3"
                                onClick={() => confirmDelete(perm)}
                              >
                                Delete
                              </button>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="4" className="text-center py-4">
                            <span className="text-muted">No UI permissions found</span>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>

                  {/* Pagination component */}
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
                  onSubmit={mappingFormSubmit}
                  validated={mappingValidated}
                  noValidate
                >
                  {/* Realm Dropdown */}
                  <CCol xs={12} sm={6} md={4} lg={3}>
                    <CFormLabel htmlFor="realmSelect" className="text-muted small font-weight-bold">
                      Realm
                    </CFormLabel>
                    <CFormSelect
                      id="realmSelect"
                      value={mappingRealmId}
                      onChange={(e) => handleMappingRealmChange(e.target.value)}
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

                  {/* Application Dropdown */}
                  <CCol xs={12} sm={6} md={4} lg={3}>
                    <CFormLabel htmlFor="appSelect" className="text-muted small font-weight-bold">
                      Application
                    </CFormLabel>
                    <CFormSelect
                      id="appSelect"
                      value={mappingApplicationId}
                      onChange={(e) => handleMappingApplicationChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                      disabled={mappingRealmId === '-1'}
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

                  {/* Permissions Checklist Palette */}
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
                            Active UI Permissions
                          </strong>
                          {filteredActivePermissions.length > 0 && (
                            <CFormCheck
                              id="selectAllPermissions"
                              label="Select All"
                              checked={isAllChecked}
                              onChange={handleCheckboxSelectAll}
                              style={{ cursor: 'pointer' }}
                            />
                          )}
                        </div>
                        <CFormInput
                          type="text"
                          placeholder="Filter permissions..."
                          size="sm"
                          style={{ maxWidth: '250px' }}
                          value={mappingSearchParam}
                          onChange={(e) => setMappingSearchParam(e.target.value)}
                        />
                      </CCardHeader>
                      <CCardBody className="p-3">
                        {filteredActivePermissions.length > 0 ? (
                          <div className="row g-2">
                            {filteredActivePermissions.map((perm) => (
                              <CCol
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={perm.uiPermissionId}
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
                                    id={`perm-${perm.uiPermissionId}`}
                                    checked={selectedPermissionIds.includes(perm.uiPermissionId)}
                                    onChange={() => handleCheckboxChange(perm.uiPermissionId)}
                                    style={{
                                      cursor: 'pointer',
                                      marginRight: '0.5rem',
                                      marginBottom: '0px',
                                    }}
                                  />
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <label
                                      htmlFor={`perm-${perm.uiPermissionId}`}
                                      className="d-block text-truncate font-weight-semibold small"
                                      style={{ cursor: 'pointer', marginBottom: 0 }}
                                      title={perm.uiPermissionName}
                                    >
                                      {perm.uiPermissionName}
                                    </label>
                                    {perm.description && (
                                      <span
                                        className="text-muted small text-truncate d-block"
                                        style={{ fontSize: '0.72rem', opacity: 0.8 }}
                                        title={perm.description}
                                      >
                                        {perm.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CCol>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-5 text-muted">
                            {mappingSearchParam ? (
                              <span>No permissions match your filter.</span>
                            ) : (
                              <span>
                                All active UI permissions are currently mapped, or no active
                                permissions exist.
                              </span>
                            )}
                          </div>
                        )}
                      </CCardBody>
                    </CCard>
                  </CCol>

                  {/* Form Submission Buttons */}
                  <CCol xs={12} className="d-flex justify-content-end gap-2 mt-4">
                    <CButton color="primary" type="submit" size="sm" className="px-4">
                      Create
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

                {/* Grouped Assigned Permissions Section */}
                <CCard className="mt-4 border shadow-sm">
                  <CCardHeader>
                    <strong>Assigned UI Permissions Profiles</strong>
                  </CCardHeader>
                  <CCardBody>
                    {/* Filtration Section */}
                    <div
                      className="row g-3 mb-4 pb-3 border-bottom align-items-end"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <CCol xs={12} sm={4}>
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

                      <CCol xs={12} sm={4}>
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
                          disabled={filterRealmId === '-1'}
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

                    {Object.keys(getGroupedMappings()).length > 0 ? (
                      Object.entries(getGroupedMappings()).map(([realmName, apps]) => (
                        <div key={realmName} className="mb-4">
                          <h6
                            className="text-primary font-weight-bold mb-3 border-bottom pb-2"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                          >
                            Realm: {realmName}
                          </h6>
                          <div className="row g-3">
                            {Object.entries(apps).map(([appName, mappingsList]) => (
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
                                    <div className="d-flex flex-column gap-2">
                                      {mappingsList.map((mapping) => (
                                        <div
                                          key={mapping.id}
                                          className="d-flex align-items-center justify-content-between"
                                        >
                                          <div className="d-flex align-items-center">
                                            <CFormCheck
                                              id={`assigned-perm-${mapping.id}`}
                                              checked
                                              disabled
                                              style={{ marginRight: '0.5rem' }}
                                            />
                                            <span
                                              className="small font-weight-semibold text-truncate"
                                              style={{ maxWidth: '160px' }}
                                              title={mapping.uiPermission?.uiPermissionName}
                                            >
                                              {mapping.uiPermission?.uiPermissionName}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger py-0 px-2"
                                            onClick={() => handleDeleteMapping(mapping.id)}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </CCardBody>
                                </CCard>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted small">
                        No mappings assigned yet. Select Realm, Application, and Permissions above
                        to map.
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={cancelDelete} backdrop="static">
        <CModalHeader>
          <CModalTitle>Delete UI Permission</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {permissionToDelete ? (
            <div>
              <p>Are you sure you want to delete this UI permission?</p>
              <p>
                <strong>{permissionToDelete.uiPermissionName}</strong>
              </p>
              <p className="text-danger small">This action cannot be undone.</p>
            </div>
          ) : (
            <p>Are you sure you want to delete this UI permission?</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDelete} size="sm">
            Cancel
          </CButton>
          <button className="btn btn-sm btn-outline-danger px-3" onClick={deletePermission}>
            Delete
          </button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default UIPermission
