import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormSelect,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
} from '@coreui/react'
import Pagination from '../pagination/Pagination'

const Application = () => {
  const [searchParam, setSearchParam] = useState('')
  const [applications, setApplications] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [size, setSize] = useState(5)

  const [realmFilter, setRealmFilter] = useState('-1')
  const [applicationFilter, setApplicationFilter] = useState('-1')
  const [statusFilter, setStatusFilter] = useState('-1')

  const handleResetFilters = () => {
    setRealmFilter('-1')
    setApplicationFilter('-1')
    setStatusFilter('-1')
    setSearchParam('')
    setCurrentPage(0)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Applications</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3 align-items-center">
              <CCol xs={12} md={6} className="d-flex flex-column flex-md-row gap-2">
                <CCol md="auto" className="flex-grow-1">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: '0.875rem',
                    }}
                  >
                    Realm:
                  </label>
                  <CFormSelect
                    id="realmFilter"
                    value={realmFilter}
                    onChange={(e) => setRealmFilter(e.target.value)}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="-1">All Realms</option>
                  </CFormSelect>
                </CCol>
                <CCol md="auto" className="flex-grow-1">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: '0.875rem',
                    }}
                  >
                    Application:
                  </label>
                  <CFormSelect
                    id="applicationFilter"
                    value={applicationFilter}
                    onChange={(e) => setApplicationFilter(e.target.value)}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="-1">All Applications</option>
                  </CFormSelect>
                </CCol>
                <CCol md="auto" className="flex-grow-1">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: '0.875rem',
                    }}
                  >
                    Status:
                  </label>
                  <CFormSelect
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="-1">All Status</option>
                    <option value="Active">Active</option>
                    <option value="In_active">In-active</option>
                  </CFormSelect>
                </CCol>
              </CCol>
              <CCol xs={12} md={6} className="d-flex justify-content-md-end gap-2">
                <CFormInput
                  type="text"
                  placeholder="Search application..."
                  size="sm"
                  style={{ maxWidth: '300px' }}
                  value={searchParam}
                  onChange={(e) => setSearchParam(e.target.value)}
                />
              </CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol xs={12}>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleResetFilters}
                  type="button"
                >
                  Clear Filters
                </button>
              </CCol>
            </CRow>
            <hr className="my-3" />
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody></CTableBody>
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

export default Application
