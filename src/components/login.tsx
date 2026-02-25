import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

import { login } from "~/helpers/data/api";

import { Icon } from "./icon";

export function Login() {
  return (
    <form
      className="login-container"
      onSubmit={(event) => {
        event.preventDefault();

        login((event.currentTarget.elements.namedItem("clientId") as HTMLInputElement).value).catch(() => {
          toast.error("Failed to login. Something went wrong!");
        });
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
