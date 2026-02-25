import { Button } from "react-bootstrap";

import { Icon } from "./icon";

export function Login({ logIn }: { logIn: (clientId: string) => Promise<void> }) {
  return (
    <form
      className="login-container"
      onSubmit={(event) => {
        event.preventDefault();
        void logIn((event.currentTarget.elements.namedItem("clientId") as HTMLInputElement).value);
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
