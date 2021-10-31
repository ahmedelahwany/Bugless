import React from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import { Segment, Button, Header , Input} from "semantic-ui-react";
import "emoji-mart/css/emoji-mart.css";

import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, {
  textFilter,
  dateFilter,
} from "react-bootstrap-table2-filter";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

class Uploads extends React.Component {
  state = {
    errors: [],
    issue: this.props.currentIssue,
    modal: false,
    uploadState: "",
    uploadTask: null,
    user: this.props.currentUser,
    loading: false,
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    downloadUrl: "",
    uploads: [],
    listeners: [],
    uploadsRef: firebase.database().ref("uploads"),
    notes : "",
    fileFilter: () => {},
    uploaderFilter: () => {},
    DateCreatedFilter: () => {},
    notesFilter: () => {},
    PaginationOptions: {},
    columns: [],
  };

  componentDidMount() {
    const { issue, listeners } = this.state;

    if (issue) {
      this.removeListeners(listeners);
      this.addListeners(issue.id);
    }

    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing {from} to {to} of {size} Results
      </span>
    );

    const PaginationOptions = {
      paginationSize: 4,
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
        {
          text: "All",
          value: this.state.uploads.length,
        },
      ],
    };

    let columns = [
      {
        dataField: "id",
        text: "ID",
        hidden: true,
      },
      {
        dataField: "filename",
        text: "File Name",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({ fileFilter: filter });
          },
        }),
        align: "center",
        headerAlign: "center",
        style :{
          wordWrap: "break-word"
        },
      },
      {
        dataField: "notes",
        text: "Notes",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({ notesFilter: filter });
          },
        }),
        style :{
          wordWrap: "break-word"
        },
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "uploader",
        text: "Uploader",
        filter: textFilter({
          getFilter: (filter) => {
            this.setState({ uploaderFilter: filter });
          },
        }),
        align: "center",
        headerAlign: "center",
      },
      {
        dataField: "download",
        text: "Download Link",
        align: "center",
        headerAlign: "center",
        formatter: function Formatter(cell) {
          return <a href={cell}>Download Link</a>;
        },
      },
      {
        dataField: "DateCreated",
        text: "Date Created",
        formatter: (cell) => cell.toString(),
        filter: dateFilter({
          style: { fontSize: "0px" },
          className: "custom-datefilter-class",
          comparatorStyle: { backgroundColor: "antiquewhite", width: "40px" },
          comparatorClassName: "custom-comparator-class",
          dateStyle: {
            backgroundColor: "cadetblue",
            marginLeft: "5px",
            width: "80px",
          },
          dateClassName: "custom-date-class",
          getFilter: (filter) => {
            this.setState({ DateCreatedFilter: filter });
          },
        }),
        align: "center",
        headerAlign: "center",
      },
    ];
    this.setState({
      columns,
      PaginationOptions,
    });
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
    this.addUploadsListener(issueId);
  };

  addUploadsListener = (issueId) => {
    let loadedUploads = [];
    this.state.uploadsRef.child(issueId).on("child_added", (snap) => {
      loadedUploads.push(snap.val());
      this.setState({
        uploads: loadedUploads,
      });
    });
    this.addToListeners(issueId, this.state.uploadsRef, "child_added");
  };

  handleClickClearFilters = () => {
    this.state.uploaderFilter("");
    this.state.notesFilter("");
    this.state.fileFilter("");
    this.state.DateCreatedFilter();
  };
  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
    this.removeListeners(this.state.listeners);
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  uploadFile = (file, metadata) => {
    const filePath = `uploads/${uuidv4()}/${file.name}`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          (err) => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.setState({ uploadState: "done", downloadUrl });
                this.state.uploadsRef
                  .child(this.state.issue.id)
                  .push()
                  .set({
                    id: uuidv4(),
                    filename: file.name,
                    notes: this.state.notes,
                    uploader: this.state.user.displayName,
                    download: downloadUrl,
                    DateCreated: new Date(Date.now()).toString(),
                  })
                  .then(() => {
                    this.setState({ downloadUrl: "" , notes: "" });
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  render() {
    const { modal, uploadState, percentUploaded } = this.state;

    return (
      <React.Fragment>
        <Segment className="uploads">
          {/* Issue Title */}
          <Header
            fluid="true"
            primary="true"
            as="h2"
            textAlign="center"
            style={{ marginTop: 0 }}
          >
            <span> # {this.state.issue.name}</span>
          </Header>
          <Input
            onChange={this.handleChange}
            fluid
            label="Add notes"
            name="notes"      
            style={{ marginBottom: "9px" }}
                />
          <Button
            color="orange"
            icon="cloud upload"
            content="Upload Media"
            fluid
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
            labelPosition="right"
          />

          <FileModal
            modal={modal}
            file={"file"}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
          <ProgressBar
            uploadState={uploadState}
            percentUploaded={percentUploaded}
          />
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

        {this.state.columns.length > 0 && (
          <BootstrapTable
            bootstrap4
            striped
            hover
            condensed
            keyField="id"
            data={this.state.uploads}
            columns={this.state.columns}
            pagination={paginationFactory(this.state.PaginationOptions)}
            filter={filterFactory()}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Uploads;
