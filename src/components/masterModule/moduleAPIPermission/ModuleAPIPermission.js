import React, { useEffect, useState, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CAccordion,
  CFormFeedback,
  CInputGroup,
  CAccordionItem,
  CFormSelect,
  CAccordionHeader,
  CAccordionBody,
  CFormCheck,
  CButton,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
} from '@coreui/react'

const ModuleAPIPermission = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Module API Permission</strong>
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
                <CFormLabel htmlFor="status">Module</CFormLabel>
                <CFormSelect id="status" style={{ cursor: 'pointer' }} required>
                  <option value="-1">Select a Module</option>
                </CFormSelect>
                <CFormFeedback tooltip invalid>
                  Please select a module
                </CFormFeedback>
              </CCol>
              <br />
              <br />
              <br />
              <br />
              <CCol xs={11} />
              <CCol xs={12}>
                <CCard className="mb-4" style={{ padding: '1em' }}>
                  <CAccordion alwaysOpen activeItemKey={1}>
                    <CAccordionItem itemKey={1}>
                      <CAccordionHeader>API Permissions</CAccordionHeader>
                      <CAccordionBody>
                        <CCol sm={14}>
                          <CInputGroup>
                            <React.Fragment>
                              <div style={{ cursor: 'pointer', marginRight: '1rem' }}>
                                <CFormCheck
                                  type="checkbox"
                                  style={{ cursor: 'pointer', marginRight: '0.2rem' }}
                                />{' '}
                              </div>
                            </React.Fragment>
                          </CInputGroup>
                        </CCol>
                      </CAccordionBody>
                    </CAccordionItem>
                  </CAccordion>
                </CCard>
              </CCol>
              <CCol xs={11} />
              <CCol xs="auto">
                <CButton color="primary" type="submit">
                  Create
                </CButton>
              </CCol>
            </CForm>
            <br />
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Module</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Permissions</CTableHeaderCell>
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

export default ModuleAPIPermission
