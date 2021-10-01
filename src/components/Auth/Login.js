import React from "react";
import firebase from "../../firebase";
import {
  Message,
  Form,
  Grid,
  Segment,
  Button,
  Header,
  Icon,
  Dropdown
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class Login extends React.Component {
  state = {
    errors: [],
    password: "",
    loading: false,
    email: "",
    usersRef: firebase.database().ref('users'),
    dropdown: "",
    options: [
      { Key: "Developer", text: "Developer", value: "Developer" },
      { Key: "Admin", text: "Admin", value: "Admin" },
    ],

  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeDropDown = (e, { value }) => this.setState({ dropdown  : value})

  saveUser = (createdUser) => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
      role : this.state.dropdown
    });
  };
  SignInwithWebsite = ( site) => {
    let errors = [];
    let error;
    if(this.state.dropdown.length){
    var provider = site === "google" ? new firebase.auth.GoogleAuthProvider() :  new firebase.auth.GithubAuthProvider();
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
      error = { message: "Please , choose a role from the dropdown menu above" };
      this.setState({ errors: errors.concat(error) });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((signedInUser) => {
          console.log(signedInUser);
          let Users = [];

          this.state.usersRef.once("value", (snapshot) => {
            snapshot.forEach((child) => {
              Users.push(child.key);
            });
          });
          console.log(signedInUser);
          if (Users.includes(signedInUser.user.uid)) {
            this.saveUser(signedInUser).then(() => {
              console.log("user saved");
            });
          } else {
            console.log(signedInUser);
          }
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        });
    }
  };

  isFormValid = ({ email, password }) => email && password;

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render() {
    const { email, password, dropdown ,errors, loading } = this.state;

    return (
      <Grid
        textAlign="center"
        verticalAlign="middle"
        className="login"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="blue" textAlign="center">
            <Icon name="bug" color="blue" />
            Login to Bugless
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                placeholder="Email Address"
                type="email"
                iconPosition="left"
                onChange={this.handleChange}
                icon="mail"
                name="email"
                className={this.handleInputError(errors, "email")}
                fluid
                value={email}
              />

              <Form.Input
                icon="lock"
                placeholder="Password"
                onChange={this.handleChange}
                type="password"
                name="password"
                className={this.handleInputError(errors, "password")}
                value={password}
                iconPosition="left"
                fluid
              />
              <Dropdown
                placeholder="Role"
                fluid
                selection
                options={this.state.options}
                onChange = {this.handleChangeDropDown}
                value = {dropdown}
              />

              <Button
                size="large"
                disabled={loading}
                className={loading ? "loading" : ""}
                color="violet"
                fluid
                style={{ marginTop: 20 }}

              >
                Sign in
              </Button>
              <Button
                style={{ marginTop: 20 }}
                fluid
                color="violet"
                size="large"
                labelPosition ='left'
                icon 
                onClick={()=> this.SignInwithWebsite("google")}
              >
                Sign in with Google instead
                <Icon name = 'google'/>
              </Button>
              <Button
                style={{ marginTop: 20 }}
                fluid
                color="violet"
                size="large"
                labelPosition ='left'
                icon 
                onClick={()=> this.SignInwithWebsite("github")}
              >
                Sign in with Github instead
                <Icon name = 'github'/>
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
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
