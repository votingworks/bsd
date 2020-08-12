import React from 'react'

import Brand from './Brand'
import ButtonBar from './ButtonBar'
import USBController from './USBController'

interface Props {
  children?: React.ReactNode
  title?: string
}

const MainNav = ({ children, title }: Props) => (
  <ButtonBar secondary naturalOrder>
    <Brand>VxScan{title && <span> / {title}</span>}</Brand>
    {children || <div />}
    <USBController />
  </ButtonBar>
)

export default MainNav
