import { Button } from 'react-bootstrap';

import { login } from 'helpers/data/api';

import { Icon } from './Icon';

export function Login() {
  return (
    <form
      className="login-container"
      onSubmit={(event: any) => {
        event.preventDefault();

        const {
          clientId: { value: clientId },
        } = event.target.elements;

        login(clientId);
      }}
    >
      <input id="clientId" required minLength={32} maxLength={32} type="password" placeholder="Enter client id..." />

      <Button type="submit" variant="outline-secondary" size="lg" className="flex">
        <Icon>check_circle_outline</Icon>
        <span>Get Started</span>
      </Button>
    </form>
  );
}
