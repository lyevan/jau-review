import React, { ReactNode } from 'react'

interface Props {
    className ?: string
    children : ReactNode
}
const Section = ({className, children} : Props) => {
  return (
    <section className={`py-[4.8rem] px-[2.4rem] md:py-[8rem] md:px-[4.8rem] xl:p-[10rem] ${className || ""}`}>{children}</section>
 
  )
}

export default Section