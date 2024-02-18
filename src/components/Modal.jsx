import React, {useState} from 'react'

export default function Modal(props) {
    document.onkeydown = (e) => {
        if( e.key === "Escape") {
            props.onClose()
        }
    }
  return (
    <div className={`modal ${props.show ? 'fixed' : 'hidden'}  ` }
        onClick={(e) => {
            props.onClose()
        }}
    >
        <div 
        onClick={(e) => {
            e.stopPropagation()
        }}
        className="modalDialog max-w-7xl">
            {props.content}
        </div>
    </div>
  )
}
