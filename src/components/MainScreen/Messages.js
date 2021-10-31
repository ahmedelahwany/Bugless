import MessagesHeader from "./MessagesHeader";
import React from "react";
import Skeleton from "./Skeleton";
import { connect } from "react-redux";
import { Segment, Comment, Button } from "semantic-ui-react";
import firebase from "../../firebase";
import { setUserPosts, setActiveIndex } from "../../actions";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Navigation from "./Navigation";
import ChangeLog from "./ChangeLog";
import Uploads from "./Uploads";
import ProjectDashboard from "./ProjectDashboard";
import ProjectIssues from "./ProjectIssues";

import IssueModal from "../SidePanel/IssueModal";

import ProjectModal from "../SidePanel/ProjectModal";

import md5 from "md5";

class Messages extends React.Component {
  state = {
    searchLoading: false,
    searchResults: [],
    user: this.props.currentUser,
    searchTerm: "",
    messages: [],
    issue: this.props.currentIssue,
    currentproject: this.props.currentProject,
    usersRef: firebase.database().ref("users"),
    issuesRef: firebase.database().ref("issues"),
    projectsRef: firebase.database().ref("projects"),
    changeLogsRef: firebase.database().ref("changeLogs"),
    numUniqueUsers: "",
    isIssueStarred: false,
    messagesLoading: true,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    privateIssue: this.props.isPrivateIssue,
    messagesRef: firebase.database().ref("messages"),
    listeners: [],
    activeItem: this.props.activeIndex,
    sectionType: this.props.isSectionType,
    type: 0,
    modal: false,
    // issue Details
    status: "",
    developer: "",
    project: "",
    priority: "",
    Itype: "",
    issueName: "",
    issueDetails: "",
    projectName: "",
    developerKey: "",
    oldIssueVal: {},

    // projectDetails
    projectNameMod: "",
    projectDetails: "",
    developers: [],
  };

  componentDidMount() {
    const { issue, user, listeners } = this.state;
    if (issue && user) {
      this.removeListeners(listeners);
      this.addListeners(issue.id);
      this.addUserStarsListener(issue.id, user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
  }

  removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
    // this.state.issuesRef.off();
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  addListeners = (issueId) => {
    this.addMessageListener(issueId);
    this.state.issuesRef.on("child_changed", (snap) => {
      var editedIssue = snap.val();
      this.setState({ issue: editedIssue });
    });
  };

  addUserStarsListener = (issueId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then((data) => {
        if (data.val() !== null) {
          const issueIds = Object.keys(data.val());
          const prevStarred = issueIds.includes(issueId);
          this.setState({ isIssueStarred: prevStarred });
        }
      });
  };
  addMessageListener = (issueId) => {
    this.props.setUserPosts([]);

    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(issueId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUserPosts(loadedMessages);
    });
    this.addToListeners(issueId, ref, "child_added");
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateIssue } = this.state;
    return privateIssue ? privateMessagesRef : messagesRef;
  };

