import md5 from "md5";
import firebase from "../../firebase";
import React from "react";
import {
  Header,
  Icon,
  Grid,
  Form,
  Segment,
  Button,
  Message,
  Dropdown,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends React.Component {
  state = {
    errors: [],
    usersReference: firebase.database().ref("users"),
    password: "",
    email: "",
    passwordConfirmation: "",
    username: "",
    loading: false,

    options: [
      { Key: "Developer", text: "Developer", value: "Developer" },
      { Key: "Admin", text: "Admin", value: "Admin" },
    ],
    dropdown: "",
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "please , fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    return (
      !password.length < 6 &&
      !passwordConfirmation.length < 6 &&
      password === passwordConfirmation
    );
  };

  isFormEmpty = ({
    username,
    email,
    password,
    passwordConfirmation,
    dropdown,
  }) => {
    return (
      !password.length ||
      !email.length ||
      !username.length ||
      !passwordConfirmation.length ||
      !dropdown.length
    );
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handleChangeDropDown = (e, { value }) => this.setState({ dropdown: value });

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  RegisterwithWebsite = (event, site) => {
    let errors = [];
    let error;
    event.preventDefault();
    if (this.state.dropdown.length) {
      var provider =
        site === "google"
          ? new firebase.auth.GoogleAuthProvider()
          : new firebase.auth.GithubAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          // var token = result.credential.accessToken;
          var user = result.user;

          var isNewUser = result.additionalUserInfo.isNewUser;
          if (isNewUser) {
            this.saveUser(result).then(() => {
              console.log("user saved");
            });
          } else {
            console.log("user " + user.email + " does exist!");
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      error = {
        message: "Please , choose a role from the dropdown menu above",
      };
      this.setState({ errors: errors.concat(error) });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((createdUser) => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`,
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                console.log("user saved");
              });
            })
            .catch((err) => {
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false,
              });
            });
        })
        .catch((err) => {
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        });
    }
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  saveUser = (createdUser) => {
    return this.state.usersReference.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
      role: this.state.dropdown,
    });
  };
  render() {
    const {
      password,
      errors,
      passwordConfirmation,
      loading,
      username,
      email,
      dropdown,
    } = this.state;

    return (
      <Grid verticalAlign="middle" className="register" textAlign="center">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="blue" textAlign="center">
            <Icon name="bug" color="blue" />
            Register for Bugless
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                value={username}
                name="username"
                iconPosition="left"
                type="text"
                placeholder="Username"
                icon="user"
                onChange={this.handleChange}
                fluid
              />

              <Form.Input
                name="email"
                iconPosition="left"
                fluid
                className={this.handleInputError(errors, "email")}
                onChange={this.handleChange}
                value={email}
                type="email"
                icon="mail"
                placeholder="Email Address"
              />

              <Form.Input
                placeholder="Password"
                type="password"
                value={password}
                className={this.handleInputError(errors, "password")}
                onChange={this.handleChange}
                name="password"
                icon="lock"
                fluid
                iconPosition="left"
              />

              <Form.Input
                name="passwordConfirmation"
                iconPosition="left"
                placeholder="Password Confirmation"
                value={passwordConfirmation}
                className={this.handleInputError(errors, "password")}
                onChange={this.handleChange}
                fluid
                icon="repeat"
                type="password"
              />

              <Dropdown
                placeholder="Role"
                fluid
                selection
                options={this.state.options}
                onChange={this.handleChangeDropDown}
                value={dropdown}
              />

              <Button
                className={loading ? "loading" : ""}
                fluid
                color="violet"
                size="large"
                disabled={loading}
                style={{ marginTop: 20 }}
              >
                Register
              </Button>
              <Button
                style={{ marginTop: 20 }}
                fluid
                color="violet"
                size="large"
                onClick={(event) => this.RegisterwithWebsite(event, "google")}
                labelPosition="left"
                icon
              >
                Register with Google instead
                <Icon name="google" />
              </Button>
              <Button
                style={{ marginTop: 20 }}
                fluid
                color="violet"
                size="large"
                onClick={(event) => this.RegisterwithWebsite(event, "github")}
                labelPosition="left"
                icon
              >
                Register with Github instead
                <Icon name="github" />
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
