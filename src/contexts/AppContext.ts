import { createContext, RefObject } from 'react'

interface AppContextInterface {
  printBallotRef?: RefObject<HTMLElement>
}

const appContext: AppContextInterface = {
  printBallotRef: undefined,
}

const AppContext = createContext(appContext)

export default AppContext
