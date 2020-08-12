import React, { useState } from 'react'

import Button, { StyledButtonProps } from './Button'
import Modal from './Modal'
import Loading from './Loading'

interface PrintButtonProps extends StyledButtonProps {
  title?: string
  afterPress?: () => void
}

const PrintButton = ({
  title,
  afterPress,
  children,
  ...rest
}: React.PropsWithChildren<PrintButtonProps>) => {
  const [isPrinting, setIsPrinting] = useState(false)

  const print = async () => {
    setIsPrinting(true)
    setTimeout(() => {
      setIsPrinting(false)
    }, 3000)
    const documentTitle = document.title
    if (title) {
      document.title = title
    }
    if (afterPress) {
      window.setTimeout(afterPress, 2000)
    }
    await (window.kiosk ?? window).print()
    if (title) {
      document.title = documentTitle
    }
  }

  return (
    <React.Fragment>
      <Button onPress={print} {...rest}>
        {children}
      </Button>
      <Modal
        isOpen={isPrinting}
        centerContent
        content={<Loading>Printing</Loading>}
      />
    </React.Fragment>
  )
}

export default PrintButton
