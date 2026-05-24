import { Outlet } from 'react-router-dom';

import NavbarComponent from './NavbarComponent';
import FooterComponent from './FooterComponent';

function LayoutComponent() {
  return (
    <>
      <NavbarComponent/>
        <Outlet />
      <FooterComponent />
    </>
  );
}

export default LayoutComponent;