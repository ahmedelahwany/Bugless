import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import {
  setCurrentIssue,
  setPrivateIssue,
  setCurrentProject,
  setSectionType,
  setActiveIndex
} from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class DirectMessages extends React.Component {
  state = {
    activeIssue: "",
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    presenceRef: firebase.database().ref("presence"),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  };

  addListeners = (currentUserUid) => {
    let loadedUsers = [];
    this.state.usersRef.on("child_added", (snap) => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    this.state.presenceRef.on("child_added", (snap) => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on("child_removed", (snap) => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = (user) => user.status === "online";

  changeIssue = (user) => {
    const issueId = this.getIssueId(user.uid);
    const issueData = {
      id: issueId,
      name: user.name,
    };
    this.props.setCurrentIssue(issueData);
    this.props.setCurrentProject(null);
    this.props.setPrivateIssue(true);
    this.props.setSectionType(true);
    this.props.setActiveIndex("Collaboration Tool")
    this.setActiveIssue(user.uid);
  };

  getIssueId = (userId) => {
    const currentUserId = this.state.user.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  setActiveIssue = (userId) => {
    this.setState({ activeIssue: userId });
  };

  render() {
    const { users, activeIssue } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> PRIVATE MESSAGES
          </span>{" "}
          ({users.length})
        </Menu.Item>
        <div style={{ overflowY: "scroll", minHeight: 100, maxHeight: 150 }}>
          {users.map((user) => (
            <Menu.Item
              key={user.uid}
              active={user.uid === activeIssue}
              onClick={() => this.changeIssue(user)}
              style={{ opacity: 0.7, fontStyle: "italic" }}
            >
              <Icon
                name="circle"
                color={this.isUserOnline(user) ? "green" : "red"}
              />
              @ {user.name}
            </Menu.Item>
          ))}
        </div>
      </Menu.Menu>
    );
  }
}

export default connect(null, {
  setCurrentIssue,
  setPrivateIssue,
  setCurrentProject,
  setSectionType,
  setActiveIndex
})(DirectMessages);