  starIssue = () => {
    if (this.state.isIssueStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.issue.id]: {
          name: this.state.issue.name,
          details: this.state.issue.details,
          createdBy: {
            name: this.state.issue.createdBy.name,
            avatar: this.state.issue.createdBy.avatar,
          },
        },
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.issue.id)
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };
  handleStar = () => {
    this.setState(
      (prevState) => ({
        isIssueStarred: !prevState.isIssueStarred,
      }),
      () => this.starIssue()
    );
  };

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const issueMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = issueMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  displayIssueName = (issue) => {
    return issue ? `${this.state.privateIssue ? "@" : "#"}${issue.name}` : "";
  };

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
    this.props.setActiveIndex(name);
  };

  displayButtons(sectionType) {
    if (this.state.privateIssue) return null;
    return (
      <Button
        style={{
          marginBottom: 0,
          marginTop: 0,
          backgroundColor: "grey",
        }}
        labelPosition="left"
        primary
        fluid
        disabled={
          sectionType
            ? this.state.issue &&
              this.state.issue.createdBy.id !== this.state.user.uid
            : this.state.currentproject &&
              this.state.currentproject.createdBy.id !== this.state.user.uid
        }
        onClick={
          sectionType ? this.openModalEditIssue : this.openModalEditProject
        }
        content={sectionType ? "Edit Issue" : "Edit Project"}
        icon="edit"
      />
    );
  }

  displayMessageSkeleton = (loading) =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  // prettier-ignore
  EditIssue = (state) => {
      const {
        issueName,issueDetails,project, status, developerKey, developer, Itype, priority, projectName,
      } = state;
  
      const {issue , changeLogsRef , oldIssueVal , issuesRef} = this.state;
      const key = issue.id;
      issuesRef
        .child(key)
        .update({
          name: `${issueName}`, details: `${issueDetails}`, type: Itype, project: `${project}`, projectName: `${projectName}`, priority: priority, status: status,
          assignedTo: {
            key: `${developerKey}`,
            name: `${developer}`,
          },
          developer: `${developer}`,
        })
        .then(() => {
          console.log("issue updated");
        })
        .catch((err) => {
          console.error(err);
        });
      let Users = [];
  
      this.state.usersRef.once("value", (snapshot) => {
        snapshot.forEach((child) => {
          Users.push(child.key);
        });
      });
      Users.forEach((childUser) => {
        this.state.usersRef
          .child(`${childUser}`)
          .child(`starred`)
          .child(`${issue.id}`)
          .update({
            name: `${issueName}`, details: `${issueDetails}`,type: Itype,project: `${project}`,projectName: `${projectName}`,priority: priority,status: status,
            assignedTo: {
              key: `${developerKey}`,
              name: `${developer}`,
            },
          })
          .then(() => {
            console.log("starred Issue updated");
          })
          .catch((err) => {
            console.log(err);
          });
      });
     
      this.createChangeLog(
        oldIssueVal, issueName, issueDetails, Itype, project, projectName, priority, status, developer, developerKey
      ).forEach((log) => {
        changeLogsRef
          .child(key)
          .push()
          .set(log)
          .then(() => {
            this.setState({ oldIssueVal: {} });
            this.setState({
              issueName: "",issueDetails: "",priority: "",status: "",developer: "",developerKey: "",Itype: "",projectName: "",project: ""
            });
          })
          .catch((err) => {
            console.error(err);
          });
      });
      
      this.closeModal();
    };

  getTypeName = (id) => {
    if (id === 0) return "Bugs/Errors";
    if (id === 1) return "Features Requests";
    if (id === 2) return "Other Comments";
    if (id === 3) return "Training/Document Requests";
  };
  getStatusName = (id) => {
    if (id === 0) return "New";
    if (id === 1) return "Open";
    if (id === 2) return "In Progress";
    if (id === 3) return "Resolved";
  };
  getPriorityName = (id) => {
    if (id === 0) return "None";
    if (id === 1) return "Low";
    if (id === 2) return "Medium";
    if (id === 3) return "high";
  };

  // prettier-ignore
  createChangeLog = (
    oldIssueVal, issueName, issueDetails, Itype, project, projectName, priority, status, developer, developerKey
  ) => {
    let changeLogs = [];
    let currentTime = new Date(Date.now()).toString();
    console.log(currentTime);
    if (oldIssueVal.name !== issueName)
      changeLogs.push({
        id: md5(currentTime + "Name"),
        Property: 0,
        OldValue: oldIssueVal.name,
        NewValue: issueName,
        DateChanged: currentTime,
      });
    if (oldIssueVal.details !== issueDetails)
      changeLogs.push({
        id: md5(currentTime + "Details"),
        Property: 1,
        OldValue: oldIssueVal.details,
        NewValue: issueDetails,
        DateChanged: currentTime,
      });
    if (oldIssueVal.type !== Itype)
      changeLogs.push({
        id: md5(currentTime + "Type"),
        Property: 6,
        OldValue: this.getTypeName(oldIssueVal.type),
        NewValue: this.getTypeName(Itype),
        DateChanged: currentTime,
      });
    if (oldIssueVal.project !== project)
      changeLogs.push({
        id: md5(currentTime + "Project"),
        Property: 2,
        OldValue: oldIssueVal.projectName,
        NewValue: projectName,
        DateChanged: currentTime,
      });
    if (oldIssueVal.priority !== priority)
      changeLogs.push({
        id: md5(currentTime + "Priority"),
        Property: 4,
        OldValue: this.getPriorityName(oldIssueVal.priority),
        NewValue: this.getPriorityName(priority),
        DateChanged: currentTime,
      });
    if (oldIssueVal.status !== status)
      changeLogs.push({
        id: md5(currentTime + "status"),
        Property: 5,
        OldValue: this.getStatusName(oldIssueVal.status),
        NewValue: this.getStatusName(status),
        DateChanged: currentTime,
      });
    if (oldIssueVal.assignedTo.key !== developerKey)
      changeLogs.push({
        id: md5(currentTime + "developer"),
        Property: 3,
        OldValue: oldIssueVal.assignedTo.name,
        NewValue: developer,
        DateChanged: currentTime,
      });
    return changeLogs;
  };

  handleSubmit = (event, state) => {
    event.preventDefault();
    if (this.state.sectionType) {
      if (this.isFormValidIssue(state)) {
        this.EditIssue(state);
      }
    } else {
      if (this.isFormValidProject(state)) {
        this.EditProject(state);
      }
    }
  };

  // prettier-ignore

  isFormValidIssue = ({
    issueName,issueDetails, priority, Itype, status, project, developerKey,
  }) => {
    return (
      issueName && issueDetails && priority !== "" && Itype !== "" && status !== "" && project !== "" && developerKey !== ""
    );
  };

  isFormValidProject= ({ projectName, projectDetails, developers }) =>
    projectName && projectDetails && developers.length > 0;

  EditProject = (state) => {
    const { projectsRef, projectName, projectDetails, developers } = state;

    const key = this.state.currentproject.id;

    projectsRef
      .child(key)
      .update({
        name: `${projectName}`,
        details: `${projectDetails}`,
        personnel: developers,
      })
      .then(() => {
        this.setState({ projectNameMod: "", projectDetails: "", developers: [] });
        console.log("project updated");
      })
      .catch((err) => {
        console.error(err);
      });

    this.closeModal();
  };
  // prettier-ignore
  openModalEditIssue = () => {
    this.state.issuesRef.once("value", (snapshot) => {
      snapshot.forEach((child) => {
        if (child.key === this.state.issue.id) {
          const {
            name, details, type, project, priority, assignedTo, status, projectName,
          } = child.val();
          this.setState({
            issueName: name,issueDetails: details,Itype: type,project,priority,status,developer: assignedTo.name,developerKey: assignedTo.key,projectName: projectName,
            oldIssueVal: child.val(),
          });
        }
      });
    });
    this.setState({ modal: true, type: 3 });
  };

  openModalEditProject = () => {
    this.state.projectsRef.once("value", (snapshot) => {
      snapshot.forEach((child) => {
        if (child.key === this.state.currentproject.id) {
          const { name, details, personnel } = child.val();
          this.setState({
            projectNameMod: name,
            projectDetails: details,
            developers: personnel,
          });
        }
      });
    });
    this.setState({ modal: true, type: 3 });
  };

  closeModal = () => this.setState({ modal: false, type: 0 });

  // prettier-ignore
  render() {
    const {
      messagesRef, messages, issue, user, searchTerm, searchResults, searchLoading, privateIssue, isIssueStarred,
      messagesLoading, currentproject,
      activeItem,sectionType,project, issuesRef, modal,type,
      issueName , issueDetails , Itype ,  developer ,developerKey, projectName, priority, status,
      projectNameMod, projectDetails, developers
    } = this.state;

    return (
      <React.Fragment>
        {privateIssue === false && (
          <Navigation
            handleItemClick={this.handleItemClick}
            activeItem={activeItem}
            isSectionType={sectionType}
          />
        )}
        {activeItem === "Collaboration Tool" && (
          <MessagesHeader
            handleSearchChange={this.handleSearchChange}
            searchLoading={searchLoading}
            handleStar={this.handleStar}
            isIssueStarred={isIssueStarred}
            issueName={this.displayIssueName(issue)}
            isPrivateIssue={privateIssue}
          />
        )}

        {this.displayButtons(sectionType)}

        {sectionType ? (<IssueModal
          key = {md5(issueName + issueDetails + project + developer + type + priority + status + Itype)}
          modal={modal} type={type} closeModal={this.closeModal} handleSubmit={(event, state) => this.handleSubmit(event, state)}
          issueName = {issueName}
          issueDetails = {issueDetails}
          Itype = {Itype}
          project = {project}
          developerKey = {developerKey} 
          developer = {developer}
          projectName = {projectName}
          priority = {priority}
          status = {status}
        />):

       (<ProjectModal
          key={md5(projectDetails+ projectNameMod + type)}
          modal={modal}
          type={type}
          closeModal={this.closeModal}
          handleSubmit={(event, state) => this.handleSubmit(event, state)}
          projectName={projectNameMod}
          projectDetails={projectDetails}
          developers = {developers}
        />)}

        {activeItem === "Change Log" && privateIssue === false && (
          <ChangeLog currentIssue={this.state.issue} />
        )}

        {activeItem === "Uploads" && (
          <Uploads
            currentIssue={this.state.issue}
            currentUser={this.props.currentUser}
          />
        )}
        {activeItem === "Collaboration Tool" && (
          <Segment className="messages_segment">
            <Comment.Group className="messages">
              {this.displayMessageSkeleton(messagesLoading)}
              {searchTerm
                ? this.displayMessages(searchResults)
                : this.displayMessages(messages)}
              <div ref={(node) => (this.messagesEnd = node)} />
            </Comment.Group>
          </Segment>
        )}

        {activeItem === "Collaboration Tool" && (
          <MessageForm
            isPrivateIssue={privateIssue}
            currentIssue={issue}
            currentUser={user}
            getMessagesRef={this.getMessagesRef}
            messagesRef={messagesRef}
          />
        )}
        {activeItem === "Dashboard" && (
          <ProjectDashboard
            currentProject={currentproject}
            currentUser={user}
            issuesRef={issuesRef}
          />
        )}

        {activeItem === "Issues" && (
          <ProjectIssues
            currentProject={currentproject}
            currentUser={user}
            issuesRef={issuesRef}
          />
        )}
      </React.Fragment>
    );
  }
}

export default connect(null, {
  setUserPosts,
  setActiveIndex,
})(Messages);
