import React from "react";
import { Header, Segment, Input, Icon, Button } from "semantic-ui-react";

class MessagesHeader extends React.Component {
  
  render() {
    const {
      handleSearchChange,
      handleStar,
      issueName,
      searchLoading,
      isPrivateIssue,
      isIssueStarred,
    } = this.props;

    return (
      <Segment clearing  className = "message_header" >
        
          {/* Issue Title */}
          <Header fluid="true" floated = "left"  as="h3" style={{ marginBottom: 0 }}>
            <span>
              {issueName}
              {!isPrivateIssue && (
                <Icon
                  name={isIssueStarred ? "star" : "star outline"}
                  onClick={handleStar}
                  color={isIssueStarred ? "yellow" : "black"}
                />
              )}
            </span>
          </Header>

          {/* Issue Search Input */}
          <Header floated = "right"  style={{ marginRight: 30 }}>
            <Input
              placeholder="Search Messages"
              onChange={handleSearchChange}
              loading={searchLoading}
              icon="search"
              size="mini"
              name="searchTerm"
            />
           
          </Header>

          
      </Segment>
    );
  }
}

export default MessagesHeader;
