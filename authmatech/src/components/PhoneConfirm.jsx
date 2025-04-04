import React, { useState } from 'react'

const PhoneConfirm = ({ data, onVerify }) => {
  const [mobile, setMobile] = useState(data?.mobile || '')
  const [countryCode, setCountryCode] = useState(data?.countryCode || '')

  const handleVerify = async () => {
    const res = await fetch('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    })
    const result = await res.json()
    if (result.success) onVerify()
    else alert('Mobile mismatch')
  }

  return (
    <div>
      <h2>Is this your mobile?</h2>
      <p>
        {countryCode} {mobile}
      </p>
      <button onClick={handleVerify}>Yes, Continue</button>
    </div>
  )
}

export default PhoneConfirm
