import { Button } from 'react-bootstrap';
import Icon from './Icon';

export default function Logout() {
  const handleClick = () => {
    window.location.href = `${
      window.location.href.split('#')[0]
    }?change_user=true`;
  };

  return (
    <Button
      id="logoutButton"
      type="submit"
      variant="link"
      size="lg"
      onClick={handleClick}
      title="Change user"
    >
      <Icon size="large">logout</Icon>
    </Button>
  );
}
