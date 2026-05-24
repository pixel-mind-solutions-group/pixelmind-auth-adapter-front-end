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

const APIPermission = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage API Permissions</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row gx-3 gy-2 align-items-center" noValidate>
              <CCol sm={4}>
                <CFormLabel htmlFor="status">Realm</CFormLabel>
                <CFormSelect id="status" style={{ cursor: 'pointer' }} required>
                  <option value="-1">Select a Realm</option>
                </CFormSelect>
                <CFormFeedback tooltip invalid>
                  Please select a realm
                </CFormFeedback>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="status">Application</CFormLabel>
                <CFormSelect id="status" style={{ cursor: 'pointer' }} required>
                  <option value="-1">Select an Application</option>
                </CFormSelect>
                <CFormFeedback tooltip invalid>
                  Please select an application
                </CFormFeedback>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputName">API Permission Name</CFormLabel>
                <CFormInput placeholder="API Permission Name" required />
                <CFormFeedback tooltip invalid>
                  Please provide an API permissionname
                </CFormFeedback>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="specificSizeInputName">Description</CFormLabel>
                <CFormInput placeholder="Description" required />
                <CFormFeedback tooltip invalid>
                  Please provide a description
                </CFormFeedback>
              </CCol>
              <CCol sm={4}>
                <CFormLabel htmlFor="status">Status</CFormLabel>
                <CFormSelect id="status" style={{ cursor: 'pointer' }} required>
                  <option value="-1">Select a status</option>
                  <option value="Active">Active</option>
                  <option value="In_active">In-active</option>
                </CFormSelect>
                <CFormFeedback tooltip invalid>
                  Please select a status
                </CFormFeedback>
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
                  placeholder="Search permission..."
                  style={{ maxWidth: '300px' }}
                />
              </CCol>
            </CRow>
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Permission</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody></CTableBody>
              </CTable>
            </CCol>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default APIPermission
