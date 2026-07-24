import { AuthLayout } from "../../components/layout/AuthLayout";
import { LeftPanel } from "../../components/auth/LeftPanel";
import { LoginForm } from "../../components/auth/LoginForm";

export function Login() {
  return (
    <AuthLayout
      left={<LeftPanel />}
      right={<LoginForm />}
    />
  );
}
