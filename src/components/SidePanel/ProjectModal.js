import React, { Component } from "react";

import firebase from "../../firebase";

// prettier-ignore
import {  Icon, Modal, Form, Input, Button , Dropdown} from "semantic-ui-react";

export class ProjectModal extends Component {
  state = {
    user: this.props.currentUser,
  
    usersRef: firebase.database().ref("users"),
    projectsRef: firebase.database().ref("projects"),
    issuesRef: firebase.database().ref("issues"),
    modal: this.props.modal,

    type: this.props.type,
    developers: this.props.developers,
    projectName: this.props.projectName,
    projectDetails: this.props.projectDetails,
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeDropDownDeveloper = (e, data) => {
    this.setState({ developers: data.value });
  };



  developerOptions = () => {
    let Users = [];

    this.state.usersRef.once("value", (snapshot) => {
      snapshot.forEach((data) => {
        if (data.val().role === "Developer")
          Users.push({
            key: data.key,
            text: data.val().name,
            value: data.key,
          });
      });
    });

    return Users;
  };

  render() {
    const { projectName, projectDetails, developers } = this.state;

    const { modal, type } = this.props;
    return (
      <React.Fragment>
        <Modal
          basic
          open={modal}
          className="modal_main"
          onClose={this.props.closeModal}
        >
          {type === 2 && <Modal.Header>Add a Project</Modal.Header>}
          {type === 3 && <Modal.Header>Edit a Project</Modal.Header>}
          <Modal.Content>
            <Form inverted onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of the Project"
                  name="projectName"
                  value={projectName}
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Project"
                  name="projectDetails"
                  value={projectDetails}
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Dropdown
                placeholder="Assigned Personnel"
                fluid
                multiple
                search
                selection
                value = {developers}
                options={this.developerOptions()}
                name="developers"
                onChange={this.handleChangeDropDownDeveloper}
              />
            </Form>
          </Modal.Content>

          <Modal.Actions>
            {type === 2 && (
              <Button
                color="green"
                inverted
                onClick={(event) => this.props.handleSubmit(event, this.state)}
              >
                <Icon name="checkmark" /> Add
              </Button>
            )}
            {type === 3 && (
              <Button color="green" inverted onClick={(event) => this.props.handleSubmit(event, this.state)}>
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

export default ProjectModal;
