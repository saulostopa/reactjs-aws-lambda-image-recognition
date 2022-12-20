import React from 'react'
import './header.css'
import logo from './../../images/logo.svg'; // with import

export interface HeaderProps {
  user?: {}
}

export const Header: React.FC<HeaderProps> = ({
  user
}) => (
  <header>
    <div className='wrapper'>
      <div>
          <img src={logo} alt={'Logo'} />
          <h1>Saulo Stopa</h1>
      </div>
    </div>
  </header>
)