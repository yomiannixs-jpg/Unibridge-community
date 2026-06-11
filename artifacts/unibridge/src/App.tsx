import { Switch, Route, Router as WouterRouter } from "wouter";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Community from "@/pages/community";
import PostDetail from "@/pages/post-detail";
import NewPost from "@/pages/new-post";
import Messages from "@/pages/messages";
import Resources from "@/pages/resources";
import SavedPosts from "@/pages/saved-posts";
import NotificationsPage from "@/pages/notifications";
import SearchPage from "@/pages/search";
import Moderation from "@/pages/moderation";
import ModerationUsers from "@/pages/moderation-users";
import ModerationReports from "@/pages/moderation-reports";
import ModerationModerators from "@/pages/moderation-moderators";
import ModerationSafety from "@/pages/moderation-safety";
import ModerationAuto from "@/pages/moderation-auto";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import Profile from "@/pages/profile";

function App() {
  return (
    <WouterRouter>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/hubs" component={Community} />
          <Route path="/communities" component={Community} />
          <Route path="/community" component={Community} />
          <Route path="/d/:slug" component={Community} />
          <Route path="/posts/:id" component={PostDetail} />
          <Route path="/create" component={NewPost} />
          <Route path="/new-post" component={NewPost} />
          <Route path="/messages" component={Messages} />
          <Route path="/resources" component={Resources} />
          <Route path="/saved" component={SavedPosts} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/moderation" component={Moderation} />
          <Route path="/moderation/users" component={ModerationUsers} />
          <Route path="/moderation/reports" component={ModerationReports} />
          <Route path="/moderation/moderators" component={ModerationModerators} />
          <Route path="/moderation/safety" component={ModerationSafety} />
          <Route path="/moderation/auto" component={ModerationAuto} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/login" component={AuthPage} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </WouterRouter>
  );
}

export default App;
