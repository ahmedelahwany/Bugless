import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import {
  setCurrentIssue,
  setPrivateIssue,
  setSectionType,
  setCurrentProject,
  setActiveIndex,
} from "../../actions";
import md5 from "md5";

import IssueModal from "./IssueModal";

// prettier-ignore
import { Menu, Icon, Modal, Form, Input, Button, Label, Select} from "semantic-ui-react";

class Issues extends React.Component {
  state = {
    activeIssue: null,
    user: this.props.currentUser,
    issue: null,
    issues: [],
    issuesRef: firebase.database().ref("issues"),
    messagesRef: firebase.database().ref("messages"),
    usersRef: firebase.database().ref("users"),
    notifications: [],
    modal: false,
    firstLoad: true,
    childRemoved: false,
    type: 0,

    status: "",
    developer: "",
    project: "",
    priority: "",
    Itype: "",
    issueName: "",
    issueDetails: "",
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedIssues = [];
    let userRole;
    this.state.usersRef.child(this.state.user.uid).on("value", (snap) => {
      userRole = snap.val().role;
    });
    this.state.issuesRef.on("child_added", (snap) => {
      if (
        userRole === "Admin" &&
        snap.val().createdBy.id === this.state.user.uid
      ) {
        loadedIssues.push(snap.val());
      }
      if (
        userRole === "Developer" &&
        snap.val().assignedTo.key === this.state.user.uid
      ) {
        loadedIssues.push(snap.val());
      }
      this.setState({ issues: loadedIssues}, () => this.setFirstIssue());
      this.addNotificationListener(snap.key);
    });

    this.state.issuesRef.on("child_changed", (snap) => {
      var index = loadedIssues.findIndex((issue) => issue.id === snap.val().id);
      var editedIssue = snap.val();

      if (index !== -1) {
        if (
          (userRole === "Developer" &&
            snap.val().assignedTo.key === this.state.user.uid) ||
          userRole === "Admin"
        ) {
          loadedIssues.splice(index, 1);
          loadedIssues.splice(index, 0, editedIssue);
        } else {
          loadedIssues.splice(index, 1);
        }
      } else {
        if (
          userRole === "Developer" &&
          snap.val().assignedTo.key === this.state.user.uid
        ) {
          loadedIssues.push(snap.val());
        }
      }
      this.setState({ issues: loadedIssues });

      if(this.state.issue.id === editedIssue.id &&  snap.val().assignedTo.key !== this.state.user.uid) {
        this.setState({firstLoad : true});
        this.setFirstIssue();
      }
    });
  };

  addNotificationListener = (issueId) => {
    this.state.messagesRef.child(issueId).on("value", (snap) => {
      if (this.state.issue) {
        this.handleNotifications(
          issueId,
          this.state.issue.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (issueId, currentIssueId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      (notification) => notification.id === issueId
    );

    if (index !== -1) {
      if (issueId !== currentIssueId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: issueId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }

    this.setState({ notifications });
  };

  removeListeners = () => {
    this.state.issuesRef.off();
    this.state.issues.forEach((issue) => {
      this.state.messagesRef.child(issue.id).off();
    });
  };

  setFirstIssue = () => {
    const firstIssue = this.state.issues[0];
    if (
      (this.state.firstLoad && this.state.issues.length > 0) ||
      
      this.state.issues.length === 1
    ) {
      this.props.setCurrentIssue(firstIssue);
      this.setActiveIssue(firstIssue);
      this.setState({ issue: firstIssue });
    }
    this.setState({
      firstLoad: false,
    });
  };

  addIssue = (state) => {
    console.log(state);
    const {
      issuesRef,
      issueName,
      issueDetails,
      developer,
      Itype,
      status,
      project,
      developerKey,
      priority,
      usersRef,
      projectName,
    } = state;

    const { user } = this.state;

    const key = issuesRef.push().key;

    const newIssue = {
      id: key,
      name: issueName,
      details: issueDetails,
      type: Itype,
      project,
      projectName,
      priority,
      status,
      assignedTo: {
        key: developerKey,
        name: developer,
      },
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
        id: user.uid,
      },
      developer: developer,
      DateCreated: new Date(Date.now()).toString(),
    };

    issuesRef
      .child(key)
      .update(newIssue)
      .then(() => {
        this.setState({
          issueName: "",
          issueDetails: "",
          priority: "",
          status: "",
          developer: "",
          Itype: "",
        });
        this.closeModal();
        console.log("issue added");
      })
      .catch((err) => {
        console.error(err);
      });

    usersRef.child(`${this.state.user.uid}/issues`).update({
      [key]: {
        name: issueName,
        details: issueDetails,
        createdBy: {
          name: user.displayName,
          avatar: user.photoURL,
          id: user.uid,
        },
      },
    });
  };

  handleSubmit = (event, state) => {
    event.preventDefault();
    const { type } = this.state;
    if (this.isFormValid(state)) {
      if (type === 2) {
        this.addIssue(state);
      }
    }
  };

  changeIssue = (issue) => {
    this.setActiveIssue(issue);

    this.clearNotifications();
    this.props.setCurrentIssue(issue);
    this.props.setCurrentProject(null);
    this.props.setPrivateIssue(false);
    this.props.setActiveIndex("Collaboration Tool");
    this.props.setSectionType(true);
    this.setState({ issue });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.issue.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total =
        this.state.notifications[index].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  setActiveIssue = (issue) => {
    this.setState({ activeIssue: issue });
  };

  getNotificationCount = (issue) => {
    let count = 0;

    this.state.notifications.forEach((notification) => {
      if (notification.id === issue.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  displayIssues = (issues) => {
    if (issues.length > 0 && this.state.activeIssue) {
      return issues.map((issue) => (
        <Menu.Item
          key={issue.id}
          onClick={() => this.changeIssue(issue)}
          name={issue.name}
          style={{ opacity: 0.7 }}
          active={issue.id === this.state.activeIssue.id}
        >
          {this.getNotificationCount(issue) && (
            <Label color="red">{this.getNotificationCount(issue)}</Label>
          )}
          # {issue.name}
        </Menu.Item>
      ));
    }
  };

  isFormValid = ({
    issueName,
    issueDetails,
    priority,
    Itype,
    status,
    project,
    developer,
  }) => {
    return (
      issueName &&
      issueDetails &&
      priority !== "" &&
      Itype !== "" &&
      status !== "" &&
      project !== "" &&
      developer !== ""
    );
  };

  openModal = () => this.setState({ modal: true, type: 2 });

  closeModal = () => this.setState({ modal: false, type: 0 });

  render() {
    const {
      issues,
      modal,
      type,
      issueName,
      issueDetails,
      Itype,
      project,
      developer,
      priority,
      status,
    } = this.state;
    const { isPrivateIssue } = this.props;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> ISSUES
            </span>{" "}
            ({issues.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          <div style={{ overflowY: "scroll", minHeight: 150, maxHeight: 150 }}>
            {this.displayIssues(issues)}
          </div>
        </Menu.Menu>
        <IssueModal
          key={md5(
            issueName +
              issueDetails +
              project +
              developer +
              type +
              priority +
              status +
              Itype
          )}
          modal={modal}
          type={type}
          closeModal={this.closeModal}
          handleSubmit={(event, state) => this.handleSubmit(event, state)}
          issueName={issueName}
          issueDetails={issueDetails}
          Itype={Itype}
          project={project}
          developer={developer}
          priority={priority}
          status={status}
          currentUser={this.state.user}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, {
  setCurrentIssue,
  setPrivateIssue,
  setSectionType,
  setCurrentProject,
  setActiveIndex,
})(Issues);
