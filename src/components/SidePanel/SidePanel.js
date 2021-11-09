import React from "react";
import { Menu, Segment } from "semantic-ui-react";

import UserPanel from "./UserPanel";
import Issues from "./Issues";
import Projects from "./Projects";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends React.Component {
  render() {
    const {
      currentUser,
      primaryColor,
      isPrivateIssue,
    } = this.props;

    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{
          background: primaryColor,
          height: "100vh",
          overflowY: "scroll",
          overflowX: "hidden",
          fontSize: "1.1rem",
          zIndex: 999,
        }}
      >
        <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
        <Starred currentUser={currentUser} />

        <Issues
          currentUser={currentUser}
          isPrivateIssue={isPrivateIssue}
        />

        <Projects currentUser={currentUser} />

        <DirectMessages currentUser={currentUser} />
      </Menu>
    );
  }
}

export default SidePanel;
