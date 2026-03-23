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
  CFormCheck,
  CButton,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
} from '@coreui/react'

const UserRole = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage User Roles</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row gx-3 gy-2 align-items-center" noValidate>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeSelect">Application</CFormLabel>
                <CFormSelect style={{ cursor: 'pointer' }} required>
                  <option value="-1">Select an application</option>
                </CFormSelect>
                <CFormFeedback tooltip invalid>
                  Please select a status.
                </CFormFeedback>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputName">First Name</CFormLabel>
                <CFormInput placeholder="First Name" required />
                <CFormFeedback tooltip invalid>
                  Please provide a first name.
                </CFormFeedback>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">Last Name</CFormLabel>
                <CInputGroup>
                  <CFormInput placeholder="Last Name" required />
                  <CFormFeedback tooltip invalid>
                    Please provide a last name.
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">User Name</CFormLabel>
                <CInputGroup className="has-validation">
                  <CInputGroupText>@</CInputGroupText>
                  <CFormInput placeholder="User Name" required />
                  <CFormFeedback tooltip invalid>
                    Please provide a user name.
                  </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputGroupUsername">Email</CFormLabel>
                <CInputGroup>
                  <CFormInput placeholder="Email" required />
                  <CFormFeedback tooltip invalid>
                    Please provide an email.
                  </CFormFeedback>
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
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default UserRole
