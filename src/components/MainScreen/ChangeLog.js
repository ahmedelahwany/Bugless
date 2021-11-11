import React, { Component } from "react";

import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, {
  textFilter,
  selectFilter,
  dateFilter,
} from "react-bootstrap-table2-filter";
import { Button , Header , Segment} from "semantic-ui-react";
import paginationFactory from 'react-bootstrap-table2-paginator';

import firebase from "../../firebase";



export default class ChangeLog extends Component {
  state = {
    changeLogs: [
    ],
     issue: this.props.currentIssue,
     listeners: [],
     changeLogsRef : firebase.database().ref("changeLogs"),
    
     PropertyFilter : ()=>{},
     OldValueFilter : ()=>{},
     DateChangedFilter : ()=>{},
     NewValueFilter : ()=>{},
     PaginationOptions :{},
     columns: [],
  };

  componentDidMount() {
    const { issue, listeners } = this.state;

    if (issue) {
      this.removeListeners(listeners);
      this.addListeners(issue.id);
    }
    const selectOptions = {
      0: "Issue Name",
      1: "Issue Details",
      2: "Project",
      3: "Developer",
      4: "Priority",
      5: "Status",
      6: "Type",
    };
   
    
     
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { from } to { to } of { size } Results
      </span>
    );

    const PaginationOptions = {
      paginationSize: 3,
      pageStartIndex: 0,
      prePageText: 'Back',
      nextPageText: 'Next',
      nextPageTitle: 'First page',
      firstPageTitle: 'Next page',
      showTotal: true,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true,
      sizePerPageList: [{
        text: '3', value: 3
      }, {
        text: '6', value: 6
      }, {
        text: 'All', value: this.state.changeLogs.length
      }] 
    };
    
    let columns = [
      {
        dataField: "id",
        text:  "ID",
        hidden:true
      },
      {
        dataField: "Property",
        text: "Property",
        formatter: (cell) => selectOptions[cell],
        filter: selectFilter({
          options: selectOptions,
          getFilter: (filter) => {
            this.setState({PropertyFilter : filter})
          }
        }),
        align : "center",
        headerAlign: 'center'
      },
      {
        dataField: "OldValue",
        text: "Old Value",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({OldValueFilter :filter})
          }
        }),
        align : "center",
        headerAlign: 'center'
      },
      {
        dataField: "NewValue",
        text: "New Value",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({NewValueFilter :filter})
          }
        }),
        align : "center",
        headerAlign: 'center'
      },
      {
        dataField: "DateChanged",
        text: "Date Changed",
        formatter: cell => cell.toString(),
        filter: dateFilter({
          style: { fontSize: "0px" },
          className: "custom-datefilter-class",
          comparatorStyle: { backgroundColor: "antiquewhite" , width: "40px" },
          comparatorClassName: "custom-comparator-class",
          dateStyle: { backgroundColor: "cadetblue", marginLeft: "5px"},
          dateClassName: "custom-date-class",
          getFilter: (filter) => {
            this.setState({DateChangedFilter : filter})
          }
        }),
        align : "center",
        headerAlign: 'center'
      },
    ];
    this.setState({
      columns,
      PaginationOptions
    });
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
  }

  removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };


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
  addListeners = (issueId) => {
    this.addChangeLogListener(issueId);
  };

  addChangeLogListener = (issueId) => {
    let loadedChangeLogs = [];
    this.state.changeLogsRef.child(issueId).on("child_added", (snap) => {
      loadedChangeLogs.push(snap.val());
      this.setState({
        changeLogs: loadedChangeLogs,
      });
    });
    this.addToListeners(issueId, this.state.changeLogsRef, "child_added");
  };

  

   handleClickClearFilters = () => {
    this.state.PropertyFilter('');
    this.state.OldValueFilter('');
    this.state.NewValueFilter('');
    this.state.DateChangedFilter();
  };
  render() {
    return (
      this.state.columns.length > 0 && (
        <React.Fragment>
        <Segment >
        {/* Issue Title */}
        <Header fluid="true" primary = "true" as="h2" textAlign ="center" style={{ marginTop: 0 }}>
          <span>
            # {this.state.issue.name}
          </span>
        </Header>
        </Segment>
          <Button
            style={{
              marginBottom: 20,
              marginTop : 0,
            }}
            labelPosition="left"
            primary
            fluid
             onClick={this.handleClickClearFilters}
            content="Clear all filters"
            icon="delete"
          />
           <Button
            style={{
              marginBottom: 20,
              marginTop : 0,
            }}
            labelPosition="left"
            secondary
            fluid
            
            content="Generate Report"
            icon="search"
          />
          <BootstrapTable
            bootstrap4
            striped
            hover
            condensed
            keyField="id"
            data={this.state.changeLogs}
            columns={this.state.columns}
            pagination={ paginationFactory(this.state.PaginationOptions)}
            filter={filterFactory()}
          />
        </React.Fragment>
      )
    );
  }
}
