import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentIssue, setPrivateIssue } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class Starred extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    activeIssue: "",
    starredIssues: []
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
  };

  addListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredIssue = { id: snap.key, ...snap.val() };
        this.setState({
          starredIssues: [...this.state.starredIssues, starredIssue]
        });
      });

    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const issueToRemove = { id: snap.key, ...snap.val() };
        const filteredIssues = this.state.starredIssues.filter(issue => {
          return issue.id !== issueToRemove.id;
        });
        this.setState({ starredIssues: filteredIssues });
      });
      this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_changed", snap => {
        const issueToEdit = { id: snap.key, ...snap.val() };
        const filteredIssues = this.state.starredIssues.map(issue => {
           if(issue.id === issueToEdit.id){
                 return issueToEdit;
           }else{
             return issue;
           }
        });
        this.setState({ starredIssues: filteredIssues });
      });
  };

  setActiveIssue = issue => {
    this.setState({ activeIssue: issue.id });
  };

  changeIssue = issue => {
    this.setActiveIssue(issue);
    this.props.setCurrentIssue(issue);
    this.props.setPrivateIssue(false);
  };

  displayIssues = starredIssues =>
    starredIssues.length > 0 &&
    starredIssues.map(issue => (
      <Menu.Item
        key={issue.id}
        onClick={() => this.changeIssue(issue)}
        name={issue.name}
        style={{ opacity: 0.7 }}
        active={issue.id === this.state.activeIssue}
      >
        # {issue.name}
      </Menu.Item>
    ));

  render() {
    const { starredIssues } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> FAVOURITE
          </span>{" "}
          ({starredIssues.length})
        </Menu.Item>
        <div style={{overflowY:"scroll" ,minHeight:80, maxHeight:120}}>

        {this.displayIssues(starredIssues)}</div>
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentIssue, setPrivateIssue }
)(Starred);
