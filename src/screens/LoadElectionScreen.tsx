import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

import Brand from '../components/Brand'
import ButtonBar from '../components/ButtonBar'
import USBController from '../components/USBController'
import Prose from '../components/Prose'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'
import Text from '../components/Text'
import { SetElection } from '../config/types'
import { readBallotPackage, BallotPackageEntry } from '../util/ballot-package'
import { patch as patchConfig } from '../api/config'

interface Props {
  setElection: SetElection
}

const LoadElectionConfigScreen = ({ setElection }: Props) => {
  const [
    currentUploadingBallotIndex,
    setCurrentUploadingBallotIndex,
  ] = useState(-1)
  const [totalTemplates, setTotalTemplates] = useState(0)
  const [currentUploadingBallot, setCurrentUploadingBallot] = useState<
    BallotPackageEntry
  >()

  const onDrop = (acceptedFiles: File[]) => {
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
          await patchConfig({ election: pkg.election })
          setCurrentUploadingBallotIndex(0)
          setTotalTemplates(pkg.ballots.length)

          for (const ballot of pkg.ballots) {
            setCurrentUploadingBallot(ballot)

            const body = new FormData()

            body.append(
              'ballots',
              new Blob([ballot.live], { type: 'application/pdf' })
            )

            body.append(
              'metadatas',
              new Blob(
                [
                  JSON.stringify({
                    precinctId: ballot.precinct.id,
                    ballotStyleId: ballot.ballotStyle.id,
                    isTestBallot: false,
                  }),
                ],
                { type: 'application/json' }
              )
            )

            body.append(
              'ballots',
              new Blob([ballot.test], { type: 'application/pdf' })
            )

            body.append(
              'metadatas',
              new Blob(
                [
                  JSON.stringify({
                    precinctId: ballot.precinct.id,
                    ballotStyleId: ballot.ballotStyle.id,
                    isTestBallot: true,
                  }),
                ],
                { type: 'application/json' }
              )
            )

            // eslint-disable-next-line no-await-in-loop
            await fetch('/scan/hmpb/addTemplates', { method: 'POST', body })
            setCurrentUploadingBallotIndex((prev) => prev + 1)
          }

          setElection(pkg.election)
        })

        reader.readAsArrayBuffer(file)
      }
    }
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ['application/json', 'application/zip'],
  })

  if (totalTemplates > 0 && currentUploadingBallot) {
    return (
      <Screen {...getRootProps()}>
        <Main noPadding>
          <MainChild center padded>
            <Prose textCenter>
              <h1>
                Uploading ballot package {currentUploadingBallotIndex + 1} of{' '}
                {totalTemplates}
              </h1>
              <p>
                {currentUploadingBallot.ballotStyle.id} /{' '}
                {currentUploadingBallot.precinct.name}
              </p>
            </Prose>
          </MainChild>
        </Main>
      </Screen>
    )
  }

  return (
    <Screen>
      <Main noPadding {...getRootProps()}>
        <MainChild center padded maxWidth={false}>
          <input {...getInputProps()} />
          <Prose textCenter>
            {isDragActive ? (
              <p>Drop files here…</p>
            ) : (
              <React.Fragment>
                <h1>Not Configured</h1>
                <Text narrow>
                  Insert Election Clerk card, drag and drop{' '}
                  <code>election.json</code> or ballot package <code>zip</code>{' '}
                  file here, or click to browse for file.
                </Text>
              </React.Fragment>
            )}
          </Prose>
        </MainChild>
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>VxScan</Brand>
        <USBController />
      </ButtonBar>
    </Screen>
  )
}

export default LoadElectionConfigScreen
