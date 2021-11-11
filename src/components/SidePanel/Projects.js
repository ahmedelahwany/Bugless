import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import {
  setCurrentProject,
  setSectionType,
  setCurrentIssue,
  setActiveIndex,
  setPrivateIssue,
} from "../../actions";
import md5 from "md5";

// prettier-ignore
import { Menu, Icon, Dropdown} from "semantic-ui-react";
import ProjectModal from "./ProjectModal";

class Projects extends React.Component {
  state = {
    activeProject: null,
    user: this.props.currentUser,
    project: null,
    projects: [],
    projectname: "",
    projectDetails: "",
    projectsRef: firebase.database().ref("projects"),
    usersRef: firebase.database().ref("users"),
    modal: false,
    firstLoad: true,
    childRemoved: false,
    type: 0,
    developers: [],
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedProjects = [];
    let userRole;
    this.state.usersRef.child(this.state.user.uid).on("value", (snap) => {
      userRole = snap.val().role;
    });

    setTimeout(() => {
      this.state.projectsRef.on("child_added", (snap) => {
        if (
          userRole === "Admin" &&
          snap.val().createdBy.id === this.state.user.uid
        ) {
          loadedProjects.push(snap.val());
        }
        if (
          userRole === "Developer" &&
          snap.val().personnel.includes(`${this.state.user.uid}`)
        ) {
          loadedProjects.push(snap.val());
        }
        this.setState({ projects: loadedProjects }, () =>
          this.setFirstProject()
        );
      });

      this.state.projectsRef.on("child_changed", (snap) => {
        var index = loadedProjects.findIndex(
          (project) => project.id === snap.val().id
        );
        var editedProject = snap.val();
        if (index !== -1) {
          if (
            (userRole === "Developer" &&
            snap.val().personnel.includes(`${this.state.user.uid}`)) ||
            userRole === "Admin"
          ) {
            loadedProjects.splice(index, 1);
            loadedProjects.splice(index, 0, editedProject);
          } else {
            loadedProjects.splice(index, 1);
          }
        } else {
          if (
            userRole === "Developer" &&
            snap.val().personnel.includes(`${this.state.user.uid}`)
          ) {
            loadedProjects.push(snap.val());
          }
        }
        this.setState({ project: loadedProjects });

        if (this.state.project.id === editedProject.id && !snap.val().personnel.includes(`${this.state.user.uid}`)) {
          this.setFirstProject();
        }
      });
    }, 2000);
  };

  removeListeners = () => {
    this.state.projectsRef.off();
  };

  setFirstProject = () => {
    const firstProject = this.state.projects[0];
    if (
      (this.state.firstLoad && this.state.projects.length > 0) ||
      
      this.state.projects.length === 1
    ) {
      this.props.setCurrentProject(firstProject);
      this.setActiveProject(firstProject);
      this.setState({ project: firstProject });
    }
    this.setState({
      firstLoad: false
    });
  };

  addProject = (state) => {
    const {
      projectsRef,
      projectName,
      projectDetails,
      developers,

      usersRef,
    } = state;

    const { user } = this.state;

    const key = projectsRef.push().key;

    const newProject = {
      id: key,
      name: projectName,
      details: projectDetails,
      personnel: developers,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
        id: user.uid,
      },
      DateCreated: new Date(Date.now()).toString(),
    };

    projectsRef
      .child(key)
      .update(newProject)
      .then(() => {
        this.setState({
          projectName: "",
          projectDetails: "",
          projectpersonnel: [],
        });
        this.closeModal();
        console.log("project added");
      })
      .catch((err) => {
        console.error(err);
      });

    usersRef.child(`${this.state.user.uid}/projects`).update({
      [key]: {
        name: projectName,
        details: projectDetails,
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
    const { type } = state;
    console.log(type);
    if (this.isFormValid(state)) {
      if (type === 2) {
        this.addProject(state);
      }
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeProject = (project) => {
    this.setActiveProject(project);
    this.props.setCurrentProject(project);
    this.props.setCurrentIssue(null);
    this.props.setSectionType(false);
    this.props.setPrivateIssue(false);
    this.props.setActiveIndex("Dashboard");
    this.setState({ project });
  };

  isFormValid = ({ projectName, projectDetails, developers }) =>
    projectName && projectDetails && developers.length > 0;

  setActiveProject = (project) => {
    this.setState({ activeProject: project });
  };

  displayProjects = (projects) => {
    if (projects.length > 0 && this.state.activeProject) {
      return projects.map((project) => (
        <Menu.Item
          key={project.id}
          onClick={() => this.changeProject(project)}
          name={project.name}
          style={{ opacity: 0.7 }}
          active={project.id === this.state.activeProject.id}
        >
          # {project.name}
        </Menu.Item>
      ));
    }
  };

  openModal = () => this.setState({ modal: true, type: 2 });

  closeModal = () => this.setState({ modal: false, type: 0 });

  render() {
    const { projects, modal, projectName, projectDetails, type, developers } =
      this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> PROJECTS
            </span>{" "}
            ({projects.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          <div style={{ overflowY: "scroll", minHeight: 150, maxHeight: 150 }}>
            {this.displayProjects(projects)}
          </div>
        </Menu.Menu>

        {/* Add Project Modal */}
        <ProjectModal
          key={md5(projectDetails + projectName + type)}
          modal={modal}
          type={type}
          closeModal={this.closeModal}
          handleSubmit={(event, state) => this.handleSubmit(event, state)}
          projectName={projectName}
          projectDetails={projectDetails}
          developers={developers}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, {
  setCurrentProject,
  setSectionType,
  setCurrentIssue,
  setActiveIndex,
  setPrivateIssue,
})(Projects);
