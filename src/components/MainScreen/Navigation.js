import React from "react";
import { Menu } from "semantic-ui-react";

class Navigation extends React.Component {
  render() {
    const { activeItem, handleItemClick , isSectionType} = this.props;

    return (
      <React.Fragment>
        {isSectionType === true && (<Menu style={{ height: "20px", padding: 0, color: "blue" }} widths={3}>
          <Menu.Item
            name="Collaboration Tool"
            active={activeItem === "Collaboration Tool"}
            onClick={handleItemClick}
            style={{ fontWeight: 900, fontSize: "20px" }}
          >
            Collaboration Tool
          </Menu.Item>

          <Menu.Item
            name="Change Log"
            active={activeItem === "Change Log"}
            onClick={handleItemClick}
            style={{ fontWeight: 900, fontSize: "20px" }}
          >
            Change Log
          </Menu.Item>

          <Menu.Item
            name="Uploads"
            active={activeItem === "Uploads"}
            onClick={handleItemClick}
            style={{ fontWeight: 900, fontSize: "20px" }}
          >
            Uploads
          </Menu.Item>
        </Menu>)
        }

        {isSectionType === false && (<Menu style={{ height: "20px", padding: 0, color: "blue" }} widths={2}>
          <Menu.Item
            name="Dashboard"
            active={activeItem === "Dashboard"}
            onClick={handleItemClick}
            style={{ fontWeight: 900, fontSize: "20px" }}
          >
            Dashboard
          </Menu.Item>

          <Menu.Item
            name="Issues"
            active={activeItem === "Issues"}
            onClick={handleItemClick}
            style={{ fontWeight: 900, fontSize: "20px" }}
          >
            Issues
          </Menu.Item>
        </Menu>)
        }
      </React.Fragment>
    );
  }
}

export default Navigation;
