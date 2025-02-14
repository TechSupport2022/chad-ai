import React, { Suspense } from 'react'
import AuthCallbackContent from './AuthCallback'

const AuthCallbackPage = () => {
   return (
      <Suspense fallback={<div>Loading...</div>}>
         <AuthCallbackContent />
      </Suspense>
   )
}

export default AuthCallbackPage