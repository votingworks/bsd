import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams, useHistory } from 'react-router-dom'
import pluralize from 'pluralize'

import Prose from '../components/Prose'
import {
  ReviewBallot,
  ProblemBallot
} from '../config/types'
import fetchJSON from '../util/fetchJSON'
import Main, { MainChild } from '../components/Main'
import ButtonBar from '../components/ButtonBar'
import Brand from '../components/Brand'
import Button from '../components/Button'
import PrintButton from '../components/PrintButton'
import LinkButton from '../components/LinkButton'
import Text from '../components/Text'

import { fetchBallotInfo } from '../api/hmpb'

const BallotReviewColumns = styled.div`
    display: flex;
    flex-direction: row;
    > div {
    flex: 1;
    }
    > div:first-child {
    margin-right: 0.5rem;
    min-width: 50%;
    }
    > div:last-child {
    margin-left: 0.5rem;
    }
`

const BallotImageContainer = styled.div`
    position: relative;
    img {
    display: block;
    }
`

export interface Props {
  problemBallot: ProblemBallot
  doContinue: () => void
}

export default function ProblemBallotScreen({
  problemBallot,
  doContinue
}: Props) {
  const history = useHistory()
  const [ballot, setBallot] = useState<ReviewBallot|undefined>()

  useEffect(() => {
    ;(async () => {
      setBallot(await fetchBallotInfo(problemBallot.ballotId.toString()))
    })()
  })

  if (!ballot) {
    return (
      <React.Fragment>
        <Main>
          <MainChild maxWidth={false}>
            <Prose maxWidth={false}>
              <p>Loading problem ballot…</p>
            </Prose>
          </MainChild>
        </Main>
        <ButtonBar secondary naturalOrder separatePrimaryButton>
          <Brand>
            VxScan
          </Brand>
        </ButtonBar>
      </React.Fragment>
    )
  }

  const offScreenInstructions = (
    <div>
      <h2>This ballot has not been counted</h2>

      <p>
	It requires adjudication by the resolution board.
      </p>
      <p>
	Please remove it from the scanner and label it <b>Ballot #{problemBallot.ballotSeq}</b>.
      </p>
      <p>
	We'll now print a replacement ballot for the resolution board.
      </p>
      <PrintButton
        small
        primary
        afterPress={doContinue}
        title="Continue"
      >
	I've removed the ballot from the scanner.<br />
	Print Replacement Ballot &amp; Continue Scanning.
      </PrintButton>
    </div>
  )

  const onScreenInstructions = (
    <div>
      <h2>This ballot has not been counted</h2>

      <p>
	It requires adjudication by the resolution board.
      </p>
      <p>
	Please remove it from the scanner and label it <b>Ballot #{problemBallot.ballotSeq}</b>.
      </p>
      <p>
	At the end of scanning, you'll have the ability to adjudicate this ballot on screen.
      </p>
      <Button
        small
        primary
        onPress={doContinue}
        title="Continue"
      >
	I've removed the ballot from the scanner.<br />
	Continue Scanning.
      </Button>
    </div>
  )
  
  return (
    <React.Fragment>
      <Main>
	<BallotReviewColumns>
          <BallotImageContainer>
            <img
              src={ballot.ballot.image.url}
              alt="Scanned Ballot"
              width="100%"
            />
          </BallotImageContainer>
	  {onScreenInstructions}
	</BallotReviewColumns>
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>
          Problem Ballot
        </Brand>
	<div>&nbsp;</div>
      </ButtonBar>
    </React.Fragment>
  )
}
