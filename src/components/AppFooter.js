import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span>&copy; 2026 PixelMind IT Solutions. All Rights Reserved.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <span className="font-weight-semibold text-primary">PixelMind IT Solutions</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
