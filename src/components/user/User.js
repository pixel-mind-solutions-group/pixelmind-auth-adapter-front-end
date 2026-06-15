import { useCallback, useEffect, useState, useRef } from 'react'
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
import { getActiveRealms } from '../../service/realm/RealmService'
import {
  getActiveApplications,
  searchApplications,
} from '../../service/application/ApplicationService'
import { getActiveUserRoles } from '../../service/userRole/UserRoleService'
import {
  registerOrModifyUserProfile,
  getUserProfileById,
  deleteUserProfileById,
  searchUserProfiles,
} from '../../service/userProfile/UserProfileService'
import Pagination from '../pagination/Pagination'
import { toast } from 'react-toastify'

const User = () => {
  // Navigation tabs state: 'definitions' or 'profile'
  const [activeTab, setActiveTab] = useState('definitions')

  // Shared dropdown data
  const [realmsOptions, setRealmsOptions] = useState([])
  const [applicationsOptions, setApplicationsOptions] = useState([])

  // ==================== TAB 1 STATE (USER DEFINITIONS) ====================
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
  const [searchParam, setSearchParam] = useState('')
  const [users, setUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [size, setSize] = useState(5)
  const [activeFilter, setActiveFilter] = useState('-1')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ==================== TAB 2 STATE (USER PROFILE MAPPING) ====================
  const [profileValidated, setProfileValidated] = useState(false)
  const [profileId, setProfileId] = useState(null)
  const [mappingRealmId, setMappingRealmId] = useState('-1')
  const [mappingApplicationId, setMappingApplicationId] = useState('-1')
  const [mappingApplicationsOptions, setMappingApplicationsOptions] = useState([])

  // Searchable User Dropdown state
  const [activeUsers, setActiveUsers] = useState([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)

  // Searchable User Role Dropdown state
  const [activeUserRoles, setActiveUserRoles] = useState([])
  const [roleSearchQuery, setRoleSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const roleDropdownRef = useRef(null)

  // Mapping Table & Filtration state
  const [assignedProfiles, setAssignedProfiles] = useState([])
  const [profileCurrentPage, setProfileCurrentPage] = useState(0)
  const [profileTotalElements, setProfileTotalElements] = useState(0)
  const [profileTotalPages, setProfileTotalPages] = useState(0)
  const profileSize = 5

  const [filterRealmId, setFilterRealmId] = useState('-1')
  const [filterApplicationId, setFilterApplicationId] = useState('-1')
  const [filterApplicationsOptions, setFilterApplicationsOptions] = useState([])
  const [filterModuleId, setFilterModuleId] = useState('-1')
  const [filterActiveUserRoles, setFilterActiveUserRoles] = useState([])
  const [filterRoleSearchQuery, setFilterRoleSearchQuery] = useState('')
  const [filterSelectedRole, setFilterSelectedRole] = useState(null)
  const [filterRoleDropdownOpen, setFilterRoleDropdownOpen] = useState(false)
  const filterRoleDropdownRef = useRef(null)

  // Mapped user filter (searchable input)
  const [filterUserQuery, setFilterUserQuery] = useState('')
  const [filterSelectedUser, setFilterSelectedUser] = useState(null)
  const [filterUserDropdownOpen, setFilterUserDropdownOpen] = useState(false)
  const [filterActiveUsers, setFilterActiveUsers] = useState([])
  const filterUserDropdownRef = useRef(null)

  const [profileDeleteModalVisible, setProfileDeleteModalVisible] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState(null)
  const [isDeletingProfile, setIsDeletingProfile] = useState(false)

  // ==================== GENERAL LOGIC & CLICK OUTSIDE ====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false)
      }
      if (filterRoleDropdownRef.current && !filterRoleDropdownRef.current.contains(event.target)) {
        setFilterRoleDropdownOpen(false)
      }
      if (filterUserDropdownRef.current && !filterUserDropdownRef.current.contains(event.target)) {
        setFilterUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load basic dropdown options globally on start
  const fetchDropdownData = useCallback(async () => {
    try {
      const realmsRes = await getActiveRealms()
      if (realmsRes.status === 200) {
        setRealmsOptions(realmsRes.data || [])
      }
      setApplicationsOptions([])
      setFilterApplicationsOptions([])
    } catch (error) {
      toast.error('Failed to load initial dropdown filters: ' + error.message)
    }
  }, [])

  useEffect(() => {
    fetchDropdownData()
  }, [fetchDropdownData])

  // ==================== TAB 1 LOGIC (USER DEFINITIONS) ====================
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
    event.preventDefault()
    const form = event.currentTarget
    if (form.checkValidity() === false) {
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
    if (activeTab === 'definitions') {
      search()
    }
  }, [activeTab, search])

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

  // ==================== TAB 2 LOGIC (USER PROFILE MAPPING) ====================
  const fetchActiveUsersForSelection = async (query = '') => {
    try {
      const res = await searchUsers(0, 50, query, true) // fetch active users
      if (res.status === 200) {
        setActiveUsers(res.data.data.users || [])
      }
    } catch (error) {
      toast.error('Failed to load users: ' + error.message)
    }
  }

  const fetchActiveRolesForSelection = async (rId, appId) => {
    if (rId === '-1' || appId === '-1') {
      setActiveUserRoles([])
      return
    }
    try {
      const res = await getActiveUserRoles(rId, appId)
      if (res.status === 200) {
        setActiveUserRoles(res.data || [])
      }
    } catch (error) {
      toast.error('Failed to load roles: ' + error.message)
    }
  }

  const fetchAssignedProfiles = useCallback(async () => {
    try {
      const rId = filterRealmId === '-1' ? null : filterRealmId
      const aId = filterApplicationId === '-1' ? null : filterApplicationId
      const uId = filterSelectedUser ? filterSelectedUser.userId : null
      const roleId = filterSelectedRole ? filterSelectedRole.roleId : null

      const res = await searchUserProfiles(
        profileCurrentPage,
        profileSize,
        rId,
        aId,
        uId,
        roleId,
        null,
      )
      if (res.status === 200 && res.data) {
        setAssignedProfiles(res.data.profiles || [])
        setProfileTotalElements(res.data.total || 0)
        setProfileTotalPages(res.data.totalPages || 0)
        setProfileCurrentPage(res.data.page || 0)
      }
    } catch (error) {
      toast.error('Failed to load assigned profiles: ' + error.message)
    }
  }, [
    profileCurrentPage,
    filterRealmId,
    filterApplicationId,
    filterSelectedUser,
    filterSelectedRole,
  ])

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchAssignedProfiles()
    }
  }, [activeTab, fetchAssignedProfiles])

  const handleMappingRealmChange = async (rId) => {
    setMappingRealmId(rId)
    setMappingApplicationId('-1')
    setMappingApplicationsOptions([])
    setSelectedRole(null)
    setRoleSearchQuery('')
    setActiveUserRoles([])

    try {
      if (rId !== '-1') {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
        if (searchRes.status === 200) {
          setMappingApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load applications for selected Realm: ' + error.message)
    }
  }

  const handleMappingApplicationChange = async (appId) => {
    setMappingApplicationId(appId)
    setSelectedRole(null)
    setRoleSearchQuery('')
    setActiveUserRoles([])

    if (mappingRealmId !== '-1' && appId !== '-1') {
      fetchActiveRolesForSelection(mappingRealmId, appId)
    }
  }

  const handleMappingFormSubmit = async (event) => {
    event.preventDefault()

    if (
      mappingRealmId === '-1' ||
      mappingApplicationId === '-1' ||
      !selectedUser ||
      !selectedRole
    ) {
      setProfileValidated(true)
      toast.warning('Please select User, Realm, Application, and searchable User Role.')
      return
    }

    const payload = {
      id: profileId,
      userId: Number(selectedUser.id || selectedUser.userId),
      realmId: Number(mappingRealmId),
      applicationId: Number(mappingApplicationId),
      userRoleId: Number(selectedRole.roleId || selectedRole.id),
    }

    try {
      const res = await registerOrModifyUserProfile(payload)
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || 'User Profile mapped successfully!')
        fetchAssignedProfiles()
        handleMappingReset()
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save User Profile mapping.')
    }
  }

  const handleMappingReset = () => {
    setProfileId(null)
    setMappingRealmId('-1')
    setMappingApplicationId('-1')
    setMappingApplicationsOptions([])
    setSelectedUser(null)
    setUserSearchQuery('')
    setSelectedRole(null)
    setRoleSearchQuery('')
    setProfileValidated(false)
    setActiveUsers([])
    setActiveUserRoles([])
  }

  const handleFilterRealmChange = async (rId) => {
    setFilterRealmId(rId)
    setFilterApplicationId('-1')
    setFilterActiveUserRoles([])
    setFilterRoleSearchQuery('')
    setFilterSelectedRole(null)
    setProfileCurrentPage(0)

    try {
      if (rId === '-1') {
        setFilterApplicationsOptions([])
      } else {
        const searchRes = await searchApplications(0, 1000, null, rId, null)
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
    setFilterActiveUserRoles([])
    setFilterRoleSearchQuery('')
    setFilterSelectedRole(null)
    setProfileCurrentPage(0)

    if (filterRealmId !== '-1' && appId !== '-1') {
      try {
        const rolesRes = await getActiveUserRoles(filterRealmId, appId)
        if (rolesRes.status === 200) {
          setFilterActiveUserRoles(rolesRes.data || [])
        }
      } catch (error) {
        toast.error('Failed to load filter roles: ' + error.message)
      }
    }
  }

  const fetchFilterActiveUsers = async (query = '') => {
    try {
      const res = await searchUsers(0, 50, query, true)
      if (res.status === 200) {
        setFilterActiveUsers(res.data.data.users || [])
      }
    } catch (error) {
      toast.error('Failed to load filter users: ' + error.message)
    }
  }

  const handleFilterClear = () => {
    setFilterRealmId('-1')
    setFilterApplicationId('-1')
    setFilterApplicationsOptions([])
    setFilterActiveUserRoles([])
    setFilterRoleSearchQuery('')
    setFilterSelectedRole(null)
    setFilterUserQuery('')
    setFilterSelectedUser(null)
    setProfileCurrentPage(0)
  }

  const loadProfileIntoForm = async (profile) => {
    setProfileId(profile.id)
    setMappingRealmId(String(profile.realmId))
    setSelectedUser({
      id: profile.userId || profile.user?.userId || profile.user?.id,
      username: profile.user?.username || 'N/A',
    })
    setUserSearchQuery(profile.user?.username || 'N/A')

    try {
      // Load apps for edit realm
      const searchRes = await searchApplications(0, 1000, null, profile.realmId, null)
      if (searchRes.status === 200) {
        setMappingApplicationsOptions(searchRes.data.applications || [])
      }
      setMappingApplicationId(String(profile.applicationId))

      // Load roles for edit app
      const rolesRes = await getActiveUserRoles(profile.realmId, profile.applicationId)
      if (rolesRes.status === 200) {
        setActiveUserRoles(rolesRes.data || [])
      }
      setSelectedRole(profile.userRole)
      setRoleSearchQuery(profile.userRole?.roleName || '')
      setProfileValidated(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.success('User Profile loaded into form')
    } catch (error) {
      toast.error('Failed to load profile for edit: ' + error.message)
    }
  }

  const confirmDeleteProfile = (profile) => {
    setProfileToDelete(profile)
    setProfileDeleteModalVisible(true)
  }

  const cancelDeleteProfile = () => {
    setProfileToDelete(null)
    setProfileDeleteModalVisible(false)
  }

  const executeDeleteProfile = async () => {
    if (!profileToDelete) return
    setIsDeletingProfile(true)
    try {
      const res = await deleteUserProfileById(profileToDelete.id)
      if (res.status === 200) {
        toast.success(res.message || 'Mapping deleted successfully!')
        fetchAssignedProfiles()
        if (profileId === profileToDelete.id) {
          handleMappingReset()
        }
      } else {
        toast.info(res.message)
      }
    } catch (error) {
      toast.error('Failed to delete mapping: ' + error.message)
    } finally {
      setIsDeletingProfile(false)
      cancelDeleteProfile()
    }
  }

  // Filtered searchable options
  const filteredUsers = activeUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()),
  )

  const filteredRoles = activeUserRoles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(roleSearchQuery.toLowerCase())),
  )

  const filteredFilterRoles = filterActiveUserRoles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(filterRoleSearchQuery.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(filterRoleSearchQuery.toLowerCase())),
  )

  const filteredFilterUsers = filterActiveUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(filterUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(filterUserQuery.toLowerCase()),
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Users & User Profiles</strong>
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
                className={`btn btn-sm rounded px-3 py-2 border-0 ${activeTab === 'definitions' ? 'btn-primary text-white shadow-sm' : ''}`}
                style={{
                  color: activeTab === 'definitions' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: activeTab === 'definitions' ? '' : 'transparent',
                  transition: 'all 0.25s ease',
                  fontWeight: '500',
                }}
                onClick={() => setActiveTab('definitions')}
              >
                User Definitions
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded px-3 py-2 border-0 ${activeTab === 'profile' ? 'btn-primary text-white shadow-sm' : ''}`}
                style={{
                  color: activeTab === 'profile' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: activeTab === 'profile' ? '' : 'transparent',
                  transition: 'all 0.25s ease',
                  fontWeight: '500',
                }}
                onClick={() => setActiveTab('profile')}
              >
                User Profile Mapping
              </button>
            </div>

            {/* TAB 1: USER DEFINITIONS */}
            {activeTab === 'definitions' && (
              <>
                <CForm
                  className="row g-3"
                  onSubmit={userFormSubmit}
                  validated={validated}
                  noValidate
                >
                  <CCol xs={12} md={6} lg={3}>
                    <CFormLabel htmlFor="firstName" className="text-muted small font-weight-bold">
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
                    <CFormLabel htmlFor="lastName" className="text-muted small font-weight-bold">
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
                    <CFormLabel htmlFor="username" className="text-muted small font-weight-bold">
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
                    <CFormLabel htmlFor="email" className="text-muted small font-weight-bold">
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
                    <CFormLabel
                      htmlFor="emailVerified"
                      className="text-muted small font-weight-bold"
                    >
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
                    <CFormLabel htmlFor="active" className="text-muted small font-weight-bold">
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

                <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                <CRow className="mb-3 align-items-center">
                  <CCol xs={12} md={6} className="d-flex flex-column flex-md-row gap-2">
                    <CCol md="auto" className="flex-grow-1">
                      <label className="form-label mb-1 text-muted small font-weight-bold">
                        Account Status
                      </label>
                      <CFormSelect
                        id="activeFilter"
                        value={activeFilter}
                        onChange={(e) => {
                          setActiveFilter(e.target.value)
                          setCurrentPage(0)
                        }}
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
                      onChange={(e) => {
                        setSearchParam(e.target.value)
                        setCurrentPage(0)
                      }}
                    />
                  </CCol>
                </CRow>

                <CCol xs={12}>
                  <CTable hover responsive align="middle" className="border-top">
                    <CTableHead color="dark">
                      <CTableRow>
                        <CTableHeaderCell scope="col">First Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Last Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">User Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Created Date</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Email Verified</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Locked</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="text-end">
                          Action
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map((user, index) => (
                          <CTableRow key={user.userId || index}>
                            <CTableDataCell className="font-weight-semibold">
                              {user.firstName}
                            </CTableDataCell>
                            <CTableDataCell>{user.lastName}</CTableDataCell>
                            <CTableDataCell className="text-info font-weight-bold">
                              @{user.username}
                            </CTableDataCell>
                            <CTableDataCell>{user.email}</CTableDataCell>
                            <CTableDataCell className="text-muted">{user.createdAt}</CTableDataCell>
                            <CTableDataCell>
                              <span
                                className={`badge rounded-pill bg-${user.emailVerified ? 'success' : 'secondary'}`}
                              >
                                {user.emailVerified ? 'Verified' : 'Un-verified'}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span
                                className={`badge rounded-pill bg-${user.active ? 'success' : 'danger'}`}
                              >
                                {user.active ? 'Non-locked' : 'Locked'}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              <CButton
                                type="button"
                                color="primary"
                                size="sm"
                                className="me-1 px-3"
                                onClick={() => loadUserIntoForm(user.userId)}
                              >
                                Edit
                              </CButton>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger px-3"
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
              </>
            )}

            {/* TAB 2: USER PROFILE MAPPING */}
            {activeTab === 'profile' && (
              <>
                <CForm
                  className="row g-3"
                  onSubmit={handleMappingFormSubmit}
                  validated={profileValidated}
                  noValidate
                >
                  {/* Searchable User Dropdown */}
                  <CCol
                    xs={12}
                    sm={6}
                    md={3}
                    style={{ position: 'relative' }}
                    ref={userDropdownRef}
                  >
                    <CFormLabel className="text-muted small font-weight-bold">User</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Type to search user..."
                      value={userSearchQuery}
                      onFocus={() => {
                        fetchActiveUsersForSelection(userSearchQuery)
                        setUserDropdownOpen(true)
                      }}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value)
                        setSelectedUser(null)
                        fetchActiveUsersForSelection(e.target.value)
                        setUserDropdownOpen(true)
                      }}
                      size="sm"
                      required
                    />
                    {userDropdownOpen && (
                      <div
                        className="dropdown-menu show w-100 shadow-lg"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'var(--cui-body-bg, #2a303d)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <button
                              key={u.userId}
                              type="button"
                              className="dropdown-item text-start d-block w-100 py-2 border-0 bg-transparent text-body"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedUser({ id: u.userId || u.id, username: u.username })
                                setUserSearchQuery(u.username)
                                setUserDropdownOpen(false)
                              }}
                            >
                              <strong>{u.username}</strong> ({u.email})
                            </button>
                          ))
                        ) : (
                          <div className="dropdown-item text-muted disabled">
                            No matching active users found
                          </div>
                        )}
                      </div>
                    )}
                    {selectedUser && (
                      <div className="text-success small mt-1">
                        ✓ Selected User: <strong>{selectedUser.username}</strong>
                      </div>
                    )}
                  </CCol>

                  {/* Realm Select */}
                  <CCol xs={12} sm={6} md={3}>
                    <CFormLabel
                      htmlFor="mappingRealmSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Realm
                    </CFormLabel>
                    <CFormSelect
                      id="mappingRealmSelect"
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
                  <CCol xs={12} sm={6} md={3}>
                    <CFormLabel
                      htmlFor="mappingAppSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Application
                    </CFormLabel>
                    <CFormSelect
                      id="mappingAppSelect"
                      value={mappingApplicationId}
                      onChange={(e) => handleMappingApplicationChange(e.target.value)}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      required
                      disabled={mappingRealmId === '-1'}
                    >
                      <option value="-1">Select an Application</option>
                      {mappingApplicationsOptions.map((app, index) => (
                        <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                          {app.clientId}
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback tooltip invalid>
                      Please select an application.
                    </CFormFeedback>
                  </CCol>

                  {/* Searchable User Role Dropdown */}
                  <CCol
                    xs={12}
                    sm={6}
                    md={3}
                    style={{ position: 'relative' }}
                    ref={roleDropdownRef}
                  >
                    <CFormLabel className="text-muted small font-weight-bold">User Role</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder={
                        mappingRealmId === '-1' || mappingApplicationId === '-1'
                          ? 'Select Realm & Application first'
                          : 'Type to search role...'
                      }
                      value={roleSearchQuery}
                      onFocus={() => {
                        if (mappingRealmId !== '-1' && mappingApplicationId !== '-1') {
                          setRoleDropdownOpen(true)
                        }
                      }}
                      onChange={(e) => {
                        setRoleSearchQuery(e.target.value)
                        setSelectedRole(null)
                        if (mappingRealmId !== '-1' && mappingApplicationId !== '-1') {
                          setRoleDropdownOpen(true)
                        }
                      }}
                      disabled={mappingRealmId === '-1' || mappingApplicationId === '-1'}
                      size="sm"
                      required
                    />
                    {roleDropdownOpen && (
                      <div
                        className="dropdown-menu show w-100 shadow-lg"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'var(--cui-body-bg, #2a303d)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {filteredRoles.length > 0 ? (
                          filteredRoles.map((role) => (
                            <button
                              key={role.roleId}
                              type="button"
                              className="dropdown-item text-start d-block w-100 py-2 border-0 bg-transparent text-body"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedRole(role)
                                setRoleSearchQuery(role.roleName)
                                setRoleDropdownOpen(false)
                              }}
                            >
                              <strong>{role.roleName}</strong>
                              {role.description ? ` - ${role.description}` : ''}
                            </button>
                          ))
                        ) : (
                          <div className="dropdown-item text-muted disabled">
                            No matching roles found
                          </div>
                        )}
                      </div>
                    )}
                    {selectedRole && (
                      <div className="text-success small mt-1">
                        ✓ Selected Role: <strong>{selectedRole.roleName}</strong>
                      </div>
                    )}
                  </CCol>

                  {/* Form Buttons */}
                  <CCol xs={12} className="d-flex justify-content-end gap-2 mt-4">
                    <CButton color="primary" type="submit" size="sm" className="px-4">
                      {profileId ? 'Update Mapping' : 'Map Profile'}
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

                <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                {/* Filtration section for Mapping Table */}
                <div
                  className="row g-3 mb-4 pb-3 border-bottom align-items-end"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <CCol xs={12} sm={6} md={3}>
                    <CFormLabel
                      htmlFor="filterRealmSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Filter by Realm
                    </CFormLabel>
                    <CFormSelect
                      id="filterRealmSelect"
                      value={filterRealmId}
                      onChange={(e) => {
                        handleFilterRealmChange(e.target.value)
                        setProfileCurrentPage(0)
                      }}
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

                  <CCol xs={12} sm={6} md={3}>
                    <CFormLabel
                      htmlFor="filterAppSelect"
                      className="text-muted small font-weight-bold"
                    >
                      Filter by Application
                    </CFormLabel>
                    <CFormSelect
                      id="filterAppSelect"
                      value={filterApplicationId}
                      onChange={(e) => {
                        handleFilterApplicationChange(e.target.value)
                        setProfileCurrentPage(0)
                      }}
                      style={{ cursor: 'pointer' }}
                      size="sm"
                      disabled={filterRealmId === '-1'}
                    >
                      <option value="-1">All Applications</option>
                      {filterApplicationsOptions.map((app, index) => (
                        <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                          {app.clientId}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol
                    xs={12}
                    sm={6}
                    md={3}
                    style={{ position: 'relative' }}
                    ref={filterUserDropdownRef}
                  >
                    <CFormLabel className="text-muted small font-weight-bold">
                      Filter by User
                    </CFormLabel>
                    <div className="d-flex align-items-center gap-1 position-relative">
                      <CFormInput
                        type="text"
                        placeholder="Search mapped users..."
                        value={filterUserQuery}
                        onClick={() => {
                          fetchFilterActiveUsers(filterUserQuery)
                          setFilterUserDropdownOpen(true)
                        }}
                        onChange={(e) => {
                          setFilterUserQuery(e.target.value)
                          setFilterSelectedUser(null)
                          fetchFilterActiveUsers(e.target.value)
                          setFilterUserDropdownOpen(true)
                          setProfileCurrentPage(0)
                        }}
                        size="sm"
                      />
                      {filterSelectedUser && (
                        <button
                          type="button"
                          className="btn btn-sm btn-close position-absolute"
                          style={{ right: '8px', zIndex: 10 }}
                          onClick={() => {
                            setFilterSelectedUser(null)
                            setFilterUserQuery('')
                            setProfileCurrentPage(0)
                          }}
                        />
                      )}
                    </div>
                    {filterUserDropdownOpen && (
                      <div
                        className="dropdown-menu show w-100 shadow-lg"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'var(--cui-body-bg, #2a303d)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {filteredFilterUsers.length > 0 ? (
                          filteredFilterUsers.map((u) => (
                            <button
                              key={u.userId}
                              type="button"
                              className="dropdown-item text-start d-block w-100 py-2 border-0 bg-transparent text-body"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setFilterSelectedUser({
                                  userId: u.userId || u.id,
                                  username: u.username,
                                })
                                setFilterUserQuery(u.username)
                                setFilterUserDropdownOpen(false)
                                setProfileCurrentPage(0)
                              }}
                            >
                              <strong>{u.username}</strong>
                            </button>
                          ))
                        ) : (
                          <div className="dropdown-item text-muted disabled">No users found</div>
                        )}
                      </div>
                    )}
                  </CCol>

                  <CCol
                    xs={12}
                    sm={6}
                    md={3}
                    style={{ position: 'relative' }}
                    ref={filterRoleDropdownRef}
                  >
                    <CFormLabel className="text-muted small font-weight-bold">
                      Filter by Role
                    </CFormLabel>
                    <div className="d-flex align-items-center gap-1 position-relative">
                      <CFormInput
                        type="text"
                        placeholder={
                          filterRealmId === '-1' || filterApplicationId === '-1'
                            ? 'Select Realm & App first'
                            : 'Search roles...'
                        }
                        value={filterRoleSearchQuery}
                        onClick={() => {
                          if (filterRealmId !== '-1' && filterApplicationId !== '-1') {
                            setFilterRoleDropdownOpen(true)
                          }
                        }}
                        onChange={(e) => {
                          setFilterRoleSearchQuery(e.target.value)
                          setFilterSelectedRole(null)
                          if (filterRealmId !== '-1' && filterApplicationId !== '-1') {
                            setFilterRoleDropdownOpen(true)
                          }
                          setProfileCurrentPage(0)
                        }}
                        disabled={filterRealmId === '-1' || filterApplicationId === '-1'}
                        size="sm"
                      />
                      {filterSelectedRole && (
                        <button
                          type="button"
                          className="btn btn-sm btn-close position-absolute"
                          style={{ right: '8px', zIndex: 10 }}
                          onClick={() => {
                            setFilterSelectedRole(null)
                            setFilterRoleSearchQuery('')
                            setProfileCurrentPage(0)
                          }}
                        />
                      )}
                    </div>
                    {filterRoleDropdownOpen && (
                      <div
                        className="dropdown-menu show w-100 shadow-lg"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'var(--cui-body-bg, #2a303d)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {filteredFilterRoles.length > 0 ? (
                          filteredFilterRoles.map((role) => (
                            <button
                              key={role.roleId}
                              type="button"
                              className="dropdown-item text-start d-block w-100 py-2 border-0 bg-transparent text-body"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setFilterSelectedRole(role)
                                setFilterRoleSearchQuery(role.roleName)
                                setFilterRoleDropdownOpen(false)
                                setProfileCurrentPage(0)
                              }}
                            >
                              <strong>{role.roleName}</strong>
                            </button>
                          ))
                        ) : (
                          <div className="dropdown-item text-muted disabled">No roles found</div>
                        )}
                      </div>
                    )}
                  </CCol>

                  <CCol xs={12} className="d-flex justify-content-end mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary px-4"
                      onClick={handleFilterClear}
                    >
                      Clear Filters
                    </button>
                  </CCol>
                </div>

                {/* Mappings Table */}
                <CCol xs={12}>
                  <CTable hover responsive align="middle" className="border-top">
                    <CTableHead color="dark">
                      <CTableRow>
                        <CTableHeaderCell scope="col">User</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                        <CTableHeaderCell scope="col">User Role</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="text-end">
                          Action
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(assignedProfiles) && assignedProfiles.length > 0 ? (
                        assignedProfiles.map((profile, index) => (
                          <CTableRow key={profile.id || index}>
                            <CTableDataCell className="font-weight-semibold">
                              {profile.user?.username || 'N/A'} ({profile.user?.email || 'N/A'})
                            </CTableDataCell>
                            <CTableDataCell>{profile.realm?.realm || 'N/A'}</CTableDataCell>
                            <CTableDataCell>
                              {profile.application?.clientId || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell className="font-weight-bold text-info">
                              {profile.userRole?.roleName || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              <CButton
                                type="button"
                                color="primary"
                                size="sm"
                                className="me-1 px-3"
                                onClick={() => loadProfileIntoForm(profile)}
                              >
                                Edit
                              </CButton>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger px-3"
                                onClick={() => confirmDeleteProfile(profile)}
                              >
                                Delete
                              </button>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="5" className="text-center py-4">
                            <span className="text-muted">No User Profile mappings found</span>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                  <Pagination
                    currentPage={profileCurrentPage}
                    totalPages={profileTotalPages}
                    totalElements={profileTotalElements}
                    onPageChange={setProfileCurrentPage}
                  />
                </CCol>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Delete User Modal */}
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
          <CButton color="secondary" onClick={cancelDelete} disabled={isDeleting} size="sm">
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

      {/* Delete Profile Modal */}
      <CModal visible={profileDeleteModalVisible} onClose={cancelDeleteProfile} backdrop="static">
        <CModalHeader>
          <CModalTitle>Delete User Profile Mapping</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {profileToDelete ? (
            <div>
              <p>Are you sure you want to delete this User Profile mapping?</p>
              <p>
                User: <strong>{profileToDelete.user?.username || 'N/A'}</strong>
              </p>
              <p>
                Role: <strong>{profileToDelete.userRole?.roleName || 'N/A'}</strong>
              </p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
          ) : (
            <p>Are you sure you want to delete this User Profile mapping?</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={cancelDeleteProfile}
            disabled={isDeletingProfile}
            size="sm"
          >
            Cancel
          </CButton>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={executeDeleteProfile}
            disabled={isDeletingProfile}
          >
            {isDeletingProfile ? 'Deleting...' : 'Delete'}
          </button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default User
