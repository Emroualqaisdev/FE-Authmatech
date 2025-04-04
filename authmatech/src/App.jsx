import React, { useEffect, useState } from 'react'
import { isMobile } from './utils/device'
import Loader from './components/Loader'
import PhoneConfirm from './components/PhoneConfirm'
import SuccessMessage from './components/SuccessMessage'
import QRCode from 'qrcode.react'
import './styles/global.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [phoneData, setPhoneData] = useState(null)
  const [verified, setVerified] = useState(false)
  const [isOnMobile, setIsOnMobile] = useState(false)

  useEffect(() => {
    const onMobile = isMobile()
    setIsOnMobile(onMobile)

    if (!onMobile) return // Skip API call on desktop

    const fetchData = async () => {
      try {
        const res = await fetch('')
        const data = await res.json()
        setPhoneData(data)
      } catch (err) {
        console.error('Error fetching mobile number:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!isOnMobile) {
    return (
      <div style={{
        height: '100vh',
        background: 'black',
        display: 'flex',
        color: 'white',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          Please scan this QR code on your phone:
        </p>
        <QRCode value="https://your-site.com" size={180} />
      </div>
    )
  }

  if (loading) return <Loader />

  if (verified) return <SuccessMessage />

  return <PhoneConfirm data={phoneData} onVerify={() => setVerified(true)} />
}

export default App
