import { BrowserRouter, Routes, Route } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { PrivateRoute } from "@/features/auth/components/PrivateRoute"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { SearchPage } from "@/features/search/pages/SearchPage"
import { ProfilePage } from "@/features/profile/pages/ProfilePage"
import { PropertyDetailPage } from "@/features/property-detail/pages/PropertyDetailPage"
import { EditPropertyPage } from "@/features/property-detail/pages/EditPropertyPage"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { OnboardingPage } from "@/features/auth/pages/OnboardingPage"

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes: PrivateRoute → AppShell → Pages */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/property/:id/edit" element={<EditPropertyPage />} />
          </Route>
        </Route>

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
