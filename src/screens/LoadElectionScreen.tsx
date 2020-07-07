import { getPrecinctById } from '@votingworks/ballot-encoder'
import React, { useState } from 'react'
import { patch as patchConfig } from '../api/config'
import ElectionConfiguration from '../components/ElectionConfiguration'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Screen from '../components/Screen'
import { SetElection } from '../config/types'
import { readBallotPackage } from '../util/ballot-package'
import { addTemplates } from '../api/hmpb'

interface Props {
  setElection: SetElection
}

const LoadElectionScreen = ({ setElection }: Props) => {
  const [
    currentUploadingBallotIndex,
    setCurrentUploadingBallotIndex,
  ] = useState(-1)
  const [totalTemplates, setTotalTemplates] = useState(0)
  const [currentUploadingBallot, setCurrentUploadingBallot] = useState<{
    ballotStyle: string
    precinct: string
    isLiveMode: boolean
    locales?: string
  }>()

  const onDrop = (acceptedFiles: readonly File[]) => {
    if (acceptedFiles.length === 1) {
      const file = acceptedFiles[0]
      const isElectionJSON = file.type === 'application/json'
      const reader = new FileReader()

      if (isElectionJSON) {
        reader.onload = async () => {
          const election = JSON.parse(reader.result as string)
          await patchConfig({ election })
          setElection(election)
        }

        reader.readAsText(file)
      } else {
        readBallotPackage(file).then(async (pkg) => {
          addTemplates(pkg)
            .on('configuring', () => {
              setCurrentUploadingBallotIndex(0)
              setTotalTemplates(pkg.ballots.length)
            })
            .on('uploading', (_pkg, ballot) => {
              const { locales } = ballot.ballotConfig
              setCurrentUploadingBallot({
                ballotStyle: ballot.ballotConfig.ballotStyleId,
                precinct:
                  getPrecinctById({
                    election: pkg.election,
                    precinctId: ballot.ballotConfig.precinctId,
                  })?.name ?? ballot.ballotConfig.precinctId,
                isLiveMode: ballot.ballotConfig.isLiveMode,
                locales: locales?.secondary
                  ? `${locales.primary} / ${locales.secondary}`
                  : locales?.primary,
              })
              setCurrentUploadingBallotIndex(pkg.ballots.indexOf(ballot))
            })
            .on('completed', () => {
              setElection(pkg.election)
            })
        })

        reader.readAsArrayBuffer(file)
      }
    }
  }
  if (totalTemplates > 0 && currentUploadingBallot) {
    return (
      <Screen>
        <Main noPadding>
          <MainChild center padded>
            <Prose textCenter>
              <h1>
                Uploading ballot package {currentUploadingBallotIndex + 1} of{' '}
                {totalTemplates}
              </h1>
              <ul style={{ textAlign: 'left' }}>
                <li>
                  <strong>Ballot Style:</strong>{' '}
                  {currentUploadingBallot.ballotStyle}
                </li>
                <li>
                  <strong>Precinct:</strong> {currentUploadingBallot.precinct}
                </li>
                <li>
                  <strong>Test Ballot:</strong>{' '}
                  {currentUploadingBallot.isLiveMode ? 'No' : 'Yes'}
                </li>
                <li>
                  <strong>Languages:</strong>{' '}
                  {currentUploadingBallot.locales ?? <em>(unknown)</em>}
                </li>
              </ul>
            </Prose>
          </MainChild>
        </Main>
      </Screen>
    )
  }

  return <ElectionConfiguration acceptFiles={onDrop} />
}

export default LoadElectionScreen
