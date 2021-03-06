import React, { useContext } from 'react'
import AppContext from '../contexts/AppContext'

import Button from './Button'

import { UsbDriveStatus } from '../lib/usbstick'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing = () => {}

const USBControllerButton: React.FC = () => {
  const { usbDriveStatus: status, usbDriveEject } = useContext(AppContext)

  if (status === UsbDriveStatus.notavailable) {
    return null
  }

  if (status === UsbDriveStatus.absent) {
    return (
      <Button small disabled onPress={doNothing}>
        No USB
      </Button>
    )
  }

  if (status === UsbDriveStatus.present) {
    return (
      <Button small disabled onPress={doNothing}>
        Connecting…
      </Button>
    )
  }

  if (status === UsbDriveStatus.recentlyEjected) {
    return (
      <Button small disabled onPress={doNothing}>
        Ejected
      </Button>
    )
  }

  return (
    <Button small onPress={usbDriveEject}>
      Eject USB
    </Button>
  )
}

export default USBControllerButton
