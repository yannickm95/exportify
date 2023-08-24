import { Button } from 'react-bootstrap';

import { logout } from 'helpers/data/api';

import { Icon } from './Icon';

export function Logout() {
  return (
    <Button id="logoutButton" type="submit" variant="link" size="lg" onClick={logout} title="Change user">
      <Icon size="large">logout</Icon>
    </Button>
  );
}
