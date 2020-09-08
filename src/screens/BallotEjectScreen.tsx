import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { AdjudicationReason } from '@votingworks/ballot-encoder'
import { fetchNextBallotSheetToReview } from '../api/hmpb'
import { BallotSheetInfo } from '../config/types'

import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Button from '../components/Button'
import MainNav from '../components/MainNav'
import Screen from '../components/Screen'

const Columns = styled.div`
  display: flex;
  > div {
    margin-right: 1em;
    &:first-child {
      flex: 1;
    }
    &:last-child {
      margin-right: 0;
    }
    img {
      max-width: 100%;
      height: 83vh;
    }
  }
`

const RectoVerso = styled.div`
  display: flex;
  & > * {
    &:first-child {
      margin-right: 1em;
    }
  }
  img {
    max-width: 100%;
    height: 83vh;
  }
`

interface Props {
  continueScanning: (override?: boolean) => void
}

const BallotEjectScreen = ({ continueScanning }: Props) => {
  const [sheetInfo, setSheetInfo] = useState<BallotSheetInfo | undefined>()

  useEffect(() => {
    ;(async () => {
      setSheetInfo(await fetchNextBallotSheetToReview())
    })()
  }, [setSheetInfo])

  if (!sheetInfo) {
    return null
  }

  let isOvervotedSheet = false
  let isBlankSheet = false
  let isUnreadableSheet = false

  for (const { interpretation } of [sheetInfo.front, sheetInfo.back]) {
    if (interpretation.type === 'InterpretedHmpbPage') {
      if (interpretation.adjudicationInfo.requiresAdjudication) {
        for (const { type } of interpretation.adjudicationInfo.allReasonInfos) {
          if (interpretation.adjudicationInfo.enabledReasons.includes(type)) {
            if (type === AdjudicationReason.Overvote) {
              isOvervotedSheet = true
            } else if (type === AdjudicationReason.BlankBallot) {
              isBlankSheet = true
            }
          }
        }
      }
    } else {
      isUnreadableSheet = true
    }
  }

  return (
    <Screen>
      <MainNav>
        <Button small onPress={() => continueScanning(true)}>
          Override
        </Button>
        <Button small onPress={() => continueScanning()}>
          Continue Scanning Batch
        </Button>
      </MainNav>
      <Main>
        <MainChild maxWidth={false}>
          <Columns>
            <Prose maxWidth={false}>
              <h1>Remove This Sheet</h1>
              <p>
                Human review is required for this last scanned sheet.{' '}
                <strong>This sheet was not tabulated.</strong>
              </p>
              <p>
                {isUnreadableSheet ? (
                  <span>This sheet was unreadable by the scanner.</span>
                ) : isOvervotedSheet ? (
                  <span>
                    This ballot sheet contains an <strong>overvote</strong>.
                  </span>
                ) : isBlankSheet ? (
                  <span>
                    This ballot sheet is <strong>blank</strong> and has no
                    votes.
                  </span>
                ) : (
                  <span>Reason could not be determined.</span>
                )}
              </p>
              <p>
                Once this ballot has been removed, press the button to continue
                scanning.
              </p>
            </Prose>
            <RectoVerso>
              <Prose>
                <h4>Front</h4>
                <p>
                  <img src={sheetInfo.front.image.url} alt="p1" />
                </p>
              </Prose>
              <Prose>
                <h4>Back</h4>
                <p>
                  <img src={sheetInfo.back.image.url} alt="p2" />
                </p>
              </Prose>
            </RectoVerso>
          </Columns>
        </MainChild>
      </Main>
    </Screen>
  )
}
export default BallotEjectScreen
