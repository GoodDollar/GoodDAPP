import React from 'react'
import styled from 'styled-components'

const AppNoticeBanner = styled.div`
display: flex;
justify-content: center;
padding-top: 20px;
padding-left: 10px;
padding-bottom: 20px;
background-color: #f8af40;
font-size: 18px;
line-height: 1.2;
font-family: 'Roboto',sans-serif;
font-weight: 700;
font-style: normal;
text-decoration: none;
color: #0c263d;
`

const AppNoticeLink = styled.a`
  color: blue;
  padding-left: 10px;
`

export type AppNoticeProps = {
  text: string,
  link?: string,
  show?: boolean
}

function AppNotice(props: AppNoticeProps): JSX.Element {
  return (
    <>
      { props.show && (
        <AppNoticeBanner>
          {props.text} 
            <AppNoticeLink href={props.link} 
              target="_blank" 
              rel="noreferrer"> → (read more) </AppNoticeLink>
        </AppNoticeBanner>)}
    </>
  )
}

export default AppNotice