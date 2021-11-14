import React, { Component } from "react";

import BootstrapTable from "react-bootstrap-table-next";
import { connect } from "react-redux";
import filterFactory, {
  textFilter,
  selectFilter,
  dateFilter,
} from "react-bootstrap-table2-filter";
import {
  setCurrentIssue,
  setPrivateIssue,
  setSectionType,
  setCurrentProject,
  setActiveIndex,
} from "../../actions";
import { Button, Header, Segment } from "semantic-ui-react";
import paginationFactory from "react-bootstrap-table2-paginator";

import firebase from "../../firebase";

class ProjectIssues extends Component {
  state = {
    ProjectIssues: [],
    project: this.props.currentProject,
    issuesRef: this.props.issuesRef,

    nameFilter: () => {},
    detailsFilter: () => {},
    DateCreatedFilter: () => {},
    priorityFilter: () => {},
    typeFilter: () => {},
    statusFilter: () => {},
    developerFilter: () => {},
    PaginationOptions: {},
    columns: [],
  };

  componentDidMount() {
    this.removeListeners();
    this.addListeners();

    const priorityOptions = {
      0: "None",
      1: "Low",
      2: "Medium",
      3: "High",
    };
    const statusOptions = {
      0: "New",
      1: "Open",
      2: "In Progress",
      3: "Resolved",
    };
    const typeOptions = {
      0: "Bugs/Errors",
      1: "Features Requests",
      2: "Other Comments",
      3: "Training/Document Requests",
    };

    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing {from} to {to} of {size} Results
      </span>
    );
    const changeIssueInner = (id) => {
      this.changeIssue(id);
    };

    const PaginationOptions = {
      paginationSize: 2,
      pageStartIndex: 0,
      prePageText: "Back",
      nextPageText: "Next",
      nextPageTitle: "First page",
      firstPageTitle: "Next page",
      showTotal: true,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true,
      sizePerPageList: [
        {
          text: "2",
          value: 2,
        },
        {
          text: "4",
          value: 4,
        },
      ],
    };

    let columns = [
      {
        dataField: "name",
        text: "Name",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({ nameFilter: filter });
          },
        }),
        style: {
          wordWrap: "break-word",
        },
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "details",
        text: "Details",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({ detailsFilter: filter });
          },
        }),
        style: {
          wordWrap: "break-word",
          fontSize: "11px",
        },
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "developer",
        text: "Developer",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({ devloperFilter: filter });
          },
        }),
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "priority",
        text: "Priority",
        formatter: (cell) => priorityOptions[cell],
        filter: selectFilter({
          options: priorityOptions,
          getFilter: (filter) => {
            this.setState({ priorityFilter: filter });
          },
        }),
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "type",
        text: "Type",
        formatter: (cell) => typeOptions[cell],
        filter: selectFilter({
          options: typeOptions,
          getFilter: (filter) => {
            this.setState({ typeFilter: filter });
          },
        }),
        style: {
          wordWrap: "break-word",
        },
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "status",
        text: "Status",
        formatter: (cell) => statusOptions[cell],
        filter: selectFilter({
          options: statusOptions,
          getFilter: (filter) => {
            this.setState({ statusFilter: filter });
          },
        }),
        align: "center",
        headerAlign: "center",
      },

      {
        dataField: "DateCreated",
        text: "Date created",
        formatter: (cell) => cell.toString(),
        filter: dateFilter({
          style: { fontSize: "0px" },
          className: "custom-datefilter-class",
          comparatorStyle: { backgroundColor: "antiquewhite", width: "20px" },
          comparatorClassName: "custom-comparator-class",
          dateStyle: {
            backgroundColor: "cadetblue",
            marginLeft: "2px",
            width: "65px",
          },
          dateClassName: "custom-date-class",
          getFilter: (filter) => {
            this.setState({ DateChangedFilter: filter });
          },
        }),
        style: {
          fontSize: "10px",
        },
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "id",
        text: "View",
        formatter: function Formatter(cell) {
          return (
            <a href={"#"} onClick={() => changeIssueInner(cell)}>
              View
            </a>
          );
        },
        align: "center",
        headerStyle: { width: "32px", fontSize: "12px" },
        headerAlign: "center",
        style: {
          fontSize: "12px",
          color: "blue",
        },
      },
    ];
    this.setState({
      columns,
      PaginationOptions,
    });
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
      if (snap.val().project === this.state.project.id) {
        ProjectIssues.push(snap.val());
        this.setState({ ProjectIssues });
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

  changeIssue = (id) => {
    let issue;
    this.state.issuesRef.child(id).on("value", (snap) => {
      issue = snap.val();
    });
    this.props.setCurrentIssue(issue);
    this.props.setCurrentProject(null);
    this.props.setPrivateIssue(false);
    this.props.setActiveIndex("Collaboration Tool");
    this.props.setSectionType(true);
  };
  handleClickClearFilters = () => {
    this.state.nameFilter("");
    this.state.detailsFilter("");
    this.state.typeFilter("");
    this.state.priorityFilter("");
    this.state.statusFilter("");
    this.state.developerFilter("");
    this.state.DateCreatedFilter();
  };
  render() {
    return (
      this.state.columns.length > 0 && (
        <React.Fragment>
          <Segment>
            {/* Issue Title */}
            <Header
              fluid="true"
              primary="true"
              as="h2"
              textAlign="center"
              style={{ marginTop: 0 }}
            >
              <span># {this.state.project.name}</span>
            </Header>
          </Segment>
          <Button
            style={{
              marginBottom: 20,
              marginTop: 0,
            }}
            labelPosition="left"
            primary
            fluid
            onClick={this.handleClickClearFilters}
            content="Clear all filters"
            icon="delete"
          />
          <BootstrapTable
            bootstrap4
            striped
            hover
            condensed
            keyField="id"
            data={this.state.ProjectIssues}
            columns={this.state.columns}
            pagination={paginationFactory(this.state.PaginationOptions)}
            filter={filterFactory()}
          />
        </React.Fragment>
      )
    );
  }
}
export default connect(null, {
  setCurrentIssue,
  setPrivateIssue,
  setSectionType,
  setCurrentProject,
  setActiveIndex,
})(ProjectIssues);
