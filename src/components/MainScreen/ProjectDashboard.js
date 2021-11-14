import React, { Component } from "react";
import CustomActiveShapePieChart from "./CustomActiveShapePieChart";
import SimpleBarChart from "./SimpleBarChart";
import firebase from "firebase";
import { Grid, Header, Segment } from "semantic-ui-react";

export class ProjectDashboard extends Component {
  state = {
    issuesRef: firebase.database().ref("issues"),
    projectID: this.props.projectID,
    issuesTypes: [
      { name: "Bugs/Errors", issues: 0 },
      { name: "Features Requests", issues: 0 },
      { name: "Other Comments", issues: 0 },
      { name: "Training/Document Requests", issues: 0 },
    ],
    issuesPriority: [
      { name: "None", issues: 0 },
      { name: "Low", issues: 0 },
      { name: "Medium", issues: 0 },
      { name: "High", issues: 0 },
    ],
    issuesStatus: [
      { name: "New", issues: 0 },
      { name: "Open", issues: 0 },
      { name: "In Progress", issues: 0 },
      { name: "Resolved", issues: 0 },
    ],
    issuesDevelopers: [],
    ProjectIssues: [],
  };

  componentDidMount() {
    this.removeListeners();
    this.addListeners();
  }
  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    //this.state.issuesRef.off();
  };

  addListeners = () => {
    let ProjectIssues = [];
    this.state.issuesRef.on("child_added", (snap) => {
      if (snap.val().project === this.state.projectID) {
        ProjectIssues.push(snap.val());
        this.updateChartsDataFromIssues(snap.val())
      }
    });
    this.state.issuesRef.on("child_changed", (snap) => {
      var index = ProjectIssues.findIndex(
        (issue) => issue.id === snap.val().id
      );
      var editedIssue = snap.val();
      if (index !== -1) {
        ProjectIssues.splice(index, 1);
        ProjectIssues.splice(index, 0, editedIssue);
      }
      this.setState({ ProjectIssues });
    });
  };

  updateChartsDataFromIssues = (issue) => {
    let issuesTypes = [...this.state.issuesTypes];
    issuesTypes[issue.type].issues++;
    let issuesPriority = [...this.state.issuesPriority];
    issuesPriority[issue.priority].issues++;
    let issuesStatus = [...this.state.issuesStatus];
    issuesStatus[issue.status].issues++;
    let exists = false
    let developerIndex;
    this.state.issuesDevelopers.forEach(function (o,i) {
      console.log(o);
       if(o.name === issue.developer){
         exists = true;
         developerIndex = i;
       }
    });
    if(exists){
        this.state.issuesDevelopers[developerIndex].issues++;
    } else {
        this.state.issuesDevelopers.push({"name":issue.developer , "issues":0})
    }
    this.setState({
      issuesTypes,
      issuesPriority,
      issuesStatus,
      issuesDevelopers:[...this.state.issuesDevelopers]
    });
  };

  render() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment style={{ marginTop: 20, marginLeft: 65 }}>
              <Header fluid="true" secondary="true" as="h4" textAlign="center">
                Issues Per Status
              </Header>
            </Segment>
            <SimpleBarChart
              data={this.state.issuesStatus}
              dataKey={"issues"}
              fill={"#8884d8"}
            />
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment style={{ marginTop: 20, marginLeft: 65 }}>
              <Header fluid="true" secondary="true" as="h4" textAlign="center">
                Issues Per Priority
              </Header>
            </Segment>
            <SimpleBarChart
              data={this.state.issuesPriority}
              dataKey={"issues"}
              fill={"#82ca9d"}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <Segment style={{ marginTop: 0, marginLeft: 65 }}>
              <Header fluid="true" secondary="true" as="h4" textAlign="center">
                Issues Per Type
              </Header>
            </Segment>
            <CustomActiveShapePieChart
              data={this.state.issuesTypes}
              dataKey={"issues"}
              fill={"red"}
            />
        
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment style={{ marginTop: 0, marginLeft: 65 }}>
              <Header fluid="true" secondary="true" as="h4" textAlign="center">
                Issues Per Developer
              </Header>
            </Segment>
            <CustomActiveShapePieChart
              data={this.state.issuesDevelopers}
              dataKey={"issues"}
              fill={"black"}
            />
        
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ProjectDashboard;
