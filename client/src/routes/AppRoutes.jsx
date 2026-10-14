import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import Home from '../pages/Home/Home'
import Explore from '../pages/Explore/Explore'
import Villages from '../pages/Villages/Villages'
import VillageDetail from '../pages/VillageDetail/VillageDetail'
import HeritageDetail from '../pages/HeritageDetail/HeritageDetail'
import MapPage from '../pages/Map/MapPage'
import Stories from '../pages/Stories/Stories'
import StoryDetail from '../pages/Stories/StoryDetail'
import Events from '../pages/Events/Events'
import EventDetail from '../pages/Events/EventDetail'
import Contribution from '../pages/Contribution/Contribution'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Profile from '../pages/Profile/Profile'
import Bookmarks from '../pages/Bookmarks/Bookmarks'
import Notifications from '../pages/Notifications/Notifications'
import AskPage from '../pages/Ask/AskPage'
import About from '../pages/About/About'
import NotFound from '../pages/NotFound/NotFound'
const Gallery = lazy(() => import('../pages/Gallery/Gallery'))
const Trail = lazy(() => import('../pages/Trail/Trail'))
const Insights = lazy(() => import('../pages/Insights/Insights'))
const Announcements = lazy(() => import('../pages/Admin/Announcements'))
const Playlists = lazy(() => import('../pages/Playlists/Playlists'))
const PlaylistView = lazy(() => import('../pages/Playlists/PlaylistView'))
const Poster = lazy(() => import('../pages/Poster/Poster'))
const Contributors = lazy(() => import('../pages/Contributors/Contributors'))
const ContributorProfile = lazy(() => import('../pages/Contributors/ContributorProfile'))
import ForgotPassword from '../pages/Password/ForgotPassword'
import ResetPassword from '../pages/Password/ResetPassword'
import Terms from '../pages/Legal/Terms'
import Privacy from '../pages/Legal/Privacy'
const pick = (name) => lazy(() => import('../pages/Admin/AdminPages').then((m) => ({ default: m[name] })))
const Dashboard = pick('Dashboard')
const ContributionReview = pick('ContributionReview')
const ReportsAdmin = pick('ReportsAdmin')
const TableAdmin = pick('TableAdmin')

export default function AppRoutes() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: '2rem' }}>Loading...</p>}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="villages" element={<Villages />} />
        <Route path="villages/:slug" element={<VillageDetail />} />
        <Route path="heritage/:slug" element={<HeritageDetail />} />
        <Route path="map" element={<MapPage />} />
        <Route path="stories" element={<Stories />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="trail" element={<Trail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="stories/:slug" element={<StoryDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:slug" element={<EventDetail />} />
        <Route path="heritage/:slug/poster" element={<Poster />} />
        <Route path="contribute" element={<Contribution />} />
        <Route path="contribute/:id/edit" element={<Contribution />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="playlists/:code" element={<PlaylistView />} />
        <Route path="contributors" element={<Contributors />} />
        <Route path="contributors/:id" element={<ContributorProfile />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="about" element={<About />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="contributions" element={<ContributionReview />} />
        <Route path="reports" element={<ReportsAdmin />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path=":section" element={<TableAdmin />} />
      </Route>
    </Routes>
    </Suspense>
  )
}
