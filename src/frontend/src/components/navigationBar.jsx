import React from "react";
import { Layout, Menu } from 'antd';
import { DatabaseOutlined, SecurityScanOutlined } from '@ant-design/icons';
import {Link} from "react-router-dom"

const { Header } = Layout;



function NavigationBar() 
{      
    return ( 
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <div className="logo"/>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
          <Menu.Item key="NewScan" icon={<SecurityScanOutlined />}><Link to="/scan">New Scan</Link></Menu.Item>
          <Menu.Item key="SourceViewer" icon={<DatabaseOutlined />}><Link to="/packages">Downloaded Packages</Link></Menu.Item>
        </Menu>
      </Header>       
      );    
}
 
export default NavigationBar;