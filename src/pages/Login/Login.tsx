import { AuthLayout } from "../../components/layout/AuthLayout";
import { LeftPanel } from "../../components/auth/LeftPanel";
import { LoginForm } from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <AuthLayout
      left={<LeftPanel />}
      right={<LoginForm />}
    />
  );
}