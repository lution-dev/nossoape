import { Outlet } from "react-router"

// TODO: 🔒 REATIVAR AUTH GUARD QUANDO TUDO ESTIVER PRONTO
// Substituir este componente pelo PrivateRoute real que verifica:
// - isAuthenticated → redirect /login
// - !profile || !board → redirect /onboarding
// O código original está em: src/features/auth/components/PrivateRoute.real.tsx

export function PrivateRoute() {
  // Auth bypass ativo — acesso livre ao app
  return <Outlet />
}
