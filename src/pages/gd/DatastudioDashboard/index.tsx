import React from 'react'
import styled from 'styled-components'

const DASHBOARD_URL =
    process.env.REACT_APP_DATASTUDIO_DASHBOARD_URL ||
    'https://datastudio.google.com/embed/reporting/f1ce8f56-058c-4e31-bfd4-1a741482642a'

const Wrapper = styled.div`
    width: 100%;
    margin-top: -2.5rem;

    @media only screen and (max-width: 768px) {
        margin-top: -2rem;
    }

    @media only screen and (max-width: 480px) {
        margin-top: -1rem;
    }
`

export default function DatastudioDashboard(): JSX.Element {
    return (
        <Wrapper>
            <iframe
                title="Datastudio Dashboard"
                width="100%"
                height="924"
                src={DASHBOARD_URL}
                frameBorder="0"
                style={{ border: 'none' }}
                allowFullScreen
            ></iframe>
        </Wrapper>
    )
}
