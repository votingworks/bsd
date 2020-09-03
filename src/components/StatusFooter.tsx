import React from 'react'
import styled from 'styled-components'
import { Election } from '@votingworks/ballot-encoder'

const StatusBar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #455a6433;
  color: #666666;
  font-size: 12px;
  padding: 8px;
`

export interface Props {
  election: Election
  electionHash?: string
}

const StatusFooter = ({ election, electionHash }: Props) => {
  return (
    <StatusBar>
      {election.title} {electionHash ? `(${electionHash.slice(0, 10)})` : ''}
    </StatusBar>
  )
}

export default StatusFooter
