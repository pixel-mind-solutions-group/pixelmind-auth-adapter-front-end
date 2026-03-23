import React, { useEffect, useState, useRef } from 'react'
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
  CFormSelect,
  CTableDataCell,
  CFormCheck,
  CButton,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
} from '@coreui/react'
import { createOrModify } from '../../service/user/UserService'
import { searchUsers } from '../../service/user/UserService'
import Pagination from '../pagination/Pagination'
import { toast } from 'react-toastify'

const User = () => {
  // Form state
  const [validated, setValidated] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    emailVerified: null,
    enabled: null,
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

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      emailVerified: emailVerified,
      enabled: enabled,
    }))
  }, [emailVerified, enabled])

  useEffect(() => {
    search()
  }, [searchParam, currentPage, size])

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
        setUsers(data.data.data.dataList)
        setTotalElements(data.data.data.totalElements)
        setTotalPages(data.data.data.totalPages)
        setCurrentPage(data.data.data.currentPage)
      } else {
        toast.info(data.message)
      }
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
                    onChange={(e) => setEmailVerified(e.target.checked)}
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
                    id="enabled"
                    onChange={(e) => setEnabled(e.target.checked)}
                    checked={enabled}
                  />
                </CInputGroup>
              </CCol>
              <br />
              <br />
              <br />
              <br />
              <CCol xs={11} />
              <CCol xs="auto">
                <CButton color="primary" type="submit">
                  Create
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
                  onChange={(e) => setSearchParam(e.target.value)}
                />
              </CCol>
            </CRow>
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">First name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Last name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">User name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created date</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email verified</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Locked</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user, index) => (
                      <CTableRow key={user.id || index}>
                        <CTableDataCell>{user.firstName}</CTableDataCell>
                        <CTableDataCell>{user.lastName}</CTableDataCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{user.createdDate}</CTableDataCell>
                        <CTableDataCell>
                          {user.emailVerified ? 'Verified' : 'Un-verified'}
                        </CTableDataCell>
                        <CTableDataCell>{user.enabled ? 'Non-locked' : 'Locked'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton type="button" color="primary" size="sm">
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
