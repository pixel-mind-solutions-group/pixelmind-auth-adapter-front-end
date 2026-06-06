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
} from '@coreui/react'
import { toast } from 'react-toastify'
import Pagination from '../../pagination/Pagination'
import { getActiveRealms } from '../../../service/realm/RealmService'
import {
  getActiveApplications,
  searchApplications,
} from '../../../service/application/ApplicationService'
import {
  createOrUpdateModule,
  getModuleById,
  deleteModuleById,
  searchModules,
} from '../../../service/module/ModuleService'

const Module = () => {
  // Form and validation state
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    realmId: '-1',
    applicationId: '-1',
    name: '',
    active: '-1',
  })

  // Table lists and pagination state
  const [modules, setModules] = useState([])
  const [searchParam, setSearchParam] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const size = 5

  // Dropdown options state
  const [realmsOptions, setRealmsOptions] = useState([])
  const [applicationsOptions, setApplicationsOptions] = useState([])

  // Modal deletion state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState(null)

  // Fetch initial dropdown metadata
  const fetchDropdownData = useCallback(async () => {
    try {
      const realmsRes = await getActiveRealms()
      if (realmsRes.status === 200) {
        setRealmsOptions(realmsRes.data)
      }
      const appsRes = await getActiveApplications()
      if (appsRes.status === 200) {
        setApplicationsOptions(appsRes.data)
      }
    } catch (error) {
      toast.error('Failed to load filter dropdowns: ' + error.message)
    }
  }, [])

  // Search API binding for loading the table list
  const fetchModules = useCallback(async () => {
    try {
      const activeParam =
        formData.active === 'true' ? true : formData.active === 'false' ? false : null
      const data = await searchModules(
        currentPage,
        size,
        searchParam,
        formData.realmId,
        formData.applicationId,
        activeParam,
      )
      if (data.status === 200) {
        setModules(data.data.modules)
        setTotalElements(data.data.total)
        setTotalPages(data.data.totalPages)
        setCurrentPage(data.data.page)
      }
    } catch (error) {
      toast.error('Failed to load modules: ' + error.message)
    }
  }, [currentPage, size, searchParam, formData.realmId, formData.applicationId, formData.active])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDropdownData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchDropdownData])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModules()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchModules])

  // Filter application list inside form when realm selection changes
  const handleRealmChange = async (realmId) => {
    setFormData((prev) => ({
      ...prev,
      realmId,
      applicationId: '-1',
    }))

    try {
      if (realmId === '-1') {
        const appsRes = await getActiveApplications()
        if (appsRes.status === 200) {
          setApplicationsOptions(appsRes.data)
        }
      } else {
        const searchRes = await searchApplications(0, 1000, null, realmId, null)
        if (searchRes.status === 200) {
          setApplicationsOptions(searchRes.data.applications)
        }
      }
    } catch (error) {
      toast.error('Failed to load applications for dropdown: ' + error.message)
    }
  }

  // Handle form changes for input text fields
  const handleFormChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Submit handler (creates or updates modules on the backend)
  const moduleFormSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (
      form.checkValidity() === false ||
      formData.realmId === '-1' ||
      formData.applicationId === '-1' ||
      formData.active === '-1'
    ) {
      event.stopPropagation()
      setValidated(true)
      toast.warning('Please select and fill all required fields.')
      return
    }

    const payload = {
      moduleId: formData.id ? Number(formData.id) : null,
      realmId: Number(formData.realmId),
      applicationId: Number(formData.applicationId),
      moduleName: formData.name.trim(),
      active: formData.active === 'true',
    }

    try {
      const res = await createOrUpdateModule(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'Module saved successfully!')
        fetchModules()
        handleReset()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save module.')
    }
  }

  // Get by ID for editing
  const loadModuleIntoForm = async (modId) => {
    try {
      const res = await getModuleById(modId)
      if (res.status === 200) {
        const moduleData = res.data

        if (moduleData.realmId) {
          const searchRes = await searchApplications(0, 1000, null, moduleData.realmId, null)
          if (searchRes.status === 200) {
            setApplicationsOptions(searchRes.data.applications)
          }
        }

        setFormData({
          id: moduleData.moduleId,
          realmId: String(moduleData.realmId),
          applicationId: String(moduleData.applicationId),
          name: moduleData.moduleName,
          active: String(moduleData.active),
        })
        setValidated(false)
        toast.success('Module loaded into form.')
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to load module for edit: ' + error.message)
    }
  }

  // Delete action triggers
  const confirmDelete = (module) => {
    setModuleToDelete(module)
    setDeleteModalVisible(true)
  }

  const cancelDelete = () => {
    setModuleToDelete(null)
    setDeleteModalVisible(false)
  }

  const deleteModule = async () => {
    if (!moduleToDelete) return
    try {
      const res = await deleteModuleById(moduleToDelete.moduleId)
      if (res.status === 200) {
        toast.success(res.message || 'Module deleted successfully!')
        fetchModules()
        if (formData.id === moduleToDelete.moduleId) {
          handleReset()
        }
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to delete module: ' + error.message)
    } finally {
      cancelDelete()
    }
  }

  // Reset form inputs
  const handleReset = () => {
    setFormData({
      id: null,
      realmId: '-1',
      applicationId: '-1',
      name: '',
      active: '-1',
    })
    setValidated(false)
    getActiveApplications()
      .then((appsRes) => {
        if (appsRes.status === 200) {
          setApplicationsOptions(appsRes.data)
        }
      })
      .catch((error) => {
        toast.error('Failed to reset application list: ' + error.message)
      })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Modules</strong>
          </CCardHeader>
          <CCardBody>
            {/* Input Form */}
            <CForm className="row g-3" onSubmit={moduleFormSubmit} validated={validated} noValidate>
              {/* Realm Select */}
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="realmId">Realm</CFormLabel>
                <CFormSelect
                  id="realmId"
                  value={formData.realmId}
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
                  Please select a realm
                </CFormFeedback>
              </CCol>

              {/* Application Select */}
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="applicationId">Application</CFormLabel>
                <CFormSelect
                  id="applicationId"
                  value={formData.applicationId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, applicationId: e.target.value }))
                  }
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
                  Please select an application
                </CFormFeedback>
              </CCol>

              {/* Module Name Field */}
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="name">Module Name</CFormLabel>
                <CFormInput
                  id="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Module Name"
                  size="sm"
                  required
                />
                <CFormFeedback tooltip invalid>
                  Please provide a module name
                </CFormFeedback>
              </CCol>

              {/* Status Select */}
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="active">Status</CFormLabel>
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
                  Please select a status
                </CFormFeedback>
              </CCol>

              {/* Form Buttons */}
              <CCol xs={12} className="d-flex justify-content-end gap-2 mt-3">
                <CButton color="primary" type="submit" size="sm">
                  {formData.id ? 'Update' : 'Create'}
                </CButton>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleReset}
                  type="button"
                >
                  Clear
                </button>
              </CCol>
            </CForm>

            <hr className="my-4" />

            {/* Filter Section */}
            <CRow className="mb-3 align-items-center">
              <CCol xs={12} md={6}></CCol>
              <CCol xs={12} md={6} className="d-flex justify-content-md-end">
                <CFormInput
                  type="text"
                  placeholder="Search module..."
                  size="sm"
                  style={{ maxWidth: '300px' }}
                  value={searchParam}
                  onChange={(e) => {
                    setSearchParam(e.target.value)
                    setCurrentPage(0)
                  }}
                />
              </CCol>
            </CRow>

            {/* Modules Table */}
            <CCol xs={12}>
              <CTable hover responsive>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Module</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">
                      Action
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Array.isArray(modules) && modules.length > 0 ? (
                    modules.map((mod, index) => (
                      <CTableRow key={mod.moduleId ? `${mod.moduleId}-${index}` : index}>
                        <CTableDataCell>{mod.realm?.realm || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{mod.application?.clientId || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{mod.moduleName}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`badge bg-${mod.active ? 'success' : 'danger'}`}>
                            {mod.active ? 'Active' : 'Inactive'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CButton
                            type="button"
                            color="primary"
                            size="sm"
                            className="me-1"
                            onClick={() => loadModuleIntoForm(mod.moduleId)}
                          >
                            Edit
                          </CButton>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmDelete(mod)}
                          >
                            Delete
                          </button>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center py-4">
                        <span className="text-muted">No modules found</span>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {/* Local Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setCurrentPage}
              />
            </CCol>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={cancelDelete} backdrop="static">
        <CModalHeader>
          <CModalTitle>Delete Module</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {moduleToDelete ? (
            <div>
              <p>Are you sure you want to delete this module?</p>
              <p>
                <strong>{moduleToDelete.moduleName}</strong> (Application:{' '}
                {moduleToDelete.application?.clientId || 'N/A'})
              </p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
          ) : (
            <p>Are you sure you want to delete this module?</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDelete}>
            Cancel
          </CButton>
          <button className="btn btn-sm btn-outline-danger" onClick={deleteModule}>
            Delete
          </button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Module
