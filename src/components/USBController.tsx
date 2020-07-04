import React, { useState } from 'react'

import useInterval from 'use-interval'

import Button from './Button'
import Text from './Text'
import {
  isPresent,
  isMounted,
  doMount,
  doUnmount,
  isAvailable,
} from '../lib/usbstick'

const USBController = () => {
  const available = isAvailable()
  const [present, setPresent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useInterval(
    () => {
      ;(async () => {
        const p = await isPresent()
        setPresent(p)
        if (p) setMounted(await isMounted())
      })()
    },
    available ? 1000 : null
  )

  if (!available) {
    return <Text>USB disabled</Text>
  }

  if (!present) {
    return <Text>No USB</Text>
  }

  return (
    <React.Fragment>
      {mounted ? (
        <Button small onClick={doUnmount}>
          Eject USB
        </Button>
      ) : (
        <Button small onClick={doMount}>
          Mount USB
        </Button>
      )}
    </React.Fragment>
  )
}

export default USBController
