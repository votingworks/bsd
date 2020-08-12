import styled from 'styled-components'

const Screen = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    @media print {
    display: none;
    }
`

export default Screen
