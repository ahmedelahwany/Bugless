import { connect } from "react-redux";
import Messages from "./MainScreen/Messages";
import "./App.css";
import MetaPanel from "./MetaPanel/MetaPanel";
import { Grid } from "semantic-ui-react";
import SidePanel from "./SidePanel/SidePanel";
import React from "react";
import ColorPanel from "./ColorPanel/ColorPanel";

const App = ({
  currentUser,
  currentIssue,
  isPrivateIssue,
  userPosts,
  primaryColor,
  secondaryColor,
  activeIndex,
  currentProject,
  isSectionType,
}) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    <ColorPanel
      key={currentUser && currentUser.name}
      currentUser={currentUser}
    />
    <SidePanel
      primaryColor={primaryColor}
      currentUser={currentUser}
      key={currentUser && currentUser.uid}
      isPrivateIssue={isPrivateIssue}
      currentProject={currentProject}
    />

    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages
        isSectionType={isSectionType}
        currentIssue={currentIssue}
        currentProject={currentProject}
        key={(currentIssue && currentIssue.id) || ( currentProject && currentProject.id)}
        currentUser={currentUser}
        isPrivateIssue={isPrivateIssue}
        activeIndex={activeIndex}
      />
    </Grid.Column>

    <Grid.Column width={4} style={{ zIndex: 3 }}>
      <MetaPanel
        isSectionType = {isSectionType}
        currentProject = {currentProject}
        isPrivateIssue={isPrivateIssue}
        key={(currentIssue && currentIssue.id) || ( currentProject && currentProject.id)}
        currentIssue={currentIssue}
        userPosts={userPosts}
      />
    </Grid.Column>
  </Grid>
);

const mapStateToProps = (state) => ({
  primaryColor: state.colors.primaryColor,
  currentUser: state.user.currentUser,
  userPosts: state.issue.userPosts,
  isPrivateIssue: state.issue.isPrivateIssue,
  currentIssue: state.issue.currentIssue,
  currentProject: state.project.currentProject,
  secondaryColor: state.colors.secondaryColor,
  activeIndex: state.Navigation.activeIndex,
  isSectionType: state.issue.isSectionType,
});

export default connect(mapStateToProps)(App);
