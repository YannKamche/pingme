import "./App.css";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

function App() {
  return (
    <>
      <h1>Hello world</h1>

      <Show when="signed-out">
        <SignInButton mode="modal" />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}

export default App;
