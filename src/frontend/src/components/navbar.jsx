import React, { Component } from "react";
import { Layout, Menu } from 'antd';
import { CodeOutlined, SecurityScanOutlined, DashboardOutlined } from '@ant-design/icons';
import {Link} from "react-router-dom"

const { Header} = Layout;
const { SubMenu } = Menu;



class Navbar extends Component {
    render() {     
        return ( 
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
            <div className="logo"/>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
                <Menu.Item key="NewScan" icon={<SecurityScanOutlined />}><Link to="/scan">New Scan</Link></Menu.Item>
              <SubMenu key="Dashboard" icon={<DashboardOutlined />} title="Dashboard">
                  <Menu.Item key="setting:NPM"><Link to="/dashboard/npm">NPM</Link></Menu.Item>
              </SubMenu>
              <Menu.Item key="SourceViewer" icon={<CodeOutlined />}><Link to="/sourceviewer">Sourceviewer</Link></Menu.Item>
            </Menu>
          </Header>       
         );
    }
}
 
export default Navbar;