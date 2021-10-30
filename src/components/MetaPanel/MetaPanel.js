import React from "react";
import firebase from "../../firebase";
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List,
  Menu,
} from "semantic-ui-react";

class MetaPanel extends React.Component {
  state = {
    issue: this.props.currentIssue,
    project: this.props.currentProject,
    sectionType: this.props.isSectionType,
    privateIssue: this.props.isPrivateIssue,
    activeIndex: 0,
    issuesRef: firebase.database().ref("issues"),
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    console.log("joj");
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    this.state.issuesRef.on("child_changed", (snap) => {
      var editedIssue = snap.val();
      this.setState({ issue: editedIssue });
    });
  };

  removeListeners = () => {};

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
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
  formatCount = (num) =>
    num > 1 || num === 0 ? `${num} posts` : `${num} post`;

  displayTopPosters = (posts) =>
    Object.entries(posts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val], i) => (
        <List.Item key={i}>
          <Image avatar src={val.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{this.formatCount(val.count)}</List.Description>
          </List.Content>
        </List.Item>
      ))
      .slice(0, 2);

  displayAssignedPersonnel = (personnel) => {
    console.log(personnel);
    return personnel.map((i) => {
      let listItem;
      this.state.usersRef.child(`${i}`).once("value", (snap) => {
        console.log(snap.val());
        listItem = (
          <Menu.Item
            style={{ marginBottom: "6px" }}
          >
            <Header  as="h5">
              <Image circular src={snap.val().avatar} />
              {snap.val().name}
            </Header>
          </Menu.Item>
        );
      });
      return listItem;
    });
  };

  render() {
    const { activeIndex, privateIssue, issue, project, sectionType } =
      this.state;
    const { userPosts } = this.props;

    if (privateIssue) return null;

    return (
      <React.Fragment>
        {sectionType === true && (
          <Segment loading={!issue}>
            <Header as="h5" attached="top">
              About # {issue && issue.name}
            </Header>
            <Accordion styled attached="true">
              <Accordion.Title
                active={activeIndex === 0}
                index={0}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="info" />
                Issue Details
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 0}>
                {issue && issue.details}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 1}
                index={1}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="laptop" />
                Issue Developer
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 1}>
                {issue && issue.assignedTo.name}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 2}
                index={2}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="at" />
                Issue Project
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 2}>
                {issue && issue.projectName}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 3}
                index={3}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="bell" />
                Issue Priority
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 3}>
                {issue && this.getPriorityName(issue.priority)}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 4}
                index={4}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="bars" />
                Issue Type
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 4}>
                {issue && this.getTypeName(issue.type)}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 5}
                index={5}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="tag" />
                Issue Status
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 5}>
                {issue && this.getStatusName(issue.status)}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 6}
                index={6}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="user circle" />
                Top Posters
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 6}>
                <List
                  style={{
                    height: "9vh",
                    overflowY: "scroll",
                    overflowX: "hidden",
                  }}
                >
                  {userPosts && this.displayTopPosters(userPosts)}
                </List>
              </Accordion.Content>

              <Accordion.Title
                active={activeIndex === 7}
                index={7}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="pencil alternate" />
                Created By
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 7}>
                <Header as="h3">
                  <Image circular src={issue && issue.createdBy.avatar} />
                  {issue && issue.createdBy.name}
                </Header>
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 8}
                index={8}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="calendar" />
                Created at
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 8}>
                {issue && issue.DateCreated}
              </Accordion.Content>
            </Accordion>
          </Segment>
        )}
        {sectionType === false && (
          <Segment loading={!project}>
            <Header as="h5" attached="top">
              About # {project && project.name}
            </Header>
            <Accordion styled attached="true">
              <Accordion.Title
                active={activeIndex === 0}
                index={0}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="info" />
                Project Details
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 0}>
                {project && project.details}
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 6}
                index={6}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="user circle" />
                AssignedPersonnel
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 6}>
                <div
                  
                  style={{
                    height: "15vh",
                    overflowY: "scroll",
                    overflowX: "hidden",
                  }}
                >
                  {project && this.displayAssignedPersonnel(project.personnel)}
                </div>
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 7}
                index={7}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="pencil alternate" />
                Created By
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 7}>
                <Header as="h3">
                  <Image circular src={project && project.createdBy.avatar} />
                  {project && project.createdBy.name}
                </Header>
              </Accordion.Content>
              <Accordion.Title
                active={activeIndex === 8}
                index={8}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="calendar" />
                Created at
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 8}>
                {project && project.DateCreated}
              </Accordion.Content>
            </Accordion>
          </Segment>
        )}
      </React.Fragment>
    );
  }
}

export default MetaPanel;
