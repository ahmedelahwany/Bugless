import React, { Component } from "react";

import firebase from "../../firebase";


// prettier-ignore
import { Menu, Icon, Modal, Form, Input, Button, Label, Select} from "semantic-ui-react";

export class IssueModal extends Component {
  state = {
    user: this.props.currentUser,
    issueName: this.props.issueName,
    issueDetails: this.props.issueDetails,
    usersRef: firebase.database().ref("users"),
    projectsRef: firebase.database().ref("projects"),
    issuesRef: firebase.database().ref("issues"),
    modal: this.props.modal,
    statusOptions: [
      { key: "N", text: "New", value: 0 },
      { key: "O", text: "Open", value: 1 },
      { key: "I", text: "In Progress", value: 2 },
      { key: "R", text: "Resolved", value: 3 },
    ],
    typeOptions: [
      { key: "B", text: "Bugs/Errors", value: 0 },
      { key: "F", text: "Feature Requests", value: 1 },
      { key: "O", text: "Other Comments", value: 2 },
      {
        key: "T",
        text: "Training/Document Requests",
        value: 3,
      },
    ],
    priorityOptions: [
      { key: "N", text: "None", value: 0 },
      { key: "L", text: "Low", value: 1 },
      { key: "M", text: "Medium", value: 2 },
      { key: "H", text: "High", value: 3 },
    ],
    type: this.props.type,
    status: this.props.status,
    developer: this.props.developer,
    project: this.props.project,
    projectName: this.props.projectName,
    priority: this.props.priority,
    Itype: this.props.Itype,
    developerKey: this.props.developerKey,
  };

  projectOptions = () => {
    let projects = [];

    this.state.projectsRef.once("value", (snapshot) => {
      snapshot.forEach((data) => {
        projects.push({
          key: data.key,
          text: data.val().name,
          value: data.key,
        });
      });
    });

    return projects;
  };
  developerOptions = () => {
    let Users = [];

    this.state.usersRef.once("value", (snapshot) => {
      snapshot.forEach((data) => {
        if (data.val().role === "Developer" && this.projectHasUser(data.key))
          Users.push({
            key: data.key,
            text: data.val().name,
            value: data.key,
          });
      });
    });

    return Users;
  };

  projectHasUser = (key) => {
    let has = false;

    if (this.state.project) {
      this.state.projectsRef
        .child(`${this.state.project}`)
        .once("value", (snap) => {
          has = snap.val().personnel.includes(key);
        });
    }
    return has;
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeDropDownItype = (e, { value }) => this.setState({ Itype: value });
  handleChangeDropDownProject = (e, data) => {
    this.setState({ project: data.value });
    const { text } = data.options.find((o) => o.key === data.value);
    this.setState({ projectName: text });
  };
  handleChangeDropDownDeveloper = (e, data) => {
    this.setState({ developerKey: data.value });
    const { text } = data.options.find((o) => o.key === data.value);
    this.setState({ developer: text });
  };
  handleChangeDropDownStatus = (e, { value }) =>
    this.setState({ status: value });
  handleChangeDropDownPriority = (e, { value }) =>
    this.setState({ priority: value });

    
  render() {
    const {
        issueName,
        issueDetails,
        statusOptions,
        typeOptions,
        priorityOptions,
        status,
        Itype,
        priority,
        project,
        developerKey
      } = this.state;

      const {modal , type  } = this.props;
    return (
      <React.Fragment>
        <Modal
          basic
          open={modal}
          className="modal_main"
          onClose={this.closeModal}
        >
          {type === 2 && <Modal.Header>Add a Issue</Modal.Header>}
          {type === 3 && <Modal.Header>Edit a Issue</Modal.Header>}
          <Modal.Content className="modal_content">
            <Form inverted onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of the Issue"
                  name="issueName"
                  value={issueName}
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Issue"
                  name="issueDetails"
                  value={issueDetails}
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field
                control={Select}
                options={this.projectOptions()}
                label={{
                  children: "Project",
                  htmlFor: "form-select-control-project",
                }}
                placeholder="Project"
                search
                value={project}
                onChange={this.handleChangeDropDownProject}
                searchInput={{ id: "form-select-control-project" }}
              />
              <Form.Field
                control={Select}
                options={this.developerOptions()}
                label={{
                  children: "Developer",
                  htmlFor: "form-select-control-developer",
                }}
                placeholder="Assigned Developer"
                search
                value = {developerKey}
                onChange={this.handleChangeDropDownDeveloper}
                searchInput={{ id: "form-select-control-developer" }}
              />
              <Form.Field
                control={Select}
                options={priorityOptions}
                label={{
                  children: "Priority",
                  htmlFor: "form-select-control-priority",
                }}
                placeholder="Issue Priority"
                search
                value={priority}
                name="priority"
                onChange={this.handleChangeDropDownPriority}
                searchInput={{ id: "form-select-control-priority" }}
              />
              <Form.Field
                control={Select}
                options={statusOptions}
                label={{
                  children: "Status",
                  htmlFor: "form-select-control-status",
                }}
                placeholder="Issue Status"
                search
                value={status}
                name="status"
                onChange={this.handleChangeDropDownStatus}
                searchInput={{ id: "form-select-control-status" }}
              />
              <Form.Field
                control={Select}
                options={typeOptions}
                label={{
                  children: "type",
                  htmlFor: "form-select-control-type",
                }}
                placeholder="Issue Type"
                search
                value={Itype}
                name="Itype"
                onChange={this.handleChangeDropDownItype}
                searchInput={{ id: "form-select-control-type" }}
              />
            </Form>
          </Modal.Content>

          <Modal.Actions>
            {type === 2 && (
              <Button color="green" inverted onClick={(event) => this.props.handleSubmit(event ,this.state)}>
                <Icon name="checkmark" /> Add
              </Button>
            )}
            {type === 3 && (
              <Button color="green" inverted onClick={(event) => this.props.handleSubmit(event ,this.state)}>
                <Icon name="checkmark" /> Edit
              </Button>
            )}
            <Button color="red" inverted onClick={this.props.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default IssueModal;
