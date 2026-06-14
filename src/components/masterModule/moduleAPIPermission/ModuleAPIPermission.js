import React, { useEffect, useState, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormFeedback,
  CFormSelect,
  CButton,
  CFormCheck,
  CFormInput,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { getActiveRealms } from '../../../service/realm/RealmService'
import {
  getActiveApplications,
  searchApplications,
} from '../../../service/application/ApplicationService'
import { searchModules } from '../../../service/module/ModuleService'
import { searchAssignedPermissions as searchAppAssignedPermissions } from '../../../service/applicationHasApiPermission/ApplicationHasApiPermissionService'
import {
  createModuleHasApiPermission,
  searchModuleAssignedPermissions,
  deleteModuleHasApiPermission,
} from '../../../service/moduleHasApiPermission/ModuleHasApiPermissionService'

const ModuleAPIPermission = () => {
  // --- STATE (MAPPING CREATION) ---
  const [mappingValidated, setMappingValidated] = useState(false)
  const [mappingRealmId, setMappingRealmId] = useState('-1')
  const [mappingApplicationId, setMappingApplicationId] = useState('-1')
  const [mappingModuleId, setMappingModuleId] = useState('-1')

  const [realmsOptions, setRealmsOptions] = useState([])
  const [applicationsOptions, setApplicationsOptions] = useState([])
  const [modulesOptions, setModulesOptions] = useState([])
  const [activePermissions, setActivePermissions] = useState([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [mappingSearchParam, setMappingSearchParam] = useState('')

  // --- STATE (ASSIGNED MAPPINGS & FILTERS) ---
  const [assignedMappings, setAssignedMappings] = useState([])
  const [filterRealmId, setFilterRealmId] = useState('-1')
  const [filterApplicationId, setFilterApplicationId] = useState('-1')
  const [filterModuleId, setFilterModuleId] = useState('-1')
  const [filterApplicationsOptions, setFilterApplicationsOptions] = useState([])
  const [filterModulesOptions, setFilterModulesOptions] = useState([])

  // Load Realm and Application dropdown data
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
      }
    } catch (error) {
      toast.error('Failed to load dropdown filters: ' + error.message)
    }
  }, [])

  // Load Assigned Module API Permissions Mappings
  const fetchAssignedMappings = useCallback(
    async (realmId = filterRealmId, appId = filterApplicationId, modId = filterModuleId) => {
      try {
        const res = await searchModuleAssignedPermissions(
          realmId === '-1' ? null : realmId,
          appId === '-1' ? null : appId,
          modId === '-1' ? null : modId
        )
        if (res.status === 200) {
          setAssignedMappings(res.data || [])
        }
      } catch (error) {
        toast.error('Failed to load assigned mappings: ' + error.message)
      }
    },
    [filterRealmId, filterApplicationId, filterModuleId]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDropdownData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchDropdownData])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignedMappings(filterRealmId, filterApplicationId, filterModuleId)
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchAssignedMappings, filterRealmId, filterApplicationId, filterModuleId])

  // Fetch API Permissions that can be assigned (mapped to Application but not to Module)
  const fetchActivePermissionsList = useCallback(async (realmId, appId, moduleId) => {
    try {
      if (
        !realmId ||
        !appId ||
        !moduleId ||
        realmId === '-1' ||
        appId === '-1' ||
        moduleId === '-1'
      ) {
        setActivePermissions([])
        return
      }

      // 1. Fetch permissions assigned to the Application
      const appPermsRes = await searchAppAssignedPermissions(realmId, appId)
      // 2. Fetch permissions already assigned to the Module
      const modPermsRes = await searchModuleAssignedPermissions(realmId, appId, moduleId)

      if (appPermsRes.status === 200 && modPermsRes.status === 200) {
        const appMapped = appPermsRes.data || []
        const modMapped = modPermsRes.data || []

        // Extract permission definitions assigned to the Application
        const candidates = appMapped
          .map((mapping) => mapping.apiPermission)
          .filter((perm) => perm !== null && perm !== undefined)

        // Filter out those already assigned to the Module
        const unassigned = candidates.filter(
          (cand) =>
            !modMapped.some(
              (m) => m.apiPermissionId === cand.apiPermissionId || m.apiPermission?.apiPermissionId === cand.apiPermissionId
            )
        )

        setActivePermissions(unassigned)
      }
    } catch (error) {
      toast.error('Failed to load active permissions: ' + error.message)
    }
  }, [])

  // Mapping Creation Handlers
  const handleMappingRealmChange = async (realmId) => {
    setMappingRealmId(realmId)
    setMappingApplicationId('-1')
    setMappingModuleId('-1')
    setModulesOptions([])
    setActivePermissions([])
    setSelectedPermissionIds([])

    try {
      if (realmId === '-1') {
        const appsRes = await getActiveApplications()
        if (appsRes.status === 200) {
          setApplicationsOptions(appsRes.data || [])
        }
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

  const handleMappingApplicationChange = async (appId) => {
    setMappingApplicationId(appId)
    setMappingModuleId('-1')
    setModulesOptions([])
    setActivePermissions([])
    setSelectedPermissionIds([])

    try {
      if (appId !== '-1') {
        const modulesRes = await searchModules(0, 1000, null, mappingRealmId, appId, true)
        if (modulesRes.status === 200) {
          setModulesOptions(modulesRes.data.modules || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load modules for dropdown: ' + error.message)
    }
  }

  const handleMappingModuleChange = (modId) => {
    setMappingModuleId(modId)
    setSelectedPermissionIds([])
    if (mappingRealmId !== '-1' && mappingApplicationId !== '-1' && modId !== '-1') {
      fetchActivePermissionsList(mappingRealmId, mappingApplicationId, modId)
    } else {
      setActivePermissions([])
    }
  }

  // Checkbox Selection Logic
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
    const filteredIds = filteredActivePermissions.map((p) => p.apiPermissionId)
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

    if (mappingRealmId === '-1' || mappingApplicationId === '-1' || mappingModuleId === '-1') {
      setMappingValidated(true)
      toast.warning('Please select Realm, Application, and Module.')
      return
    }

    if (selectedPermissionIds.length === 0) {
      toast.warning('Please select at least one API permission to map.')
      return
    }

    const payload = {
      moduleId: Number(mappingModuleId),
      apiPermissionIdList: selectedPermissionIds,
    }

    try {
      const res = await createModuleHasApiPermission(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'Module API Permission mapping created successfully!')
        // Reload mapping checklist
        fetchActivePermissionsList(mappingRealmId, mappingApplicationId, mappingModuleId)
        // Refresh bottom mapped lists
        fetchAssignedMappings()
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
      const res = await deleteModuleHasApiPermission(mappingId)
      if (res.status === 200) {
        toast.success(res.message || 'Mapping deleted successfully!')
        fetchAssignedMappings()
        if (
          mappingRealmId !== '-1' &&
          mappingApplicationId !== '-1' &&
          mappingModuleId !== '-1'
        ) {
          fetchActivePermissionsList(mappingRealmId, mappingApplicationId, mappingModuleId)
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
    setMappingModuleId('-1')
    setSelectedPermissionIds([])
    setActivePermissions([])
    setModulesOptions([])
    setMappingValidated(false)
    setMappingSearchParam('')
    getActiveApplications()
      .then((appsRes) => {
        if (appsRes.status === 200) {
          setApplicationsOptions(appsRes.data || [])
        }
      })
      .catch((error) => {
        toast.error('Failed to reset applications: ' + error.message)
      })
  }

  // --- FILTRATION HANDLERS (ASSIGNED LIST) ---
  const handleFilterRealmChange = async (realmId) => {
    setFilterRealmId(realmId)
    setFilterApplicationId('-1')
    setFilterModuleId('-1')
    setFilterModulesOptions([])

    try {
      if (realmId === '-1') {
        setFilterApplicationsOptions(applicationsOptions)
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

  const handleFilterApplicationChange = async (appId) => {
    setFilterApplicationId(appId)
    setFilterModuleId('-1')
    setFilterModulesOptions([])

    try {
      if (appId !== '-1') {
        const modulesRes = await searchModules(0, 1000, null, filterRealmId, appId, true)
        if (modulesRes.status === 200) {
          setFilterModulesOptions(modulesRes.data.modules || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load filter modules: ' + error.message)
    }
  }

  const handleFilterModuleChange = (modId) => {
    setFilterModuleId(modId)
  }

  const handleFilterClear = () => {
    setFilterRealmId('-1')
    setFilterApplicationId('-1')
    setFilterModuleId('-1')
    setFilterApplicationsOptions(applicationsOptions)
    setFilterModulesOptions([])
  }

  // Group Mappings reactively by Realm -> Application -> Module
  const getGroupedMappings = () => {
    const grouped = {}
    assignedMappings.forEach((mapping) => {
      const realmName =
        mapping.realm?.realm || mapping.module?.realm?.realm || 'Unknown Realm'
      const appName =
        mapping.application?.clientId ||
        mapping.module?.application?.clientId ||
        'Unknown Application'
      const moduleName = mapping.module?.moduleName || 'Unknown Module'

      if (!grouped[realmName]) {
        grouped[realmName] = {}
      }
      if (!grouped[realmName][appName]) {
        grouped[realmName][appName] = {}
      }
      if (!grouped[realmName][appName][moduleName]) {
        grouped[realmName][appName][moduleName] = []
      }
      grouped[realmName][appName][moduleName].push(mapping)
    })
    return grouped
  }

  // Filter checklist permissions local filtering
  const filteredActivePermissions = activePermissions.filter(
    (perm) =>
      perm.apiPermissionName.toLowerCase().includes(mappingSearchParam.toLowerCase()) ||
      (perm.description &&
        perm.description.toLowerCase().includes(mappingSearchParam.toLowerCase()))
  )

  const isAllChecked =
    filteredActivePermissions.length > 0 &&
    filteredActivePermissions.map((p) => p.apiPermissionId).every((id) => selectedPermissionIds.includes(id))

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Module API Permission</strong>
          </CCardHeader>
          <CCardBody>
            {/* Creation Mapping Form */}
            <CForm
              className="row g-3"
              onSubmit={mappingFormSubmit}
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

              {/* Application Select */}
              <CCol xs={12} sm={6} md={4}>
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

              {/* Module Select */}
              <CCol xs={12} sm={6} md={4}>
                <CFormLabel htmlFor="moduleSelect" className="text-muted small font-weight-bold">
                  Module
                </CFormLabel>
                <CFormSelect
                  id="moduleSelect"
                  value={mappingModuleId}
                  onChange={(e) => handleMappingModuleChange(e.target.value)}
                  style={{ cursor: 'pointer' }}
                  size="sm"
                  required
                >
                  <option value="-1">Select a Module</option>
                  {modulesOptions.map((mod) => (
                    <option key={mod.moduleId} value={mod.moduleId}>
                      {mod.moduleName}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback tooltip invalid>
                  Please select a module.
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
                        Unmapped API Permissions
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
                          <CCol xs={12} sm={6} md={4} lg={3} key={perm.apiPermissionId} className="py-1">
                            <div
                              className="d-flex align-items-center rounded px-2 py-1"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                minHeight: '38px',
                              }}
                            >
                              <CFormCheck
                                id={`perm-${perm.apiPermissionId}`}
                                checked={selectedPermissionIds.includes(perm.apiPermissionId)}
                                onChange={() => handleCheckboxChange(perm.apiPermissionId)}
                                style={{
                                  cursor: 'pointer',
                                  marginRight: '0.5rem',
                                  marginBottom: '0px',
                                }}
                              />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <label
                                  htmlFor={`perm-${perm.apiPermissionId}`}
                                  className="d-block text-truncate font-weight-semibold small"
                                  style={{ cursor: 'pointer', marginBottom: 0 }}
                                  title={perm.apiPermissionName}
                                >
                                  {perm.apiPermissionName}
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
                      <div className="text-center py-5 text-muted small">
                        {mappingSearchParam ? (
                          <span>No permissions match your filter.</span>
                        ) : (
                          <span>
                            Select Realm, Application, and Module to view unmapped API permissions.
                          </span>
                        )}
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Action Buttons */}
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

            {/* Assigned Mappings Cards with Filters */}
            <CCard className="mt-4 border shadow-sm">
              <CCardHeader>
                <strong>Assigned Module API Permissions Profiles</strong>
              </CCardHeader>
              <CCardBody>
                {/* Filtration Form */}
                <div
                  className="row g-3 mb-4 pb-3 border-bottom align-items-end"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <CCol xs={12} sm={3}>
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

                  <CCol xs={12} sm={3}>
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

                  <CCol xs={12} sm={3}>
                    <CFormLabel htmlFor="filterModuleSelect" className="text-muted small font-weight-bold">
                      Filter by Module
                    </CFormLabel>
                    <CFormSelect
                      id="filterModuleSelect"
                      value={filterModuleId}
                      onChange={(e) => handleFilterModuleChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                    >
                      <option value="-1">All Modules</option>
                      {filterModulesOptions.map((mod) => (
                        <option key={mod.moduleId} value={mod.moduleId}>
                          {mod.moduleName}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol xs={12} sm={3}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary w-100"
                      onClick={handleFilterClear}
                    >
                      Clear Filters
                    </button>
                  </CCol>
                </div>

                {/* Grouped Assigned Permissions Display */}
                {Object.keys(getGroupedMappings()).length > 0 ? (
                  Object.entries(getGroupedMappings()).map(([realmName, apps]) => (
                    <div key={realmName} className="mb-4">
                      <h6
                        className="text-primary font-weight-bold mb-3 border-bottom pb-2"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        Realm: {realmName}
                      </h6>
                      {Object.entries(apps).map(([appName, modules]) => (
                        <div key={appName} className="ms-2 mb-3">
                          <span className="text-muted small d-block mb-2 font-weight-bold">
                            Application: {appName}
                          </span>
                          <div className="row g-3">
                            {Object.entries(modules).map(([moduleName, mappingsList]) => (
                              <div key={moduleName} className="col-12 col-md-6 col-lg-4">
                                <CCard
                                  className="h-100"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderColor: 'rgba(255, 255, 255, 0.06)',
                                  }}
                                >
                                  <CCardHeader
                                    className="py-2 bg-transparent font-weight-semibold small"
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                                  >
                                    Module: {moduleName}
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
                                              title={mapping.apiPermission?.apiPermissionName}
                                            >
                                              {mapping.apiPermission?.apiPermissionName}
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
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No mappings found matching the filters.
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ModuleAPIPermission
