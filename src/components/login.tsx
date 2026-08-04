import { Button } from "./button";
import { CheckCircleOutlineIcon } from "./icon";

export function Login({ logIn }: { logIn: (clientId: string) => Promise<void> }) {
  return (
    <form
      className="mx-auto flex max-w-md flex-col items-stretch justify-center gap-4 sm:max-w-none sm:flex-row sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        void logIn((event.currentTarget.elements.namedItem("clientId") as HTMLInputElement).value);
      }}
    >
      <input
        id="clientId"
        required
        minLength={32}
        maxLength={32}
        type="password"
        className="h-12 w-full rounded-md border border-gray-500 bg-neutral-800 px-3 text-white placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 focus:outline-none sm:w-64"
        placeholder="Enter client id..."
      />

      <Button type="submit" variant="outline" size="large" className="w-full sm:w-44">
        <CheckCircleOutlineIcon />
        <span>Get Started</span>
      </Button>
    </form>
  );
}
