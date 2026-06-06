import { useCallback, useEffect, useState } from 'react'
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
  CInputGroup,
  CInputGroupText,
  CTableDataCell,
  CFormCheck,
  CFormSelect,
  CButton,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import {
  createOrModify,
  searchUsers,
  getUserById,
  deleteUserById,
} from '../../service/user/UserService'
import Pagination from '../pagination/Pagination'
import { toast } from 'react-toastify'

const User = () => {
  // Form state
  const [validated, setValidated] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [active, setActive] = useState(false)
  const [formData, setFormData] = useState({
    userId: null,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    emailVerified: false,
    active: false,
  })

  // Search query state
  const [searchParam, setSearchParam] = useState('')
  const [users, setUsers] = useState([])

  // User table state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [size, setSize] = useState(5)

  // Filter state
  const [activeFilter, setActiveFilter] = useState('-1')

  const handleFormChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const handleEmailVerifiedChange = (value) => {
    setEmailVerified(value)

    setFormData((prev) => ({
      ...prev,
      emailVerified: value,
    }))
  }

  const handleActiveChange = (value) => {
    setActive(value)

    setFormData((prev) => ({
      ...prev,
      active: value,
    }))
  }

  const handleReset = () => {
    setFormData({
      userId: null,
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      emailVerified: false,
      active: false,
    })
    setEmailVerified(false)
    setActive(false)
    setValidated(false)
    setSearchParam('')
    setActiveFilter('-1')
    search()
  }

  const userFormSubmit = async (event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
      setValidated(true)
    } else {
      try {
        const data = await createOrModify(formData)
        if (data.status === 201) {
          toast.success(data.message)
          search()
          handleReset()
        } else {
          toast.info(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const search = useCallback(async () => {
    try {
      // map activeFilter to boolean active param: 'locked' -> false, 'unlocked' -> true
      let activeParam
      if (activeFilter === 'locked') activeParam = false
      else if (activeFilter === 'unlocked') activeParam = true

      const data = await searchUsers(currentPage, size, searchParam, activeParam)
      if (data.status === 200) {
        setUsers(data.data.data.users)
        setTotalElements(data.data.data.total)
        setTotalPages(data.data.data.totalPages)
        setCurrentPage(data.data.data.page)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [currentPage, size, searchParam, activeFilter])

  useEffect(() => {
    search()
  }, [search])

  const loadUserIntoForm = async (userId) => {
    try {
      const user = await getUserById(userId)
      setFormData(() => ({
        userId: user.userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        emailVerified: Boolean(user.emailVerified),
        active: Boolean(user.active),
      }))
      setEmailVerified(Boolean(user.emailVerified))
      setActive(Boolean(user.active))
      setValidated(false)
      toast.success('User loaded into form')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = (user) => {
    setUserToDelete(user)
    setDeleteModalVisible(true)
  }

  const cancelDelete = () => {
    setUserToDelete(null)
    setDeleteModalVisible(false)
  }

  const deleteUser = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await deleteUserById(userToDelete.userId)
      toast.success('User deleted successfully')
      if (formData.userId === userToDelete.userId) {
        handleReset()
      }
      cancelDelete()
      search()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Users</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3" onSubmit={userFormSubmit} validated={validated} noValidate>
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="firstName" className="form-label">
                  First Name
                </CFormLabel>
                <CInputGroup className="has-validation">
                  <CFormInput
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange(e)}
                    size="sm"
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide a first name
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="lastName" className="form-label">
                  Last Name
                </CFormLabel>
                <CInputGroup className="has-validation">
                  <CFormInput
                    placeholder="Last Name"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange(e)}
                    size="sm"
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide a last name
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="username" className="form-label">
                  User Name
                </CFormLabel>
                <CInputGroup className="has-validation">
                  <CInputGroupText>@</CInputGroupText>
                  <CFormInput
                    placeholder="User Name"
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleFormChange(e)}
                    size="sm"
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide a user name
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol xs={12} md={6} lg={3}>
                <CFormLabel htmlFor="email" className="form-label">
                  Email
                </CFormLabel>
                <CInputGroup className="has-validation">
                  <CFormInput
                    placeholder="Email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange(e)}
                    size="sm"
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide an email
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol xs={6} md={3} lg={2}>
                <CFormLabel htmlFor="emailVerified" className="form-label">
                  Email Verified
                </CFormLabel>
                <CFormCheck
                  style={{ cursor: 'pointer' }}
                  type="checkbox"
                  label="Yes"
                  id="emailVerified"
                  onChange={(e) => handleEmailVerifiedChange(e.target.checked)}
                  checked={emailVerified}
                />
              </CCol>
              <CCol xs={6} md={3} lg={2}>
                <CFormLabel htmlFor="active" className="form-label">
                  User Status
                </CFormLabel>
                <CFormCheck
                  style={{ cursor: 'pointer' }}
                  type="checkbox"
                  label="Enabled"
                  id="active"
                  onChange={(e) => handleActiveChange(e.target.checked)}
                  checked={active}
                />
              </CCol>
              <CCol xs={12} className="d-flex justify-content-end gap-2 mt-2">
                <CButton color="primary" type="submit" size="sm">
                  {formData.userId ? 'Update' : 'Create'}
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
            <hr className="my-3" />
            <CRow className="mb-3 align-items-center">
              <CCol xs={12} md={6} className="d-flex flex-column flex-md-row gap-2">
                <CCol md="auto" className="flex-grow-1">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: '0.875rem',
                    }}
                  >
                    Account Status:
                  </label>
                  <CFormSelect
                    id="activeFilter"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    size="sm"
                    style={{ cursor: 'pointer', maxWidth: '150px' }}
                  >
                    <option value="-1">All</option>
                    <option value="locked">Locked</option>
                    <option value="unlocked">Unlocked</option>
                  </CFormSelect>
                </CCol>
              </CCol>
              <CCol xs={12} md={6} className="d-flex justify-content-md-end">
                <CFormInput
                  type="text"
                  placeholder="Search user..."
                  size="sm"
                  style={{ maxWidth: '300px' }}
                  value={searchParam}
                  onChange={(e) => setSearchParam(e.target.value)}
                />
              </CCol>
            </CRow>
            <hr className="my-3" />
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">First Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Last Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">User Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created Date</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email Verified</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Locked</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Array.isArray(users) ? (
                    users.map((user, index) => (
                      <CTableRow key={user.userId || index}>
                        <CTableDataCell>{user.firstName}</CTableDataCell>
                        <CTableDataCell>{user.lastName}</CTableDataCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{user.createdAt}</CTableDataCell>
                        <CTableDataCell>
                          {user.emailVerified ? 'Verified' : 'Un-verified'}
                        </CTableDataCell>
                        <CTableDataCell>{user.active ? 'Non-locked' : 'Locked'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            type="button"
                            color="primary"
                            size="sm"
                            onClick={() => loadUserIntoForm(user.userId)}
                          >
                            Edit
                          </CButton>{' '}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmDelete(user)}
                          >
                            Delete
                          </button>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center py-4">
                        <span className="text-muted">No users found</span>
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
          </CCardBody>
        </CCard>
      </CCol>
      <CModal visible={deleteModalVisible} onClose={cancelDelete} backdrop="static">
        <CModalHeader>
          <CModalTitle>Delete user</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {userToDelete ? (
            <div>
              <p>Are you sure you want to delete this user?</p>
              <p>
                <strong>
                  {userToDelete.username || userToDelete.email || userToDelete.userId}
                </strong>
              </p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
          ) : (
            <p>Are you sure you want to delete this user?</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDelete} disabled={isDeleting}>
            Cancel
          </CButton>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={deleteUser}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default User
