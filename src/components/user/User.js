import { useEffect, useState } from 'react'
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
  CButton,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
} from '@coreui/react'
import { createOrModify, searchUsers, getUserById } from '../../service/user/UserService'
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
    emailVerified: null,
    active: null,
  })

  // Search query state
  const [searchParam, setSearchParam] = useState('')
  const [users, setUsers] = useState([])

  // User table state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [size, setSize] = useState(5)

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
      emailVerified: null,
      active: null,
    })
    setEmailVerified(false)
    setActive(false)
    setValidated(false)
    setSearchParam('')
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

  const search = async () => {
    try {
      const data = await searchUsers(currentPage, size, searchParam)
      if (data.status === 200) {
        setUsers(data.data.data.users)
        setTotalElements(data.data.data.total)
        setTotalPages(data.data.data.totalPages)
        setCurrentPage(data.data.data.page)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    search()
  }, [searchParam, currentPage, size])

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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Users</strong>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row gx-3 gy-2 align-items-center"
              onSubmit={userFormSubmit}
              validated={validated}
              noValidate
            >
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputName">First Name</CFormLabel>
                <CInputGroup className="has-validation">
                  <CFormInput
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange(e)}
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide a first name
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">Last Name</CFormLabel>
                <CInputGroup className="has-validation">
                  <CFormInput
                    placeholder="Last Name"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange(e)}
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide a last name
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">User Name</CFormLabel>
                <CInputGroup className="has-validation">
                  <CInputGroupText>@</CInputGroupText>
                  <CFormInput
                    placeholder="User Name"
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleFormChange(e)}
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide a user name
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">Email</CFormLabel>
                <CInputGroup className="has-validation">
                  <CFormInput
                    placeholder="Email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange(e)}
                    required
                  />
                  <CFormFeedback tooltip invalid>
                    Please provide an email
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol sm={2}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">Email verification</CFormLabel>
                <CInputGroup>
                  <CFormCheck
                    style={{ cursor: 'pointer' }}
                    type="checkbox"
                    label="Verified"
                    id="emailVerified"
                    onChange={(e) => handleEmailVerifiedChange(e.target.checked)}
                    checked={emailVerified}
                  />
                </CInputGroup>
              </CCol>
              <CCol sm={2}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">Lock user account</CFormLabel>
                <CInputGroup>
                  <CFormCheck
                    style={{ cursor: 'pointer' }}
                    type="checkbox"
                    label="Enabled"
                    id="active"
                    onChange={(e) => handleActiveChange(e.target.checked)}
                    checked={active}
                  />
                </CInputGroup>
              </CCol>
              <br />
              <br />
              <br />
              <br />
              <CCol xs={12} className="d-flex justify-content-end">
                <CButton color="primary" type="submit">
                  {formData.userId ? 'Update' : 'Create'}
                </CButton>
                <CButton color="secondary" type="button" className="ms-2" onClick={handleReset}>
                  Reset
                </CButton>
              </CCol>
            </CForm>
            <br />
            <CRow className="mb-3">
              <CCol xs={6}></CCol>
              <CCol xs={6} className="d-flex justify-content-end">
                <CFormInput
                  type="text"
                  placeholder="Search user..."
                  style={{ maxWidth: '300px' }}
                  value={searchParam}
                  onChange={(e) => setSearchParam(e.target.value)}
                />
              </CCol>
            </CRow>
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
                          <CButton type="button" color="danger" size="sm">
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center">
                        No users found
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
    </CRow>
  )
}

export default User
